import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, finalize, takeUntil } from 'rxjs';
import { LanguageStateService } from '../../services/language-state.service';
import { InfoTableService } from '../../services/info-table.service';
import { ToastMessage, ToastService } from '../../services/toast.service';

interface InfoItem {
  id: number | string;
  code: number;
  fullName: string;
  shortName: string;
  stateCode?: number;
  stateId?: number;
  state?: string | Record<string, unknown>;
  canActivate?: boolean;
  canDeactivate?: boolean;
  /** ContentTypeDto / API */
  typeName?: string;
  /** CurrencyTypeDto / API */
  symbol?: string;
  /** Region FK: `info_country.code` (JSON: countryCode). */
  countryCode?: number;
}

interface InfoItemUI extends InfoItem {
  confirming?: boolean;
  isActive: boolean;
}

interface SaveInfoModel {
  fullName: string;
  shortName: string;
  code: number;
  typeName?: string;
  symbol?: string;
  /** Region: FK to `info_country.code` (ASP.NET camelCase: countryCode). */
  countryCode?: number;
}

/** Matches StudentLifeHelper.Common.Constants.StateConstants */
const STATE_ACTIVE = 1;
const STATE_PASSIVE = 2;

@Component({
  selector: 'app-info-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './info-table.component.html',
  styleUrl: './info-table.component.scss',
})
export class InfoTableComponent implements OnInit, OnDestroy {
  tableName = '';
  items: InfoItemUI[] = [];
  /** Options for Region country selector (Country rows from API). */
  countries: InfoItem[] = [];
  toasts: ToastMessage[] = [];

  isLoading = false;
  isModalVisible = false;
  isModalOpen = false;
  editingId: number | string | null = null;
  private editingItem: InfoItemUI | null = null;

  private readonly destroy$ = new Subject<void>();
  private readonly stateOverrides = new Map<number | string, boolean>();
  /** Bumps on each load(); stale HTTP completions must not overwrite items or loading. */
  private loadToken = 0;

