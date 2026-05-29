import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  API_ENDPOINTS,
  CurrencyPostDto,
  CurrencyPostFilterOptions,
  PaginationModel,
  SqlQueryEntry,
  UpdateCurrencyPostModel,
} from '../contracts';
import { normalizeCurrencyPostDto } from '../features/currency-posts/currency-post-dto-normalize';
import { SqlPanelService } from './SqlPanelService';

function unwrapPagedPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }
  const o = raw as Record<string, unknown>;
  const inner = o['data'] ?? o['Data'] ?? o['result'] ?? o['Result'];
  if (inner && typeof inner === 'object') {
    const inn = inner as Record<string, unknown>;
    if ('rows' in inn || 'Rows' in inn || 'total' in inn || 'Total' in inn) {
      return inner;
    }
  }
  return raw;
}

function extractRowArray(rowsRaw: unknown): unknown[] {
  if (Array.isArray(rowsRaw)) {
    return rowsRaw;
  }
  if (rowsRaw && typeof rowsRaw === 'object') {
    const values = Object.values(rowsRaw as Record<string, unknown>);
    if (values.length && values.every((v) => v && typeof v === 'object')) {
      return values;
    }
  }
  return [];
}

function normalizePagination<T>(raw: unknown): PaginationModel<T> {
  if (Array.isArray(raw)) {
    return {
      rows: raw as T[],
      pageIndex: 1,
      pageSize: raw.length,
      total: raw.length,
    };
  }
  const payload = unwrapPagedPayload(raw);
  if (!payload || typeof payload !== 'object') {
    return { rows: [], pageIndex: 1, pageSize: 20, total: 0 };
  }
  const o = payload as Record<string, unknown>;
  const rowsRaw = o['rows'] ?? o['Rows'];
  const rows = extractRowArray(rowsRaw) as T[];
  return {
    rows,
    pageIndex: Number(o['pageIndex'] ?? o['PageIndex'] ?? o['page'] ?? o['Page'] ?? 1),
    pageSize: Number(o['pageSize'] ?? o['PageSize'] ?? 20),
    total: Number(o['total'] ?? o['Total'] ?? 0),
  };
}

function mapCurrencyPostPagination(raw: unknown): PaginationModel<CurrencyPostDto> {
  const p = normalizePagination<CurrencyPostDto>(raw);
  return {
    ...p,
    rows: p.rows.map((r) => normalizeCurrencyPostDto(r)),
  };
}

function buildCurrencyPostFilterBody(filter: CurrencyPostFilterOptions): Record<string, unknown> {
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 20;
  const body: Record<string, unknown> = {
    page,
    pageSize,
    Page: page,
    PageSize: pageSize,
  };
  const assign = (key: keyof CurrencyPostFilterOptions) => {
    const v = filter[key];
    if (v === undefined || v === null) {
      return;
    }
    if (typeof v === 'string' && v === '') {
      return;
    }
    body[key as string] = v as unknown;
    const pascal = key.charAt(0).toUpperCase() + key.slice(1);
    body[pascal] = v as unknown;
  };
  (
    [
      'fromCurrencyCode',
      'toCurrencyCode',
      'minAmount',
      'maxAmount',
      'username',
      'search',
      'sortBy',
      'orderType',
    ] as const
  ).forEach(assign);
  return body;
}

