import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const isRefreshRequest = req.url.includes('/Auth/RefreshToken');

      if (!isUnauthorized || isRefreshRequest) {
        return throwError(() => error);
      }

      const currentAccessToken = authService.getAccessToken();
      const currentRefreshToken = authService.getRefreshToken();
      if (!currentAccessToken || !currentRefreshToken) {
        authService.clearTokens();
        void router.navigate(['/login']);
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
              authService.clearTokens();
              void router.navigate(['/login']);
              return throwError(() => refreshError);
            }),
          );
      }

      return refreshTokenSubject.pipe(
        filter((token): token is string => !!token),
        take(1),
        switchMap((token) => {
          const retriedRequest = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
          return next(retriedRequest);
        }),
      );
    }),
  );
};
