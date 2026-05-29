import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterModel } from '../contracts';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-card">
        <h1>Student Life Helper</h1>
        <p class="subtitle">Create your account</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label for="username">Username</label>
          <input id="username" type="text" formControlName="username" />

          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" />

          <label for="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" type="password" formControlName="confirmPassword" />

          <label for="imageFile">Profile Image (optional)</label>
          <input id="imageFile" type="file" accept="image/*" (change)="onFileSelected($event)" />

          <button class="btn-primary" type="submit" [disabled]="loading || form.invalid">
            {{ loading ? 'Creating account...' : 'Register' }}
          </button>
        </form>

        <p *ngIf="errorMessage" class="message error">{{ errorMessage }}</p>

        <p class="bottom-link">
          Already have an account?
          <a routerLink="/login">Login</a>
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
        width: min(460px, 94vw);
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
export class RegisterComponent {
  loading = false;
  errorMessage = '';
  selectedImageFile: File | null = null;

  readonly form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImageFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const password = this.form.controls.password.value ?? '';
    const confirmPassword = this.form.controls.confirmPassword.value ?? '';
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const model: RegisterModel = {
      firstName: 'Student',
      lastName: 'User',
      middleName: null,
      birthDate: null,
      imageFile: this.selectedImageFile,
      username: this.form.controls.username.value ?? '',
      password,
      // Default codes required by backend register contract.
      birthCountryCode: 1,
      residenceCountryCode: 1,
      genderCode: 1,
      regionCode: 1,
    };

    this.authService.register(model).subscribe({
      next: () => {
        void this.router.navigate(['/login'], { queryParams: { registered: 1 } });
      },
      error: (error: unknown) => {
        this.loading = false;
        this.errorMessage =
          error instanceof Error ? error.message : 'Registration failed. Please try again.';
      },
    });
  }
}
