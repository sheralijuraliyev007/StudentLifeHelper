import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import type { RoomPostFilterOptions } from '../../contracts';
import type { SelectListItem } from '../../services/manual.service';
import { RegisterLookupService } from '../../services/register-lookup.service';
import { RoomPostFilterLookupsService } from './room-post-filter-lookups.service';
import {
  ROOM_POST_SORT_OPTIONS,
  filterOptionCode,
  type RoomPostFilterCriteria,
} from './room-post-filters';

interface FilterFormValue {
  search: string;
  title: string;
  countryCode: number | null;
  regionCode: number | null;
  roomPostTypeCode: number | null;
  roomTypeCode: number | null;
  forGenderCode: number | null;
  currencyCode: number | null;
  minimumMonthlyRentFee: number | null;
  maximumMonthlyRentFee: number | null;
  minimumDepositAmount: number | null;
  maximumDepositAmount: number | null;
  depositExists: '' | 'true' | 'false';
  sortBy: string;
  orderType: string;
}

@Component({
  selector: 'app-room-post-filter-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="filters" [formGroup]="form" (ngSubmit)="apply()">
      <div class="filters-grid">
        <div class="field">
          <label for="rp-search">Search in title</label>
          <input id="rp-search" type="text" formControlName="search" placeholder="Matches listing title" />
        </div>
        <div class="field">
          <label for="rp-title">Title (exact field)</label>
          <input id="rp-title" type="text" formControlName="title" placeholder="Overrides search if both set" />
        </div>
        <div class="field">
          <label for="rp-country">Country</label>
          <select id="rp-country" formControlName="countryCode" (change)="onCountryChange()">
            <option [ngValue]="null">Any country</option>
            <option *ngFor="let c of countries; trackBy: trackSelect" [ngValue]="c.orderCode">{{ c.text }}</option>
          </select>
        </div>
        <div class="field">
          <label for="rp-region">Region</label>
          <select id="rp-region" formControlName="regionCode" [disabled]="!regions.length">
            <option [ngValue]="null">Any region</option>
            <option *ngFor="let r of regions; trackBy: trackSelect" [ngValue]="r.orderCode">{{ r.text }}</option>
          </select>
        </div>
        <div class="field">
          <label for="rp-room-type">Room type</label>
          <select id="rp-room-type" formControlName="roomTypeCode">
            <option [ngValue]="null">Any</option>
            <option *ngFor="let x of roomTypes; trackBy: trackSelect" [ngValue]="optionCode(x)">{{ x.text }}</option>
          </select>
        </div>
        <div class="field">
          <label for="rp-listing-type">Listing type</label>
          <select id="rp-listing-type" formControlName="roomPostTypeCode">
            <option [ngValue]="null">Any</option>
            <option *ngFor="let x of roomPostTypes; trackBy: trackSelect" [ngValue]="optionCode(x)">{{ x.text }}</option>
          </select>
        </div>
        <div class="field">
          <label for="rp-currency">Currency</label>
          <select id="rp-currency" formControlName="currencyCode">
            <option [ngValue]="null">Any</option>
            <option *ngFor="let x of currencies; trackBy: trackSelect" [ngValue]="optionCode(x)">{{ x.text }}</option>
          </select>
        </div>
        <div class="field">
          <label for="rp-gender">Guest gender</label>
          <select id="rp-gender" formControlName="forGenderCode">
            <option [ngValue]="null">Any</option>
            <option *ngFor="let x of genders; trackBy: trackSelect" [ngValue]="x.orderCode">{{ x.text }}</option>
          </select>
        </div>
        <div class="field">
          <label for="rp-rent-min">Min rent</label>
          <input id="rp-rent-min" type="number" min="0" step="0.01" formControlName="minimumMonthlyRentFee" />
        </div>
        <div class="field">
          <label for="rp-rent-max">Max rent</label>
          <input id="rp-rent-max" type="number" min="0" step="0.01" formControlName="maximumMonthlyRentFee" />
        </div>
        <div class="field">
          <label for="rp-dep-min">Min deposit</label>
          <input id="rp-dep-min" type="number" min="0" step="0.01" formControlName="minimumDepositAmount" />
        </div>
        <div class="field">
          <label for="rp-dep-max">Max deposit</label>
          <input id="rp-dep-max" type="number" min="0" step="0.01" formControlName="maximumDepositAmount" />
        </div>
        <div class="field">
          <label for="rp-deposit">Deposit</label>
          <select id="rp-deposit" formControlName="depositExists">
            <option value="">Any</option>
            <option value="true">Has deposit</option>
            <option value="false">No deposit</option>
          </select>
        </div>
        <div class="field">
          <label for="rp-sort">Sort by</label>
          <select id="rp-sort" formControlName="sortBy">
            <option *ngFor="let o of sortOptions" [value]="o.value">{{ o.label }}</option>
          </select>
        </div>
        <div class="field">
          <label for="rp-order">Order</label>
          <select id="rp-order" formControlName="orderType">
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>
        </div>
      </div>
      <div class="filters-actions">
        <button type="submit" class="btn-apply">Apply filters</button>
        <button type="button" class="btn-clear" (click)="clear()">Clear</button>
        <span *ngIf="!lookupsReady" class="hint">Loading filter options…</span>
        <span *ngIf="lookupError" class="err">{{ lookupError }}</span>
      </div>
    </form>
  `,
  styles: [
    `
      .filters {
        margin-bottom: 18px;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid rgba(51, 65, 85, 0.85);
        background: rgba(15, 23, 42, 0.65);
      }
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      input,
      select {
        width: 100%;
        box-sizing: border-box;
        border-radius: 9px;
        border: 1px solid #334155;
        background: #0f172a;
        color: #e2e8f0;
        padding: 8px 10px;
        font-size: 0.88rem;
        font-family: inherit;
      }
      input:disabled,
      select:disabled {
        opacity: 0.5;
      }
      .filters-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }
      .btn-apply {
        border: none;
        border-radius: 10px;
        padding: 8px 16px;
        font-weight: 600;
        cursor: pointer;
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
        font-family: inherit;
      }
      .btn-clear {
        border: 1px solid #475569;
        border-radius: 10px;
        padding: 8px 14px;
        font-weight: 600;
        cursor: pointer;
        background: transparent;
        color: #cbd5e1;
        font-family: inherit;
      }
      .hint {
        font-size: 0.85rem;
        color: #94a3b8;
      }
      .err {
        font-size: 0.85rem;
        color: #fecaca;
      }
    `,
  ],
})
export class RoomPostFilterPanelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lookups = inject(RoomPostFilterLookupsService);
  private readonly regionLookups = inject(RegisterLookupService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly filtersApply = output<RoomPostFilterCriteria>();
  readonly optionCode = filterOptionCode;

  readonly sortOptions = ROOM_POST_SORT_OPTIONS;

  form = this.fb.nonNullable.group({
    search: '',
    title: '',
    countryCode: null as number | null,
    regionCode: null as number | null,
    roomPostTypeCode: null as number | null,
    roomTypeCode: null as number | null,
    forGenderCode: null as number | null,
    currencyCode: null as number | null,
    minimumMonthlyRentFee: null as number | null,
    maximumMonthlyRentFee: null as number | null,
    minimumDepositAmount: null as number | null,
    maximumDepositAmount: null as number | null,
    depositExists: '' as '' | 'true' | 'false',
    sortBy: '',
    orderType: 'DESC',
  });

  countries: SelectListItem<number>[] = [];
  regions: SelectListItem<number>[] = [];
  roomTypes: SelectListItem<number>[] = [];
  roomPostTypes: SelectListItem<number>[] = [];
  currencies: SelectListItem<number>[] = [];
  genders: SelectListItem<number>[] = [];

  lookupsReady = false;
  lookupError = '';

  ngOnInit(): void {
    this.lookups.load().pipe(take(1)).subscribe({
      next: (data) => {
        this.countries = data.countries;
        this.roomTypes = data.roomTypes;
        this.roomPostTypes = data.roomPostTypes;
        this.currencies = data.currencies;
        this.genders = data.genders;
        this.lookupsReady = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.lookupError = 'Could not load filter dropdowns.';
        this.cdr.markForCheck();
      },
    });
  }

  trackSelect(_: number, item: SelectListItem<number>): number {
    return filterOptionCode(item);
  }

  onCountryChange(): void {
    const countryCode = this.form.controls.countryCode.value;
    this.form.controls.regionCode.setValue(null);
    this.regions = [];
    if (countryCode == null || countryCode <= 0) {
      this.cdr.markForCheck();
      return;
    }
    this.regionLookups
      .getRegionSelect(countryCode)
      .pipe(take(1))
      .subscribe({
        next: (rows) => {
          this.regions = rows;
          this.cdr.markForCheck();
        },
        error: () => {
          this.regions = [];
          this.cdr.markForCheck();
        },
      });
  }

  apply(): void {
    this.filtersApply.emit(this.criteriaFromForm());
    this.cdr.markForCheck();
  }

  clear(): void {
    this.form.reset({
      search: '',
      title: '',
      countryCode: null,
      regionCode: null,
      roomPostTypeCode: null,
      roomTypeCode: null,
      forGenderCode: null,
      currencyCode: null,
      minimumMonthlyRentFee: null,
      maximumMonthlyRentFee: null,
      minimumDepositAmount: null,
      maximumDepositAmount: null,
      depositExists: '',
      sortBy: '',
      orderType: 'DESC',
    });
    this.regions = [];
    this.filtersApply.emit({});
    this.cdr.markForCheck();
  }

  private criteriaFromForm(): RoomPostFilterCriteria {
    const v = this.form.getRawValue() as FilterFormValue;
    const criteria: RoomPostFilterOptions = {};

    const title = v.title.trim() || v.search.trim();
    if (title) {
      criteria.title = title;
    }
    if (v.regionCode != null && v.regionCode > 0) {
      criteria.regionCode = v.regionCode;
    }
    if (v.roomPostTypeCode != null && v.roomPostTypeCode > 0) {
      criteria.roomPostTypeCode = v.roomPostTypeCode;
    }
    if (v.roomTypeCode != null && v.roomTypeCode > 0) {
      criteria.roomTypeCode = v.roomTypeCode;
    }
    if (v.forGenderCode != null && v.forGenderCode > 0) {
      criteria.forGenderCode = v.forGenderCode;
    }
    if (v.currencyCode != null && v.currencyCode > 0) {
      criteria.currencyCode = v.currencyCode;
    }
    if (v.minimumMonthlyRentFee != null && Number.isFinite(v.minimumMonthlyRentFee)) {
      criteria.minimumMonthlyRentFee = v.minimumMonthlyRentFee;
    }
    if (v.maximumMonthlyRentFee != null && Number.isFinite(v.maximumMonthlyRentFee)) {
      criteria.maximumMonthlyRentFee = v.maximumMonthlyRentFee;
    }
    if (v.minimumDepositAmount != null && Number.isFinite(v.minimumDepositAmount)) {
      criteria.minimumDepositAmount = v.minimumDepositAmount;
    }
    if (v.maximumDepositAmount != null && Number.isFinite(v.maximumDepositAmount)) {
      criteria.maximumDepositAmount = v.maximumDepositAmount;
    }
    if (v.depositExists === 'true') {
      criteria.depositExists = true;
    } else if (v.depositExists === 'false') {
      criteria.depositExists = false;
    }
    const sortBy = v.sortBy.trim();
    if (sortBy) {
      criteria.sortBy = sortBy;
    }
    if (v.orderType) {
      criteria.orderType = v.orderType;
    }

    return criteria;
  }
}
