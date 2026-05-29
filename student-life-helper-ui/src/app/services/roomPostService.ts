import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  API_ENDPOINTS,
  PaginationModel,
  RoomPostDto,
  RoomPostFilterOptions,
  SqlQueryEntry,
  UpdateRoomPostModel,
} from '../contracts';
import { normalizeRoomPostDto } from '../features/room-posts/room-post-dto-normalize';
import { SqlPanelService } from './SqlPanelService';

/** If the API wraps `PaginationModel` in `data` / `result`, unwrap for parsing. */
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




function mapRoomPostPagination(raw: unknown): PaginationModel<RoomPostDto> {
  const p = normalizePagination<RoomPostDto>(raw);
  return {
    ...p,
    rows: p.rows.map((r) => normalizeRoomPostDto(r)),
  };
}

function buildRoomPostFilterBody(filter: RoomPostFilterOptions): Record<string, unknown> {
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 20;
  const body: Record<string, unknown> = {
    page,
    pageSize,
    Page: page,
    PageSize: pageSize,
  };
  const assign = (key: keyof RoomPostFilterOptions) => {
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
      'sortBy',
      'orderType',
      'roomPostTypeCode',
      'roomTypeCode',
      'title',
      'forGenderCode',
      'currencyCode',
      'minimumMonthlyRentFee',
      'maximumMonthlyRentFee',
      'minimumDepositAmount',
      'maximumDepositAmount',
      'depositExists',
      'regionCode',
    ] as const
  ).forEach(assign);
  return body;
}

/** Same logical action with the opposite `…Async` / non-async segment (for 404/405 fallback). */
function alternateRoomPostActionUrl(url: string): string | null {
  const put = url.match(/^(.*\/RoomPosts\/)(Update|Activate|Deactivate|Delete)(Async)?\/(\d+)$/i);
  if (put) {
    const prefix = put[1]!;
    const action = put[2]!;
    const asyncSeg = put[3];
    const id = put[4]!;
    return asyncSeg ? `${prefix}${action}/${id}` : `${prefix}${action}Async/${id}`;
  }
  const ac = url.match(/^(.*\/RoomPosts\/)AddContent\/(\d+)$/);
  if (ac) {
    return `${ac[1]}AddContentAsync/${ac[2]}`;
  }
  const acA = url.match(/^(.*\/RoomPosts\/)AddContentAsync\/(\d+)$/);
  if (acA) {
    return `${acA[1]}AddContent/${acA[2]}`;
  }
  const deleteContent = url.match(/^(.*\/RoomPosts\/)(DeleteContent)(Async)?\/(\d+)\/(\d+)$/i);
  if (deleteContent) {
    const prefix = deleteContent[1]!;
    const action = deleteContent[2]!;
    const asyncSeg = deleteContent[3];
    const roomPostId = deleteContent[4]!;
    const contentId = deleteContent[5]!;
    return asyncSeg
      ? `${prefix}${action}/${roomPostId}/${contentId}`
      : `${prefix}${action}Async/${roomPostId}/${contentId}`;
  }
  const setCover = url.match(/^(.*\/RoomPosts\/)(SetCover)(Async)?\/(\d+)\/(\d+)$/i);
  if (setCover) {
    const prefix = setCover[1]!;
    const action = setCover[2]!;
    const asyncSeg = setCover[3];
    const roomPostId = setCover[4]!;
    const contentId = setCover[5]!;
    return asyncSeg
      ? `${prefix}${action}/${roomPostId}/${contentId}`
      : `${prefix}${action}Async/${roomPostId}/${contentId}`;
  }
  if (url.endsWith('/GetUserRoomPostsAsync')) {
    return url.replace(/\/GetUserRoomPostsAsync$/, '/GetUserRoomPosts');
  }
  if (url.endsWith('/GetUserRoomPosts')) {
    return url.replace(/\/GetUserRoomPosts$/, '/GetUserRoomPostsAsync');
  }
  return null;
}

@Injectable({
  providedIn: 'root',
})
export class RoomPostService {
  constructor(private readonly http: HttpClient, private readonly sqlPanel: SqlPanelService) {}

  private extractQueries(raw: unknown): void {
    if (!raw || typeof raw !== 'object') return;
    const o = raw as Record<string, unknown>;
    const queries = o['queries'] ?? o['Queries'];
    if (Array.isArray(queries) && queries.length) {
      this.sqlPanel.push(queries as SqlQueryEntry[]);
    }
  }
  


  

