import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { API_ENDPOINTS, SqlQueryEntry } from '../contracts';
import { SqlPanelService } from './SqlPanelService';

export interface InfoCrudEndpoints {
  getAll: string;
  getById: string;
  create: string;
  update: string;
  delete: string;
  makePassive: string;
  makeActive: string;
}

@Injectable({ providedIn: 'root' })
export class InfoTableService {
  private readonly endpointTemplate = API_ENDPOINTS.admin.info.country;
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

  getAll<TDto>(controller: string): Observable<TDto[]> {
    const urls = this.buildEndpoints(controller);
    return this.http.get<unknown>(urls.getAll).pipe(
      tap((raw) => this.forwardQueries(raw)),
      map((raw) => this.unwrap<TDto[]>(raw))
    );
  }

  getById<TDto, TId extends string | number>(controller: string, id: TId): Observable<TDto> {
    const urls = this.buildEndpoints(controller);
    return this.http.get<unknown>(urls.getById, { params: { id: String(id) } }).pipe(
      tap((raw) => this.forwardQueries(raw)),
      map((raw) => this.unwrap<TDto>(raw))
    );
  }

  create<TCreateModel, TResponse = unknown>(controller: string, model: TCreateModel): Observable<TResponse> {
  const urls = this.buildEndpoints(controller);
  return this.http.post<unknown>(urls.create, model).pipe(
    tap((raw) => this.forwardQueries(raw)),
    map((raw) => this.unwrap<TResponse>(raw))
  );
}

update<TUpdateModel, TId extends string | number, TResponse = unknown>(
  controller: string, id: TId, model: TUpdateModel
): Observable<TResponse> {
  const urls = this.buildEndpoints(controller);
  return this.http.post<unknown>(urls.update, model, {
    params: { id: String(id) },
  }).pipe(
    tap((raw) => this.forwardQueries(raw)),
    map((raw) => this.unwrap<TResponse>(raw))
  );
}

delete<TId extends string | number, TResponse = unknown>(controller: string, id: TId): Observable<TResponse> {
  const urls = this.buildEndpoints(controller);
  return this.http.delete<unknown>(urls.delete, {
    params: { id: String(id) },
  }).pipe(
    tap((raw) => this.forwardQueries(raw)),
    map((raw) => this.unwrap<TResponse>(raw))
  );
}

makePassive<TId extends string | number, TResponse = unknown>(controller: string, id: TId): Observable<TResponse> {
  const urls = this.buildEndpoints(controller);
  return this.http.post<unknown>(urls.makePassive, null, {
    params: { id: String(id) },
  }).pipe(
    tap((raw) => this.forwardQueries(raw)),
    map((raw) => this.unwrap<TResponse>(raw))
  );
}

makeActive<TId extends string | number, TResponse = unknown>(controller: string, id: TId): Observable<TResponse> {
  const urls = this.buildEndpoints(controller);
  return this.http.post<unknown>(urls.makeActive, null, {
    params: { id: String(id) },
  }).pipe(
    tap((raw) => this.forwardQueries(raw)),
    map((raw) => this.unwrap<TResponse>(raw))
  );
}

  private buildEndpoints(controller: string): InfoCrudEndpoints {
    const normalized = controller.trim();
    if (!normalized) throw new Error('Controller name is required.');
    return {
      getAll: this.swapController(this.endpointTemplate.getAll, normalized),
      getById: this.swapController(this.endpointTemplate.getById, normalized),
      create: this.swapController(this.endpointTemplate.create, normalized),
      update: this.swapController(this.endpointTemplate.update, normalized),
      delete: this.swapController(this.endpointTemplate.delete, normalized),
      makePassive: this.swapController(this.endpointTemplate.makePassive, normalized),
      makeActive: this.swapController(this.endpointTemplate.makeActive, normalized),
    };
  }

  private swapController(url: string, controller: string): string {
    return url.replace('/Country/', `/${controller}/`);
  }
}