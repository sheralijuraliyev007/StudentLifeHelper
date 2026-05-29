import { CommonModule } from '@angular/common';
import { ChangeDetectorRef,Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, take } from 'rxjs';
import type { UpdateCurrencyPostModel } from '../../contracts';
import { RegisterLookupService } from '../../services/register-lookup.service';
import type { SelectListItem } from '../../services/manual.service';
import { CurrencyPostService } from '../../services/currency-post.service';
import { ToastService } from '../../services/toast.service';
import { formatCurrencyPostError } from './currency-post-format-error';

@Component({
  selector: 'app-currency-post-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav">
        <a routerLink="/admin/currency-posts/mine" class="link-muted">← My currency posts</a>
        <a *ngIf="postId" [routerLink]="['/admin/currency-posts', postId]" class="link-muted">View post</a>
      </nav>

      <div class="card" *ngIf="!fatalError">
        <h1>Edit currency post</h1>
        <p class="subtitle">Update your exchange offer details.</p>

        <p *ngIf="!lookupsReady && !lookupError" class="hint">Loading…</p>
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

      <div class="card error-card" *ngIf="fatalError">
        <h1>Cannot edit post</h1>
        <p>{{ fatalError }}</p>
        <a routerLink="/admin/currency-posts/mine" class="link-muted">Back to my posts</a>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .page { min-height: 100vh; display: grid; place-items: start center; padding: 28px 18px 48px; }
      .top-nav { width: min(720px, 96vw); margin-bottom: 12px; display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
      .link-muted { color: #94a3b8; text-decoration: none; font-size: 0.88rem; }
      .card {
        width: min(720px, 96vw); background: #0f172a; border: 1px solid #334155;
        border-radius: 18px; padding: 28px 26px 32px;
      }
      .error-card { border-color: #7f1d1d; }
      h1 { margin: 0; font-size: 1.55rem; color: #f8fafc; }
      .subtitle { margin: 8px 0 20px; color: #94a3b8; }
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
      .message.error { margin-top: 14px; color: #fecaca; }
      .hint { color: #94a3b8; }
    `,
  ],
})
export class CurrencyPostEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lookups = inject(RegisterLookupService);
  private readonly currencyPosts = inject(CurrencyPostService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  postId = 0;
  currencies: SelectListItem<number>[] = [];
  lookupsReady = false;
  lookupError = '';
  fatalError = '';
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
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      this.fatalError = 'Invalid post id in the URL.';
      return;
    }
    this.postId = Math.trunc(id);

    forkJoin({
      currencies: this.lookups.getCurrencyTypeSelect(),
      post: this.currencyPosts.getById(this.postId),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ currencies, post }) => {
          this.currencies = currencies;
          this.form.patchValue({
            title: post.title,
            description: post.description,
            fromCurrencyCode: post.fromCurrencyCode,
            toCurrencyCode: post.toCurrencyCode,
            amount: post.amount,
          });
          this.lookupsReady = true;
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.fatalError = formatCurrencyPostError(e);
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
    console.log(raw);
    const body: UpdateCurrencyPostModel = {
      title: (raw.title ?? '').trim(),
      description: (raw.description ?? '').trim(),
      fromCurrencyCode: raw.fromCurrencyCode ?? undefined,
      toCurrencyCode: raw.toCurrencyCode ?? undefined,
      amount: raw.amount != null ? Number(raw.amount) : undefined,
    };

    this.submitting = true;
    this.errorMessage = '';
    this.currencyPosts
      .update(this.postId, body)
      .pipe(take(1), finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.toast.show('Post updated.', true);
          void this.router.navigate(['/admin/currency-posts', this.postId]);
        },
        error: (e) => {
          this.errorMessage = formatCurrencyPostError(e);
          this.toast.show(this.errorMessage, false);
        },
      });
  }
}