function alternateCurrencyPostActionUrl(url: string): string | null {
  const put = url.match(/^(.*\/CurrencyPosts\/)(Update|Activate|Deactivate|Delete)(Async)?\/(\d+)$/i);
  if (put) {
    const prefix = put[1]!;
    const action = put[2]!;
    const asyncSeg = put[3];
    const id = put[4]!;
    return asyncSeg ? `${prefix}${action}/${id}` : `${prefix}${action}Async/${id}`;
  }
  if (url.endsWith('/GetUserCurrencyPostsAsync')) {
    return url.replace(/\/GetUserCurrencyPostsAsync$/, '/GetUserCurrencyPosts');
  }
  if (url.endsWith('/GetUserCurrencyPosts')) {
    return url.replace(/\/GetUserCurrencyPosts$/, '/GetUserCurrencyPostsAsync');
  }
  const add = url.match(/^(.*\/CurrencyPosts\/)Add(Async)?$/i);
  if (add) {
    return add[2] ? `${add[1]}Add` : `${add[1]}AddAsync`;
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class CurrencyPostService {
  constructor(
    private readonly http: HttpClient,
    private readonly sqlPanel: SqlPanelService
  ) {}

  private extractQueries(raw: unknown): void {
    if (!raw || typeof raw !== 'object') return;
    const o = raw as Record<string, unknown>;
    const queries = o['queries'] ?? o['Queries'];
    if (Array.isArray(queries) && queries.length) {
      this.sqlPanel.push(queries as SqlQueryEntry[]);
    }
  }

  private withActionFallback<T>(url: string, call: (u: string) => Observable<T>): Observable<T> {
    return call(url).pipe(
      catchError((err: unknown) => {
        const alt = alternateCurrencyPostActionUrl(url);
        if (
          !(err instanceof HttpErrorResponse) ||
          alt == null ||
          (err.status !== 404 && err.status !== 405)
        ) {
          return throwError(() => err);
        }
        return call(alt);
      }),
    );
  }

  getAll(filter: CurrencyPostFilterOptions): Observable<PaginationModel<CurrencyPostDto>> {
    return this.http
      .post<unknown>(API_ENDPOINTS.mainPage.currencyPosts.getAll, buildCurrencyPostFilterBody(filter))
      .pipe(map((raw) => {
        this.extractQueries(raw);
        return mapCurrencyPostPagination(raw);
      }));
  }

  getUserPosts(filter: CurrencyPostFilterOptions): Observable<PaginationModel<CurrencyPostDto>> {
    const url = API_ENDPOINTS.mainPage.currencyPosts.getUserPosts;
    const body = buildCurrencyPostFilterBody(filter);
    return this.withActionFallback(url, (u) => this.http.post<unknown>(u, body)).pipe(
      map((raw) => {
        this.extractQueries(raw);
        return mapCurrencyPostPagination(raw);
      }),
    );
  }

  getById(id: number): Observable<CurrencyPostDto> {
    return this.http.get<unknown>(API_ENDPOINTS.mainPage.currencyPosts.getById(id)).pipe(
      map((raw) => {
        this.extractQueries(raw);
        const o = raw as Record<string, unknown>;
        const body = o['data'] ?? o['Data'] ?? raw;
        if (body == null) throw new Error('Currency post not found.');
        return normalizeCurrencyPostDto(body);
      }),
    );
  }

  create(formData: FormData): Observable<number> {
    const url = API_ENDPOINTS.mainPage.currencyPosts.add;
    return this.withActionFallback(url, (u) => this.http.post<unknown>(u, formData)).pipe(
      map((raw) => {
        this.extractQueries(raw);
        const o = raw as Record<string, unknown>;
        const id = Number(o['data'] ?? o['Data'] ?? raw);
        if (!id || id <= 0) throw new Error('Server did not return a valid currency post ID.');
        return id;
      }),
    );
  }

  update(id: number, body: UpdateCurrencyPostModel): Observable<string> {
    const url = API_ENDPOINTS.mainPage.currencyPosts.update(id);
    return this.withActionFallback(url, (u) =>
      this.http.put<unknown>(u, body, {
        headers: { 'Content-Type': 'application/json' },
      })
    ).pipe(
      map((raw) => {
        this.extractQueries(raw);
        const o = raw as Record<string, unknown>;
        return (o['data'] ?? o['Data'] ?? '') as string;
      })
    );
  }

  private putStatusAction(url: string): Observable<string> {
    return this.withActionFallback(url, (u) =>
      this.http.put<unknown>(u, {})
    ).pipe(
      map((raw) => {
        this.extractQueries(raw);
        const o = raw as Record<string, unknown>;
        const msg = ((o['data'] ?? o['Data'] ?? '') as string).trim();
        if (msg && /failed|cannot|not found|unauthorized/i.test(msg) &&
            !/success|activated|deactivated|deleted/i.test(msg)) {
          throw new Error(msg);
        }
        return msg;
      }),
    );
  }

  activate(id: number): Observable<string> {
    return this.putStatusAction(API_ENDPOINTS.mainPage.currencyPosts.activate(id));
  }

  deactivate(id: number): Observable<string> {
    return this.putStatusAction(API_ENDPOINTS.mainPage.currencyPosts.deactivate(id));
  }

  delete(id: number): Observable<string> {
    return this.putStatusAction(API_ENDPOINTS.mainPage.currencyPosts.delete(id));
  }
}
