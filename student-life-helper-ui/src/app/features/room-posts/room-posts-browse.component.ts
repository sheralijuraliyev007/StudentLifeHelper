import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { RoomPostDto, UserDto } from '../../contracts';
import { RoomPostService } from '../../services/roomPostService';
import { RoomPostFilterPanelComponent } from './room-post-filter-panel.component';
import {
  emptyRoomPostFilterCriteria,
  toRoomPostFilterRequest,
  type RoomPostFilterCriteria,
} from './room-post-filters';
import { roomPostCardDeposit } from './room-post-card-display';
import { CurrencySymbolService } from './currency-symbol.service';
import { roomPostMainImageUrl } from './room-post-media';
import { roomPostCanEdit } from './room-post-status';

@Component({
  selector: 'app-room-posts-browse',
  standalone: true,
  imports: [CommonModule, RouterLink, RoomPostFilterPanelComponent],
  template: `
    <section class="page">
      <nav class="top-nav" aria-label="Room posts navigation">
        <a routerLink="/admin/profile" class="link-muted">← Back to profile</a>
        <div class="top-nav-right">
          <a routerLink="/admin/room-posts/mine" class="link-muted">My posts</a>
          <a routerLink="/admin/room-posts/create" class="link-accent">+ New room post</a>
        </div>
      </nav>

      <header class="hero">
        <h1>Room posts</h1>
        <p class="lead">Browse listings from the community. Use filters to narrow results.</p>
      </header>

      <app-room-post-filter-panel (filtersApply)="onFiltersApply($event)" />

      <div *ngIf="loading && !rows.length" class="state">Loading listings…</div>
      <p *ngIf="errorMessage" class="error-banner">{{ errorMessage }}</p>

      <div *ngIf="!errorMessage && (rows.length || !loading)" class="toolbar">
        <span class="meta">
          Showing {{ rows.length }} on this page
          <ng-container *ngIf="total > 0"> · {{ total }} total</ng-container>
          <span *ngIf="refreshing" class="refreshing"> · Updating…</span>
        </span>
        <div class="pager">
          <button type="button" class="btn-ghost" [disabled]="page <= 1 || busy" (click)="goPage(page - 1)">
            Previous
          </button>
          <span class="page-label">Page {{ page }}</span>
          <button type="button" class="btn-ghost" [disabled]="!canGoNext || busy" (click)="goPage(page + 1)">
            Next
          </button>
        </div>
      </div>

      <div *ngIf="!busy && !errorMessage && !rows.length" class="empty">
        <p>No room posts found yet.</p>
        <a routerLink="/admin/room-posts/create" class="link-accent">Create the first one</a>
      </div>

      <div class="grid" *ngIf="rows.length" [class.is-refreshing]="refreshing">
        <article class="card" *ngFor="let post of rows; trackBy: trackById">
          <div class="thumb" *ngIf="coverOf(post) as cover; else noCover">
            <img [src]="cover" [alt]="post.title" />
          </div>
          <ng-template #noCover>
            <div class="thumb placeholder" aria-hidden="true"></div>
          </ng-template>
          <div class="body">
            <h2 class="title">{{ post.title }}</h2>
            <p class="desc">{{ excerpt(post.description) }}</p>
            <ul class="facts">
              <li><span class="k">Region</span> {{ post.regionName }}</li>
              <li>
                <span class="k">Rent</span> {{ post.monthlyRentFee }} {{ currencyLabel(post) }}
              </li>
              <li *ngIf="depositAmount(post) as deposit">
                <span class="k">Deposit</span> {{ deposit }} {{ currencyLabel(post) }}
              </li>
              <li><span class="k">Type</span> {{ post.roomTypeName }} · {{ post.roomPostName }}</li>
              <li><span class="k">Host</span> {{ '@' + post.username }}</li>
              <li><span class="k">Status</span> {{ post.statusName }}</li>
            </ul>
            <div class="actions">
              <a [routerLink]="['/admin/room-posts', post.id]" class="btn-small primary">View</a>
              <a
                *ngIf="isOwnPost(post) && canEditPost(post)"
                [routerLink]="['/admin/room-posts', post.id, 'add-content']"
                class="btn-small secondary"
              >
                Photos
              </a>
              <a *ngIf="post.addressLink" class="btn-small ghost" [href]="post.addressLink" target="_blank" rel="noopener">
                Map / link
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
      .page {
        max-width: 1100px;
        margin: 0 auto;
        padding: 22px 18px 48px;
      }
      .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 18px;
      }
      .link-muted {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.92rem;
      }
      .link-muted:hover {
        color: #e2e8f0;
      }
      .link-accent {
        color: #a5b4fc;
        font-weight: 600;
        text-decoration: none;
        font-size: 0.92rem;
      }
      .link-accent:hover {
        color: #c7d2fe;
      }
      .top-nav-right {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .hero h1 {
        margin: 0 0 8px;
        font-size: 1.75rem;
        color: #f8fafc;
      }
      .lead {
        margin: 0 0 22px;
        color: #94a3b8;
        max-width: 52ch;
        line-height: 1.5;
      }
      .state {
        color: #94a3b8;
        padding: 20px 0;
      }
      .error-banner {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(127, 29, 29, 0.45);
        color: #fecaca;
        margin-bottom: 16px;
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 18px;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid rgba(51, 65, 85, 0.85);
        background: rgba(15, 23, 42, 0.65);
      }
      .meta {
        font-size: 0.88rem;
        color: #94a3b8;
      }
      .refreshing {
        color: #a5b4fc;
      }
      .grid.is-refreshing {
        opacity: 0.65;
        transition: opacity 0.15s ease;
      }
      .pager {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .page-label {
        font-size: 0.88rem;
        color: #cbd5e1;
        min-width: 72px;
        text-align: center;
      }
      .btn-ghost {
        border: 1px solid #334155;
        background: #111827;
        color: #e2e8f0;
        border-radius: 10px;
        padding: 8px 14px;
        cursor: pointer;
        font-weight: 600;
      }
      .btn-ghost:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .empty {
        text-align: center;
        padding: 40px 16px;
        color: #94a3b8;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 18px;
      }
      .card {
        display: flex;
        flex-direction: column;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(51, 65, 85, 0.9);
        background: rgba(15, 23, 42, 0.92);
        box-shadow: 0 16px 32px rgba(2, 6, 23, 0.35);
      }
      .thumb {
        aspect-ratio: 16 / 10;
        background: #020617;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .thumb.placeholder {
        background: linear-gradient(135deg, #1e293b, #0f172a);
      }
      .body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }
      .title {
        margin: 0;
        font-size: 1.05rem;
        color: #f1f5f9;
        line-height: 1.35;
      }
      .desc {
        margin: 0;
        font-size: 0.86rem;
        color: #94a3b8;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .facts {
        list-style: none;
        margin: 6px 0 0;
        padding: 0;
        display: grid;
        gap: 4px;
        font-size: 0.82rem;
        color: #cbd5e1;
      }
      .facts .k {
        color: #64748b;
        margin-right: 6px;
      }
      .actions {
        margin-top: auto;
        padding-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .btn-small {
        display: inline-block;
        font-size: 0.8rem;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 9px;
        text-decoration: none;
        border: 1px solid transparent;
      }
      .btn-small.primary {
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
      }
      .btn-small.ghost {
        border-color: #334155;
        color: #cbd5e1;
        background: transparent;
      }
    `,
  ],
})
export class RoomPostsBrowseComponent implements OnInit {
  private readonly roomPosts = inject(RoomPostService);
  private readonly auth = inject(AuthService);
  private readonly currencySymbols = inject(CurrencySymbolService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  private loadToken = 0;

  readonly pageSize = 12;

  page = 1;
  total = 0;
  rows: RoomPostDto[] = [];
  loading = true;
  refreshing = false;
  errorMessage = '';
  currentUsername = '';
  filterCriteria: RoomPostFilterCriteria = emptyRoomPostFilterCriteria();

  canGoNext = false;

  get busy(): boolean {
    return this.loading || this.refreshing;
  }

  ngOnInit(): void {
    void this.currencySymbols.ensureLoaded().then(() => this.cdr.markForCheck());
    this.auth
      .getProfile()
      .pipe(
        take(1),
        catchError(() => of(null as UserDto | null)),
      )
      .subscribe((profile) => {
        this.ngZone.run(() => {
          if (profile?.username) {
            this.currentUsername = profile.username.trim().toLowerCase();
          }
          this.cdr.markForCheck();
        });
      });
    this.load(false);
  }

  trackById(_: number, post: RoomPostDto): number {
    return post.id;
  }

  goPage(next: number): void {
    if (next < 1) {
      return;
    }
    this.page = next;
    this.load(true);
  }

  onFiltersApply(criteria: RoomPostFilterCriteria): void {
    this.filterCriteria = criteria;
    this.page = 1;
    this.load(true);
  }

  coverOf(post: RoomPostDto): string | null {
    return roomPostMainImageUrl(post);
  }

  currencyLabel(post: RoomPostDto): string {
    return this.currencySymbols.labelFor(post);
  }

  depositAmount(post: RoomPostDto): number | null {
    return roomPostCardDeposit(post);
  }

  excerpt(text: string): string {
    const t = (text ?? '').trim();
    return t.length > 220 ? `${t.slice(0, 217)}…` : t;
  }

  isOwnPost(post: RoomPostDto): boolean {
    if (!this.currentUsername) {
      return false;
    }
    return (post.username ?? '').trim().toLowerCase() === this.currentUsername;
  }

  canEditPost(post: RoomPostDto): boolean {
    return roomPostCanEdit(post.statusCode);
  }

  private load(soft: boolean): void {
    const myToken = ++this.loadToken;
    if (soft && this.rows.length > 0) {
      this.refreshing = true;
    } else {
      this.loading = true;
    }
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.roomPosts
      .getRoomPostsPage(this.listRequest())
      .pipe(
        take(1),
        finalize(() => {
          if (myToken !== this.loadToken) {
            return;
          }
          this.ngZone.run(() => {
            this.loading = false;
            this.refreshing = false;
            this.cdr.markForCheck();
          });
        }),
      )
      .subscribe({
        next: (res) => {
          if (myToken !== this.loadToken) {
            return;
          }
          this.ngZone.run(() => {
            this.rows = res.rows ?? [];
            this.total = res.total ?? 0;
            this.applyPagingHints();
            this.cdr.markForCheck();
          });
        },
        error: (e) => {
          if (myToken !== this.loadToken) {
            return;
          }
          this.ngZone.run(() => {
            if (!soft) {
              this.rows = [];
            }
            this.errorMessage = this.formatError(e);
            this.cdr.markForCheck();
          });
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
      if (err.status === 401 || err.status === 403) {
        return 'You need to be signed in to browse room posts.';
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Could not load room posts.';
  }

  private listRequest() {
    return toRoomPostFilterRequest(this.filterCriteria, this.page, this.pageSize);
  }

  private applyPagingHints(): void {
    const gotFullPage = this.rows.length >= this.pageSize;
    const moreByTotal = this.total > 0 && this.page * this.pageSize < this.total;
    this.canGoNext = moreByTotal || (this.total <= 0 && gotFullPage);
  }
}
