import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-card">
        <h1>Student Life Helper</h1>
        <p class="subtitle">Sign in to continue</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label for="username">Username</label>
          <input id="username" type="text" formControlName="username" />

          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" />

          <button class="btn-primary" type="submit" [disabled]="loading || form.invalid">
            {{ loading ? 'Signing in...' : 'Login' }}
          </button>
        </form>

        <p *ngIf="successMessage" class="message success">{{ successMessage }}</p>
        <p *ngIf="errorMessage" class="message error">{{ errorMessage }}</p>

        <p class="bottom-link">
          Don't have an account?
          <a routerLink="/register">Register</a>
        </p>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .auth-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      .auth-card {
        width: min(430px, 94vw);
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 18px;
        box-shadow: 0 18px 36px rgba(2, 6, 23, 0.4);
        padding: 30px;
      }
      h1 { margin: 0; font-size: 1.62rem; color: #f8fafc; letter-spacing: 0.01em; }
      .subtitle { margin: 6px 0 18px; color: #94a3b8; }
      form { display: grid; gap: 9px; }
      label { font-size: 0.88rem; color: #cbd5e1; font-weight: 600; }
      input {
        border: 1px solid #334155;
        border-radius: 11px;
        padding: 10px 12px;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color .2s ease;
        background: #111827;
        color: #f8fafc;
      }
      input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); background: #0b1220; }
      .btn-primary {
        margin-top: 8px;
        border: 0;
        border-radius: 11px;
        padding: 11px 14px;
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        transition: transform .15s ease, filter .2s ease;
      }
      .btn-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.04); }
      .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
      .message { margin: 12px 0 0; font-size: 0.92rem; }
      .success { color: #166534; }
      .error { color: #b91c1c; }
      .bottom-link { margin: 14px 0 0; color: #94a3b8; font-size: 0.92rem; }
      a { color: #a5b4fc; text-decoration: none; font-weight: 600; }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';
  successMessage = '';

  readonly form;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    fb: FormBuilder,
  ) {
    this.form = fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const registered = this.route.snapshot.queryParamMap.get('registered') === '1';
    const usernameFromQuery = this.route.snapshot.queryParamMap.get('username')?.trim();
    if (usernameFromQuery) {
      this.form.patchValue({ username: usernameFromQuery });
    }
    if (registered) {
      this.successMessage = usernameFromQuery
        ? 'Registration successful. Sign in with your password below.'
        : 'Registration successful. You can log in now.';
    }

    this.authService
      .tryRestoreSession()
      .pipe(take(1))
      .subscribe(({ ok }) => {
        if (ok) {
          void this.router.navigate(['/admin/profile']);
        }
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const username = (this.form.controls.username.value ?? '').trim().toLowerCase();
    const password = this.form.controls.password.value ?? '';

    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.markForCheck();
          void this.router.navigate(['/admin/profile'], { replaceUrl: true });
        });
      },
      error: (error: unknown) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.errorMessage = this.formatLoginError(error);
          this.cdr.markForCheck();
        });
      },
    });
  }

  private formatLoginError(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: unknown }).error;
      if (
        Array.isArray(body) &&
        body.every(
          (x) =>
            typeof x === 'object' &&
            x !== null &&
            'errorResult' in x &&
            typeof (x as { errorResult?: unknown }).errorResult === 'object' &&
            (x as { errorResult?: unknown }).errorResult !== null,
        )
      ) {
        const messages = body
          .map((x) => {
            const result = (x as { errorResult?: { errorMessage?: unknown } }).errorResult;
            return typeof result?.errorMessage === 'string' ? result.errorMessage : '';
          })
          .filter((x) => x.length > 0);
        if (messages.length > 0) {
          return messages.join(' ');
        }
      }
      if (typeof body === 'string' && body.length > 0) {
        return body;
      }
    }
    return error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
  }
}
