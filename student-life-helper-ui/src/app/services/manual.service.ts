import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_ENDPOINTS, SqlQueryEntry } from '../contracts';
import { SqlPanelService } from './SqlPanelService';

export interface SelectListItem<TValue = number> {
  value: TValue;
  text: string;
  orderCode: number;
}

@Injectable({ providedIn: 'root' })
export class ManualService {
  constructor(
    private readonly http: HttpClient,
    private readonly sqlPanel: SqlPanelService
  ) {}

  private unwrap(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') return raw;
    const o = raw as Record<string, unknown>;
    const queries = o['queries'] ?? o['Queries'];
    if (Array.isArray(queries) && queries.length) {
      this.sqlPanel.push(queries as SqlQueryEntry[]);
    }
    return o['data'] ?? o['Data'] ?? raw;
  }

  private get<T>(url: string, params?: Record<string, string>): Observable<T> {
    return this.http
      .get<unknown>(url, params ? { params } : {})
      .pipe(map((raw) => this.unwrap(raw) as T));
  }

  getCountrySelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getCountrySelect);
  }

  getRegionSelect(countryCode: number): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getRegionSelect, {
      countryCode: String(countryCode)
    });
  }

  getRoleSelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getRoleSelect);
  }

  getGenderSelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getGenderSelect);
  }

  getRoomTypeSelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getRoomTypeSelect);
  }

  getContentTypeSelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getContentTypeSelect);
  }

  getCurrencyTypeSelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getCurrencyTypeSelect);
  }

  getRoomPostTypeSelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getRoomPostTypeSelect);
  }

  getStatusSelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getStatusSelect);
  }

  getInfoTableSelect(): Observable<SelectListItem[]> {
    return this.get(API_ENDPOINTS.admin.manual.getInfoTableSelect);
  }
}