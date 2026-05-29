import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, NgZone, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, take } from 'rxjs';
import { RegisterLookupService } from '../../services/register-lookup.service';
import type { SelectListItem } from '../../services/manual.service';
import { RoomPostService } from '../../services/roomPostService';

@Component({
  selector: 'app-room-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav" aria-label="Room posts navigation">
        <a routerLink="/admin/room-posts" class="link-muted">← All room posts</a>
        <div class="top-nav-right">
          <a routerLink="/admin/room-posts/mine" class="link-muted">My posts</a>
          <a routerLink="/admin/profile" class="link-muted">Profile</a>
        </div>
      </nav>
      <div class="card">
        <h1>New room post</h1>
        <p class="subtitle">Describe the room — after you save, you will go straight to upload photos.</p>

        <p *ngIf="!lookupsReady && !lookupError" class="lookups-hint">Loading dropdown options…</p>
        <p *ngIf="lookupError" class="message error">{{ lookupError }}</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="lookupsReady">
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
          <textarea
            id="description"
            rows="5"
            formControlName="description"
            maxlength="4000"
          ></textarea>

          <div class="field-row">
            <div class="field">
              <label for="roomCapacityCount">Room capacity</label>
              <input
                id="roomCapacityCount"
                type="number"
                min="1"
                formControlName="roomCapacityCount"
              />
            </div>
            <div class="field">
              <label for="monthlyRentFee">Monthly rent</label>
              <input id="monthlyRentFee" type="number" min="0" step="0.01" formControlName="monthlyRentFee" />
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="depositAmount">Deposit (optional)</label>
              <input id="depositAmount" type="number" min="0" step="0.01" formControlName="depositAmount" />
            </div>
            <div class="field">
              <label for="addressLink">Address / map link</label>
              <input id="addressLink" type="url" formControlName="addressLink" />
            </div>
          </div>

          <button class="btn-primary" type="submit" [disabled]="isSubmitting || form.invalid">
            {{ isSubmitting ? 'Creating…' : 'Create & add photos' }}
          </button>
        </form>

        <p *ngIf="errorMessage" class="message error">{{ errorMessage }}</p>
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
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          background-color 0.2s ease;
      }
      input:focus,
      select:focus,
      textarea:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        background: #0b1220;
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
export class RoomPostCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lookups = inject(RegisterLookupService);
  private readonly roomPosts = inject(RoomPostService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  countries: SelectListItem<number>[] = [];
  regions: SelectListItem<number>[] = [];
  roomTypes: SelectListItem<number>[] = [];
  roomPostTypes: SelectListItem<number>[] = [];
  currencies: SelectListItem<number>[] = [];
  genders: SelectListItem<number>[] = [];

  isSubmitting = false;
  errorMessage = '';
  lookupsReady = false;
  lookupError = '';
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
    roomCapacityCount: [
      1,
      [Validators.required, Validators.min(1), Validators.max(999)],
    ],
    monthlyRentFee: [null as number | null, [Validators.required, Validators.min(0)]],
    depositAmount: [null as number | null, [Validators.min(0)]],
    addressLink: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    forkJoin({
      countries: this.lookups.getCountrySelect(),
      roomTypes: this.lookups.getRoomTypeSelect(),
      roomPostTypes: this.lookups.getRoomPostTypeSelect(),
      currencies: this.lookups.getCurrencyTypeSelect(),
      genders: this.lookups.getGenderSelect(),
    })
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.countries = res.countries;
          this.roomTypes = res.roomTypes;
          this.roomPostTypes = res.roomPostTypes;
          this.currencies = res.currencies;
          this.genders = res.genders;
          this.lookupsReady = true;
        },
        error: (e) => {
          this.lookupError = this.formatError(e);
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

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const raw = this.form.getRawValue();
    const fd = new FormData();
    fd.append('RoomPostTypeCode', String(raw.roomPostTypeCode));
    fd.append('RoomTypeCode', String(raw.roomTypeCode));
    fd.append('Title', (raw.title ?? '').trim());
    fd.append('Description', (raw.description ?? '').trim());
    fd.append('RoomCapacityCount', String(raw.roomCapacityCount ?? ''));
    fd.append('MonthlyRentFee', String(raw.monthlyRentFee ?? ''));
    fd.append('CurrencyCode', String(raw.currencyCode));
    fd.append('RegionCode', String(raw.regionCode));
    fd.append('AddressLink', (raw.addressLink ?? '').trim());
    if (raw.forGenderCode != null) {
      fd.append('ForGenderCode', String(raw.forGenderCode));
    }
    if (raw.depositAmount != null && Number(raw.depositAmount) > 0) {
      fd.append('DepositAmount', String(raw.depositAmount));
    }

    this.roomPosts.createRoomPostAndGetNewId(fd).subscribe({
      next: (newId: number) => {
        console.log('Created room post ID:', newId);
        sessionStorage.setItem('currentRoomPostId', String(newId));
        this.ngZone.run(() => {
          void this.router.navigate(['/admin/room-posts', newId, 'add-content']).then((success) => {
            if (!success) {
              window.location.href = `/admin/room-posts/${newId}/add-content`;
            }
          });
        });
      },
      error: (err) => {
        console.error('Create room post error:', err);
        this.errorMessage = this.formatError(err);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private formatError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.length) {
        return body;
      }
      if (Array.isArray(body)) {
        return body.map((x) => String(x)).join(' ');
      }
      if (body && typeof body === 'object') {
        const o = body as Record<string, unknown>;
        const msg = o['message'] ?? o['title'];
        if (typeof msg === 'string') {
          return msg;
        }
      }
      if (err.message) {
        return err.message;
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
