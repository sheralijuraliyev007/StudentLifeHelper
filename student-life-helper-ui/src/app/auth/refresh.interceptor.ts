import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../contracts';
import { AuthService } from './auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isPublicAuthRequest(url: string): boolean {
  return (
    url.includes('/Auth/Login') ||
    url.includes('/Auth/Register') ||
    url.includes('/Auth/RefreshToken')
  );
}

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (isPublicAuthRequest(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const isRefreshRequest = req.url.includes(API_ENDPOINTS.auth.refreshToken);

      if (!isUnauthorized || isRefreshRequest) {
        return throwError(() => error);
      }

      const currentAccessToken = authService.getAccessToken();
      const currentRefreshToken = authService.getRefreshToken();
      if (!currentAccessToken || !currentRefreshToken) {
        authService.clearTokens();
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService
          .refreshToken({
            accessToken: currentAccessToken,
            refreshToken: currentRefreshToken,
          })
          .pipe(
            switchMap((tokens) => {
              isRefreshing = false;
              refreshTokenSubject.next(tokens.accessToken);

              const retriedRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
              });

              return next(retriedRequest);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokenSubject.next(null);
              authService.clearTokens();
              void router.navigate(['/login']);
              return throwError(() => refreshError);
            }),
          );
      }

      return refreshTokenSubject.pipe(
        filter((token) => token !== null || !isRefreshing),
        take(1),
        switchMap((token: string | null) => {
          if (!token) {
            authService.clearTokens();
            return throwError(() => error);
          }
          const retriedRequest = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
          return next(retriedRequest);
        }),
      );
    }),
  );
};
