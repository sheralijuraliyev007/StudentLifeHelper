import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of, switchMap, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { UserDto } from '../../contracts';
import { RegisterLookupService } from '../../services/register-lookup.service';
import type { SelectListItem } from '../../services/manual.service';
import { toAbsoluteApiResourceUrl } from './profile-image-url';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private static readonly ASSET_DEFAULT = 'assets/avatars/default.png';

  profile: UserDto | null = null;
  isLoading = true;
  errorMessage = '';
  profileActionMessage = '';
  usernameActionMessage = '';
  languageActionMessage = '';
  profileActionError = '';
  usernameActionError = '';
  languageActionError = '';
  savingProfile = false;
  savingUsername = false;
  savingLanguage = false;
  savingImage = false;
  languageModalOpen = false;
  countries: SelectListItem<number>[] = [];
  genders: SelectListItem<number>[] = [];

  /** Bound to `<img [src]>` — backend URL when imgId exists, otherwise default avatar. */
  avatarSrc = '';
  private avatarErrorHandled = false;
  private avatarCacheBuster = 0;
  private localPreviewUrl: string | null = null;
  selectedProfileImageFile: File | null = null;
  imageActionMessage = '';
  imageActionError = '';
  readonly profileForm;
  readonly usernameForm;
  readonly languageForm;

  constructor(
    private readonly authService: AuthService,
    private readonly registerLookupService: RegisterLookupService,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    fb: FormBuilder,
  ) {
    this.profileForm = fb.group({
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]],
      middleName: ['', [Validators.maxLength(50)]],
      birthDate: [''],
      birthCountryCode: [null as number | null],
      residenceCountryCode: [null as number | null],
      genderCode: [null as number | null],
    });

    this.usernameForm = fb.group({
      newUsername: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
    });
    this.languageForm = fb.group({
      languageCode: [null as number | null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadLookups();
    this.loadProfile();
  }

  /**
   * Loads profile from the API and applies it to the view.
   * Call again after any successful action that changes profile data (e.g. update user).
   */
  loadProfile(options?: { showLoading?: boolean }): void {
    const showLoading = options?.showLoading !== false;
    if (showLoading) {
      this.isLoading = true;
      this.errorMessage = '';
    }

    this.authService
      .getProfile(options?.showLoading === false)
      .pipe(
        take(1),
        finalize(() => {
          if (showLoading) {
            this.isLoading = false;
          }
          this.ngZone.run(() => this.cdr.detectChanges());
        }),
      )
      .subscribe({
        next: (user) => {
          this.ngZone.run(() => {
            this.applyProfileState(user);
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.profile = null;
            this.errorMessage = 'Could not load your profile. Try signing in again.';
            this.avatarSrc = '';
            this.cdr.detectChanges();
          });
        },
      });
  }

  computeAvatarSrc(user: UserDto): string {
    const raw = this.readImgUrl(user);
    if (!raw) {
      return ProfileComponent.ASSET_DEFAULT;
    }
    const base = toAbsoluteApiResourceUrl(raw);
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}t=${this.avatarCacheBuster || Date.now()}`;
  }

  onAvatarImgError(): void {
    if (!this.profile || this.avatarErrorHandled) {
      return;
    }
    const fallback = ProfileComponent.ASSET_DEFAULT;
    if (this.avatarSrc === fallback) {
      this.avatarErrorHandled = true;
      return;
    }
    this.avatarSrc = fallback;
    this.avatarErrorHandled = true;
  }

  get displayName(): string {
    const p = this.profile;
    if (!p) {
      return '';
    }
    const parts = [p.firstName, p.middleName, p.lastName].filter((x) => !!x?.trim());
    return parts.length ? parts.join(' ') : p.username;
  }

  submitProfileUpdate(): void {
    if (this.profileForm.invalid || !this.profile) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const form = this.profileForm.getRawValue();
    const payload = {
      firstName: this.toNullableString(form.firstName),
      lastName: this.toNullableString(form.lastName),
      middleName: this.toNullableString(form.middleName),
      birthDate: this.toNullableString(form.birthDate),
      birthCountryCode: this.toNullableNumber(form.birthCountryCode),
      residenceCountryCode: this.toNullableNumber(form.residenceCountryCode),
      genderCode: this.toNullableNumber(form.genderCode),
    };
    this.profileActionError = '';
    this.profileActionMessage = '';
    this.savingProfile = true;
    this.authService
      .updateProfile(payload)
      .pipe(finalize(() => (this.savingProfile = false)))
      .subscribe({
        next: (msg) => {
          this.profileActionMessage = msg || 'Profile updated successfully.';
          this.loadProfile({ showLoading: false });
        },
        error: (err: unknown) => {
          this.profileActionError = this.resolveApiError(err, 'Failed to update profile.');
        },
      });
  }

  submitUsernameUpdate(): void {
    if (this.usernameForm.invalid || !this.profile) {
      this.usernameForm.markAllAsTouched();
      return;
    }
    const newUsername = (this.usernameForm.controls.newUsername.value ?? '').trim().toLowerCase();
    if (!newUsername || newUsername === this.profile.username.toLowerCase()) {
      this.usernameActionError = 'Enter a different username.';
      this.usernameActionMessage = '';
      return;
    }
    this.usernameActionError = '';
    this.usernameActionMessage = '';
    this.savingUsername = true;
    this.authService
      .updateUsername(newUsername)
      .pipe(finalize(() => (this.savingUsername = false)))
      .subscribe({
        next: (msg) => {
          this.usernameActionMessage = msg || 'Username updated successfully.';
          this.loadProfile({ showLoading: false });
        },
        error: (err: unknown) => {
          this.usernameActionError = this.resolveApiError(err, 'Failed to update username.');
        },
      });
  }

  openLanguageModal(): void {
    this.languageActionError = '';
    this.languageActionMessage = '';
    this.languageModalOpen = true;
  }

  closeLanguageModal(): void {
    this.languageModalOpen = false;
  }

  submitLanguageUpdate(): void {
    if (this.languageForm.invalid) {
      this.languageForm.markAllAsTouched();
      return;
    }
    const languageCode = this.toNullableNumber(this.languageForm.controls.languageCode.value);
    if (!languageCode) {
      this.languageActionError = 'Language code is required.';
      return;
    }
    this.savingLanguage = true;
    this.languageActionError = '';
    this.languageActionMessage = '';
    this.authService
      .updateProfile({ languageCode })
      .pipe(finalize(() => (this.savingLanguage = false)))
      .subscribe({
        next: (msg) => {
          this.languageActionMessage = msg || 'Language updated successfully.';
          this.loadProfile({ showLoading: false });
          this.closeLanguageModal();
        },
        error: (err: unknown) => {
          this.languageActionError = this.resolveApiError(err, 'Failed to update language code.');
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.imageActionError = '';
    this.imageActionMessage = '';
    console.log('Selected file:', file ?? null);
    if (!file) {
      this.selectedProfileImageFile = null;
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.selectedProfileImageFile = null;
      this.imageActionError = 'Please choose a valid image file.';
      if (input) {
        input.value = '';
      }
      return;
    }
    this.selectedProfileImageFile = file;
  }

  updateImage(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    console.log('UPLOAD CLICKED');
    if (this.savingImage) {
      return;
    }

    if (!this.profile) {
      this.imageActionError = 'Profile is not loaded.';
      console.error('UPLOAD FAILED: profile is not loaded');
      return;
    }
    if (!this.selectedProfileImageFile) {
      this.imageActionError = 'Select an image first.';
      console.error('No file selected');
      return;
    }
    this.savingImage = true;
    this.imageActionError = '';
    this.imageActionMessage = '';
    this.authService
      .updateUserImage(this.selectedProfileImageFile)
      .pipe(
        switchMap((msg) =>
          this.authService.getProfile(true).pipe(
            take(1),
            catchError(() => of(null)),
            switchMap((user) => of({ msg, user })),
          ),
        ),
        finalize(() => (this.savingImage = false)),
      )
      .subscribe({
        next: ({ msg, user }) => {
          console.log('UPLOAD SUCCESS', msg);
          this.imageActionMessage = msg || 'Profile image updated successfully.';
          this.applyLocalPreview();
          this.selectedProfileImageFile = null;
          this.avatarCacheBuster = Date.now();
          if (user) {
            this.applyProfileState(user);
          }
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          console.error('UPLOAD FAILED', err);
          this.imageActionError = this.resolveApiError(err, 'Failed to update profile image.');
        },
      });
  }

  private applyLocalPreview(): void {
    if (!this.selectedProfileImageFile) {
      return;
    }
    if (this.localPreviewUrl) {
      URL.revokeObjectURL(this.localPreviewUrl);
      this.localPreviewUrl = null;
    }
    this.localPreviewUrl = URL.createObjectURL(this.selectedProfileImageFile);
    this.avatarSrc = this.localPreviewUrl;
    this.avatarErrorHandled = false;
  }

  private patchFormsFromProfile(user: UserDto): void {
    const birthCountryCode = this.resolveCodeByText(this.countries, user.birthCountry);
    const residenceCountryCode = this.resolveCodeByText(this.countries, user.residenceCountry);
    const genderCode = this.resolveCodeByText(this.genders, user.gender);
    this.profileForm.patchValue({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      middleName: user.middleName ?? '',
      birthDate: user.birthDate?.slice(0, 10) ?? '',
      birthCountryCode,
      residenceCountryCode,
      genderCode,
    });
    this.languageForm.patchValue({
      languageCode: user.languageCode ?? null,
    });
    this.usernameForm.patchValue({
      newUsername: user.username ?? '',
    });
  }

  private toNullableString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toNullableNumber(value: unknown): number | null {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private readImgUrl(user: UserDto): string | null {
    const record = user as unknown as Record<string, unknown>;
    const raw = user.imgUrl ?? record['ImgUrl'] ?? record['imgURL'] ?? record['ImgURL'];
    if (typeof raw !== 'string') {
      return null;
    }
    const t = raw.trim();
    return t.length > 0 ? t : null;
  }

  private resolveCodeByText(list: SelectListItem<number>[], text: string | undefined): number | null {
    const target = (text ?? '').trim().toLowerCase();
    if (!target) {
      return null;
    }
    const item = list.find((x) => x.text.trim().toLowerCase() === target);
    return item?.orderCode ?? null;
  }

  private applyProfileState(user: UserDto): void {
    this.profile = user;
    this.errorMessage = '';
    this.patchFormsFromProfile(user);
    this.avatarErrorHandled = false;
    const rawImgUrl = this.readImgUrl(user);
    this.avatarSrc = this.computeAvatarSrc(user);
    if (!rawImgUrl && this.localPreviewUrl) {
      // Keep local preview until backend starts returning imgUrl.
      this.avatarSrc = this.localPreviewUrl;
    } else if (this.localPreviewUrl && this.avatarSrc !== this.localPreviewUrl) {
      URL.revokeObjectURL(this.localPreviewUrl);
      this.localPreviewUrl = null;
    }
    // Temporary debug logs for frontend-state verification.
    console.log('PROFILE IMG URL:', user.imgUrl ?? null);
    console.log('AVATAR SRC:', this.avatarSrc);
  }

  private loadLookups(): void {
    forkJoin({
      countries: this.registerLookupService.getCountrySelect(),
      genders: this.registerLookupService.getGenderSelect(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ countries, genders }) => {
          this.countries = countries;
          this.genders = genders;
          if (this.profile) {
            this.patchFormsFromProfile(this.profile);
          }
        },
        error: () => {
          // page stays functional even if select endpoints fail
        },
      });
  }

  private resolveApiError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (typeof body === 'string' && body.trim()) {
        return body;
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
      const message = (body as { message?: unknown } | null)?.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
      if (error.status === 400) {
        return 'Request failed. Please check your input and try again.';
      }
      return error.message || fallback;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }
}
