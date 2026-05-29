import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
      :host {
        display: block;
        min-height: 100vh;
      }
      .auth-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f4f6fb;
        padding: 20px;
      }
      .auth-card {
        width: min(420px, 92vw);
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 14px 36px rgba(31, 41, 55, 0.12);
        padding: 28px;
      }
      h1 {
        margin: 0;
        font-size: 1.6rem;
        color: #111827;
      }
      .subtitle {
        margin: 6px 0 18px;
        color: #6b7280;
      }
      form {
        display: grid;
        gap: 8px;
      }
      label {
        font-size: 0.9rem;
        color: #374151;
      }
      input {
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 10px 12px;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      input:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
      }
      .btn-primary {
        margin-top: 8px;
        border: 0;
        border-radius: 10px;
        padding: 11px 14px;
        background: #4f46e5;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      .btn-primary:hover:not(:disabled) {
        background: #4338ca;
      }
      .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      .message {
        margin: 12px 0 0;
        font-size: 0.92rem;
      }
      .success {
        color: #166534;
      }
      .error {
        color: #b91c1c;
      }
      .bottom-link {
        margin: 14px 0 0;
        color: #6b7280;
        font-size: 0.92rem;
      }
      a {
        color: #4f46e5;
        text-decoration: none;
        font-weight: 600;
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const registered = this.route.snapshot.queryParamMap.get('registered');
    if (registered === '1') {
      this.successMessage = 'Registration successful. You can log in now.';
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const username = this.form.controls.username.value ?? '';
    const password = this.form.controls.password.value ?? '';

    this.authService.login({ username, password }).subscribe({
      next: () => {
        void this.router.navigate(['/admin/dashboard']);
      },
      error: (error: unknown) => {
        this.loading = false;
        this.errorMessage =
          error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      },
    });
  }
}
