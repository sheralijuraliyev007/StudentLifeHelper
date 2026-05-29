import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

const ADMIN_ROLE_CODE = 1;

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const payload = parseJwtPayload(token);
  const roleCodeRaw = payload?.['role_code'];
  const roleCode = typeof roleCodeRaw === 'string' ? Number(roleCodeRaw) : roleCodeRaw;

  if (roleCode !== ADMIN_ROLE_CODE) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
