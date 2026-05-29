import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../contracts';

export interface SelectListItem<TValue = number> {
  value: TValue;
  text: string;
  orderCode: number;
}

@Injectable({
  providedIn: 'root',
})
export class ManualService {
  constructor(private readonly http: HttpClient) {}

  getCountrySelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getCountrySelect)
      .pipe(catchError((error) => this.handleError('GetCountrySelect', error)));
  }

  getRegionSelect(countryCode: number): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getRegionSelect, {
        params: { countryCode: String(countryCode) },
      })
      .pipe(catchError((error) => this.handleError('GetRegionSelect', error)));
  }

  getRoleSelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getRoleSelect)
      .pipe(catchError((error) => this.handleError('GetRoleSelect', error)));
  }

  getGenderSelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getGenderSelect)
      .pipe(catchError((error) => this.handleError('GetGenderSelect', error)));
  }

  getRoomTypeSelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getRoomTypeSelect)
      .pipe(catchError((error) => this.handleError('GetRoomTypeSelect', error)));
  }

  getContentTypeSelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getContentTypeSelect)
      .pipe(catchError((error) => this.handleError('GetContentTypeSelect', error)));
  }

  getCurrencyTypeSelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getCurrencyTypeSelect)
      .pipe(catchError((error) => this.handleError('GetCurrencyTypeSelect', error)));
  }

  getRoomPostTypeSelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getRoomPostTypeSelect)
      .pipe(catchError((error) => this.handleError('GetRoomPostTypeSelect', error)));
  }

  getStatusSelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getStatusSelect)
      .pipe(catchError((error) => this.handleError('GetStatusSelect', error)));
  }

  getInfoTableSelect(): Observable<SelectListItem<number>[]> {
    return this.http
      .get<SelectListItem<number>[]>(API_ENDPOINTS.admin.manual.getInfoTableSelect)
      .pipe(catchError((error) => this.handleError('GetInfoTableSelect', error)));
  }

  private handleError(operation: string, error: unknown) {
    const message =
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Unexpected error';

    return throwError(() => new Error(`${operation} failed: ${message}`));
  }
}
