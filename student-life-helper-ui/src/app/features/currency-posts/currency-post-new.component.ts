import { CommonModule } from '@angular/common';
import { ChangeDetectorRef,Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, take } from 'rxjs';
import { RegisterLookupService } from '../../services/register-lookup.service';
import type { SelectListItem } from '../../services/manual.service';
import { CurrencyPostService } from '../../services/currency-post.service';
import { ToastService } from '../../services/toast.service';
import { formatCurrencyPostError } from './currency-post-format-error';


@Component({
  selector: 'app-currency-post-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav">
        <a routerLink="/admin/currency-posts" class="link-muted">← All currency posts</a>
        <div class="top-nav-right">
          <a routerLink="/admin/currency-posts/mine" class="link-muted">My posts</a>
        </div>
      </nav>

      <div class="card">
        <h1>New currency post</h1>
        <p class="subtitle">Offer a currency exchange to other students.</p>

        <p *ngIf="!lookupsReady && !lookupError" class="hint">Loading currencies…</p>
        <p *ngIf="lookupError" class="message error">{{ lookupError }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="lookupsReady">
          <label for="title">Title</label>
          <input id="title" type="text" formControlName="title" maxlength="200" autocomplete="off" />

          <label for="description">Description</label>
          <textarea id="description" rows="5" formControlName="description" maxlength="4000"></textarea>

          <div class="field-row">
            <div class="field">
              <label for="fromCurrencyCode">From currency</label>
              <select id="fromCurrencyCode" formControlName="fromCurrencyCode">
                <option [ngValue]="null" disabled>Select</option>
                <option *ngFor="let c of currencies; trackBy: trackSelect" [ngValue]="c.value">{{ c.text }}</option>
              </select>
            </div>
            <div class="field">
              <label for="toCurrencyCode">To currency</label>
              <select id="toCurrencyCode" formControlName="toCurrencyCode">
                <option [ngValue]="null" disabled>Select</option>
                <option *ngFor="let c of currencies; trackBy: trackSelect" [ngValue]="c.value">{{ c.text }}</option>
              </select>
            </div>
          </div>
          <p *ngIf="form.get('fromCurrencyCode')?.value && 
          form.get('toCurrencyCode')?.value && 
          form.get('fromCurrencyCode')?.value === form.get('toCurrencyCode')?.value"
   style="color:#fca5a5; font-size:0.85rem; margin:0;">
  From and To currency cannot be the same
</p>

          <label for="amount">Amount</label>
          <input id="amount" type="number" min="0.01" step="0.01" formControlName="amount" />

<button class="btn-primary" type="submit" 
  [disabled]="submitting || form.invalid || 
  form.get('fromCurrencyCode')?.value === form.get('toCurrencyCode')?.value">
  {{ submitting ? 'Saving…' : 'Save changes' }}
</button>
        </form>

        <p *ngIf="errorMessage" class="message error">{{ errorMessage }}</p>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .page { min-height: 100vh; display: grid; place-items: start center; padding: 28px 18px 48px; }
      .top-nav { width: min(720px, 96vw); margin-bottom: 12px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
      .link-muted { color: #94a3b8; text-decoration: none; font-size: 0.88rem; }
      .top-nav-right { display: flex; gap: 14px; }
      .card {
        width: min(720px, 96vw); background: #0f172a; border: 1px solid #334155;
        border-radius: 18px; padding: 28px 26px 32px; box-shadow: 0 18px 36px rgba(2, 6, 23, 0.4);
      }
      h1 { margin: 0; font-size: 1.55rem; color: #f8fafc; }
      .subtitle { margin: 8px 0 20px; color: #94a3b8; font-size: 0.95rem; }
      .hint { color: #94a3b8; }
      form { display: grid; gap: 11px; }
      .field-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      @media (max-width: 640px) { .field-row { grid-template-columns: 1fr; } }
      .field { display: grid; gap: 6px; }
      label { font-size: 0.86rem; color: #cbd5e1; font-weight: 600; }
      input, select, textarea {
        border: 1px solid #334155; border-radius: 11px; padding: 10px 12px;
        background: #111827; color: #f8fafc; font-family: inherit;
      }
      textarea { resize: vertical; min-height: 110px; }
      .btn-primary {
        margin-top: 6px; border: 0; border-radius: 11px; padding: 12px 14px;
        background: linear-gradient(90deg, #4f46e5, #4338ca); color: #fff; font-weight: 700; cursor: pointer;
      }
      .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
      .message.error { margin-top: 14px; color: #fecaca; font-size: 0.92rem; }
    `,
  ],
})
export class CurrencyPostNewComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lookups = inject(RegisterLookupService);
  private readonly currencyPosts = inject(CurrencyPostService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  currencies: SelectListItem<number>[] = [];
  lookupsReady = false;
  lookupError = '';
  submitting = false;
  errorMessage = '';

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    fromCurrencyCode: [null as number | null, [Validators.required]],
    toCurrencyCode: [null as number | null, [Validators.required]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit(): void {
    this.lookups
      .getCurrencyTypeSelect()
      .pipe(take(1))
      .subscribe({
        next: (items) => {
          this.currencies = items;
          this.lookupsReady = true;
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.lookupError = formatCurrencyPostError(e);
          this.cdr.markForCheck();
        },
      });
  }

  trackSelect(_: number, item: SelectListItem<number>): number {
    return item.value;
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if(raw.fromCurrencyCode === raw.toCurrencyCode) {
      this.errorMessage = 'From currency and to currency cannot be the same.';
      return;
    }
    const fd = new FormData();
    fd.append('Title', (raw.title ?? '').trim());
    fd.append('Description', (raw.description ?? '').trim());
    fd.append('FromCurrencyCode', String(raw.fromCurrencyCode));
    fd.append('ToCurrencyCode', String(raw.toCurrencyCode));
    fd.append('Amount', String(raw.amount));

    this.submitting = true;
    this.errorMessage = '';
    this.currencyPosts
      .create(fd)
      .pipe(take(1), finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.toast.show('Currency post created.', true);
          void this.router.navigate(['/admin/currency-posts/mine']);
        },
        error: (e) => {
          this.errorMessage = formatCurrencyPostError(e);
          this.toast.show(this.errorMessage, false);
        },
      });
  }
}
