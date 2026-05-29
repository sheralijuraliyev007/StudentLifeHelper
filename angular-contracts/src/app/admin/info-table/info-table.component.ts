import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, finalize, takeUntil } from 'rxjs';
import { InfoTableService } from '../../services/info-table.service';
import { ToastMessage, ToastService } from '../../services/toast.service';

interface InfoItem {
  id: number | string;
  code: number;
  fullName: string;
  shortName: string;
  stateCode?: number;
}

interface InfoItemUI extends InfoItem {
  confirming?: boolean;
  isActive: boolean;
}

interface SaveInfoModel {
  fullName: string;
  shortName: string;
  code: number;
}

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
  toasts: ToastMessage[] = [];

  isLoading = false;
  isModalVisible = false;
  isModalOpen = false;
  editingId: number | string | null = null;

  private readonly destroy$ = new Subject<void>();
  private closeModalTimeoutId: number | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    code: [null as number | null, [Validators.required]],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly fb: FormBuilder,
    private readonly infoTableService: InfoTableService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.toastService.toasts$.pipe(takeUntil(this.destroy$)).subscribe((toasts) => {
      this.toasts = toasts;
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.tableName = params.get('tableName') ?? '';
      this.items = [];
      this.closeModal(true);
      this.load();
    });
  }

  ngOnDestroy(): void {
    if (this.closeModalTimeoutId !== null) {
      window.clearTimeout(this.closeModalTimeoutId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  openCreateModal(): void {
    this.editingId = null;
    this.form.reset({ name: '', code: null });
    this.openModal();
  }

  openEditModal(item: InfoItemUI): void {
    this.editingId = item.id;
    this.form.patchValue({
      name: item.fullName,
      code: item.code,
    });
    this.openModal();
  }

  submit(): void {
    if (this.form.invalid || !this.tableName) {
      this.form.markAllAsTouched();
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
        this.items = this.items.filter((entry) => entry.id !== item.id);
        this.toastService.show('Record deleted successfully.', true);
      },
      'Delete failed.',
    );
  }

  toggleState(item: InfoItemUI): void {
    const request$ = item.isActive
      ? this.infoTableService.makePassive(this.tableName, item.id)
      : this.infoTableService.makeActive(this.tableName, item.id);

    this.execute(
      request$,
      () => {
        this.items = this.items.map((entry) =>
          entry.id === item.id
            ? { ...entry, isActive: !entry.isActive, stateCode: !entry.isActive ? 1 : 0 }
            : entry,
        );
        this.toastService.show('State updated successfully.', true);
      },
      'State update failed.',
    );
  }

  trackById(_: number, item: InfoItemUI): number | string {
    return item.id;
  }

  private load(): void {
    if (!this.tableName) {
      return;
    }

    this.execute(
      this.infoTableService.getAll<InfoItem>(this.tableName),
      (items) => {
        this.items = items.map((item) => this.toInfoItemUI(item));
      },
      'Failed to load records.',
      false,
    );
  }

  private createItem(payload: SaveInfoModel): void {
    this.execute(
      this.infoTableService.create<SaveInfoModel, Partial<InfoItem>>(this.tableName, payload),
      (response) => {
        const created = this.toInfoItemUI({
          id: this.resolveId(response?.id),
          code: this.resolveNumber(response?.code, payload.code),
          fullName: this.resolveName(response?.fullName, payload.fullName),
          shortName: this.resolveName(response?.shortName, payload.shortName),
          stateCode: this.resolveNumber(response?.stateCode, 1),
        });
        this.items = [created, ...this.items];
        this.closeModal();
        this.toastService.show('Record created successfully.', true);
      },
      'Create failed.',
    );
  }

  private updateItem(id: number | string, payload: SaveInfoModel): void {
    this.execute(
      this.infoTableService.update<SaveInfoModel, number | string, Partial<InfoItem>>(
        this.tableName,
        id,
        payload,
      ),
      (response) => {
        const index = this.items.findIndex((entry) => entry.id === id);
        if (index < 0) {
          return;
        }

        const current = this.items[index];
        const updated: InfoItemUI = {
          ...current,
          code: this.resolveNumber(response?.code, payload.code),
          fullName: this.resolveName(response?.fullName, payload.fullName),
          shortName: this.resolveName(response?.shortName, payload.shortName),
          stateCode: this.resolveNumber(response?.stateCode, current.stateCode ?? (current.isActive ? 1 : 0)),
          isActive: this.resolveNumber(response?.stateCode, current.isActive ? 1 : 0) === 1,
          confirming: false,
        };

        this.items = [
          ...this.items.slice(0, index),
          updated,
          ...this.items.slice(index + 1),
        ];
        this.closeModal();
        this.toastService.show('Record updated successfully.', true);
      },
      'Update failed.',
    );
  }

  private buildPayload(): SaveInfoModel {
    const name = (this.form.controls.name.value ?? '').trim();
    const code = Number(this.form.controls.code.value ?? 0);
    return {
      fullName: name,
      shortName: name,
      code,
    };
  }

  private toInfoItemUI(item: InfoItem): InfoItemUI {
    const stateCode = this.resolveNumber(item.stateCode, 1);
    return {
      id: item.id,
      code: this.resolveNumber(item.code, 0),
      fullName: this.resolveName(item.fullName, item.shortName),
      shortName: this.resolveName(item.shortName, item.fullName),
      stateCode,
      isActive: stateCode === 1,
      confirming: false,
    };
  }

  private execute<T>(
    request$: Observable<T>,
    onSuccess: (response: T) => void,
    fallbackError: string,
    showErrorToast = true,
  ): void {
    this.isLoading = true;
    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (response) => {
          onSuccess(response);
        },
        error: (error: unknown) => {
          if (showErrorToast) {
            this.toastService.show(this.resolveErrorMessage(error, fallbackError), false);
          }
        },
      });
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
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

  private resolveId(value: unknown): number | string {
    if (typeof value === 'number' || typeof value === 'string') {
      return value;
    }
    return `tmp-${Date.now()}`;
  }

  private openModal(): void {
    if (this.closeModalTimeoutId !== null) {
      window.clearTimeout(this.closeModalTimeoutId);
      this.closeModalTimeoutId = null;
    }
    this.isModalVisible = true;
    window.requestAnimationFrame(() => {
      this.isModalOpen = true;
    });
  }

  closeModal(resetForm = true): void {
    this.isModalOpen = false;
    this.closeModalTimeoutId = window.setTimeout(() => {
      this.isModalVisible = false;
      if (resetForm) {
        this.form.reset({ name: '', code: null });
      }
      this.editingId = null;
    }, 200);
  }
}
