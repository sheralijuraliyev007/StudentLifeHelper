import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AdminUserFilterOptions,
  API_ENDPOINTS,
  PaginationModel,
  SqlQueryEntry,
  UpdateUserModelForAdmin,
  UserDtoForAdmin,
} from '../contracts';
import { SqlPanelService } from './SqlPanelService';
import { Observable, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
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

  getAll(filter: AdminUserFilterOptions): Observable<PaginationModel<UserDtoForAdmin>> {
    return this.http.post<unknown>(API_ENDPOINTS.admin.users.getAll, filter).pipe(
      tap((raw) => this.forwardQueries(raw)),
      map((raw) => this.unwrap<PaginationModel<UserDtoForAdmin>>(raw))
    );
  }

  getByUsername(username: string): Observable<UserDtoForAdmin> {
    const params = new HttpParams().set('username', username);
    return this.http.get<unknown>(API_ENDPOINTS.admin.users.getByUsername, { params }).pipe(
      tap((raw) => this.forwardQueries(raw)),
      map((raw) => this.unwrap<UserDtoForAdmin>(raw))
    );
  }

  update(userId: string, payload: UpdateUserModelForAdmin) {
    return this.http.put(API_ENDPOINTS.admin.users.update(userId), payload, { responseType: 'text' });
  }

  activate(userId: string) {
    return this.http.put(API_ENDPOINTS.admin.users.activate(userId), {}, { responseType: 'text' });
  }

  deactivate(userId: string) {
    return this.http.put(API_ENDPOINTS.admin.users.deactivate(userId), {}, { responseType: 'text' });
  }

  delete(userId: string) {
    return this.http.delete(API_ENDPOINTS.admin.users.delete(userId), { responseType: 'text' });
  }

  updateUserImage(userId: string, imageFile: File) {
    const formData = new FormData();
    formData.append('img', imageFile);
    return this.http.put(API_ENDPOINTS.admin.users.updateUserImage(userId), formData, { responseType: 'text' });
  }
}