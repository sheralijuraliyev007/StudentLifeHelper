import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, Subject, finalize, take, takeUntil } from 'rxjs';
import { RoomPostDto } from '../../contracts';
import { RoomPostService } from '../../services/roomPostService';
import { ToastMessage, ToastService } from '../../services/toast.service';
import { RoomPostFilterPanelComponent } from './room-post-filter-panel.component';
import {
  emptyRoomPostFilterCriteria,
  toRoomPostFilterRequest,
  type RoomPostFilterCriteria,
} from './room-post-filters';
import { roomPostCardDeposit } from './room-post-card-display';
import { CurrencySymbolService } from './currency-symbol.service';
import { roomPostMainImageUrl } from './room-post-media';
import {
  RoomPostStatusCode,
  roomPostCanActivate,
  roomPostCanDeactivate,
  roomPostCanDelete,
  roomPostCanEdit,
  roomPostStatusLabelEn,
} from './room-post-status';

@Component({
  selector: 'app-room-posts-mine',
  standalone: true,
  imports: [CommonModule, RouterLink, RoomPostFilterPanelComponent],
  template: `
    <section class="page">
      <nav class="top-nav" aria-label="Room posts navigation">
        <a routerLink="/admin/room-posts" class="link-muted">← All room posts</a>
        <div class="top-nav-right">
          <a routerLink="/admin/room-posts/create" class="link-accent">+ New room post</a>
          <a routerLink="/admin/profile" class="link-muted">Profile</a>
        </div>
      </nav>

      <header class="hero">
        <h1>My room posts</h1>
        <p class="lead">Only listings you created (deleted items are hidden). Use filters to narrow your list.</p>
      </header>

      <app-room-post-filter-panel (filtersApply)="onFiltersApply($event)" />

      <div class="toast-stack" aria-live="polite">
        <div
          *ngFor="let toast of toasts; trackBy: trackToastById"
          class="toast"
          [class.toast-success]="toast.success"
          [class.toast-error]="!toast.success"
        >
          {{ toast.text }}
        </div>
      </div>

      <div *ngIf="loading() && !rows().length" class="state">Loading your listings…</div>
      <p *ngIf="errorMessage()" class="error-banner">{{ errorMessage() }}</p>

      <div *ngIf="!errorMessage() && (rows().length || !loading())" class="toolbar">
        <span class="meta">
          Showing {{ rows().length }} on this page
          <ng-container *ngIf="total() > 0"> · {{ total() }} yours</ng-container>
          <span *ngIf="refreshing()" class="refreshing"> · Updating…</span>
        </span>
        <div class="pager">
          <button
            type="button"
            class="btn-ghost"
            [disabled]="page() <= 1 || busy()"
            (click)="goPage(page() - 1)"
          >
            Previous
          </button>
          <span class="page-label">Page {{ page() }}</span>
          <button type="button" class="btn-ghost" [disabled]="!canGoNext() || busy()" (click)="goPage(page() + 1)">
            Next
          </button>
        </div>
      </div>

      <div *ngIf="!busy() && !errorMessage() && !rows().length" class="empty">
        <p>You do not have any room posts yet.</p>
        <a routerLink="/admin/room-posts/create" class="link-accent">Create one</a>
      </div>

      <div class="grid" *ngIf="rows().length" [class.is-refreshing]="refreshing()">
        <article class="card" *ngFor="let post of rows(); trackBy: trackById">
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
              <li><span class="k">Status</span> {{ post.statusName }}</li>
            </ul>
            <div class="actions">
              <a [routerLink]="['/admin/room-posts', post.id]" class="btn-small primary">View</a>
              <a
                *ngIf="canEdit(post)"
                [routerLink]="['/admin/room-posts', post.id, 'edit']"
                class="btn-small secondary"
              >
                Edit
              </a>
              <button
                type="button"
                class="btn-small secondary"
                *ngIf="canActivate(post)"
                [disabled]="actingId() === post.id"
                (click)="activate(post)"
              >
                Activate
              </button>
              <button
                type="button"
                class="btn-small warn"
                *ngIf="canDeactivate(post)"
                [disabled]="actingId() === post.id"
                (click)="deactivate(post)"
              >
                Deactivate
              </button>
              <button
                type="button"
                class="btn-small danger"
                *ngIf="canDelete(post)"
                [disabled]="actingId() === post.id"
                (click)="deletePost(post)"
              >
                Delete
              </button>
              <a
                *ngIf="canEdit(post)"
                [routerLink]="['/admin/room-posts', post.id, 'add-content']"
                class="btn-small primary"
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
      .top-nav-right {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
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
      .toast-stack {
        position: fixed;
        top: 18px;
        right: 18px;
        display: grid;
        gap: 8px;
        z-index: 1400;
        pointer-events: none;
      }
      .toast-stack .toast {
        pointer-events: auto;
      }
      .toast {
        color: #fff;
        padding: 10px 14px;
        border-radius: 8px;
        min-width: 220px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
      }
      .toast-success {
        background: #16a34a;
      }
      .toast-error {
        background: #dc2626;
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
      .btn-small.secondary {
        border: 1px solid #475569;
        color: #e2e8f0;
        background: rgba(30, 41, 59, 0.6);
      }
      .btn-small.warn {
        border: 1px solid #b45309;
        color: #fde68a;
        background: rgba(120, 53, 15, 0.35);
      }
      .btn-small.danger {
        border: 1px solid #b91c1c;
        color: #fecaca;
        background: rgba(127, 29, 29, 0.35);
      }
      button.btn-small {
        cursor: pointer;
        font-family: inherit;
      }
      button.btn-small:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    `,
  ],
})
export class RoomPostsMineComponent implements OnInit, OnDestroy {
  private readonly roomPosts = inject(RoomPostService);
  private readonly toastService = inject(ToastService);
  private readonly currencySymbols = inject(CurrencySymbolService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private readonly destroy$ = new Subject<void>();
  /** Invalidates in-flight list responses after `load()` or pagination (like info-table `loadToken`). */
  private loadToken = 0;

  readonly pageSize = 12;

  readonly page = signal(1);
  readonly total = signal(0);
  readonly rows = signal<RoomPostDto[]>([]);
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly errorMessage = signal('');
  readonly canGoNext = signal(false);
  readonly actingId = signal<number | null>(null);

  filterCriteria: RoomPostFilterCriteria = emptyRoomPostFilterCriteria();

  toasts: ToastMessage[] = [];

  busy(): boolean {
    return this.loading() || this.refreshing();
  }

  ngOnInit(): void {
    void this.currencySymbols.ensureLoaded().then(() => this.cdr.markForCheck());
    this.toastService.toasts$.pipe(takeUntil(this.destroy$)).subscribe((list) => {
      this.toasts = list;
      this.cdr.markForCheck();
    });
    this.load(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackById(_: number, post: RoomPostDto): number {
    return post.id;
  }

  trackToastById(_: number, toast: ToastMessage): number {
    return toast.id;
  }

  goPage(next: number): void {
    if (next < 1) {
      return;
    }
    this.page.set(next);
    this.load(false);
  }

  onFiltersApply(criteria: RoomPostFilterCriteria): void {
    this.filterCriteria = criteria;
    this.page.set(1);
    this.load(false);
  }

  canEdit(post: RoomPostDto): boolean {
    return roomPostCanEdit(post.statusCode);
  }

  canActivate(post: RoomPostDto): boolean {
    return roomPostCanActivate(post.statusCode);
  }

  canDeactivate(post: RoomPostDto): boolean {
    return roomPostCanDeactivate(post.statusCode);
  }

  canDelete(post: RoomPostDto): boolean {
    return roomPostCanDelete(post.statusCode);
  }

  activate(post: RoomPostDto): void {
    this.runStatusAction(post, {
      nextCode: RoomPostStatusCode.Active,
      nextName: roomPostStatusLabelEn[RoomPostStatusCode.Active] ?? 'Active',
      request: (id) => this.roomPosts.activateRoomPost(id),
      successToast: 'Listing activated.',
    });
  }

  deactivate(post: RoomPostDto): void {
    if (!confirm('Deactivate this listing? It will be hidden from the public feed.')) {
      return;
    }
    this.runStatusAction(post, {
      nextCode: RoomPostStatusCode.Passive,
      nextName: roomPostStatusLabelEn[RoomPostStatusCode.Passive] ?? 'Passive',
      request: (id) => this.roomPosts.deactivateRoomPost(id),
      successToast: 'Listing deactivated.',
    });
  }

  deletePost(post: RoomPostDto): void {
    if (!confirm('Delete this listing permanently? You can only delete when the API allows your current status.')) {
      return;
    }
    this.actingId.set(post.id);
    this.roomPosts
      .deleteRoomPost(post.id)
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        finalize(() => this.actingId.set(null)),
      )
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.rows.update((rows) => rows.filter((r) => r.id !== post.id));
            this.total.update((t) => Math.max(0, t - 1));
            this.applyPagingHints();
            this.toastService.show('Listing deleted.', true);
            this.syncInBackground();
          });
        },
        error: (e) => {
          this.ngZone.run(() => {
            this.toastService.show(this.formatActionError(e), false);
          });
        },
      });
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

  /** Reconcile with server without clearing the grid (info-table `syncInBackground`). */
  private syncInBackground(): void {
    this.load(false);
  }

  private runStatusAction(
    post: RoomPostDto,
    options: {
      nextCode: number;
      nextName: string;
      request: (id: number) => Observable<string>;
      successToast: string;
    },
  ): void {
    const snapshot = { ...post };
    this.patchRow(snapshot.id, options.nextCode, options.nextName);
    this.actingId.set(post.id);

    options
      .request(post.id)
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        finalize(() => {
          this.actingId.set(null);
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.toastService.show(options.successToast, true);
            this.syncInBackground();
          });
        },
        error: (e) => {
          this.ngZone.run(() => {
            this.patchRow(snapshot.id, snapshot.statusCode, snapshot.statusName);
            this.toastService.show(this.formatActionError(e), false);
            this.cdr.markForCheck();
          });
        },
      });
  }

  private patchRow(id: number, statusCode: number, statusName: string): void {
    this.rows.update((rows) =>
      rows.map((r) => (r.id === id ? { ...r, statusCode, statusName } : r)),
    );
    this.cdr.markForCheck();
  }

  private load(useLoadingOverlay: boolean): void {
    const myToken = ++this.loadToken;
    const soft = !useLoadingOverlay && this.rows().length > 0;
    if (soft) {
      this.refreshing.set(true);
    } else if (useLoadingOverlay) {
      this.loading.set(true);
      this.errorMessage.set('');
    }

    this.roomPosts
      .getUserRoomPostsPage(this.listRequest())
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        finalize(() => {
          if (myToken !== this.loadToken) {
            return;
          }
          this.ngZone.run(() => {
            this.loading.set(false);
            this.refreshing.set(false);
            this.cdr.markForCheck();
          });
        }),
      )
      .subscribe({
        next: (res) => {
          if (myToken !== this.loadToken) {
            return;
          }
          this.rows.set(res.rows ?? []);
          this.total.set(res.total ?? 0);
          this.applyPagingHints();
          this.ngZone.run(() => this.cdr.markForCheck());
        },
        error: (e) => {
          if (myToken !== this.loadToken) {
            return;
          }
          this.ngZone.run(() => {
            if (!soft) {
              this.rows.set([]);
              this.errorMessage.set(this.formatError(e));
            }
            this.cdr.markForCheck();
          });
        },
      });
  }

  private listRequest() {
    return toRoomPostFilterRequest(this.filterCriteria, this.page(), this.pageSize);
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
        return 'You need to be signed in to view your room posts.';
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Could not load your room posts.';
  }

  private formatActionError(err: unknown): string {
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
        const errors = o['errors'] ?? o['Errors'];
        if (Array.isArray(errors)) {
          return errors.map((x) => String(x)).join(' ');
        }
        const title = o['title'] ?? o['Title'];
        if (typeof title === 'string' && title.trim()) {
          return title;
        }
      }
      if (err.status === 401 || err.status === 403) {
        return 'You are not signed in or not allowed to change this listing.';
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Action failed.';
  }

  private applyPagingHints(): void {
    const rowCount = this.rows().length;
    const totalVal = this.total();
    const pageVal = this.page();
    const gotFullPage = rowCount >= this.pageSize;
    const moreByTotal = totalVal > 0 && pageVal * this.pageSize < totalVal;
    this.canGoNext.set(moreByTotal || (totalVal <= 0 && gotFullPage));
  }
}
