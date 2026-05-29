import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS, InfoTranslationDto } from '../contracts';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  constructor(private readonly http: HttpClient) {}

  getRecordTranslations(tableCode: number, recordCode: number): Observable<InfoTranslationDto[]> {
    return this.http
      .get<InfoTranslationDto[]>(API_ENDPOINTS.admin.info.translation.getRecordTranslations, {
        params: {
          tableCode: String(tableCode),
          recordCode: String(recordCode),
        },
      })
      .pipe(catchError((error) => this.handleError('GetRecordTranslations', error)));
  }

  getTranslation(
    tableCode: number,
    recordCode: number,
    columnName: string,
  ): Observable<InfoTranslationDto> {
    return this.http
      .get<InfoTranslationDto>(API_ENDPOINTS.admin.info.translation.getTranslation, {
        params: {
          tableCode: String(tableCode),
          recordCode: String(recordCode),
          columnName,
        },
      })
      .pipe(catchError((error) => this.handleError('GetTranslation', error)));
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
