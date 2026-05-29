import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, tap, timeout } from 'rxjs';
import { API_ENDPOINTS, LoginModel, RegisterModel, SqlQueryEntry, TokenDto, UpdateUserModel, UserDto } from '../contracts';
import { normalizeTokenDto, normalizeUserDto } from './auth-response.util';
import { isTokenExpired } from './jwt.utils';
import { SqlPanelService } from '../services/SqlPanelService';

const AUTH_HTTP_TIMEOUT_MS = 60_000;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  constructor(private readonly http: HttpClient,private readonly sqlPanel: SqlPanelService) {}

  register(model: RegisterModel): Observable<UserDto> {
return this.http.post<unknown>(API_ENDPOINTS.auth.register, this.toRegisterFormData(model)).pipe(
    map((raw) => normalizeUserDto(this.unwrap(raw)))
    );
  }

  /** Register, then sign in with the same credentials. */
  registerAndSignIn(model: RegisterModel): Observable<{ user: UserDto; tokens: TokenDto }> {
    const credentials = {
      username: (model.username ?? '').trim().toLowerCase(),
      password: model.password ?? '',
    };
    const payload: RegisterModel = { ...model, ...credentials };

    return this.register(payload).pipe(
      tap(() => this.clearTokens()),
      switchMap((user) =>
        this.login(credentials).pipe(map((tokens) => ({ user, tokens }))),
      ),
    );
  }

login(model: LoginModel): Observable<TokenDto> {
  this.clearTokens();
  const username = (model.username ?? '').trim().toLowerCase();
  const password = model.password ?? '';
  return this.doLoginRequest({ username, password }).pipe(
    timeout(AUTH_HTTP_TIMEOUT_MS),
    map((raw) => normalizeTokenDto(this.unwrap(raw))), // ← unwrap first
    tap((tokens) => this.setTokens(tokens)),
  );
}
getProfile(forceFresh = false): Observable<UserDto> {
  const options = forceFresh
    ? {
        params: new HttpParams().set('t', String(Date.now())),
        headers: new HttpHeaders({
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        }),
      }
    : {};

  return this.http
    .get<unknown>(API_ENDPOINTS.auth.getProfile, options)
    .pipe(map((raw) => normalizeUserDto(this.unwrap(raw))));
}

updateProfile(model: UpdateUserModel): Observable<string> {
  return this.http.post<unknown>(API_ENDPOINTS.auth.updateProfile, model).pipe(
    map((raw) => {
      this.unwrap(raw);
      const o = raw as Record<string, unknown>;
      return (o['data'] ?? o['Data'] ?? '') as string;
    })
  );
}

updateUsername(newUsername: string): Observable<string> {
  const params = new HttpParams().set('newUsername', newUsername);
  return this.http.post<unknown>(API_ENDPOINTS.auth.updateUsername, null, { params }).pipe(
    map((raw) => {
      this.unwrap(raw);
      const o = raw as Record<string, unknown>;
      return (o['data'] ?? o['Data'] ?? '') as string;
    })
  );
}
updateUserImage(file: File): Observable<string> {
  const formData = new FormData();
  formData.append('img', file);
  return this.http.put<unknown>(API_ENDPOINTS.auth.updateUserImage, formData).pipe(
    map((raw) => {
      this.unwrap(raw);
      const o = raw as Record<string, unknown>;
      return (o['data'] ?? o['Data'] ?? '') as string;
    })
  );
}

  tryRestoreSession(): Observable<{ ok: boolean }> {
    const access = this.getAccessToken();
    const refresh = this.getRefreshToken();

    if (access && !isTokenExpired(access)) {
      return of({ ok: true });
    }

    if (!refresh) {
      this.clearTokens();
      return of({ ok: false });
    }

    const payload: TokenDto = {
      accessToken: access ?? '',
      refreshToken: refresh,
    };

    return this.refreshToken(payload).pipe(
      map(() => ({ ok: true })),
      catchError(() => {
        this.clearTokens();
        return of({ ok: false });
      }),
    );
  }

  getLanguageCodeFromAccessToken(): number | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return null;
    }
    const raw = payload['language_code'] ?? payload['languageCode'];
    if (raw == null || raw === '') {
      return null;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      return null;
    }
    return n;
  }

private unwrap(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const o = raw as Record<string, unknown>;
  const queries = o['queries'] ?? o['Queries'];
  if (Array.isArray(queries) && queries.length) {
    this.sqlPanel.push(queries as SqlQueryEntry[]); // ← replace console.log with this
  }
  return o['data'] ?? o['Data'] ?? raw;
}

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const part = token.split('.')[1];
      if (!part) {
        return null;
      }
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const json = atob(padded);
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

refreshToken(tokenDto?: TokenDto): Observable<TokenDto> {
  const payload: TokenDto = tokenDto ?? {
    accessToken: this.getAccessToken() ?? '',
    refreshToken: this.getRefreshToken() ?? '',
  };
  return this.http.post<unknown>(API_ENDPOINTS.auth.refreshToken, payload).pipe(
    map((raw) => normalizeTokenDto(this.unwrap(raw))), // ← unwrap first
    tap((tokens) => this.setTokens(tokens)),
  );
}

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setTokens(tokens: TokenDto): void {
    localStorage.setItem(this.accessTokenKey, tokens.accessToken);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  private toRegisterFormData(model: RegisterModel): FormData {
    const formData = new FormData();
    formData.append('FirstName', model.firstName);
    formData.append('LastName', model.lastName);
    formData.append('Username', model.username);
    formData.append('Password', model.password);
    formData.append('BirthCountryCode', String(model.birthCountryCode));
    formData.append('ResidenceCountryCode', String(model.residenceCountryCode));
    formData.append('GenderCode', String(model.genderCode));
    formData.append('RegionCode', String(model.regionCode));

    if (model.middleName) {
      formData.append('MiddleName', model.middleName);
    }
    if (model.birthDate) {
      formData.append('BirthDate', model.birthDate);
    }
    if (model.imageFile) {
      formData.append('ImageFile', model.imageFile, model.imageFile.name);
    }

    return formData;
  }

  /** `application/x-www-form-urlencoded` binds reliably to `[FromForm] LoginModel`. */
  private doLoginRequest(model: LoginModel): Observable<unknown> {
    const body = new HttpParams()
      .set('Username', model.username)
      .set('Password', model.password);
    return this.http.post<unknown>(API_ENDPOINTS.auth.login, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
}
