import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  NgZone,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import type { ChatDto, UserDtoForAdmin } from '../contracts';
import { AdminUserService } from '../services/admin-user.service';
import { AuthService } from '../auth/auth.service';
import { ChatService } from '../services/chat.service';
import { ToastService } from '../services/toast.service';
import { avatarInitial, chatAvatarUrl, lastMessagePreview } from './chat-display';
import { formatRelativeTime } from './chat-time';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="hero">
        <div>
          <h1>Messages</h1>
          <p class="lead">Chat with other students in real time.</p>
        </div>
        <button type="button" class="btn-primary" (click)="openNewChat()">New chat</button>
      </header>

      <div class="search-row">
        <input
          type="search"
          [(ngModel)]="searchText"
          (keyup.enter)="applySearch()"
          placeholder="Search by username…"
        />
        <button type="button" class="btn-ghost" (click)="applySearch()" [disabled]="loading()">Search</button>
      </div>

      <div *ngIf="loading()" class="state">Loading chats…</div>
      <p *ngIf="errorMessage()" class="error-banner">{{ errorMessage() }}</p>

      <div class="chat-list" *ngIf="!loading() && !errorMessage()">
        <button
          type="button"
          class="chat-item"
          *ngFor="let chat of chats(); trackBy: trackChat"
          (click)="openChat(chat)"
        >
          <div class="avatar" *ngIf="avatarUrl(chat) as src; else letterAvatar">
            <img [src]="src" [alt]="chat.otherUsername" />
          </div>
          <ng-template #letterAvatar>
            <div class="avatar fallback">{{ avatarInitial(chat.otherUsername) }}</div>
          </ng-template>
          <div class="chat-body">
            <div class="chat-top">
              <span class="username">{{ '@' + chat.otherUsername }}</span>
              <span class="time">{{ relativeTime(chat.lastMessageAt) }}</span>
            </div>
            <p class="preview">{{ preview(chat) }}</p>
          </div>
          <span class="unread" *ngIf="chat.unreadCount > 0">{{ chat.unreadCount }}</span>
        </button>
        <p *ngIf="!chats().length" class="empty">No conversations yet. Start a new chat.</p>
      </div>

      <div class="pager" *ngIf="chats().length">
        <button type="button" class="btn-ghost" [disabled]="page() <= 1 || loading()" (click)="goPage(page() - 1)">
          Previous
        </button>
        <span>Page {{ page() }}</span>
        <button type="button" class="btn-ghost" [disabled]="!canGoNext() || loading()" (click)="goPage(page() + 1)">
          Next
        </button>
      </div>
    </section>

    <div class="modal-backdrop" *ngIf="showNewChat()" (click)="closeNewChat()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h2>Start a new chat</h2>
        <p class="hint">Search users by username.</p>
        <div class="search-row">
          <input
            type="search"
            [(ngModel)]="userSearchText"
            (keyup.enter)="searchUsers()"
            placeholder="Username…"
          />
          <button type="button" class="btn-primary" (click)="searchUsers()" [disabled]="userSearchLoading()">
            {{ userSearchLoading() ? '…' : 'Find' }}
          </button>
        </div>
        <div class="user-results">
          <button
            type="button"
            class="user-row"
            *ngFor="let user of userResults(); trackBy: trackUser"
            [disabled]="startingChat()"
            (click)="startChatWith(user)"
          >
            <span class="avatar small fallback">{{ avatarInitial(user.username) }}</span>
            <span>{{ '@' + user.username }}</span>
          </button>
          <p *ngIf="userSearchDone() && !userResults().length" class="hint">No users found.</p>
        </div>
        <button type="button" class="btn-ghost full" (click)="closeNewChat()">Cancel</button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100%;
      }
      .page {
        max-width: 720px;
        margin: 0 auto;
        padding: 8px 4px 32px;
      }
      .hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 18px;
      }
      .hero h1 {
        margin: 0 0 6px;
        color: #f8fafc;
        font-size: 1.75rem;
      }
      .lead {
        margin: 0;
        color: #94a3b8;
        font-size: 0.92rem;
      }
      .search-row {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      input[type='search'],
      input[type='text'] {
        flex: 1;
        border-radius: 10px;
        border: 1px solid #334155;
        background: #0f172a;
        color: #e2e8f0;
        padding: 10px 12px;
        font-family: inherit;
      }
      .btn-primary,
      .btn-ghost {
        border-radius: 10px;
        padding: 10px 14px;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        border: 1px solid transparent;
      }
      .btn-primary {
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
      }
      .btn-ghost {
        border-color: #475569;
        background: #111827;
        color: #e2e8f0;
      }
      .btn-ghost:disabled,
      .btn-primary:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .state,
      .hint,
      .empty {
        color: #94a3b8;
      }
      .error-banner {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(127, 29, 29, 0.45);
        color: #fecaca;
        margin-bottom: 12px;
      }
      .chat-list {
        display: grid;
        gap: 8px;
      }
      .chat-item {
        display: grid;
        grid-template-columns: 48px 1fr auto;
        gap: 12px;
        align-items: center;
        width: 100%;
        text-align: left;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid #334155;
        background: #1e293b;
        cursor: pointer;
        color: inherit;
        font-family: inherit;
      }
      .chat-item:hover {
        border-color: #6366f1;
        background: #273449;
      }
      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 999px;
        overflow: hidden;
        background: #334155;
        display: grid;
        place-items: center;
      }
      .avatar.small {
        width: 36px;
        height: 36px;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar.fallback {
        color: #e2e8f0;
        font-weight: 700;
        font-size: 1.1rem;
      }
      .chat-top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }
      .username {
        color: #f1f5f9;
        font-weight: 600;
      }
      .time {
        color: #64748b;
        font-size: 0.78rem;
        flex-shrink: 0;
      }
      .preview {
        margin: 0;
        color: #94a3b8;
        font-size: 0.88rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .unread {
        min-width: 22px;
        height: 22px;
        padding: 0 6px;
        border-radius: 999px;
        background: #4f46e5;
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
        display: grid;
        place-items: center;
      }
      .pager {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        margin-top: 18px;
        color: #cbd5e1;
        font-size: 0.88rem;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.72);
        display: grid;
        place-items: center;
        z-index: 2000;
        padding: 16px;
      }
      .modal {
        width: min(440px, 100%);
        border-radius: 14px;
        border: 1px solid #334155;
        background: #0f172a;
        padding: 18px;
      }
      .modal h2 {
        margin: 0 0 8px;
        color: #f8fafc;
      }
      .user-results {
        margin: 14px 0;
        display: grid;
        gap: 6px;
        max-height: 240px;
        overflow-y: auto;
      }
      .user-row {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid #334155;
        background: #1e293b;
        color: #e2e8f0;
        cursor: pointer;
        font-family: inherit;
      }
      .user-row:hover:not(:disabled) {
        border-color: #6366f1;
      }
      .btn-ghost.full {
        width: 100%;
      }
    `,
  ],
})
export class ChatListComponent implements OnInit {
  private readonly chat = inject(ChatService);
  private readonly adminUsers = inject(AdminUserService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly avatarInitial = avatarInitial;

  readonly chats = signal<ChatDto[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly page = signal(1);
  readonly canGoNext = signal(false);
  readonly showNewChat = signal(false);
  readonly userResults = signal<UserDtoForAdmin[]>([]);
  readonly userSearchLoading = signal(false);
  readonly userSearchDone = signal(false);
  readonly startingChat = signal(false);

  searchText = '';
  userSearchText = '';
  private currentUserId = '';
  private readonly pageSize = 20;

  ngOnInit(): void {
    this.auth
      .getProfile()
      .pipe(take(1))
      .subscribe({
        next: (p) => {
          this.currentUserId = p.id;
        },
      });

    this.chat.onChatCreated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((chat) => {
      this.ngZone.run(() => {
        this.chats.update((list) => {
          const filtered = list.filter((c) => c.id !== chat.id);
          return [chat, ...filtered];
        });
        this.cdr.markForCheck();
      });
    });

    this.chat.onMessage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.ngZone.run(() => {
        void this.load(false);
      });
    });

    void this.chat.startConnection();
    this.load(true);
  }

  trackChat(_: number, chat: ChatDto): string {
    return chat.id;
  }

  trackUser(_: number, user: UserDtoForAdmin): string {
    return user.id;
  }

  avatarUrl(chat: ChatDto): string | null {
    return chatAvatarUrl(chat.otherUserProfileImageUrl);
  }

  relativeTime(iso: string | null): string {
    return formatRelativeTime(iso);
  }

  preview(chat: ChatDto): string {
    return lastMessagePreview(chat.lastMessageText);
  }

  applySearch(): void {
    this.page.set(1);
    this.load(true);
  }

  goPage(next: number): void {
    if (next < 1) {
      return;
    }
    this.page.set(next);
    this.load(true);
  }

  openChat(chat: ChatDto): void {
    void this.router.navigate(['/admin/chat', chat.id]);
  }

  openNewChat(): void {
    this.showNewChat.set(true);
    this.userResults.set([]);
    this.userSearchDone.set(false);
    this.userSearchText = '';
  }

  closeNewChat(): void {
    this.showNewChat.set(false);
  }

  searchUsers(): void {
    const q = this.userSearchText.trim();
    if (!q) {
      return;
    }
    this.userSearchLoading.set(true);
    this.adminUsers
      .getAll({ page: 1, pageSize: 20, userName: q })
      .pipe(
        take(1),
        finalize(() => this.userSearchLoading.set(false)),
      )
      .subscribe({
        next: (res) => {
          const rows = (res.rows ?? []).filter((u) => u.id !== this.currentUserId);
          this.userResults.set(rows);
          this.userSearchDone.set(true);
        },
        error: (e) => this.toast.show(this.formatError(e), false),
      });
  }

  startChatWith(user: UserDtoForAdmin): void {
    this.startingChat.set(true);
    this.chat
      .getOrCreateChat(user.id)
      .pipe(
        take(1),
        finalize(() => this.startingChat.set(false)),
      )
      .subscribe({
        next: (chat) => {
          this.closeNewChat();
          void this.router.navigate(['/admin/chat', chat.id]);
        },
        error: (e) => this.toast.show(this.formatError(e), false),
      });
  }

  private load(showOverlay: boolean): void {
    if (showOverlay) {
      this.loading.set(true);
      this.errorMessage.set('');
    }
    const username = this.searchText.trim();
    this.chat
      .getMyChats({
        page: this.page(),
        pageSize: this.pageSize,
        username: username || undefined,
        search: username || undefined,
      })
      .pipe(
        take(1),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.chats.set(res.rows ?? []);
            const gotFull = (res.rows?.length ?? 0) >= this.pageSize;
            const moreByTotal = (res.total ?? 0) > this.page() * this.pageSize;
            this.canGoNext.set(moreByTotal || (res.total <= 0 && gotFull));
            this.cdr.markForCheck();
          });
        },
        error: (e) => {
          this.ngZone.run(() => {
            this.errorMessage.set(this.formatError(e));
            this.cdr.markForCheck();
          });
        },
      });
  }

  private formatError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string' && err.error) {
        return err.error;
      }
      if (Array.isArray(err.error)) {
        return err.error.map((x) => String(x)).join(' ');
      }
    }
    if (err instanceof Error) {
      return err.message;
    }
    return 'Something went wrong.';
  }
}
