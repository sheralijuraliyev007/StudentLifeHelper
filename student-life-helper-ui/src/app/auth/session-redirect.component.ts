import { Component } from '@angular/core';

/** Placeholder for `/` when `autoLoginGuard` always redirects (avoids an empty route config). */
@Component({
  selector: 'app-session-redirect',
  standalone: true,
  template: '',
})
export class SessionRedirectComponent {}
