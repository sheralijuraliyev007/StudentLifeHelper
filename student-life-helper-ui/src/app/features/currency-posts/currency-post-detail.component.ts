import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import type { CurrencyPostDto } from '../../contracts';
import { ChatService } from '../../services/chat.service';
import { CurrencyPostService } from '../../services/currency-post.service';
import { ToastService } from '../../services/toast.service';
import { formatRelativeTime } from '../../chat/chat-time';
import {
  roomPostCanActivate,
  roomPostCanDeactivate,
  roomPostCanDelete,
  roomPostCanEdit,
  roomPostStatusLabelEn,
  RoomPostStatusCode,
} from '../room-posts/room-post-status';
import { currencyExchangeLabel } from './currency-post-display';
import { formatCurrencyPostError } from './currency-post-format-error';

@Component({
  selector: 'app-currency-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page">
      <nav class="top-nav">
        <a [routerLink]="backLink" class="link-muted">{{ backLabel }}</a>
        <div class="top-nav-right">
          <a routerLink="/admin/currency-posts" class="link-muted">All posts</a>
          <a routerLink="/admin/currency-posts/mine" class="link-muted">My posts</a>
        </div>
      </nav>

      <div *ngIf="loading()" class="state">Loading post…</div>
      <p *ngIf="!loading() && errorMessage()" class="error-banner">{{ errorMessage() }}</p>

      <div class="detail" *ngIf="!loading() && post() as p">
        <header class="hero">
          <p class="eyebrow">
            {{ isOwner() ? 'Your offer' : 'Offer' }} · #{{ p.id }}
            <span class="badge" [class.badge-owner]="isOwner()">{{ isOwner() ? 'Owner view' : 'Viewer' }}</span>
          </p>
          <div class="exchange">{{ exchangeLabel(p) }}</div>
          <div class="amount">{{ p.amount }}</div>
          <h1>{{ p.title }}</h1>
          <p class="lead">{{ p.description }}</p>
        </header>

        <ul class="facts">
          <li><span class="k">From</span> {{ p.fromCurrencyName }} ({{ p.fromCurrencySymbol }})</li>
          <li><span class="k">To</span> {{ p.toCurrencyName }} ({{ p.toCurrencySymbol }})</li>
          <li><span class="k">User</span> {{ '@' + p.username }}</li>
          <li><span class="k">Status</span> {{ p.statusName }}</li>
          <li><span class="k">Posted</span> {{ relativeTime(p.createdDateTime) }}</li>
        </ul>

        <div class="viewer-actions" *ngIf="!isOwner()">
          <button type="button" class="btn-small primary" [disabled]="chatting()" (click)="chatWithOwner()">
            {{ chatting() ? 'Opening chat…' : 'Chat with owner' }}
          </button>
        </div>

        <div class="owner-actions" *ngIf="isOwner()">
          <h2 class="section-title">Manage post</h2>
          <div class="actions">
            <a *ngIf="canEdit()" [routerLink]="['/admin/currency-posts', p.id, 'edit']" class="btn-small secondary">Edit</a>
            <button type="button" class="btn-small secondary" *ngIf="canActivate()" [disabled]="acting()" (click)="activate()">Activate</button>
            <button type="button" class="btn-small warn" *ngIf="canDeactivate()" [disabled]="acting()" (click)="deactivate()">Deactivate</button>
            <button type="button" class="btn-small danger" *ngIf="canDelete()" [disabled]="acting()" (click)="deletePost()">Delete</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .page { max-width: 820px; margin: 0 auto; padding: 22px 18px 48px; }
      .top-nav { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
      .top-nav-right { display: flex; gap: 14px; flex-wrap: wrap; }
      .link-muted { color: #94a3b8; text-decoration: none; font-size: 0.92rem; }
      .state { color: #94a3b8; }
      .error-banner { padding: 12px 14px; border-radius: 12px; background: rgba(127, 29, 29, 0.45); color: #fecaca; }
      .eyebrow { margin: 0 0 8px; color: #94a3b8; font-size: 0.88rem; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .badge { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; background: rgba(51, 65, 85, 0.8); color: #cbd5e1; }
      .badge-owner { background: rgba(79, 70, 229, 0.35); color: #c7d2fe; }
      .exchange { font-size: 2rem; font-weight: 800; color: #c7d2fe; margin-bottom: 8px; }
      .amount { font-size: 2.5rem; font-weight: 800; color: #f8fafc; margin-bottom: 14px; }
      .hero h1 { margin: 0 0 10px; color: #f8fafc; font-size: 1.75rem; }
      .lead { margin: 0; color: #cbd5e1; white-space: pre-wrap; line-height: 1.55; }
      .facts { list-style: none; margin: 22px 0; padding: 0; display: grid; gap: 6px; color: #cbd5e1; font-size: 0.92rem; }
      .facts .k { color: #64748b; margin-right: 6px; }
      .section-title { margin: 0 0 12px; font-size: 1.05rem; color: #e2e8f0; }
      .owner-actions { margin-top: 8px; padding: 14px 16px; border-radius: 14px; border: 1px solid rgba(99, 102, 241, 0.35); background: rgba(49, 46, 129, 0.2); }
      .viewer-actions { margin: 16px 0; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .btn-small { display: inline-block; font-size: 0.8rem; font-weight: 600; padding: 6px 12px; border-radius: 9px; text-decoration: none; border: 1px solid transparent; cursor: pointer; font-family: inherit; }
      .btn-small.primary { background: linear-gradient(90deg, #4f46e5, #4338ca); color: #fff; }
      .btn-small.secondary { border: 1px solid #475569; color: #e2e8f0; background: rgba(30, 41, 59, 0.6); }
      .btn-small.warn { border: 1px solid #b45309; color: #fde68a; background: rgba(120, 53, 15, 0.35); }
      .btn-small.danger { border: 1px solid #b91c1c; color: #fecaca; background: rgba(127, 29, 29, 0.35); }
      .btn-small:disabled { opacity: 0.45; cursor: not-allowed; }
    `,
  ],
})
export class CurrencyPostDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly currencyPosts = inject(CurrencyPostService);
  private readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly post = signal<CurrencyPostDto | null>(null);
  readonly isOwner = signal(false);
  readonly acting = signal(false);
  readonly chatting = signal(false);

  private currentUserId = '';
  private postId = 0;

  readonly relativeTime = formatRelativeTime;
  readonly exchangeLabel = currencyExchangeLabel;

  get backLink(): string {
    return this.isOwner() ? '/admin/currency-posts/mine' : '/admin/currency-posts';
  }

  get backLabel(): string {
    return this.isOwner() ? '← My currency posts' : '← All currency posts';
  }

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      this.loading.set(false);
      this.errorMessage.set('Invalid post id.');
      return;
    }
    this.postId = Math.trunc(id);
    this.load();
  }

  canEdit(): boolean {
    const p = this.post();
    return this.isOwner() && p != null && roomPostCanEdit(p.statusCode);
  }

  canActivate(): boolean {
    const p = this.post();
    return p != null && roomPostCanActivate(p.statusCode);
  }

  canDeactivate(): boolean {
    const p = this.post();
    return p != null && roomPostCanDeactivate(p.statusCode);
  }

  canDelete(): boolean {
    const p = this.post();
    return p != null && roomPostCanDelete(p.statusCode);
  }

  chatWithOwner(): void {
    const p = this.post();
    if (!p?.userId) return;
    this.chatting.set(true);
    this.chatService
      .getOrCreateChat(p.userId)
      .pipe(take(1), finalize(() => this.chatting.set(false)))
      .subscribe({
        next: (chat) => void this.router.navigate(['/admin/chat', chat.id]),
        error: (e) => this.toast.show(formatCurrencyPostError(e), false),
      });
  }

  activate(): void {
    this.runStatus(() => this.currencyPosts.activate(this.postId), RoomPostStatusCode.Active, 'Post activated.');
  }

  deactivate(): void {
    if (!confirm('Deactivate this post?')) return;
    this.runStatus(() => this.currencyPosts.deactivate(this.postId), RoomPostStatusCode.Passive, 'Post deactivated.');
  }

  deletePost(): void {
    if (!confirm('Delete this post permanently?')) return;
    this.acting.set(true);
    this.currencyPosts
      .delete(this.postId)
      .pipe(take(1), finalize(() => this.acting.set(false)))
      .subscribe({
        next: () => {
          this.toast.show('Post deleted.', true);
          void this.router.navigate(['/admin/currency-posts/mine']);
        },
        error: (e) => this.toast.show(formatCurrencyPostError(e), false),
      });
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    forkJoin({
      profile: this.auth.getProfile(),
      post: this.currencyPosts.getById(this.postId),
    })
      .pipe(take(1), finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ profile, post }) => {
          this.currentUserId = profile.id;
          const owner = profile.id === post.userId;
          this.isOwner.set(owner);
          this.post.set(post);
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.errorMessage.set(formatCurrencyPostError(e));
          this.cdr.markForCheck();
        },
      });
  }

  private runStatus(
    call: () => ReturnType<CurrencyPostService['activate']>,
    nextCode: number,
    successToast: string,
  ): void {
    const snapshot = this.post();
    if (!snapshot) return;
    this.acting.set(true);
    call()
      .pipe(take(1), finalize(() => this.acting.set(false)))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            const nextName = roomPostStatusLabelEn[nextCode] ?? snapshot.statusName;
            this.post.set({ ...snapshot, statusCode: nextCode, statusName: nextName });
            this.toast.show(successToast, true);
            this.cdr.markForCheck();
          });
        },
        error: (e) => this.toast.show(formatCurrencyPostError(e), false),
      });
  }
}
