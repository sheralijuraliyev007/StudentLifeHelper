import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay } from 'rxjs';
import { API_ENDPOINTS } from '../contracts';
import { AuthService } from '../auth/auth.service';
import { getRoleCodeFromToken } from '../auth/jwt.utils';
import type { SelectListItem } from './manual.service';

const ADMIN_ROLE_CODE = 1;

@Injectable({ providedIn: 'root' })
export class RegisterLookupService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly regionCache = new Map<number, Observable<SelectListItem<number>[]>>();

  private countryCache$?: Observable<SelectListItem<number>[]>;
  private genderCache$?: Observable<SelectListItem<number>[]>;
  private languageCache$?: Observable<SelectListItem<number>[]>;
  private roomTypeCache$?: Observable<SelectListItem<number>[]>;
  private currencyCache$?: Observable<SelectListItem<number>[]>;
  private roomPostTypeCache$?: Observable<SelectListItem<number>[]>;

  getCountrySelect(): Observable<SelectListItem<number>[]> {
    this.countryCache$ ??= this.http
      .get<unknown>(API_ENDPOINTS.public.manual.getCountrySelect)
      .pipe(
        map((payload) => this.normalizeItems(payload)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    return this.countryCache$;
  }

  getGenderSelect(): Observable<SelectListItem<number>[]> {
    this.genderCache$ ??= this.http
      .get<unknown>(API_ENDPOINTS.public.manual.getGenderSelect)
      .pipe(
        map((payload) => this.normalizeItems(payload)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    return this.genderCache$;
  }

  getLanguageSelect(): Observable<SelectListItem<number>[]> {
    this.languageCache$ ??= this.http
      .get<unknown>(API_ENDPOINTS.public.manual.getLanguageSelect)
      .pipe(
        map((payload) => this.normalizeItems(payload)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    return this.languageCache$;
  }

  getRegionSelect(countryCode: number): Observable<SelectListItem<number>[]> {
    if (!Number.isFinite(countryCode) || countryCode <= 0) {
      return of([]);
    }
    let cached = this.regionCache.get(countryCode);
    if (!cached) {
      cached = this.http
        .get<unknown>(API_ENDPOINTS.public.manual.getRegionSelect, {
          params: { countryCode: String(countryCode) },
        })
        .pipe(
          map((payload) => this.normalizeRegionItems(payload)),
          shareReplay({ bufferSize: 1, refCount: true }),
        );
      this.regionCache.set(countryCode, cached);
    }
    return cached;
  }

  getRoomTypeSelect(): Observable<SelectListItem<number>[]> {
    this.roomTypeCache$ ??= this.fetchSelect(this.roomTypeManualUrl());
    return this.roomTypeCache$;
  }

  getCurrencyTypeSelect(): Observable<SelectListItem<number>[]> {
    this.currencyCache$ ??= this.fetchSelect(this.currencyTypeManualUrl());
    return this.currencyCache$;
  }

  getRoomPostTypeSelect(): Observable<SelectListItem<number>[]> {
    this.roomPostTypeCache$ ??= this.fetchSelect(this.roomPostTypeManualUrl());
    return this.roomPostTypeCache$;
  }

  /** Public manual APIs require the User role; admins use api/admin/Manual instead. */
  private roomTypeManualUrl(): string {
    return this.isAdministrator()
      ? API_ENDPOINTS.admin.manual.getRoomTypeSelect
      : API_ENDPOINTS.public.manual.getRoomTypeSelect;
  }

  private currencyTypeManualUrl(): string {
    return this.isAdministrator()
      ? API_ENDPOINTS.admin.manual.getCurrencyTypeSelect
      : API_ENDPOINTS.public.manual.getCurrencyTypeSelect;
  }

  private roomPostTypeManualUrl(): string {
    return this.isAdministrator()
      ? API_ENDPOINTS.admin.manual.getRoomPostTypeSelect
      : API_ENDPOINTS.public.manual.getRoomPostTypeSelect;
  }

  private isAdministrator(): boolean {
    const token = this.auth.getAccessToken();
    if (!token) {
      return false;
    }
    return getRoleCodeFromToken(token) === ADMIN_ROLE_CODE;
  }

  private fetchSelect(url: string): Observable<SelectListItem<number>[]> {
    return this.http.get<unknown>(url).pipe(
      map((payload) => this.normalizeItems(payload)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * Region manual lists use DB `id` as `value` but `CreateRoomPostModel.RegionCode`
   * (and `info_region.code` FK) expect the business `code` (`orderCode` in the API).
   */
  private normalizeRegionItems(payload: unknown): SelectListItem<number>[] {
    return this.normalizeItems(payload).map((item) => ({
      ...item,
      value: item.orderCode,
    }));
  }

private unwrap(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') return payload;
  const o = payload as Record<string, unknown>;
  return o['data'] ?? o['Data'] ?? payload;
}

private normalizeItems(payload: unknown): SelectListItem<number>[] {
  const items = this.unwrap(payload);
  if (!Array.isArray(items)) {
    return [];
  }
  return items
    .map((raw) => this.normalizeItem(raw))
    .filter((item): item is SelectListItem<number> => item !== null);
}
  clearRegionCache(): void {
    this.regionCache.clear();
  }

  private normalizeItem(raw: unknown): SelectListItem<number> | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    const obj = raw as Record<string, unknown>;
    const valueRaw = obj['value'] ?? obj['Value'];
    const textRaw = obj['text'] ?? obj['Text'];
    const orderRaw = obj['orderCode'] ?? obj['OrderCode'];
    const value = typeof valueRaw === 'number' ? valueRaw : Number(valueRaw);
    if (!Number.isFinite(value) || typeof textRaw !== 'string') {
      return null;
    }
    return {
      value,
      text: textRaw,
      orderCode: typeof orderRaw === 'number' ? orderRaw : Number(orderRaw ?? 0),
    };

    
  }
  
}


