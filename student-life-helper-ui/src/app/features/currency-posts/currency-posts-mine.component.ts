import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import type { CurrencyPostDto } from '../../contracts';
import { CurrencyPostService } from '../../services/currency-post.service';
import { ToastService } from '../../services/toast.service';
import { formatRelativeTime } from '../../chat/chat-time';
import {
  RoomPostStatusCode,
  roomPostCanActivate,
  roomPostCanDeactivate,
  roomPostCanDelete,
  roomPostCanEdit,
  roomPostStatusLabelEn,
} from '../room-posts/room-post-status';
import { currencyExchangeLabel, currencyPostExcerpt } from './currency-post-display';
import { formatCurrencyPostError } from './currency-post-format-error';

@Component({
  selector: 'app-currency-posts-mine',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav">
        <a routerLink="/admin/currency-posts" class="link-muted">← All currency posts</a>
        <div class="top-nav-right">
          <a routerLink="/admin/currency-posts/new" class="link-accent">+ New post</a>
          <a routerLink="/admin/profile" class="link-muted">Profile</a>
        </div>
      </nav>

      <header class="hero">
        <h1>My currency posts</h1>
        <p class="lead">Manage your exchange offers across all statuses.</p>
      </header>

      <div *ngIf="loading() && !rows().length" class="state">Loading your posts…</div>
      <p *ngIf="errorMessage()" class="error-banner">{{ errorMessage() }}</p>

      <div *ngIf="!errorMessage() && (rows().length || !loading())" class="toolbar">
        <span class="meta">
          Showing {{ rows().length }} on this page
          <ng-container *ngIf="total() > 0"> · {{ total() }} yours</ng-container>
          <span *ngIf="refreshing()" class="refreshing"> · Updating…</span>
        </span>
        <div class="pager">
          <button type="button" class="btn-ghost" [disabled]="page() <= 1 || busy()" (click)="goPage(page() - 1)">Previous</button>
          <span class="page-label">Page {{ page() }}</span>
          <button type="button" class="btn-ghost" [disabled]="!canGoNext() || busy()" (click)="goPage(page() + 1)">Next</button>
        </div>
      </div>

      <div *ngIf="!busy() && !errorMessage() && !rows().length" class="empty">
        <p>You do not have any currency posts yet.</p>
        <a routerLink="/admin/currency-posts/new" class="link-accent">Create one</a>
      </div>

      <div class="grid" *ngIf="rows().length" [class.is-refreshing]="refreshing()">
        <article class="card" *ngFor="let post of rows(); trackBy: trackById">
          <div class="exchange">{{ exchangeLabel(post) }}</div>
          <div class="amount">{{ post.amount }}</div>
          <h2 class="title">{{ post.title }}</h2>
          <p class="desc">{{ excerpt(post.description) }}</p>
          <div class="meta-row">
            <span>{{ relativeTime(post.createdDateTime) }}</span>
            <span class="status-badge">{{ post.statusName }}</span>
          </div>
          <div class="actions">
            <a [routerLink]="['/admin/currency-posts', post.id]" class="btn-small primary">View</a>
            <a *ngIf="canEdit(post)" [routerLink]="['/admin/currency-posts', post.id, 'edit']" class="btn-small secondary">Edit</a>
            <button type="button" class="btn-small secondary" *ngIf="canActivate(post)" [disabled]="actingId() === post.id" (click)="activate(post)">Activate</button>
            <button type="button" class="btn-small warn" *ngIf="canDeactivate(post)" [disabled]="actingId() === post.id" (click)="deactivate(post)">Deactivate</button>
            <button type="button" class="btn-small danger" *ngIf="canDelete(post)" [disabled]="actingId() === post.id" (click)="deletePost(post)">Delete</button>
          </div>
        </article>
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
      .link-accent { color: #a5b4fc; font-weight: 600; text-decoration: none; font-size: 0.92rem; }
      .hero h1 { margin: 0 0 8px; font-size: 1.75rem; color: #f8fafc; }
      .lead { margin: 0 0 20px; color: #94a3b8; }
      .state, .empty { color: #94a3b8; }
      .error-banner { padding: 12px 14px; border-radius: 12px; background: rgba(127, 29, 29, 0.45); color: #fecaca; margin-bottom: 16px; }
      .toolbar { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; padding: 12px 14px; border-radius: 14px; border: 1px solid rgba(51, 65, 85, 0.85); background: rgba(15, 23, 42, 0.65); }
      .meta { font-size: 0.88rem; color: #94a3b8; }
      .refreshing { color: #a5b4fc; }
      .pager { display: flex; align-items: center; gap: 10px; }
      .page-label { font-size: 0.88rem; color: #cbd5e1; }
      .btn-ghost { border: 1px solid #475569; background: transparent; color: #e2e8f0; border-radius: 10px; padding: 8px 14px; cursor: pointer; font-family: inherit; }
      .btn-ghost:disabled { opacity: 0.45; cursor: not-allowed; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
      .grid.is-refreshing { opacity: 0.65; }
      .card { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 18px 16px; }
      .exchange { font-size: 1.35rem; font-weight: 700; color: #c7d2fe; margin-bottom: 6px; }
      .amount { font-size: 1.75rem; font-weight: 800; color: #f8fafc; margin-bottom: 10px; }
      .title { margin: 0 0 8px; font-size: 1.05rem; color: #f8fafc; }
      .desc { margin: 0 0 12px; color: #94a3b8; font-size: 0.88rem; line-height: 1.45; }
      .meta-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 0.8rem; color: #64748b; margin-bottom: 12px; }
      .status-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; background: rgba(79, 70, 229, 0.35); color: #e0e7ff; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .btn-small { font-size: 0.8rem; font-weight: 600; padding: 6px 12px; border-radius: 9px; text-decoration: none; border: 1px solid transparent; cursor: pointer; font-family: inherit; }
      .btn-small.primary { background: linear-gradient(90deg, #4f46e5, #4338ca); color: #fff; }
      .btn-small.secondary { border: 1px solid #475569; color: #e2e8f0; background: rgba(30, 41, 59, 0.6); }
      .btn-small.warn { border: 1px solid #b45309; color: #fde68a; background: rgba(120, 53, 15, 0.35); }
      .btn-small.danger { border: 1px solid #b91c1c; color: #fecaca; background: rgba(127, 29, 29, 0.35); }
      .btn-small:disabled { opacity: 0.45; cursor: not-allowed; }
    `,
  ],
})
export class CurrencyPostsMineComponent implements OnInit {
  private readonly currencyPosts = inject(CurrencyPostService);
  private readonly toast = inject(ToastService);
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
  readonly actingId = signal(0);

  readonly relativeTime = formatRelativeTime;
  readonly exchangeLabel = currencyExchangeLabel;
  readonly excerpt = currencyPostExcerpt;

  busy(): boolean {
    return this.loading() || this.refreshing();
  }

  ngOnInit(): void {
    this.load(false);
  }

  trackById(_: number, post: CurrencyPostDto): number {
    return post.id;
  }

  canEdit(post: CurrencyPostDto): boolean {
    return roomPostCanEdit(post.statusCode);
  }

  canActivate(post: CurrencyPostDto): boolean {
    return roomPostCanActivate(post.statusCode);
  }

  canDeactivate(post: CurrencyPostDto): boolean {
    return roomPostCanDeactivate(post.statusCode);
  }

  canDelete(post: CurrencyPostDto): boolean {
    return roomPostCanDelete(post.statusCode);
  }

  goPage(next: number): void {
    if (next < 1) return;
    this.page.set(next);
    this.load(true);
  }

  activate(post: CurrencyPostDto): void {
    this.runStatus(post, () => this.currencyPosts.activate(post.id), RoomPostStatusCode.Active, 'Post activated.');
  }

  deactivate(post: CurrencyPostDto): void {
    if (!confirm('Deactivate this post?')) return;
    this.runStatus(post, () => this.currencyPosts.deactivate(post.id), RoomPostStatusCode.Passive, 'Post deactivated.');
  }

  deletePost(post: CurrencyPostDto): void {
    if (!confirm('Delete this post permanently?')) return;
    this.actingId.set(post.id);
    this.currencyPosts
      .delete(post.id)
      .pipe(take(1), finalize(() => this.actingId.set(0)))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.toast.show('Post deleted.', true);
            this.load(true);
          });
        },
        error: (e) => this.toast.show(formatCurrencyPostError(e), false),
      });
  }

  private runStatus(
    post: CurrencyPostDto,
    call: () => ReturnType<CurrencyPostService['activate']>,
    nextCode: number,
    successToast: string,
  ): void {
    this.actingId.set(post.id);
    call()
      .pipe(take(1), finalize(() => this.actingId.set(0)))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            const nextName = roomPostStatusLabelEn[nextCode] ?? post.statusName;
            this.rows.update((list) =>
              list.map((p) => (p.id === post.id ? { ...p, statusCode: nextCode, statusName: nextName } : p)),
            );
            this.toast.show(successToast, true);
            this.cdr.markForCheck();
          });
        },
        error: (e) => this.toast.show(formatCurrencyPostError(e), false),
      });
  }

  private load(soft: boolean): void {
    const token = ++this.loadToken;
    if (soft) this.refreshing.set(true);
    else {
      this.loading.set(true);
      this.errorMessage.set('');
    }

    this.currencyPosts
      .getUserPosts({ page: this.page(), pageSize: this.pageSize })
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
          this.errorMessage.set(formatCurrencyPostError(e));
        },
      });
  }
}