  /** On 404/405, retry once with the opposite `…Async` / non-async action segment. */
  private withRoomPostActionFallback<T>(url: string, call: (u: string) => Observable<T>): Observable<T> {
    return call(url).pipe(
      catchError((err: unknown) => {
        const alt = alternateRoomPostActionUrl(url);
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

  /** POST Add — server returns the new room post id as a JSON number. */
  createRoomPostAndGetNewId(formData: FormData): Observable<number> {
    return this.http.post<unknown>(API_ENDPOINTS.mainPage.roomPosts.add, formData).pipe(
      map((raw) => {
        this.extractQueries(raw);
        const o = raw as Record<string, unknown>;
        const id = Number(o['data'] ?? o['Data'] ?? raw);
        if (!id || id <= 0) throw new Error('Server did not return a valid room post ID');
        return id;
      })
    );
  }

getRoomPostById(id: number): Observable<RoomPostDto> {
  return this.http.get<unknown>(API_ENDPOINTS.mainPage.roomPosts.getById(id)).pipe(
    map((raw) => {
      this.extractQueries(raw);
      const o = raw as Record<string, unknown>;
      const body = o['data'] ?? o['Data'] ?? raw;
      if (body == null) throw new Error('Room post not found.');
      return normalizeRoomPostDto(body as RoomPostDto);
    }),
  );
}

getRoomPostsPage(filter: RoomPostFilterOptions): Observable<PaginationModel<RoomPostDto>> {
  return this.http
    .post<unknown>(API_ENDPOINTS.mainPage.roomPosts.getAll, buildRoomPostFilterBody(filter))
    .pipe(map((raw) => {
      this.extractQueries(raw);
      return mapRoomPostPagination(raw);
    }));
}

  /**
   * Current user's room posts. Server: `POST …/GetUserRoomPosts` with JSON body (`RoomPostFilterOptions`), same style as `GetAll`.
   */
getUserRoomPostsPage(filter: RoomPostFilterOptions): Observable<PaginationModel<RoomPostDto>> {
  const url = API_ENDPOINTS.mainPage.roomPosts.getUserRoomPosts;
  const body = buildRoomPostFilterBody(filter);
  return this.withRoomPostActionFallback(url, (u) =>
    this.http.post<unknown>(u, body),
  ).pipe(map((raw) => {
    this.extractQueries(raw);
    return mapRoomPostPagination(raw);
  }));
  
}

addContent(roomPostId: number, files: File[]): Observable<string> {
  if (!Number.isFinite(roomPostId) || roomPostId <= 0) {
    return throwError(() => new Error('Invalid room post id for content upload.'));
  }
  const url = API_ENDPOINTS.mainPage.roomPosts.addContent(roomPostId);
  const fd = new FormData();
  files.forEach((file) => fd.append('files', file));
  return this.http.post<unknown>(url, fd).pipe(
    map((raw) => {
      this.extractQueries(raw);
      const o = raw as Record<string, unknown>;
      return (o['data'] ?? o['Data'] ?? '') as string;
    })
  );
}

 deleteContent(roomPostId: number, contentId: number): Observable<string> {
  const url = API_ENDPOINTS.mainPage.roomPosts.deleteContent(roomPostId, contentId);
  return this.withRoomPostActionFallback(url, (u) => this.http.delete<unknown>(u)).pipe(
    map((raw) => {
      this.extractQueries(raw);
      const o = raw as Record<string, unknown>;
      return (o['data'] ?? o['Data'] ?? '') as string;
    })
  );
}

setCover(roomPostId: number, contentId: number): Observable<string> {
  const url = API_ENDPOINTS.mainPage.roomPosts.setCover(roomPostId, contentId);
  return this.withRoomPostActionFallback(url, (u) => this.http.put<unknown>(u, {})).pipe(
    map((raw) => {
      this.extractQueries(raw);
      const o = raw as Record<string, unknown>;
      return (o['data'] ?? o['Data'] ?? '') as string;
    })
  );
}

  /** `PUT …/RoomPosts/Update/{id}` + JSON body per `BaseMainPageController.UpdateAsync`. */
  updateRoomPost(id: number, body: UpdateRoomPostModel): Observable<string> {
    const url = API_ENDPOINTS.mainPage.roomPosts.update(id);
    return this.withRoomPostActionFallback(url, (u) =>
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

  /** Status actions return `text/plain` (e.g. "Activated"), not JSON. */
  private putRoomPostStatusAction(url: string): Observable<string> {
    return this.withRoomPostActionFallback(url, (u) =>
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
      })
    );
  }

  

  activateRoomPost(id: number): Observable<string> {
    return this.putRoomPostStatusAction(API_ENDPOINTS.mainPage.roomPosts.activate(id));
  }

  deactivateRoomPost(id: number): Observable<string> {
    return this.putRoomPostStatusAction(API_ENDPOINTS.mainPage.roomPosts.deactivate(id));
  }

  deleteRoomPost(id: number): Observable<string> {
    return this.putRoomPostStatusAction(API_ENDPOINTS.mainPage.roomPosts.delete(id));
  }
}
