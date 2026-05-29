import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, catchError, finalize, forkJoin, of, takeUntil } from 'rxjs';
import { UserDtoForAdmin } from '../../contracts';
import { AdminUserService } from '../../services/admin-user.service';
import { ManualService, SelectListItem } from '../../services/manual.service';
import { ToastMessage, ToastService } from '../../services/toast.service';

interface UserFilters {
  userName: string;
  roleCode: number | null;
  genderCode: number | null;
  birthCountryCode: number | null;
  residenceCountryCode: number | null;
  pageSize: number;
}

interface UsersResponseShape {
  rows?: UserDtoForAdmin[];
  Rows?: UserDtoForAdmin[];
  total?: number;
  Total?: number;
  page?: number;
  Page?: number;
  pageSize?: number;
  PageSize?: number;
}

interface EditableUserSnapshot {
  firstName: string;
  lastName: string;
  middleName: string | null;
  birthDate: string | null;
  roleCode: number | null;
  genderCode: number | null;
  birthCountryCode: number | null;
  residenceCountryCode: number | null;
  languageCode: number | null;
}

const STATE_ACTIVE = 1;
const STATE_PASSIVE = 2;
const ALLOWED_ROLE_CODE_ON_UPDATE = 2;

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <div class="head">
        <div>
          <h2>Users Management</h2>
          <p class="head-subtitle">Manage members with quick filters and safe actions</p>
        </div>
        <button class="btn" type="button" (click)="reload()" [disabled]="loading || actionLoading">Refresh</button>
      </div>

      <form [formGroup]="filtersForm" class="filters" (ngSubmit)="applyFilters()">
        <input type="text" formControlName="userName" placeholder="Search username" />
        <select formControlName="roleCode">
          <option [ngValue]="null">All roles</option>
          <option *ngFor="let option of roles" [ngValue]="option.orderCode">{{ option.text }}</option>
        </select>
        <select formControlName="genderCode">
          <option [ngValue]="null">All genders</option>
          <option *ngFor="let option of genders" [ngValue]="option.orderCode">{{ option.text }}</option>
        </select>
        <select formControlName="birthCountryCode">
          <option [ngValue]="null">Birth country</option>
          <option *ngFor="let option of countries" [ngValue]="option.orderCode">{{ option.text }}</option>
        </select>
        <select formControlName="residenceCountryCode">
          <option [ngValue]="null">Residence country</option>
          <option *ngFor="let option of countries" [ngValue]="option.orderCode">{{ option.text }}</option>
        </select>
        <select formControlName="pageSize">
          <option [ngValue]="10">10</option>
          <option [ngValue]="20">20</option>
          <option [ngValue]="50">50</option>
        </select>
        <button class="btn primary" type="submit" [disabled]="loading || actionLoading">Apply</button>
      </form>

      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="table-wrap" *ngIf="!loading; else loadingTpl">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Role</th>
              <th>Gender</th>
              <th>Birth/Residence</th>
              <th>State</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users; trackBy: trackByUserId">
              <td>{{ user.username }}</td>
              <td>{{ fullName(user) }}</td>
              <td><span class="chip">{{ user.role }}</span></td>
              <td><span class="chip chip-soft">{{ user.gender }}</span></td>
              <td>{{ user.birthCountry }} / {{ user.residenceCountry }}</td>
              <td>
                <span class="state-badge" [class.state-active]="isUserActive(user)" [class.state-passive]="!isUserActive(user)">
                  {{ user.state }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-sm" type="button" (click)="openEdit(user)" [disabled]="actionLoading">Edit</button>
                <button
                  class="btn-sm"
                  type="button"
                  (click)="toggleState(user)"
                  [disabled]="actionLoading || !canToggleState(user)"
                >
                  {{ isUserActive(user) ? 'Deactivate' : 'Activate' }}
                </button>
                <button class="btn-sm danger" type="button" (click)="remove(user)" [disabled]="actionLoading">Delete</button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="7" class="empty">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #loadingTpl>
        <div class="loading">Loading users...</div>
      </ng-template>

      <div class="pager">
        <button class="btn" type="button" (click)="prevPage()" [disabled]="loading || actionLoading || pageIndex <= 1">
          Previous
        </button>
        <span>Page {{ pageIndex }} / {{ totalPages }}</span>
        <button class="btn" type="button" (click)="nextPage()" [disabled]="loading || actionLoading || pageIndex >= totalPages">
          Next
        </button>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="editingUser" (click)="closeEdit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Edit User</h3>
        <form [formGroup]="editForm" (ngSubmit)="saveEdit()">
          <input type="text" formControlName="firstName" placeholder="First name" />
          <input type="text" formControlName="lastName" placeholder="Last name" />
          <input type="text" formControlName="middleName" placeholder="Middle name (optional)" />
          <input type="date" formControlName="birthDate" />
          <select formControlName="roleCode">
            <option [ngValue]="null">Role</option>
            <option *ngFor="let option of roles" [ngValue]="option.orderCode">{{ option.text }}</option>
          </select>
          <select formControlName="genderCode">
            <option [ngValue]="null">Gender</option>
            <option *ngFor="let option of genders" [ngValue]="option.orderCode">{{ option.text }}</option>
          </select>
          <select formControlName="birthCountryCode">
            <option [ngValue]="null">Birth country</option>
            <option *ngFor="let option of countries" [ngValue]="option.orderCode">{{ option.text }}</option>
          </select>
          <select formControlName="residenceCountryCode">
            <option [ngValue]="null">Residence country</option>
            <option *ngFor="let option of countries" [ngValue]="option.orderCode">{{ option.text }}</option>
          </select>
          <input type="number" formControlName="languageCode" placeholder="Language code" />
          <div class="image-upload-row">
            <input type="file" accept="image/*" (change)="onEditImageSelected($event)" />
            <button class="btn" type="button" (click)="saveEditImage()" [disabled]="actionLoading || !selectedEditImageFile">
              Update Image
            </button>
          </div>

          <div class="modal-actions">
            <button class="btn" type="button" (click)="closeEdit()">Cancel</button>
            <button class="btn primary" type="submit" [disabled]="loading || actionLoading || editForm.invalid">Save</button>
          </div>
        </form>
      </div>
    </div>

    <div class="toast-wrap">
      <div
        *ngFor="let toast of toasts; trackBy: trackToastById"
        class="toast"
        [class.success]="toast.success"
        [class.error-toast]="!toast.success"
      >
        {{ toast.text }}
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        position: relative;
        overflow: hidden;
        background: linear-gradient(160deg, rgba(15, 23, 42, .92), rgba(30, 41, 59, .88));
        border: 1px solid rgba(51, 65, 85, .9);
        border-radius: 20px;
        padding: 22px;
        box-shadow: 0 20px 36px rgba(2, 6, 23, .42);
      }
      .card::before {
        content: "";
        position: absolute;
        width: 220px;
        height: 220px;
        border-radius: 999px;
        top: -110px;
        right: -80px;
        background: radial-gradient(circle, rgba(129, 140, 248, .22) 0%, transparent 70%);
        pointer-events: none;
      }
      .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
      h2 { margin: 0; color: #f8fafc; }
      .head-subtitle { margin: 4px 0 0; color: #94a3b8; font-size: .88rem; }
      .filters { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
      @media (max-width: 1200px) { .filters { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      @media (max-width: 760px) { .filters { grid-template-columns: 1fr; } }
      input, select {
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 8px 10px;
        background: #111827;
        color: #f8fafc;
      }
      .btn {
        border: 1px solid #334155;
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 10px;
        padding: 8px 12px;
        cursor: pointer;
        font-weight: 600;
        transition: all .2s ease;
      }
      .btn:hover:not(:disabled) { border-color: #6366f1; transform: translateY(-1px); }
      .primary { background: linear-gradient(90deg, #4f46e5, #4338ca); color: #fff; border-color: #4338ca; }
      .btn-sm {
        border: 1px solid #cbd5e1;
        background: #111827;
        color: #e2e8f0;
        border-radius: 8px;
        padding: 5px 8px;
        cursor: pointer;
        font-size: .82rem;
      }
      .danger { border-color: #7f1d1d; color: #fecaca; background: #450a0a; }
      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 11px 8px; border-bottom: 1px solid #334155; text-align: left; vertical-align: top; color: #e2e8f0; }
      th { font-size: .78rem; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; font-weight: 700; }
      tbody tr:hover { background: rgba(99, 102, 241, .12); }
      .chip {
        display: inline-flex;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: .78rem;
        font-weight: 700;
        color: #312e81;
        background: rgba(99, 102, 241, .12);
      }
      .chip-soft { color: #0f766e; background: rgba(20, 184, 166, .12); }
      .state-badge {
        display: inline-flex;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: .78rem;
        font-weight: 700;
      }
      .state-active { color: #166534; background: #dcfce7; }
      .state-passive { color: #991b1b; background: #fee2e2; }
      .actions { display: flex; gap: 6px; flex-wrap: wrap; min-width: 220px; }
      .empty { color: #94a3b8; text-align: center; }
      .loading { color: #94a3b8; padding: 12px 0; }
      .pager { margin-top: 12px; display: flex; gap: 12px; align-items: center; justify-content: flex-end; }
      .error { color: #fca5a5; margin: 0 0 10px; }
      .modal-backdrop { position: fixed; inset: 0; background: rgba(17, 24, 39, .45); display: grid; place-items: center; z-index: 1000; }
      .modal {
        width: min(560px, 92vw);
        background: rgba(255, 255, 255, .98);
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        box-shadow: 0 20px 44px rgba(15, 23, 42, .2);
        padding: 16px;
        display: grid;
        gap: 8px;
      }
      .modal h3 { margin: 0 0 4px; }
      .modal form { display: grid; gap: 8px; }
      .image-upload-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; }
      .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
      .toast-wrap { position: fixed; top: 20px; right: 20px; display: grid; gap: 8px; z-index: 1200; }
      .toast { padding: 10px 12px; border-radius: 8px; color: #fff; font-size: .9rem; box-shadow: 0 8px 24px rgba(15, 23, 42, .15); }
      .toast.success { background: #16a34a; }
      .toast.error-toast { background: #dc2626; }
    `,
  ],
})
export class UsersManagementComponent implements OnInit, OnDestroy {
  readonly filtersForm;
  readonly editForm;
  readonly destroy$ = new Subject<void>();

  users: UserDtoForAdmin[] = [];
  roles: SelectListItem<number>[] = [];
  genders: SelectListItem<number>[] = [];
  countries: SelectListItem<number>[] = [];
  toasts: ToastMessage[] = [];
  editingUser: UserDtoForAdmin | null = null;
  private editingSnapshot: EditableUserSnapshot | null = null;
  selectedEditImageFile: File | null = null;
  loading = false;
  actionLoading = false;
  errorMessage = '';
  pageIndex = 1;
  total = 0;
  pageSize = 10;
  private loadToken = 0;

  constructor(
    fb: FormBuilder,
    private readonly usersService: AdminUserService,
    private readonly manualService: ManualService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
  ) {
    this.filtersForm = fb.group({
      userName: [''],
      roleCode: [null as number | null],
      genderCode: [null as number | null],
      birthCountryCode: [null as number | null],
      residenceCountryCode: [null as number | null],
      pageSize: [10, [Validators.required]],
    });

    this.editForm = fb.group({
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]],
      middleName: ['', [Validators.maxLength(50)]],
      birthDate: [''],
      roleCode: [null as number | null],
      genderCode: [null as number | null],
      birthCountryCode: [null as number | null],
      residenceCountryCode: [null as number | null],
      languageCode: [null as number | null],
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  ngOnInit(): void {
    this.toastService.toasts$.pipe(takeUntil(this.destroy$)).subscribe((toasts) => (this.toasts = toasts));
    this.loadSelects();
    this.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.pageSize = Number(this.filtersForm.controls.pageSize.value ?? 10);
    this.reload();
  }

  reload(showLoading = true): void {
    const f = this.filtersForm.getRawValue() as UserFilters;
    const requestToken = ++this.loadToken;
    this.errorMessage = '';
    this.execute(
      this.usersService.getAll({
        page: this.pageIndex,
        pageSize: Number(f.pageSize ?? 10),
        userName: (f.userName ?? '').trim() || null,
        roleCode: f.roleCode,
        genderCode: f.genderCode,
        birthCountryCode: f.birthCountryCode,
        residenceCountryCode: f.residenceCountryCode,
      }),
      (response) => {
        if (requestToken !== this.loadToken) {
          return;
        }
        this.users = this.normalizeRows(response);
        this.total = this.readNumber(response, 'total', this.users.length);
        this.pageIndex = this.readNumber(response, 'page', this.pageIndex);
        this.pageSize = this.readNumber(response, 'pageSize', Number(f.pageSize ?? 10));
      },
      'Failed to load users.',
      false,
      showLoading,
      requestToken,
      (message) => {
        if (requestToken !== this.loadToken) {
          return;
        }
        this.errorMessage = message;
      },
    );
  }

  prevPage(): void {
    if (this.pageIndex <= 1) return;
    this.pageIndex -= 1;
    this.reload();
  }

  nextPage(): void {
    if (this.pageIndex >= this.totalPages) return;
    this.pageIndex += 1;
    this.reload();
  }

  openEdit(user: UserDtoForAdmin): void {
    this.editingUser = user;
    this.selectedEditImageFile = null;
    this.editingSnapshot = {
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName ?? null,
      birthDate: user.birthDate?.slice(0, 10) ?? null,
      roleCode: user.roleId ?? null,
      genderCode: user.genderId ?? null,
      birthCountryCode: user.birthCountryId ?? null,
      residenceCountryCode: user.residenceCountryId ?? null,
      languageCode: user.languageCode ?? null,
    };
    this.editForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName ?? '',
      birthDate: user.birthDate?.slice(0, 10) ?? '',
      roleCode: user.roleId ?? null,
      genderCode: user.genderId ?? null,
      birthCountryCode: user.birthCountryId ?? null,
      residenceCountryCode: user.residenceCountryId ?? null,
      languageCode: user.languageCode ?? null,
    });
  }

  closeEdit(): void {
    this.editingUser = null;
    this.editingSnapshot = null;
    this.selectedEditImageFile = null;
  }

  onEditImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    if (!file) {
      this.selectedEditImageFile = null;
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.selectedEditImageFile = null;
      this.toastService.show('Please choose a valid image file.', false);
      if (input) {
        input.value = '';
      }
      return;
    }
    this.selectedEditImageFile = file;
  }

  saveEditImage(): void {
    if (this.actionLoading) {
      return;
    }
    if (!this.editingUser) {
      return;
    }
    if (!this.selectedEditImageFile) {
      this.toastService.show('Select an image first.', false);
      return;
    }
    this.actionLoading = true;
    this.execute(
      this.usersService.updateUserImage(this.editingUser.id, this.selectedEditImageFile),
      () => {
        this.toastService.show('User image updated.', true);
        this.selectedEditImageFile = null;
        this.syncInBackground();
      },
      'Image update failed.',
      true,
      false,
    );
  }

  saveEdit(): void {
    if (!this.editingUser || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const form = this.editForm.getRawValue();
    const selectedRole = this.numOrNull(form['roleCode']);
    const originalRole = this.editingSnapshot?.roleCode ?? null;
    const roleChanged = selectedRole !== originalRole;
    if (roleChanged && selectedRole !== null && selectedRole !== ALLOWED_ROLE_CODE_ON_UPDATE) {
      this.toastService.show(`Only role code ${ALLOWED_ROLE_CODE_ON_UPDATE} is allowed.`, false);
      return;
    }
    const payload = this.buildUpdatePayload(form);
    if (!payload) {
      this.closeEdit();
      this.toastService.show('No changes detected.', true);
      return;
    }
    this.actionLoading = true;
    const editing = this.editingUser;
    this.execute(
      this.usersService.update(this.editingUser.id, payload),
      () => {
        if (editing) {
          this.applyEditLocally(editing.id, form);
        }
        this.closeEdit();
        this.toastService.show('User updated.', true);
        this.syncInBackground();
      },
      'Update failed.',
      true,
      false,
    );
  }

  toggleState(user: UserDtoForAdmin): void {
    const isActive = this.isUserActive(user);
    if ((isActive && !user.canDeactivate) || (!isActive && !user.canActivate)) {
      this.toastService.show('State action is not allowed for this user.', false);
      return;
    }

    this.actionLoading = true;
    const request$ = isActive
      ? this.usersService.deactivate(user.id)
      : this.usersService.activate(user.id);
    this.execute(
      request$,
      () => {
        const nextActive = !isActive;
        this.users = this.users.map((entry) =>
          entry.id === user.id
            ? {
                ...entry,
                canDeactivate: nextActive,
                canActivate: !nextActive,
                state: nextActive ? 'Active' : 'Passive',
                stateId: nextActive ? STATE_ACTIVE : STATE_PASSIVE,
              }
            : entry,
        );
        this.toastService.show('User state updated.', true);
        this.syncInBackground();
      },
      'State update failed.',
      true,
      false,
    );
  }

  remove(user: UserDtoForAdmin): void {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    this.actionLoading = true;
    this.execute(
      this.usersService.delete(user.id),
      () => {
        this.users = this.users.filter((entry) => entry.id !== user.id);
        this.total = Math.max(0, this.total - 1);
        this.toastService.show('User deleted.', true);
        this.syncInBackground();
      },
      'Delete failed.',
      true,
      false,
    );
  }

  fullName(user: UserDtoForAdmin): string {
    return [user.firstName, user.middleName, user.lastName].filter((x) => !!x).join(' ');
  }

  trackByUserId(_: number, user: UserDtoForAdmin): string {
    return user.id;
  }

  trackToastById(_: number, toast: ToastMessage): number {
    return toast.id;
  }

  private loadSelects(): void {
    this.execute(
      forkJoin({
        roles: this.manualService.getRoleSelect().pipe(catchError(() => of([] as SelectListItem<number>[]))),
        genders: this.manualService.getGenderSelect().pipe(catchError(() => of([] as SelectListItem<number>[]))),
        countries: this.manualService.getCountrySelect().pipe(catchError(() => of([] as SelectListItem<number>[]))),
      }),
      ({ roles, genders, countries }) => {
        this.roles = roles ?? [];
        this.genders = genders ?? [];
        this.countries = countries ?? [];
      },
      'Failed to load filter selects.',
      true,
      false,
    );
  }

  private resolveError(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string' && err.error.trim()) return err.error;
      const msg = (err.error as { message?: unknown } | null)?.message;
      if (typeof msg === 'string' && msg.trim()) return msg;
      return err.message || fallback;
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }

  private normalizeRows(response: UsersResponseShape | unknown): UserDtoForAdmin[] {
    const record = this.asRecord(response) as UsersResponseShape | null;
    const rowsRaw = (record?.['rows'] ?? record?.['Rows']) as unknown;
    if (!Array.isArray(rowsRaw)) {
      return [];
    }
    return (rowsRaw as UserDtoForAdmin[]).map((user) => this.normalizeUserState(user));
  }

  private readNumber(response: UsersResponseShape | unknown, key: string, fallback: number): number {
    const record = this.asRecord(response);
    const candidate = record?.[key] ?? record?.[key.charAt(0).toUpperCase() + key.slice(1)];
    const value = Number(candidate);
    return Number.isFinite(value) ? value : fallback;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private nullIfEmpty(v: unknown): string | null {
    if (typeof v !== 'string') return null;
    const trimmed = v.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private numOrNull(v: unknown): number | null {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  private buildUpdatePayload(form: Record<string, unknown>): Record<string, unknown> | null {
    const snapshot = this.editingSnapshot;
    if (!snapshot) {
      return null;
    }

    const current: EditableUserSnapshot = {
      firstName: this.nullIfEmpty(form['firstName']) ?? '',
      lastName: this.nullIfEmpty(form['lastName']) ?? '',
      middleName: this.nullIfEmpty(form['middleName']),
      birthDate: this.nullIfEmpty(form['birthDate']),
      roleCode: this.numOrNull(form['roleCode']),
      genderCode: this.numOrNull(form['genderCode']),
      birthCountryCode: this.numOrNull(form['birthCountryCode']),
      residenceCountryCode: this.numOrNull(form['residenceCountryCode']),
      languageCode: this.numOrNull(form['languageCode']),
    };

    if (!current.genderCode) {
      current.genderCode = snapshot.genderCode;
    }
    if (!current.languageCode) {
      current.languageCode = snapshot.languageCode;
    }
    const payload: Record<string, unknown> = {};
    if (current.firstName !== snapshot.firstName) payload['FirstName'] = current.firstName;
    if (current.lastName !== snapshot.lastName) payload['LastName'] = current.lastName;
    if ((current.middleName ?? null) !== (snapshot.middleName ?? null)) payload['MiddleName'] = current.middleName;
    if ((current.birthDate ?? null) !== (snapshot.birthDate ?? null)) payload['BirthDate'] = current.birthDate;
    if ((current.birthCountryCode ?? null) !== (snapshot.birthCountryCode ?? null)) {
      payload['BirthCountryCode'] = current.birthCountryCode;
    }
    if ((current.residenceCountryCode ?? null) !== (snapshot.residenceCountryCode ?? null)) {
      payload['ResidenceCountryCode'] = current.residenceCountryCode;
    }
    // API validation currently requires LanguageCode on update.
    payload['LanguageCode'] = current.languageCode;
    // API validation currently requires GenderCode on update.
    payload['GenderCode'] = current.genderCode;
    if ((current.roleCode ?? null) !== (snapshot.roleCode ?? null) && current.roleCode !== null) {
      payload['RoleCode'] = current.roleCode;
    }

    const genderChanged = (current.genderCode ?? null) !== (snapshot.genderCode ?? null);
    const changedKeys = Object.keys(payload).filter((k) => {
      if (k === 'LanguageCode') return false;
      if (k === 'GenderCode') return genderChanged;
      return true;
    });
    return changedKeys.length > 0 ? payload : null;
  }

  private execute<T>(
    request$: Observable<T>,
    onSuccess: (response: T) => void,
    fallbackError: string,
    showErrorToast = true,
    useLoadingOverlay = true,
    loadCompletionToken?: number,
    onError?: (message: string) => void,
  ): void {
    if (useLoadingOverlay) {
      this.loading = true;
    }
    this.actionLoading = !useLoadingOverlay;

    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            if (useLoadingOverlay) {
              if (loadCompletionToken !== undefined && loadCompletionToken !== this.loadToken) {
                return;
              }
              this.loading = false;
            }
            this.actionLoading = false;
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          onSuccess(response);
          this.cdr.detectChanges();
        });
      },
      error: (err: unknown) => {
        const message = this.resolveError(err, fallbackError);
        if (onError) {
          onError(message);
        } else if (showErrorToast) {
          this.toastService.show(message, false);
        }
      },
    });
  }

  private syncInBackground(): void {
    this.reload(false);
  }

  private applyEditLocally(userId: string, form: Record<string, unknown>): void {
    this.users = this.users.map((entry) => {
      if (entry.id !== userId) return entry;
      const firstName = this.nullIfEmpty(form['firstName']) ?? entry.firstName;
      const middleName = this.nullIfEmpty(form['middleName']);
      const lastName = this.nullIfEmpty(form['lastName']) ?? entry.lastName;
      const birthDate = this.nullIfEmpty(form['birthDate']) ?? entry.birthDate ?? null;
      const roleCode = this.numOrNull(form['roleCode']) ?? entry.roleId;
      const genderCode = this.numOrNull(form['genderCode']) ?? entry.genderId;
      const birthCountryCode = this.numOrNull(form['birthCountryCode']) ?? entry.birthCountryId;
      const residenceCountryCode = this.numOrNull(form['residenceCountryCode']) ?? entry.residenceCountryId;
      const languageCode = this.numOrNull(form['languageCode']) ?? entry.languageCode ?? 0;

      return {
        ...entry,
        firstName,
        middleName,
        lastName,
        birthDate,
        roleId: roleCode,
        genderId: genderCode,
        birthCountryId: birthCountryCode,
        residenceCountryId: residenceCountryCode,
        languageCode,
      };
    });
  }

  isUserActive(user: UserDtoForAdmin): boolean {
    const stateId = Number(user.stateId);
    if (Number.isFinite(stateId)) {
      return stateId === STATE_ACTIVE;
    }
    const state = (user.state ?? '').toString().trim().toLowerCase();
    if (state === 'active') {
      return true;
    }
    if (state === 'passive' || state === 'inactive') {
      return false;
    }
    if (typeof user.canDeactivate === 'boolean' && typeof user.canActivate === 'boolean') {
      if (user.canDeactivate && !user.canActivate) return true;
      if (!user.canDeactivate && user.canActivate) return false;
    }
    if (typeof user.canDeactivate === 'boolean') {
      return user.canDeactivate;
    }
    return true;
  }

  canToggleState(user: UserDtoForAdmin): boolean {
    return this.isUserActive(user) ? !!user.canDeactivate : !!user.canActivate;
  }

  private normalizeUserState(user: UserDtoForAdmin): UserDtoForAdmin {
    const active = this.isUserActive(user);
    return {
      ...user,
      canDeactivate: active,
      canActivate: !active,
      state: active ? 'Active' : 'Passive',
      stateId: active ? STATE_ACTIVE : STATE_PASSIVE,
    };
  }
}
