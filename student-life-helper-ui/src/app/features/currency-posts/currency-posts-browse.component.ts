import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import type { CurrencyPostDto, UserDto } from '../../contracts';
import { CurrencyPostService } from '../../services/currency-post.service';
import { RegisterLookupService } from '../../services/register-lookup.service';
import type { SelectListItem } from '../../services/manual.service';
import { formatRelativeTime } from '../../chat/chat-time';
import { currencyExchangeLabel, currencyPostExcerpt } from './currency-post-display';
import { formatCurrencyPostError } from './currency-post-format-error';

@Component({
  selector: 'app-currency-posts-browse',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav">
        <a routerLink="/admin/profile" class="link-muted">← Back to profile</a>
        <div class="top-nav-right">
          <a routerLink="/admin/currency-posts/mine" class="link-muted">My posts</a>
          <a routerLink="/admin/currency-posts/new" class="link-accent">+ New post</a>
        </div>
      </nav>

      <header class="hero">
        <h1>Currency posts</h1>
        <p class="lead">Browse active currency exchange offers from the community.</p>
      </header>

      <div class="filters">
        <div class="filter-row">
          <label>
            From
            <select [(ngModel)]="fromCurrencyCode" (ngModelChange)="applyFilters()">
              <option [ngValue]="null">Any</option>
              <option *ngFor="let c of currencies; trackBy: trackCurrency" [ngValue]="c.value">{{ c.text }}</option>
            </select>
          </label>
          <label>
            To
            <select [(ngModel)]="toCurrencyCode" (ngModelChange)="applyFilters()">
              <option [ngValue]="null">Any</option>
              <option *ngFor="let c of currencies; trackBy: trackCurrency" [ngValue]="c.value">{{ c.text }}</option>
            </select>
          </label>
          <label>
            Min amount
            <input type="number" min="0" step="0.01" [(ngModel)]="minAmount" (keyup.enter)="applyFilters()" />
          </label>
          <label>
            Max amount
            <input type="number" min="0" step="0.01" [(ngModel)]="maxAmount" (keyup.enter)="applyFilters()" />
          </label>
        </div>
        <div class="filter-row">
          <label class="grow">
            Search
            <input type="search" [(ngModel)]="searchText" placeholder="Title or description…" (keyup.enter)="applyFilters()" />
          </label>
          <button type="button" class="btn-ghost" (click)="applyFilters()" [disabled]="busy()">Apply</button>
          <button type="button" class="btn-ghost" (click)="clearFilters()" [disabled]="busy()">Clear</button>
        </div>
      </div>

      <div *ngIf="loading() && !rows().length" class="state">Loading offers…</div>
      <p *ngIf="errorMessage()" class="error-banner">{{ errorMessage() }}</p>

      <div *ngIf="!errorMessage() && (rows().length || !loading())" class="toolbar">
        <span class="meta">
          Showing {{ rows().length }} on this page
          <ng-container *ngIf="total() > 0"> · {{ total() }} total</ng-container>
          <span *ngIf="refreshing()" class="refreshing"> · Updating…</span>
        </span>
        <div class="pager">
          <button type="button" class="btn-ghost" [disabled]="page() <= 1 || busy()" (click)="goPage(page() - 1)">Previous</button>
          <span class="page-label">Page {{ page() }}</span>
          <button type="button" class="btn-ghost" [disabled]="!canGoNext() || busy()" (click)="goPage(page() + 1)">Next</button>
        </div>
      </div>

      <div *ngIf="!busy() && !errorMessage() && !rows().length" class="empty">
        <p>No currency posts found.</p>
        <a routerLink="/admin/currency-posts/new" class="link-accent">Create one</a>
      </div>

      <div class="grid" *ngIf="rows().length" [class.is-refreshing]="refreshing()">
        <a
          class="card"
          *ngFor="let post of rows(); trackBy: trackById"
          [routerLink]="['/admin/currency-posts', post.id]"
        >
          <div class="exchange">{{ exchangeLabel(post) }}</div>
          <div class="amount">{{ post.amount }}</div>
          <h2 class="title">{{ post.title }}</h2>
          <p class="desc">{{ excerpt(post.description) }}</p>
          <div class="meta-row">
            <span>{{ '@' + post.username }}</span>
            <span>{{ relativeTime(post.createdDateTime) }}</span>
          </div>
          <span class="status-badge">{{ post.statusName }}</span>
        </a>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .page { max-width: 1100px; margin: 0 auto; padding: 22px 18px 48px; }
      .top-nav { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
      .top-nav-right { display: flex; gap: 16px; flex-wrap: wrap; }
      .link-muted { color: #94a3b8; text-decoration: none; font-size: 0.92rem; }
      .link-muted:hover { color: #e2e8f0; }
      .link-accent { color: #a5b4fc; font-weight: 600; text-decoration: none; font-size: 0.92rem; }
      .link-accent:hover { color: #c7d2fe; }
      .hero h1 { margin: 0 0 8px; font-size: 1.75rem; color: #f8fafc; }
      .lead { margin: 0 0 20px; color: #94a3b8; max-width: 52ch; line-height: 1.5; }
      .filters {
        margin-bottom: 18px; padding: 14px 16px; border-radius: 14px;
        border: 1px solid #334155; background: rgba(15, 23, 42, 0.72);
        display: grid; gap: 12px;
      }
      .filter-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
      .filter-row label { display: grid; gap: 6px; font-size: 0.82rem; color: #cbd5e1; font-weight: 600; min-width: 140px; }
      .filter-row label.grow { flex: 1; min-width: 200px; }
      .filter-row select, .filter-row input {
        border: 1px solid #334155; border-radius: 10px; background: #0f172a; color: #f8fafc;
        padding: 8px 10px; font-family: inherit;
      }
      .btn-ghost {
        border: 1px solid #475569; background: transparent; color: #e2e8f0;
        border-radius: 10px; padding: 8px 14px; cursor: pointer; font-weight: 600; font-family: inherit;
      }
      .btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }
      .state { color: #94a3b8; padding: 20px 0; }
      .error-banner {
        padding: 12px 14px; border-radius: 12px; background: rgba(127, 29, 29, 0.45);
        color: #fecaca; margin-bottom: 16px;
      }
      .toolbar {
        display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
        margin-bottom: 18px; padding: 12px 14px; border-radius: 14px;
        border: 1px solid rgba(51, 65, 85, 0.85); background: rgba(15, 23, 42, 0.65);
      }
      .meta { font-size: 0.88rem; color: #94a3b8; }
      .refreshing { color: #a5b4fc; }
      .pager { display: flex; align-items: center; gap: 10px; }
      .page-label { font-size: 0.88rem; color: #cbd5e1; }
      .empty { color: #94a3b8; padding: 24px 0; }
      .grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
      }
      .grid.is-refreshing { opacity: 0.65; transition: opacity 0.15s ease; }
      .card {
        display: block; text-decoration: none; color: inherit;
        background: #1e293b; border: 1px solid #334155; border-radius: 14px;
        padding: 18px 16px; position: relative; transition: border-color 0.2s ease, transform 0.15s ease;
      }
      .card:hover { border-color: #6366f1; transform: translateY(-2px); }
      .exchange {
        font-size: 1.35rem; font-weight: 700; color: #c7d2fe; margin-bottom: 6px;
        letter-spacing: 0.02em;
      }
      .amount {
        font-size: 1.75rem; font-weight: 800; color: #f8fafc; margin-bottom: 10px;
      }
      .title { margin: 0 0 8px; font-size: 1.05rem; color: #f8fafc; }
      .desc { margin: 0 0 12px; color: #94a3b8; font-size: 0.88rem; line-height: 1.45; }
      .meta-row {
        display: flex; justify-content: space-between; gap: 8px; font-size: 0.8rem; color: #64748b;
      }
      .status-badge {
        position: absolute; top: 12px; right: 12px;
        font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
        padding: 3px 8px; border-radius: 999px; background: rgba(79, 70, 229, 0.35); color: #e0e7ff;
      }
      @media (max-width: 640px) {
        .filter-row label { min-width: 100%; }
      }
    `,
  ],
})
export class CurrencyPostsBrowseComponent implements OnInit {
  private readonly currencyPosts = inject(CurrencyPostService);
  private readonly lookups = inject(RegisterLookupService);
  private readonly auth = inject(AuthService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  private loadToken = 0;
  readonly pageSize = 12;

  readonly page = signal(1);
  readonly total = signal(0);
  readonly rows = signal<CurrencyPostDto[]>([]);
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly errorMessage = signal('');
  readonly canGoNext = signal(false);

  currencies: SelectListItem<number>[] = [];
  fromCurrencyCode: number | null = null;
  toCurrencyCode: number | null = null;
  minAmount: number | null = null;
  maxAmount: number | null = null;
  searchText = '';

  readonly relativeTime = formatRelativeTime;
  readonly exchangeLabel = currencyExchangeLabel;
  readonly excerpt = currencyPostExcerpt;

  busy(): boolean {
    return this.loading() || this.refreshing();
  }

  ngOnInit(): void {
    this.lookups
      .getCurrencyTypeSelect()
      .pipe(take(1))
      .subscribe({
        next: (items) => {
          this.currencies = items;
          this.cdr.markForCheck();
        },
      });
    this.auth
      .getProfile()
      .pipe(take(1), catchError(() => of(null as UserDto | null)))
      .subscribe(() => this.load(false));
  }

  trackById(_: number, post: CurrencyPostDto): number {
    return post.id;
  }

  trackCurrency(_: number, item: SelectListItem<number>): number {
    return item.value;
  }

  goPage(next: number): void {
    if (next < 1) return;
    this.page.set(next);
    this.load(true);
  }

  applyFilters(): void {
    this.page.set(1);
    this.load(true);
  }

  clearFilters(): void {
    this.fromCurrencyCode = null;
    this.toCurrencyCode = null;
    this.minAmount = null;
    this.maxAmount = null;
    this.searchText = '';
    this.applyFilters();
  }

  private load(soft: boolean): void {
    const token = ++this.loadToken;
    if (soft) {
      this.refreshing.set(true);
    } else {
      this.loading.set(true);
      this.errorMessage.set('');
    }

    this.currencyPosts
      .getAll(this.buildFilter())
      .pipe(
        take(1),
        finalize(() => {
          if (token === this.loadToken) {
            this.loading.set(false);
            this.refreshing.set(false);
          }
        }),
      )
      .subscribe({
        next: (res) => {
          if (token !== this.loadToken) return;
          this.ngZone.run(() => {
            const list = res.rows ?? [];
            this.rows.set(list);
            this.total.set(res.total ?? 0);
            const gotFull = list.length >= this.pageSize;
            const moreByTotal = (res.total ?? 0) > this.page() * this.pageSize;
            this.canGoNext.set(moreByTotal || (res.total <= 0 && gotFull));
            this.cdr.markForCheck();
          });
        },
        error: (e) => {
          if (token !== this.loadToken) return;
          this.ngZone.run(() => {
            this.errorMessage.set(formatCurrencyPostError(e));
            this.cdr.markForCheck();
          });
        },
      });
  }

  private buildFilter() {
    return {
      page: this.page(),
      pageSize: this.pageSize,
      fromCurrencyCode: this.fromCurrencyCode ?? undefined,
      toCurrencyCode: this.toCurrencyCode ?? undefined,
      minAmount: this.minAmount != null && this.minAmount > 0 ? this.minAmount : undefined,
      maxAmount: this.maxAmount != null && this.maxAmount > 0 ? this.maxAmount : undefined,
      search: this.searchText.trim() || undefined,
    };
  }
}