  readonly form;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly infoTableService: InfoTableService,
    private readonly languageStateService: LanguageStateService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    fb: FormBuilder,
  ) {
    this.form = fb.group({
      shortName: ['', [Validators.required, Validators.maxLength(15)]],
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      code: [null as number | null, [Validators.required]],
      extra: [''],
      /** Selected `Country.code` → submitted as `countryCode` for Region. */
      countryCode: [null as number | null],
    });
  }

  ngOnInit(): void {
    this.toastService.toasts$.pipe(takeUntil(this.destroy$)).subscribe((toasts) => {
      this.toasts = toasts;
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.tableName = params.get('tableName') ?? '';
      this.items = [];
      this.stateOverrides.clear();
      this.configureFormForTable();
      this.closeModal(true);
      if (this.tableName === 'Region') {
        this.loadCountries();
      } else {
        this.countries = [];
      }
      this.load();
    });

    this.languageStateService.languageCode$.pipe(takeUntil(this.destroy$)).subscribe((code) => {
      if (code == null || !this.tableName) {
        return;
      }
      if (this.tableName === 'Region') {
        this.loadCountries();
      }
      this.load(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Only close when the click lands on the backdrop itself, not bubbled from the dialog. */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  openCreateModal(): void {
    this.editingId = null;
    this.editingItem = null;
    this.form.reset({ shortName: '', fullName: '', code: null, extra: '', countryCode: null });
    this.form.patchValue({ extra: '' });
    this.openModal();
  }

  openEditModal(item: InfoItemUI): void {
    this.editingId = item.id;
    this.editingItem = item;
    this.form.patchValue({
      shortName: item.shortName,
      fullName: item.fullName,
      code: item.code,
      extra: this.readExtraValue(item),
      countryCode: this.readCountryCodeForForm(item),
    });
    this.openModal();
  }

  submit(): void {
    if (!this.tableName) {
      this.toastService.show('Table name is missing.', false);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const base = 'Please fill Short Name, Full Name, and Code.';
      const withExtra =
        this.tableName === 'ContentType' || this.tableName === 'CurrencyType'
          ? 'Please fill Short Name, Full Name, Code, and Extra field.'
          : base;
      const withCountry = this.tableName === 'Region' ? `${base} Select a country.` : withExtra;
      this.toastService.show(
        this.tableName === 'Region' ? withCountry : withExtra,
        false,
      );
      return;
    }

    const payload = this.buildPayload();
    if (this.editingId === null) {
      this.createItem(payload);
      return;
    }
    this.updateItem(this.editingId, payload);
  }

  toggleConfirming(target: InfoItemUI, confirming: boolean): void {
    this.items = this.items.map((item) =>
      item.id === target.id ? { ...item, confirming } : { ...item, confirming: false },
    );
  }

  delete(item: InfoItemUI): void {
    this.execute(
      this.infoTableService.delete(this.tableName, item.id),
      () => {
        this.stateOverrides.delete(item.id);
        this.items = this.items.filter((entry) => entry.id !== item.id);
        this.toastService.show('Record deleted successfully.', true);
        this.syncInBackground();
      },
      'Delete failed.',
      true,
      false,
    );
  }

  toggleState(item: InfoItemUI): void {
    const request$ = item.isActive
      ? this.infoTableService.makePassive(this.tableName, item.id)
      : this.infoTableService.makeActive(this.tableName, item.id);

    this.execute(
      request$,
      () => {
        const nextActive = !item.isActive;
        this.stateOverrides.set(item.id, nextActive);
        this.items = this.items.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                isActive: nextActive,
                stateCode: nextActive ? STATE_ACTIVE : STATE_PASSIVE,
              }
            : entry,
        );
        this.toastService.show('State updated successfully.', true);
        this.syncInBackground();
      },
      'State update failed.',
      true,
      false,
    );
  }

  trackById(_: number, item: InfoItemUI): number | string {
    return item.id;
  }

  trackToastById(_: number, toast: ToastMessage): number {
    return toast.id;
  }

  get isEditMode(): boolean {
    return this.editingId !== null;
  }

  private load(useLoadingOverlay = true): void {
    if (!this.tableName) {
      return;
    }

    const myToken = ++this.loadToken;
    if (useLoadingOverlay) {
      this.isLoading = true;
      this.cdr.detectChanges(); // ← show spinner immediately
    }
    const requestedTable = this.tableName;

    this.execute(
      this.infoTableService.getAll<InfoItem>(this.tableName),
      (items) => {
        if (requestedTable !== this.tableName || myToken !== this.loadToken) {
          return;
        }
        const previousStateById = new Map<number | string, boolean>(
          this.items.map((item) => [item.id, item.isActive]),
        );
        this.items = items.map((item) => this.toInfoItemUI(item, previousStateById.get(item.id)));
      },
      'Failed to load records.',
      true,
      useLoadingOverlay,
      myToken,
    );
  }

  private createItem(payload: SaveInfoModel): void {
    this.execute(
      this.infoTableService.create<SaveInfoModel, unknown>(this.tableName, payload),
      () => {
        const tempId = `tmp-${Date.now()}`;
        const createdItem: InfoItemUI = {
          id: tempId,
          code: payload.code,
          shortName: payload.shortName,
          fullName: payload.fullName,
          stateCode: STATE_ACTIVE,
          isActive: true,
          confirming: false,
          ...(payload.typeName !== undefined ? { typeName: payload.typeName } : {}),
          ...(payload.symbol !== undefined ? { symbol: payload.symbol } : {}),
          ...(payload.countryCode !== undefined ? { countryCode: payload.countryCode } : {}),
        };
        this.items = [createdItem, ...this.items];
        this.closeModal();
        this.toastService.show('Record created successfully.', true);
        this.syncInBackground();
      },
      'Create failed.',
      true,
      false,
    );
  }

  private updateItem(id: number | string, payload: SaveInfoModel): void {
    const updatePayload: Record<string, unknown> = {
      fullName: payload.fullName,
      shortName: payload.shortName,
    };
    if (payload.typeName !== undefined) {
      updatePayload['typeName'] = payload.typeName;
    }
    if (payload.symbol !== undefined) {
      updatePayload['symbol'] = payload.symbol;
    }
    if (payload.countryCode !== undefined) {
      updatePayload['countryCode'] = payload.countryCode;
    }

    this.execute(
      this.infoTableService.update<Record<string, unknown>, number | string, unknown>(
        this.tableName,
        id,
        updatePayload,
      ),
      () => {
        this.items = this.items.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                shortName: payload.shortName,
                fullName: payload.fullName,
                ...(payload.typeName !== undefined ? { typeName: payload.typeName } : {}),
                ...(payload.symbol !== undefined ? { symbol: payload.symbol } : {}),
                ...(payload.countryCode !== undefined ? { countryCode: payload.countryCode } : {}),
              }
            : entry,
        );
        this.closeModal();
        this.toastService.show('Record updated successfully.', true);
        this.syncInBackground();
      },
      'Update failed.',
      true,
      false,
    );
  }

  private buildPayload(): SaveInfoModel {
    const shortName = (this.form.controls.shortName.value ?? '').trim();
    const fullName = (this.form.controls.fullName.value ?? '').trim();
    const code = Number(this.form.controls.code.value ?? 0);
    const payload: SaveInfoModel = {
      fullName,
      shortName,
      code,
    };

    const extraValue = (this.form.controls.extra.value ?? '').toString().trim();
    if (this.tableName === 'ContentType' && extraValue) {
      payload.typeName = extraValue;
    }
    if (this.tableName === 'CurrencyType' && extraValue) {
      payload.symbol = extraValue;
    }

    if (this.tableName === 'Region') {
      const countryCode = this.form.controls.countryCode.value;
      if (countryCode !== null && countryCode !== undefined && Number.isFinite(Number(countryCode))) {
        payload.countryCode = Number(countryCode);
      }
    }

    return payload;
  }

  private toInfoItemUI(item: InfoItem, previousIsActive?: boolean): InfoItemUI {
    const stateInfo = this.resolveStateCode(item, STATE_ACTIVE);
    const overrideState = this.stateOverrides.get(item.id);

    let isActive: boolean;
    if (stateInfo.isExplicit) {
      isActive = stateInfo.code === STATE_ACTIVE;
      if (this.stateOverrides.has(item.id)) {
        this.stateOverrides.delete(item.id);
      }
    } else {
      isActive = overrideState ?? previousIsActive ?? stateInfo.code === STATE_ACTIVE;
    }

    const stateCode = stateInfo.isExplicit
      ? stateInfo.code
      : isActive
        ? STATE_ACTIVE
        : STATE_PASSIVE;

    const raw = item as unknown as Record<string, unknown>;
    const typeNameMerged = typeof item.typeName === 'string' ? item.typeName : raw['typeName'];
    const typeName = typeof typeNameMerged === 'string' ? typeNameMerged : undefined;
    const symbolMerged = typeof item.symbol === 'string' ? item.symbol : raw['symbol'];
    const symbol = typeof symbolMerged === 'string' ? symbolMerged : undefined;
    const countryCodeRaw = item.countryCode ?? raw['countryCode'];
    const countryCode = this.resolveOptionalFiniteNumber(countryCodeRaw);

    return {
      id: item.id,
      code: this.resolveNumber(item.code, 0),
      fullName: this.resolveName(item.fullName, item.shortName),
      shortName: this.resolveName(item.shortName, item.fullName),
      stateCode,
      isActive,
      confirming: false,
      ...(typeName !== undefined ? { typeName } : {}),
      ...(symbol !== undefined ? { symbol } : {}),
      ...(countryCode !== undefined ? { countryCode } : {}),
    };
  }

  private execute<T>(
    request$: Observable<T>,
    onSuccess: (response: T) => void,
    fallbackError: string,
    showErrorToast = true,
    useLoadingOverlay = true,
    /** When set, only this completion may clear the loading overlay (see load concurrency). */
    loadCompletionToken?: number,
  ): void {
    if (useLoadingOverlay) {
      this.isLoading = true;
    }
    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.ngZone.run(() => {
            if (!useLoadingOverlay) {
              return;
            }
            if (loadCompletionToken !== undefined && loadCompletionToken !== this.loadToken) {
              return;
            }
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
        next: (response) => {
          try {
            this.ngZone.run(() => {
              onSuccess(response);
              this.cdr.detectChanges();
            });
          } catch {
            if (showErrorToast) {
              this.toastService.show('Failed to process server response.', false);
            }
          }
        },
        error: (error: unknown) => {
          this.ngZone.run(() => {
            if (showErrorToast) {
              this.toastService.show(this.resolveErrorMessage(error, fallbackError), false);
            }
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
      });
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = this.resolveApiErrorMessage(error.error);
      return apiMessage ?? error.message ?? fallback;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }

  private resolveApiErrorMessage(errorBody: unknown): string | null {
    if (typeof errorBody === 'string' && errorBody.trim()) {
      return errorBody;
    }
    if (typeof errorBody === 'object' && errorBody !== null) {
      const record = errorBody as Record<string, unknown>;
      const message = record['message'];
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
      const title = record['title'];
      if (typeof title === 'string' && title.trim()) {
        return title;
      }
    }
    return null;
  }

  private resolveName(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value : fallback;
  }

  private resolveNumber(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }

  private resolveOptionalFiniteNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private resolveStateCode(value: unknown, fallback: number): { code: number; isExplicit: boolean } {
    const record = this.asRecord(value);
    const stateCode = this.resolveNumber(record?.['stateCode'], Number.NaN);
    if (Number.isFinite(stateCode)) {
      return { code: stateCode, isExplicit: true };
    }

    const stateId = this.resolveNumber(record?.['stateId'], Number.NaN);
    if (Number.isFinite(stateId)) {
      return { code: stateId, isExplicit: true };
    }

    const state = record?.['state'];
    const stateFromStateProperty = this.resolveStateFromStateProperty(state);
    if (stateFromStateProperty !== null) {
      return { code: stateFromStateProperty, isExplicit: true };
    }

    const canActivate = record?.['canActivate'];
    const canDeactivate = record?.['canDeactivate'];
    if (typeof canActivate === 'boolean' && typeof canDeactivate === 'boolean') {
      if (canActivate && !canDeactivate) {
        return { code: STATE_PASSIVE, isExplicit: true };
      }
      if (!canActivate && canDeactivate) {
        return { code: STATE_ACTIVE, isExplicit: true };
      }
    }
    if (typeof canActivate === 'boolean') {
      return { code: canActivate ? STATE_PASSIVE : STATE_ACTIVE, isExplicit: true };
    }
    if (typeof canDeactivate === 'boolean') {
      return { code: canDeactivate ? STATE_ACTIVE : STATE_PASSIVE, isExplicit: true };
    }

    return { code: fallback, isExplicit: false };
  }

  private resolveStateFromStateProperty(state: unknown): number | null {
    if (typeof state === 'string') {
      const normalized = state.trim().toLowerCase();
      if (normalized === 'active') {
        return STATE_ACTIVE;
      }
      if (normalized === 'passive' || normalized === 'inactive') {
        return STATE_PASSIVE;
      }
      return null;
    }

    const stateRecord = this.asRecord(state);
    if (!stateRecord) {
      return null;
    }

    const code = this.resolveNumber(stateRecord['code'], Number.NaN);
    if (Number.isFinite(code)) {
      return code;
    }
    const id = this.resolveNumber(stateRecord['id'], Number.NaN);
    if (Number.isFinite(id)) {
      return id;
    }

    const shortName = stateRecord['shortName'];
    if (typeof shortName === 'string') {
      const normalized = shortName.trim().toLowerCase();
      if (normalized === 'active') {
        return STATE_ACTIVE;
      }
      if (normalized === 'passive' || normalized === 'inactive') {
        return STATE_PASSIVE;
      }
    }

    const fullName = stateRecord['fullName'];
    if (typeof fullName === 'string') {
      const normalized = fullName.trim().toLowerCase();
      if (normalized === 'active') {
        return STATE_ACTIVE;
      }
      if (normalized === 'passive' || normalized === 'inactive') {
        return STATE_PASSIVE;
      }
    }

    return null;
  }

  private syncInBackground(): void {
    // Keep UI responsive: apply immediate updates and then reconcile with server.
    this.load(false);
  }

  private configureFormForTable(): void {
    this.form.controls.extra.clearValidators();
    if (this.tableName === 'ContentType' || this.tableName === 'CurrencyType') {
      this.form.controls.extra.setValidators([Validators.required]);
    }
    this.form.controls.extra.updateValueAndValidity();

    this.form.controls.countryCode.clearValidators();
    if (this.tableName === 'Region') {
      this.form.controls.countryCode.setValidators([Validators.required]);
    }
    this.form.controls.countryCode.updateValueAndValidity();
  }

  private loadCountries(): void {
    this.execute(
      this.infoTableService.getAll<InfoItem>('Country'),
      (list) => {
        this.countries = list ?? [];
      },
      'Failed to load countries.',
      true,
      false,
    );
  }

  private readExtraValue(item: InfoItem): string {
    if (this.tableName === 'ContentType') {
      if (typeof item.typeName === 'string') {
        return item.typeName;
      }
      const raw = item as unknown as Record<string, unknown>;
      return typeof raw['typeName'] === 'string' ? raw['typeName'] : '';
    }
    if (this.tableName === 'CurrencyType') {
      if (typeof item.symbol === 'string') {
        return item.symbol;
      }
      const raw = item as unknown as Record<string, unknown>;
      return typeof raw['symbol'] === 'string' ? raw['symbol'] : '';
    }
    return '';
  }

  private readCountryCodeForForm(item: InfoItemUI): number | null {
    if (this.tableName !== 'Region') {
      return null;
    }
    const v = item.countryCode;
    if (typeof v === 'number' && Number.isFinite(v)) {
      return v;
    }
    const raw = item as unknown as Record<string, unknown>;
    const n = this.resolveOptionalFiniteNumber(raw['countryCode']);
    return n !== undefined ? n : null;
  }

  private openModal(): void {
    this.isModalVisible = true;
    this.isModalOpen = true;
  }

  closeModal(resetForm = true): void {
    this.isModalOpen = false;
    this.isModalVisible = false;
    if (resetForm) {
      this.form.reset({ shortName: '', fullName: '', code: null, extra: '', countryCode: null });
    }
    this.editingId = null;
    this.editingItem = null;
    this.cdr.detectChanges();
  }
}
