import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from './auth.service';
import { getRoleCodeFromToken } from './jwt.utils';

const ADMIN_ROLE_CODE = 1;

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.tryRestoreSession().pipe(
    map(({ ok }) => {
      if (!ok) {
        return router.createUrlTree(['/login']);
      }
      const token = authService.getAccessToken();
      if (!token) {
        return router.createUrlTree(['/login']);
      }
      const roleCode = getRoleCodeFromToken(token);
      return roleCode === ADMIN_ROLE_CODE ? true : router.createUrlTree(['/admin/profile']);
    }),
  );
};
