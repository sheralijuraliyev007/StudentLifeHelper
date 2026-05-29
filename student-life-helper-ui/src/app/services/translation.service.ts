import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { API_ENDPOINTS, InfoTranslationDto, SqlQueryEntry } from '../contracts';
import { SqlPanelService } from './SqlPanelService';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly sqlPanel = inject(SqlPanelService);

  private forwardQueries(raw: unknown): void {
    if (!raw || typeof raw !== 'object') return;
    const o = raw as Record<string, unknown>;
    const queries = o['queries'] ?? o['Queries'];
    if (Array.isArray(queries) && queries.length) {
      this.sqlPanel.push(queries as SqlQueryEntry[]);
    }
  }

  private unwrap<T>(raw: unknown): T {
    if (!raw || typeof raw !== 'object') return raw as T;
    const o = raw as Record<string, unknown>;
    return (o['data'] ?? o['Data'] ?? raw) as T;
  }

  getRecordTranslations(tableCode: number, recordCode: number): Observable<InfoTranslationDto[]> {
    return this.http
      .get<unknown>(API_ENDPOINTS.admin.info.translation.getRecordTranslations, {
        params: { tableCode: String(tableCode), recordCode: String(recordCode) },
      })
      .pipe(
        tap((raw) => this.forwardQueries(raw)),
        map((raw) => this.unwrap<InfoTranslationDto[]>(raw))
      );
  }

  getTranslation(
    tableCode: number,
    recordCode: number,
    columnName: string,
    languageCode?: number | null,
  ): Observable<InfoTranslationDto> {
    let params = new HttpParams()
      .set('tableCode', String(tableCode))
      .set('recordCode', String(recordCode))
      .set('columnName', columnName);
    if (languageCode != null && Number.isFinite(languageCode)) {
      params = params.set('languageCode', String(languageCode));
    }

    return this.http
      .get<unknown>(API_ENDPOINTS.admin.info.translation.getTranslation, { params })
      .pipe(
        tap((raw) => this.forwardQueries(raw)),
        map((raw) => {
          const text = this.unwrap<string>(raw);
          const lc = languageCode != null && Number.isFinite(Number(languageCode))
            ? Number(languageCode) : 0;
          return {
            tableCode,
            languageCode: lc,
            recordCode,
            columnName,
            translatedText: text ?? '',
          };
        }),
      );
  }
}