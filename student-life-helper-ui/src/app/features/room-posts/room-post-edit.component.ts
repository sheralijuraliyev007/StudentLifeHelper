import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, from, of, switchMap, take, finalize, firstValueFrom } from 'rxjs';
import type { SelectListItem } from '../../services/manual.service';
import { RegisterLookupService } from '../../services/register-lookup.service';
import { RoomPostService } from '../../services/roomPostService';
import type { RoomPostDto, UpdateRoomPostModel } from '../../contracts';
import { roomPostCanEdit } from './room-post-status';

@Component({
  selector: 'app-room-post-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav" aria-label="Room posts navigation">
        <a routerLink="/admin/room-posts/mine" class="link-muted">← My room posts</a>
        <div class="top-nav-right">
          <a routerLink="/admin/room-posts" class="link-muted">All posts</a>
          <a
            *ngIf="canEditPhotos()"
            [routerLink]="['/admin/room-posts', postId, 'add-content']"
            class="link-muted"
          >
            Photos
          </a>
        </div>
      </nav>

      <div class="card" *ngIf="!fatalError">
        <h1>Edit room post</h1>
        <p class="subtitle">Update your listing. Status changes use Activate / Deactivate / Delete on My posts.</p>

        <p *ngIf="!lookupsReady && !lookupError" class="lookups-hint">Loading…</p>
        <p *ngIf="lookupError" class="message error">{{ lookupError }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" *ngIf="lookupsReady">
          <div class="field-row">
            <div class="field">
              <label for="countryCode">Country</label>
              <select id="countryCode" formControlName="countryCode" (change)="onCountryChange()">
                <option [ngValue]="null" disabled>Choose country</option>
                <option *ngFor="let c of countries; trackBy: trackSelect" [ngValue]="c.orderCode">{{ c.text }}</option>
              </select>
            </div>
            <div class="field">
              <label for="regionCode">Region</label>
              <select id="regionCode" formControlName="regionCode">
                <option [ngValue]="null" disabled>Select region</option>
                <option *ngFor="let r of regions; trackBy: trackSelect" [ngValue]="r.value">{{ r.text }}</option>
              </select>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="roomTypeCode">Room type</label>
              <select id="roomTypeCode" formControlName="roomTypeCode">
                <option [ngValue]="null" disabled>Select</option>
                <option *ngFor="let x of roomTypes; trackBy: trackSelect" [ngValue]="x.value">{{ x.text }}</option>
              </select>
            </div>
            <div class="field">
              <label for="roomPostTypeCode">Listing type</label>
              <select id="roomPostTypeCode" formControlName="roomPostTypeCode">
                <option [ngValue]="null" disabled>Select</option>
                <option *ngFor="let x of roomPostTypes; trackBy: trackSelect" [ngValue]="x.value">{{ x.text }}</option>
              </select>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="currencyCode">Currency</label>
              <select id="currencyCode" formControlName="currencyCode">
                <option [ngValue]="null" disabled>Select</option>
                <option *ngFor="let x of currencies; trackBy: trackSelect" [ngValue]="x.value">{{ x.text }}</option>
              </select>
            </div>
            <div class="field">
              <label for="forGenderCode">Preferred guest gender (optional)</label>
              <select id="forGenderCode" formControlName="forGenderCode">
                <option [ngValue]="null">Any / not specified</option>
                <option *ngFor="let g of genders; trackBy: trackSelect" [ngValue]="g.value">{{ g.text }}</option>
              </select>
            </div>
          </div>

          <label for="title">Title</label>
          <input id="title" type="text" formControlName="title" autocomplete="off" maxlength="200" />

          <label for="description">Description</label>
          <textarea id="description" rows="5" formControlName="description" maxlength="4000"></textarea>

          <div class="field-row">
            <div class="field">
              <label for="monthlyRentFee">Monthly rent</label>
              <input id="monthlyRentFee" type="number" min="0" step="0.01" formControlName="monthlyRentFee" />
            </div>
            <div class="field">
              <label for="depositAmount">Deposit (optional)</label>
              <input id="depositAmount" type="number" min="0" step="0.01" formControlName="depositAmount" />
            </div>
          </div>

          <label for="addressLink">Address / map link</label>
          <input id="addressLink" type="url" formControlName="addressLink" />

          <button class="btn-primary" type="submit" [disabled]="submitting || form.invalid">
            {{ submitting ? 'Saving…' : 'Save changes' }}
          </button>
        </form>

        <p *ngIf="errorMessage" class="message error">{{ errorMessage }}</p>
      </div>

      <div class="card error-card" *ngIf="fatalError">
        <h1>Cannot edit listing</h1>
        <p>{{ fatalError }}</p>
        <a routerLink="/admin/room-posts/mine" class="link-muted">Back to my posts</a>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
      .top-nav {
        max-width: min(720px, 96vw);
        margin: 0 auto 12px;
        padding: 0 4px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
      }
      .link-muted {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.88rem;
      }
      .link-muted:hover {
        color: #e2e8f0;
      }
      .top-nav-right {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .lookups-hint {
        color: #94a3b8;
        font-size: 0.92rem;
        margin: 0 0 12px;
      }
      .page {
        min-height: 100vh;
        display: grid;
        place-items: start center;
        padding: 28px 18px 48px;
      }
      .card {
        width: min(720px, 96vw);
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 18px;
        box-shadow: 0 18px 36px rgba(2, 6, 23, 0.4);
        padding: 28px 26px 32px;
      }
      .error-card {
        border-color: #7f1d1d;
      }
      h1 {
        margin: 0;
        font-size: 1.55rem;
        color: #f8fafc;
      }
      .subtitle {
        margin: 8px 0 20px;
        color: #94a3b8;
        font-size: 0.95rem;
      }
      form {
        display: grid;
        gap: 11px;
      }
      .field-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      @media (max-width: 640px) {
        .field-row {
          grid-template-columns: 1fr;
        }
      }
      .field {
        display: grid;
        gap: 6px;
      }
      label {
        font-size: 0.86rem;
        color: #cbd5e1;
        font-weight: 600;
      }
      input,
      select,
      textarea {
        border: 1px solid #334155;
        border-radius: 11px;
        padding: 10px 12px;
        outline: none;
        background: #111827;
        color: #f8fafc;
      }
      textarea {
        resize: vertical;
        min-height: 110px;
      }
      .btn-primary {
        margin-top: 6px;
        border: 0;
        border-radius: 11px;
        padding: 12px 14px;
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
        font-weight: 700;
        cursor: pointer;
      }
      .btn-primary:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
      .message {
        margin-top: 14px;
        font-size: 0.92rem;
      }
      .error {
        color: #fecaca;
      }
    `,
  ],
})
export class RoomPostEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lookups = inject(RegisterLookupService);
  private readonly roomPosts = inject(RoomPostService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  postId = 0;
  /** Loaded listing status; used to show Photos only when updates are allowed. */
  private postStatusCode = 0;
  countries: SelectListItem<number>[] = [];
  regions: SelectListItem<number>[] = [];
  roomTypes: SelectListItem<number>[] = [];
  roomPostTypes: SelectListItem<number>[] = [];
  currencies: SelectListItem<number>[] = [];
  genders: SelectListItem<number>[] = [];

  submitting = false;
  errorMessage = '';
  lookupsReady = false;
  lookupError = '';
  fatalError = '';
  private lastRegionCountry: number | null = null;

  readonly form = this.fb.group({
    countryCode: [null as number | null, [Validators.required]],
    regionCode: [null as number | null, [Validators.required]],
    roomTypeCode: [null as number | null, [Validators.required]],
    roomPostTypeCode: [null as number | null, [Validators.required]],
    currencyCode: [null as number | null, [Validators.required]],
    forGenderCode: [null as number | null],
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    monthlyRentFee: [null as number | null, [Validators.required, Validators.min(0)]],
    depositAmount: [null as number | null, [Validators.min(0)]],
    addressLink: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      this.fatalError = 'Invalid listing id in the URL.';
      return;
    }
    this.postId = id;

    forkJoin({
      countries: this.lookups.getCountrySelect(),
      roomTypes: this.lookups.getRoomTypeSelect(),
      roomPostTypes: this.lookups.getRoomPostTypeSelect(),
      currencies: this.lookups.getCurrencyTypeSelect(),
      genders: this.lookups.getGenderSelect(),
      post: this.roomPosts.getRoomPostById(id),
    })
      .pipe(
        take(1),
        switchMap((res) =>
          from(this.resolveCountryAndRegions(res.post, res.countries)).pipe(
            switchMap((resolved) => of({ ...res, resolved })),
          ),
        ),
      )
      .subscribe({
        next: ({ countries, roomTypes, roomPostTypes, currencies, genders, post, resolved }) => {
          this.countries = countries;
          this.roomTypes = roomTypes;
          this.roomPostTypes = roomPostTypes;
          this.currencies = currencies;
          this.genders = genders;
          if (resolved) {
            this.lastRegionCountry = resolved.country;
            this.regions = resolved.regions;
            this.form.patchValue({ countryCode: resolved.country });
          } else {
            this.regions = [];
          }
          this.patchFromPost(post);
          this.lookupsReady = true;
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.fatalError = this.formatError(e) || 'Could not load this listing.';
          this.cdr.markForCheck();
        },
      });
  }

  trackSelect(_: number, item: SelectListItem<number>): number {
    return item.value;
  }

  onCountryChange(): void {
    const code = this.form.controls.countryCode.value;
    if (code == null) {
      this.lastRegionCountry = null;
      this.regions = [];
      this.form.patchValue({ regionCode: null });
      return;
    }
    if (this.lastRegionCountry === code && this.regions.length > 0) {
      return;
    }
    this.lastRegionCountry = code;
    this.form.patchValue({ regionCode: null });
    this.lookups
      .getRegionSelect(code)
      .pipe(take(1))
      .subscribe({
        next: (items) => {
          this.regions = items;
        },
        error: (e) => {
          this.errorMessage = this.formatError(e);
        },
      });
  }

submit(): void {
  if (this.form.invalid || this.submitting) {
    this.form.markAllAsTouched();
    return;
  }
  const raw = this.form.getRawValue();
  const body: UpdateRoomPostModel = {
    roomPostTypeCode: raw.roomPostTypeCode ?? undefined,
    roomTypeCode: raw.roomTypeCode ?? undefined,
    title: (raw.title ?? '').trim(),
    description: (raw.description ?? '').trim(),
    monthlyRentFee: raw.monthlyRentFee ?? undefined,
    currencyCode: raw.currencyCode ?? undefined,
    regionCode: raw.regionCode ?? undefined,
    addressLink: (raw.addressLink ?? '').trim(),
    depositAmount: raw.depositAmount != null ? Number(raw.depositAmount) : null,
  };
  if (raw.forGenderCode != null) {
    body.forGenderCode = raw.forGenderCode;
  }

  this.submitting = true;
  this.errorMessage = '';
  this.roomPosts
    .updateRoomPost(this.postId, body)
    .pipe(
      take(1),
      finalize(() => {
        this.submitting = false;
      }),
    )
    .subscribe({
      next: () => {
        this.lookups.clearRegionCache(); // ← clears stale region cache
        void this.router.navigate(['/admin/room-posts/mine']);
      },
      error: (e) => {
        this.errorMessage = this.formatError(e);
      },
    });
}

  canEditPhotos(): boolean {
    return roomPostCanEdit(this.postStatusCode);
  }

  private patchFromPost(post: RoomPostDto): void {

    console.log('post.regionCode:', post.regionCode);
    console.log('available regions:', this.regions.map(r => ({ value: r.value, orderCode: r.orderCode, text: r.text })));
    this.postStatusCode = post.statusCode;
    this.form.patchValue({
      regionCode: post.regionCode,
      roomTypeCode: post.roomTypeCode,
      roomPostTypeCode: post.roomPostTypeCode,
      currencyCode: post.currencyCode,
      forGenderCode: post.forGenderCode > 0 ? post.forGenderCode : null,
      title: post.title,
      description: post.description,
      monthlyRentFee: post.monthlyRentFee,
      depositAmount: post.depositAmount > 0 ? post.depositAmount : null,
      addressLink: post.addressLink ?? '',
    });
  }

  private async resolveCountryAndRegions(
    post: RoomPostDto,
    countries: SelectListItem<number>[],
  ): Promise<{ country: number; regions: SelectListItem<number>[] } | null> {
    for (const c of countries) {
      try {
        const regs = await firstValueFrom(this.lookups.getRegionSelect(c.orderCode));
        if (regs.some((r) => r.value === post.regionCode)) {
          return { country: c.orderCode, regions: regs };
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  private formatError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.length) {
        return body;
      }
      if (Array.isArray(body)) {
        return body
          .map((x) => (typeof x === 'string' ? x : this.errorBodyToString(x)))
          .filter((s) => s.length > 0)
          .join(' ');
      }
      if (body && typeof body === 'object') {
        const fromObject = this.errorBodyToString(body);
        if (fromObject) {
          return fromObject;
        }
      }
      if (err.status === 404) {
        return 'Room post not found.';
      }
      if (err.status === 408) {
        return 'Request timed out. Please try again.';
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Something went wrong.';
  }

  private errorBodyToString(body: unknown): string {
    if (typeof body === 'string') {
      return body;
    }
    if (body == null) {
      return '';
    }
    if (Array.isArray(body)) {
      return body
        .map((x) => (typeof x === 'string' ? x : this.errorBodyToString(x)))
        .filter((s) => s.length > 0)
        .join(' ');
    }
    if (typeof body === 'object') {
      const o = body as Record<string, unknown>;
      const msg = o['message'] ?? o['title'];
      if (typeof msg === 'string' && msg.length) {
        return msg;
      }
      const errors = o['errors'];
      if (errors && typeof errors === 'object') {
        const parts: string[] = [];
        for (const v of Object.values(errors as Record<string, unknown>)) {
          if (typeof v === 'string') {
            parts.push(v);
          } else if (Array.isArray(v)) {
            parts.push(...v.map((x) => String(x)));
          }
        }
        if (parts.length) {
          return parts.join(' ');
        }
      }
      const values = Object.values(o).filter((v) => typeof v === 'string') as string[];
      if (values.length) {
        return values.join(' ');
      }
    }
    return '';
  }
}
