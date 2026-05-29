import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

/** Root path: send users with a restorable session straight to admin, else to login. */
export const autoLoginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.tryRestoreSession().pipe(
    map(({ ok }) =>
      ok ? router.createUrlTree(['/admin/profile']) : router.createUrlTree(['/login']),
    ),
  );
};
