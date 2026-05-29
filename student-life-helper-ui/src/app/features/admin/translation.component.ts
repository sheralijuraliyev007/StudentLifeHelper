import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, catchError, finalize, map, of, switchMap, take, takeUntil, throwError } from 'rxjs';
import { InfoTranslationDto } from '../../contracts';
import { AuthService } from '../../auth/auth.service';
import { InfoTableService } from '../../services/info-table.service';
import { ManualService, SelectListItem } from '../../services/manual.service';
import { ToastMessage, ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
import { LanguageStateService } from '../../services/language-state.service';

interface LanguageOption {
  code: number;
  fullName: string;
}

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="card">
        <h2>Translations</h2>
        <p class="subtitle">Search and manage record translations.</p>

        <form class="grid" [formGroup]="queryForm">
          <label>Info Table</label>
          <select formControlName="tableCode" (change)="onQueryInfoTableChange($event)">
            <option [ngValue]="null">Select table</option>
            <option *ngFor="let item of infoTables; trackBy: trackInfoTable" [ngValue]="item.orderCode">{{ item.text }}</option>
          </select>

          <label>Record Code</label>
          <input type="number" formControlName="recordCode" />

          <label>Column Name</label>
          <input type="text" formControlName="columnName" />
        </form>

        <div class="actions">
          <button class="btn btn-primary" [disabled]="isLoading || queryForm.invalid" (click)="loadRecordTranslations()">
            Get Record Translations
          </button>
          <button class="btn btn-secondary" [disabled]="isLoading || queryForm.invalid" (click)="loadSingleTranslation()">
            Get Single Translation
          </button>
        </div>
      </div>

      <div class="card">
        <h3>Create Translation</h3>
        <form class="grid" [formGroup]="createForm">
          <label>Table</label>
          <select formControlName="tableCode">
            <option [ngValue]="null">Select table</option>
            <option *ngFor="let item of infoTables; trackBy: trackInfoTable" [ngValue]="item.orderCode">{{ item.text }}</option>
          </select>

          <label>Language</label>
          <select formControlName="languageCode">
            <option [ngValue]="null">Select language</option>
            <option *ngFor="let language of languages" [ngValue]="language.code">{{ language.fullName }}</option>
          </select>

          <label>Record Code</label>
          <input type="number" formControlName="recordCode" />

          <label>Column Name</label>
          <input type="text" formControlName="columnName" />

          <label>Translated Text</label>
          <textarea formControlName="translatedText" rows="3"></textarea>
        </form>
        <div class="actions">
          <button class="btn btn-primary" [disabled]="isLoading || createForm.invalid" (click)="createTranslation()">
            Create
          </button>
        </div>
      </div>

      <div class="card">
        <h3>Translations Result</h3>
        <table>
          <thead>
            <tr>
              <th>Table</th>
              <th>Language</th>
              <th>Record</th>
              <th>Column</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="translations.length === 0 && !isLoading">
              <td colspan="5" class="empty">No data loaded.</td>
            </tr>
            <tr *ngFor="let translation of translations; let i = index" [class.striped]="i % 2 === 1">
              <td>{{ translation.tableCode }}</td>
              <td>{{ languageDisplay(translation.languageCode) }}</td>
              <td>{{ translation.recordCode }}</td>
              <td>{{ translation.columnName }}</td>
              <td>{{ translation.translatedText }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="overlay" *ngIf="isLoading">
        <div class="spinner"></div>
      </div>

      <div class="toast-stack">
        <div *ngFor="let toast of toasts" class="toast" [class.success]="toast.success" [class.error]="!toast.success">
          {{ toast.text }}
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page { position: relative; display: grid; gap: 16px; }
    .card { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 8px 24px rgba(15,23,42,.08); }
    h2, h3 { margin: 0 0 8px; }
    .subtitle { margin: 0 0 12px; color: #6b7280; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(180px, 1fr)); gap: 8px 12px; }
    label { font-size: .85rem; color: #4b5563; }
    input, select, textarea { border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 10px; outline: none; }
    input:focus, select:focus, textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
    .actions { margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; }
    .btn { border: 0; border-radius: 8px; padding: 8px 12px; font-weight: 600; cursor: pointer; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }
    .btn-primary { background: #4f46e5; color: #fff; }
    .btn-secondary { background: #e5e7eb; color: #111827; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #edf0f6; }
    th { font-size: .84rem; text-transform: uppercase; color: #5e667a; }
    .striped { background: #fafbff; }
    .empty { text-align: center; color: #6b7280; }
    .overlay { position: absolute; inset: 0; background: rgba(255,255,255,.65); display: grid; place-items: center; border-radius: 12px; }
    .spinner { width: 34px; height: 34px; border: 3px solid #c7d2fe; border-top-color: #4f46e5; border-radius: 50%; animation: spin .8s linear infinite; }
    .toast-stack { position: fixed; top: 18px; right: 18px; display: grid; gap: 8px; z-index: 1100; }
    .toast { color: #fff; padding: 10px 14px; border-radius: 8px; min-width: 220px; box-shadow: 0 8px 20px rgba(0,0,0,.18); }
    .toast.success { background: #16a34a; }
    .toast.error { background: #dc2626; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class TranslationComponent implements OnInit, OnDestroy {
  isLoading = false;
  translations: InfoTranslationDto[] = [];
  infoTables: SelectListItem<number>[] = [];
  languages: LanguageOption[] = [];
  toasts: ToastMessage[] = [];
  /** From `AuthService.getProfile()` for Get Single Translation (matches user language in DB). */
  private userLanguageCode: number | null = null;

  readonly queryForm;
  readonly createForm;
  private readonly destroy$ = new Subject<void>();
  /** Supports overlapping translation HTTP calls so one completion does not clear another's loading state. */
  private pendingLoadingCount = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly translationService: TranslationService,
    private readonly infoTableService: InfoTableService,
    private readonly manualService: ManualService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly languageStateService: LanguageStateService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.queryForm = this.fb.group({
      tableCode: [null as number | null, [Validators.required]],
      /** Optional until load; invalid values (e.g. negative) must not block table selection. */
      recordCode: [null as number | null],
      columnName: [''],
    });

    this.createForm = this.fb.group({
      tableCode: [null as number | null, [Validators.required]],
      languageCode: [null as number | null, [Validators.required]],
      recordCode: [null as number | null, [Validators.required]],
      columnName: ['', [Validators.required]],
      translatedText: ['', [Validators.required]],
    });

    this.toastService.toasts$.pipe(takeUntil(this.destroy$)).subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  ngOnInit(): void {
    const fromToken = this.authService.getLanguageCodeFromAccessToken();
    if (fromToken != null) {
      this.userLanguageCode = fromToken;
    }
    this.loadInfoTables();
    this.loadLanguages();
    this.loadUserLanguageFromProfile();
    this.languageStateService.languageCode$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
      if (code == null) {
        return;
      }
      this.userLanguageCode = code;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecordTranslations(): void {
    const tableCode = this.queryForm.controls.tableCode.value;
    const recordCode = this.queryForm.controls.recordCode.value;
    if (tableCode == null) {
      return;
    }
    if (!Number.isFinite(Number(tableCode))) {
      return;
    }
    if (!this.isValidPositiveRecordCode(recordCode)) {
      this.toastService.show('Enter a valid positive record code.', false);
      return;
    }
    this.fetchRecordTranslations(Number(tableCode), Number(recordCode));
  }

  /**
   * Reads table code from the native `change` event, always syncs the form, then either
   * loads translations (valid positive record only) or clears stale rows for the new table.
   */
  onQueryInfoTableChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const tableCode = this.readTableCodeFromSelectChange(select);
    if (tableCode === null) {
      this.queryForm.patchValue({ tableCode: null });
      this.translations = [];
      return;
    }

    this.queryForm.patchValue({ tableCode });

    const recordCode = this.queryForm.controls.recordCode.value;
    if (!this.isValidPositiveRecordCode(recordCode)) {
      this.translations = [];
      return;
    }

    this.fetchRecordTranslations(tableCode, Number(recordCode));
  }

  /** Record codes are positive integers (matches typical `code` columns). */
  private isValidPositiveRecordCode(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    const n = Number(value);
    return Number.isFinite(n) && n > 0 && Number.isInteger(n);
  }

  private readTableCodeFromSelectChange(select: HTMLSelectElement): number | null {
    if (select.selectedIndex <= 0) {
      return null;
    }
    const item = this.infoTables[select.selectedIndex - 1];
    if (!item) {
      return null;
    }
    const n = Number(item.orderCode);
    return Number.isFinite(n) ? n : null;
  }

  private fetchRecordTranslations(tableCode: number, recordCode: number): void {
    this.withLoading(
      this.translationService.getRecordTranslations(tableCode, recordCode).pipe(take(1)),
      (data) => {
        this.translations = data;
        this.toastService.show('Record translations loaded.', true);
      },
      'Failed to load record translations.',
    );
  }

  loadSingleTranslation(): void {
    const tableCode = this.queryForm.controls.tableCode.value;
    const recordCode = this.queryForm.controls.recordCode.value;
    const columnName = (this.queryForm.controls.columnName.value ?? '').trim();
    if (tableCode == null || !columnName) {
      this.toastService.show('Table and column name are required.', false);
      return;
    }
    if (!this.isValidPositiveRecordCode(recordCode)) {
      this.toastService.show('Enter a valid positive record code.', false);
      return;
    }

    const tc = Number(tableCode);
    const rc = Number(recordCode);
    const resolveLang$ =
      this.userLanguageCode != null && Number.isFinite(this.userLanguageCode)
        ? of(this.userLanguageCode)
        : this.authService.getProfile().pipe(
            take(1),
            map((u) => {
              const lc = this.readLanguageCodeFromUser(u);
              if (lc != null) {
                this.userLanguageCode = lc;
              }
              return lc;
            }),
          );

    this.withLoading(
      resolveLang$.pipe(
        take(1),
        switchMap((lang) => {
          if (lang == null) {
            return throwError(
              () => new Error('Your language could not be read from your profile. Try refreshing the page.'),
            );
          }
          return this.translationService.getTranslation(tc, rc, columnName, lang);
        }),
      ),
      (data) => {
        this.translations = [data];
        this.toastService.show('Translation loaded.', true);
      },
      'Failed to load translation.',
    );
  }

  /** Table column: show language name when `languages` is loaded; otherwise the numeric code. */
  languageDisplay(languageCode: number): string {
    if (!Number.isFinite(languageCode) || languageCode <= 0) {
      return '—';
    }
    const row = this.languages.find((l) => l.code === languageCode);
    return row ? row.fullName : String(languageCode);
  }

  private readLanguageCodeFromUser(user: unknown): number | null {
    const r = user as Record<string, unknown> | null | undefined;
    if (!r) {
      return null;
    }
    const raw = r['languageCode'] ?? r['LanguageCode'];
    if (raw == null || raw === '') {
      return null;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      return null;
    }
    return n;
  }

  createTranslation(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload = {
      tableCode: this.createForm.controls.tableCode.value,
      languageCode: this.createForm.controls.languageCode.value,
      recordCode: this.createForm.controls.recordCode.value,
      columnName: (this.createForm.controls.columnName.value ?? '').trim(),
      translatedText: (this.createForm.controls.translatedText.value ?? '').trim(),
    };

    this.withLoading(
      this.infoTableService.create('Translation', payload).pipe(take(1)),
      () => {
        const newItem: InfoTranslationDto = {
          tableCode: payload.tableCode ?? 0,
          languageCode: payload.languageCode ?? 0,
          recordCode: payload.recordCode ?? 0,
          columnName: payload.columnName,
          translatedText: payload.translatedText,
        };
        this.translations = [newItem, ...this.translations];
        this.createForm.reset({
          tableCode: null,
          languageCode: null,
          recordCode: null,
          columnName: '',
          translatedText: '',
        });
        this.toastService.show('Translation created successfully.', true);
      },
      'Failed to create translation.',
    );
  }

  trackInfoTable(_: number, item: SelectListItem<number>): number {
    return item.orderCode;
  }

  private loadInfoTables(): void {
    this.manualService
      .getInfoTableSelect()
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        map((data) => this.normalizeInfoTableSelect(data)),
        catchError(() =>
          this.infoTableService.getAll<{ id?: number; code?: number; fullName?: string }>('InfoTable').pipe(
            take(1),
            map((rows) =>
              (rows ?? [])
                .map((row) => {
                  const value = Number(row?.id);
                  const orderCode = Number(row?.code);
                  const text = (row?.fullName ?? '').toString().trim();
                  if (!Number.isFinite(value) || !Number.isFinite(orderCode) || !text) {
                    return null;
                  }
                  return { value, orderCode, text } as SelectListItem<number>;
                })
                .filter((item): item is SelectListItem<number> => item !== null),
            ),
          ),
        ),
      )
      .subscribe({
        next: (data) => {
          this.infoTables = data ?? [];
          if (this.infoTables.length === 0) {
            this.toastService.show('Info table options are empty.', false);
          }
        },
        error: () => {
          this.toastService.show('Failed to load info table options.', false);
        },
      });
  }

  private normalizeInfoTableSelect(data: unknown): SelectListItem<number>[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((raw) => {
        const row = raw as Record<string, unknown> | null;
        if (!row) {
          return null;
        }

        const valueRaw = row['value'] ?? row['Value'];
        const orderCodeRaw = row['orderCode'] ?? row['OrderCode'];
        const textRaw = row['text'] ?? row['Text'];

        const value = Number(valueRaw);
        const orderCode = Number(orderCodeRaw);
        const text = typeof textRaw === 'string' ? textRaw.trim() : '';
        if (!Number.isFinite(value) || !Number.isFinite(orderCode) || !text) {
          return null;
        }

        return { value, orderCode, text } as SelectListItem<number>;
      })
      .filter((item): item is SelectListItem<number> => item !== null);
  }

  private loadUserLanguageFromProfile(): void {
    this.authService
      .getProfile()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe({
        next: (user) => {
          const lc = this.readLanguageCodeFromUser(user);
          if (lc != null) {
            this.userLanguageCode = lc;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          /* profile optional; server still resolves language when query param omitted */
        },
      });
  }

  private loadLanguages(): void {
    this.infoTableService
      .getAll<{ code: number; fullName: string }>('Language')
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe({
        next: (data) => {
          this.languages = (data ?? []).map((item) => ({ code: item.code, fullName: item.fullName }));
        },
        error: () => {
          this.toastService.show('Failed to load languages.', false);
        },
      });
  }

  private withLoading<T>(
    request$: import('rxjs').Observable<T>,
    next: (value: T) => void,
    errorMessage: string,
  ): void {
    this.pendingLoadingCount += 1;
    this.isLoading = true;
    request$
      .pipe(
        finalize(() => {
          this.pendingLoadingCount = Math.max(0, this.pendingLoadingCount - 1);
          this.isLoading = this.pendingLoadingCount > 0;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next,
        error: (error: unknown) => {
          this.toastService.show(error instanceof Error ? error.message : errorMessage, false);
        },
      });
  }
}
