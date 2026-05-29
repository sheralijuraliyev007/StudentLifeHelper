import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, take } from 'rxjs';
import { RegisterModel } from '../contracts';
import type { SelectListItem } from '../services/manual.service';
import { RegisterLookupService } from '../services/register-lookup.service';
import { AuthService } from './auth.service';

const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_LOWER = /[a-z]/;
const PASSWORD_DIGIT = /[0-9]/;
const PASSWORD_SPECIAL = /[\W_]/;

function notFutureDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v == null || v === '') {
      return null;
    }
    const d = new Date(v as string);
    if (Number.isNaN(d.getTime())) {
      return { invalidDate: true };
    }
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return d <= endOfToday ? null : { futureDate: true };
  };
}

/** At least 13 years old (matches server-side "AddYears(-13)" style check). */
function minAgeYears(years: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v == null || v === '') {
      return null;
    }
    const birth = new Date(v as string);
    if (Number.isNaN(birth.getTime())) {
      return null;
    }
    const latest = new Date();
    latest.setFullYear(latest.getFullYear() - years);
    latest.setHours(23, 59, 59, 999);
    return birth <= latest ? null : { minAge: { requiredYears: years } };
  };
}

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
          <div class="field-row">
            <div class="field">
              <label for="firstName">First name</label>
              <input id="firstName" type="text" formControlName="firstName" autocomplete="given-name" />
              <span class="field-error" *ngIf="form.controls.firstName.touched && form.controls.firstName.invalid">
                Required, max 50 characters.
              </span>
            </div>
            <div class="field">
              <label for="lastName">Last name</label>
              <input id="lastName" type="text" formControlName="lastName" autocomplete="family-name" />
              <span class="field-error" *ngIf="form.controls.lastName.touched && form.controls.lastName.invalid">
                Required, max 50 characters.
              </span>
            </div>
          </div>

          <label for="middleName">Middle name (optional)</label>
          <input id="middleName" type="text" formControlName="middleName" autocomplete="additional-name" />
          <span class="field-error" *ngIf="form.controls.middleName.touched && form.controls.middleName.invalid">
            Max 50 characters.
          </span>

          <label for="birthDate">Birth date (optional)</label>
          <input id="birthDate" type="date" formControlName="birthDate" [max]="birthDateMax" />
          <span class="field-error" *ngIf="form.controls.birthDate.touched && form.controls.birthDate.invalid">
            Must be in the past and you must be at least 13 years old.
          </span>

          <label for="username">Username</label>
          <input id="username" type="text" formControlName="username" autocomplete="username" />
          <span class="field-error" *ngIf="form.controls.username.touched && form.controls.username.invalid">
            5–50 characters: letters, numbers, dots, and underscores only.
          </span>

          <label for="password">Password</label>
          <input id="password" type="password" formControlName="password" autocomplete="new-password" />
          <p class="help-text">
            At least 8 characters with uppercase, lowercase, a number, and a special character.
          </p>
          <span class="field-error" *ngIf="form.controls.password.touched && form.controls.password.invalid">
            Password does not meet the requirements.
          </span>

          <label for="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" formControlName="confirmPassword" autocomplete="new-password" />
          <span
            class="field-error"
            *ngIf="
              (form.controls.confirmPassword.touched || form.controls.password.touched) &&
              (form.controls.confirmPassword.invalid || form.hasError('passwordMismatch'))
            "
          >
            Must match password.
          </span>

          <label for="birthCountryCode">Birth country</label>
          <select id="birthCountryCode" formControlName="birthCountryCode" (change)="onBirthCountryChanged()">
            <option [ngValue]="null">Select country</option>
            <option *ngFor="let c of countries" [ngValue]="c.orderCode">{{ c.text }}</option>
          </select>

          <label class="checkbox-row">
            <input type="checkbox" [checked]="sameResidenceAsBirth" (change)="onSameResidenceToggle($event)" />
            Residence country is the same as birth country
          </label>

          <ng-container *ngIf="!sameResidenceAsBirth">
            <label for="residenceCountryCode">Residence country</label>
            <select
              id="residenceCountryCode"
              formControlName="residenceCountryCode"
              (change)="onResidenceCountryChanged()"
            >
              <option [ngValue]="null">Select country</option>
              <option *ngFor="let c of countries" [ngValue]="c.orderCode">{{ c.text }}</option>
            </select>
          </ng-container>

          <label for="regionCode">Region</label>
          <select id="regionCode" formControlName="regionCode">
            <option [ngValue]="null">Select region</option>
            <option *ngFor="let r of regions" [ngValue]="r.orderCode">{{ r.text }}</option>
          </select>

          <label for="genderCode">Gender</label>
          <select id="genderCode" formControlName="genderCode">
            <option [ngValue]="null">Select gender</option>
            <option *ngFor="let g of genders" [ngValue]="g.orderCode">{{ g.text }}</option>
          </select>

          <label for="imageFile">Profile photo (optional)</label>
          <input id="imageFile" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" (change)="onFileSelected($event)" />
          <p class="help-text">JPG or PNG, maximum 5 MB.</p>
          <span class="field-error" *ngIf="imageTouched && imageValidationError">{{ imageValidationError }}</span>

          <button class="btn-primary" type="submit" [disabled]="loading || loadingSelects || form.invalid">
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
        padding: 24px;
      }
      .auth-card {
        width: min(560px, 96vw);
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 18px;
        box-shadow: 0 18px 36px rgba(2, 6, 23, 0.4);
        padding: 30px;
      }
      h1 {
        margin: 0;
        font-size: 1.6rem;
        color: #f8fafc;
      }
      .subtitle {
        margin: 6px 0 18px;
        color: #94a3b8;
      }
      .hint-banner {
        margin: 0 0 8px;
        padding: 10px 12px;
        font-size: 0.88rem;
        color: #1e3a5f;
        background: #e0f2fe;
        border-radius: 10px;
        border: 1px solid #bae6fd;
      }
      form {
        display: grid;
        gap: 8px;
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 520px) {
        .field-row {
          grid-template-columns: 1fr;
        }
      }
      .field {
        display: grid;
        gap: 4px;
      }
      label {
        font-size: 0.88rem;
        color: #cbd5e1;
        font-weight: 600;
      }
      .checkbox-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 4px 0;
        cursor: pointer;
      }
      .checkbox-row input {
        width: auto;
      }
      input,
      select {
        border: 1px solid #334155;
        border-radius: 11px;
        padding: 10px 12px;
        outline: none;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          background-color 0.2s ease;
        background: #111827;
        color: #f8fafc;
      }
      input:focus,
      select:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        background: #0b1220;
      }
      .help-text {
        margin: 0;
        font-size: 0.82rem;
        color: #94a3b8;
      }
      .field-error {
        font-size: 0.82rem;
        color: #b91c1c;
      }
      .btn-primary {
        margin-top: 8px;
        border: 0;
        border-radius: 11px;
        padding: 11px 14px;
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.15s ease, filter 0.2s ease;
      }
      .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.04);
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
        color: #94a3b8;
        font-size: 0.92rem;
      }
      a {
        color: #a5b4fc;
        text-decoration: none;
        font-weight: 600;
      }
    `,
  ],
})
export class RegisterComponent {
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  loadingSelects = true;
  errorMessage = '';
  imageValidationError = '';
  imageTouched = false;
  selectedImageFile: File | null = null;
  countries: SelectListItem<number>[] = [];
  genders: SelectListItem<number>[] = [];
  regions: SelectListItem<number>[] = [];
  sameResidenceAsBirth = true;

  readonly birthDateMax: string;

  readonly form;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly registerLookup: RegisterLookupService,
    fb: FormBuilder,
  ) {
    const max = new Date();
    max.setDate(max.getDate() - 1);
    this.birthDateMax = max.toISOString().slice(0, 10);

    this.form = fb.group(
      {
        firstName: ['', [Validators.required, Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        middleName: ['', [Validators.maxLength(50)]],
        birthDate: ['', [notFutureDate(), minAgeYears(13)]],
        username: [
          '',
          [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern(USERNAME_PATTERN)],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(PASSWORD_UPPER),
            Validators.pattern(PASSWORD_LOWER),
            Validators.pattern(PASSWORD_DIGIT),
            Validators.pattern(PASSWORD_SPECIAL),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        birthCountryCode: [null as number | null, [Validators.required]],
        residenceCountryCode: [null as number | null],
        regionCode: [null as number | null, [Validators.required]],
        genderCode: [null as number | null, [Validators.required]],
      },
      { validators: [RegisterComponent.passwordsMatchValidator] },
    );

    this.form.controls.password.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ emitEvent: false });
    });
    this.form.controls.confirmPassword.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ emitEvent: false });
    });

    this.loadSelects();
  }

  private static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value as string | undefined;
    const confirm = group.get('confirmPassword')?.value as string | undefined;
    if (pass == null || confirm == null || pass === '' || confirm === '') {
      return null;
    }
    return pass === confirm ? null : { passwordMismatch: true };
  }

  onSameResidenceToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.sameResidenceAsBirth = checked;
    if (checked) {
      const birth = this.form.controls.birthCountryCode.value;
      this.form.patchValue({ residenceCountryCode: birth }, { emitEvent: false });
      this.loadRegionsForResidence(birth);
    } else {
      this.form.patchValue({ regionCode: null }, { emitEvent: false });
      this.regions = [];
      this.loadRegionsForResidence(this.form.controls.residenceCountryCode.value);
    }
  }

  onBirthCountryChanged(): void {
    const birth = this.form.controls.birthCountryCode.value;
    if (this.sameResidenceAsBirth) {
      this.form.patchValue({ residenceCountryCode: birth }, { emitEvent: false });
      this.loadRegionsForResidence(birth);
    }
  }

  onResidenceCountryChanged(): void {
    this.loadRegionsForResidence(this.form.controls.residenceCountryCode.value);
  }

  onFileSelected(event: Event): void {
    this.imageTouched = true;
    const input = event.target as HTMLInputElement;
    this.selectedImageFile = input.files?.[0] ?? null;
    this.imageValidationError = this.validateAvatar(this.selectedImageFile) ?? '';
    this.errorMessage = '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const imgErr = this.validateAvatar(this.selectedImageFile);
    if (imgErr) {
      this.imageValidationError = imgErr;
      return;
    }
    this.imageValidationError = '';

    this.authService.clearTokens();
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const birthCountryCode = this.form.controls.birthCountryCode.value ?? 0;
    const residenceCountryCode = this.sameResidenceAsBirth
      ? birthCountryCode
      : (this.form.controls.residenceCountryCode.value ?? 0);
    const genderCode = this.form.controls.genderCode.value ?? 0;
    const regionCode = this.form.controls.regionCode.value ?? 0;

    const birthDateRaw = this.form.controls.birthDate.value;
    const birthDate =
      typeof birthDateRaw === 'string' && birthDateRaw.length > 0 ? birthDateRaw : null;

    const middleRaw = (this.form.controls.middleName.value ?? '').trim();
    const username = (this.form.controls.username.value ?? '').trim();
    const password = this.form.controls.password.value ?? '';

    const model: RegisterModel = {
      firstName: (this.form.controls.firstName.value ?? '').trim(),
      lastName: (this.form.controls.lastName.value ?? '').trim(),
      middleName: middleRaw.length > 0 ? middleRaw : null,
      birthDate,
      imageFile: this.selectedImageFile,
      username,
      password,
      birthCountryCode,
      residenceCountryCode,
      genderCode,
      regionCode,
    };

    this.authService
      .register(model)
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: () => {
          this.trySignInAfterRegister(username, password);
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.errorMessage = this.formatRegisterError(err);
            this.cdr.markForCheck();
          });
        },
      });
  }

  private setLoading(value: boolean): void {
    this.ngZone.run(() => {
      this.loading = value;
      this.cdr.markForCheck();
    });
  }

  /** Sign in after successful registration, then go to profile. */
  private trySignInAfterRegister(username: string, password: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    void username;
    void password;

    this.authService
      .login({ username, password })
      .pipe(finalize(() => this.setLoading(false)))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            void this.router.navigate(['/admin/profile'], { replaceUrl: true });
          });
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.errorMessage = this.formatRegisterError(err);
            this.cdr.markForCheck();
          });
        },
      });
  }

  private validateAvatar(file: File | null): string | null {
    if (!file) return null;
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return 'Image must be 5 MB or smaller.';
    }
    const okMime = file.type === 'image/jpeg' || file.type === 'image/png';
    const ext = file.name.toLowerCase();
    const okExt = ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png');
    if (!okMime && !okExt) {
      return 'Only JPG and PNG images are allowed.';
    }
    return null;
  }

  private formatRegisterError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (Array.isArray(body) && body.every((x) => typeof x === 'string')) {
        return body.join(' ');
      }
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
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return 'Registration failed. Please try again.';
  }

  private loadRegionsForResidence(countryCode: number | null): void {
    this.form.patchValue({ regionCode: null }, { emitEvent: false });
    this.regions = [];
    if (!countryCode) {
      return;
    }
    this.registerLookup
      .getRegionSelect(countryCode)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.regions = data;
        },
        error: () => {
          this.errorMessage = 'Failed to load regions.';
        },
      });
  }

  private loadSelects(): void {
    this.loadingSelects = true;

    forkJoin({
      countries: this.registerLookup.getCountrySelect(),
      genders: this.registerLookup.getGenderSelect(),
    })
      .pipe(
        take(1),
        finalize(() => (this.loadingSelects = false)),
      )
      .subscribe({
        next: ({ countries, genders }) => {
          if (countries.length === 0 || genders.length === 0) {
            this.errorMessage = 'Public reference lists are empty.';
            return;
          }
          this.countries = countries;
          this.genders = genders;
          const firstCountry = countries[0]?.orderCode ?? null;
          this.form.patchValue({
            birthCountryCode: firstCountry,
            residenceCountryCode: firstCountry,
            genderCode: genders[0]?.orderCode ?? null,
            regionCode: null,
          });
          this.sameResidenceAsBirth = true;
          this.loadRegionsForResidence(firstCountry);
        },
        error: () => {
          this.errorMessage = 'Public reference lists failed to load. Endpoint returned server error.';
        },
      });
  }
}
