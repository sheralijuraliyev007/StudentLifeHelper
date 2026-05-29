import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../contracts';

export interface InfoCrudEndpoints {
  getAll: string;
  getById: string;
  create: string;
  update: string;
  delete: string;
  makePassive: string;
  makeActive: string;
}

@Injectable({
  providedIn: 'root',
})
export class InfoTableService {
  // Reuse endpoint pattern already defined in API_ENDPOINTS.admin.info
  private readonly endpointTemplate = API_ENDPOINTS.admin.info.country;

  constructor(private readonly http: HttpClient) {}

  getAll<TDto>(controller: string): Observable<TDto[]> {
    const urls = this.buildEndpoints(controller);
    return this.http
      .get<TDto[]>(urls.getAll)
      .pipe(catchError((error) => this.handleError(`GetAll for ${controller}`, error)));
  }

  getById<TDto, TId extends string | number>(controller: string, id: TId): Observable<TDto> {
    const urls = this.buildEndpoints(controller);
    return this.http
      .get<TDto>(urls.getById, { params: { id: String(id) } })
      .pipe(catchError((error) => this.handleError(`GetById for ${controller}`, error)));
  }

  create<TCreateModel, TResponse = unknown>(
    controller: string,
    model: TCreateModel,
  ): Observable<TResponse> {
    const urls = this.buildEndpoints(controller);
    return this.http
      .post<TResponse>(urls.create, model)
      .pipe(catchError((error) => this.handleError(`Create for ${controller}`, error)));
  }

  update<TUpdateModel, TId extends string | number, TResponse = unknown>(
    controller: string,
    id: TId,
    model: TUpdateModel,
  ): Observable<TResponse> {
    const urls = this.buildEndpoints(controller);
    return this.http
      .post<TResponse>(urls.update, model, { params: { id: String(id) } })
      .pipe(catchError((error) => this.handleError(`Update for ${controller}`, error)));
  }

  delete<TId extends string | number, TResponse = unknown>(
    controller: string,
    id: TId,
  ): Observable<TResponse> {
    const urls = this.buildEndpoints(controller);
    return this.http
      .delete<TResponse>(urls.delete, { params: { id: String(id) } })
      .pipe(catchError((error) => this.handleError(`Delete for ${controller}`, error)));
  }

  makePassive<TId extends string | number, TResponse = unknown>(
    controller: string,
    id: TId,
  ): Observable<TResponse> {
    const urls = this.buildEndpoints(controller);
    return this.http
      .post<TResponse>(urls.makePassive, null, { params: { id: String(id) } })
      .pipe(catchError((error) => this.handleError(`MakePassive for ${controller}`, error)));
  }

  makeActive<TId extends string | number, TResponse = unknown>(
    controller: string,
    id: TId,
  ): Observable<TResponse> {
    const urls = this.buildEndpoints(controller);
    return this.http
      .post<TResponse>(urls.makeActive, null, { params: { id: String(id) } })
      .pipe(catchError((error) => this.handleError(`MakeActive for ${controller}`, error)));
  }

  private buildEndpoints(controller: string): InfoCrudEndpoints {
    const normalized = controller.trim();
    if (!normalized) {
      throw new Error('Controller name is required.');
    }

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
