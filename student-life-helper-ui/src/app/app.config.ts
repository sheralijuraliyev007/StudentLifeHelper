import { ApplicationConfig } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { jwtInterceptor } from './auth/jwt.interceptor';
import { refreshInterceptor } from './auth/refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Default XHR backend runs inside NgZone so subscribers update the UI reliably.
    // `withFetch()` can leave responses completing outside the zone (stuck "Loading…" despite 200 in DevTools).
    provideHttpClient(withInterceptors([jwtInterceptor, refreshInterceptor])),
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideAnimations(),
  ],
};
