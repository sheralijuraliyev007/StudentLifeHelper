import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS, LoginModel, RegisterModel, TokenDto, UserDto } from '../contracts';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  constructor(private readonly http: HttpClient) {}

  register(model: RegisterModel): Observable<UserDto> {
    return this.http.post<UserDto>(API_ENDPOINTS.auth.register, this.toRegisterFormData(model));
  }

  login(model: LoginModel): Observable<TokenDto> {
    return this.http
      .post<TokenDto>(API_ENDPOINTS.auth.login, this.toLoginFormData(model))
      .pipe(tap((tokens) => this.setTokens(tokens)));
  }

  getProfile(): Observable<UserDto> {
    return this.http.get<UserDto>(API_ENDPOINTS.auth.getProfile);
  }

  refreshToken(tokenDto?: TokenDto): Observable<TokenDto> {
    const payload: TokenDto = tokenDto ?? {
      accessToken: this.getAccessToken() ?? '',
      refreshToken: this.getRefreshToken() ?? '',
    };

    return this.http.post<TokenDto>(API_ENDPOINTS.auth.refreshToken, payload).pipe(
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
    formData.append('firstName', model.firstName);
    formData.append('lastName', model.lastName);
    formData.append('username', model.username);
    formData.append('password', model.password);
    formData.append('birthCountryCode', String(model.birthCountryCode));
    formData.append('residenceCountryCode', String(model.residenceCountryCode));
    formData.append('genderCode', String(model.genderCode));
    formData.append('regionCode', String(model.regionCode));

    if (model.middleName) {
      formData.append('middleName', model.middleName);
    }

    if (model.birthDate) {
      formData.append('birthDate', model.birthDate);
    }

    if (model.imageFile) {
      formData.append('imageFile', model.imageFile);
    }

    return formData;
  }

  private toLoginFormData(model: LoginModel): FormData {
    const formData = new FormData();
    formData.append('username', model.username);
    formData.append('password', model.password);
    return formData;
  }
}
