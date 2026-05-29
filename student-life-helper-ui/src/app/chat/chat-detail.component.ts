import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import type { ChatDto, MessageDto } from '../contracts';
import { AuthService } from '../auth/auth.service';
import { ChatService } from '../services/chat.service';
import { ToastService } from '../services/toast.service';
import { avatarInitial, chatAvatarUrl } from './chat-display';
import { formatMessageTime } from './chat-time';
import { messagePreviewText } from './chat-normalize';

@Component({
  selector: 'app-chat-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="chat-header">
        <a routerLink="/admin/chat" class="back">← Chats</a>
        <div class="peer" *ngIf="currentChat() as c">
          <div class="avatar" *ngIf="peerAvatar() as src; else peerLetter">
            <img [src]="src" [alt]="c.otherUsername" />
          </div>
          <ng-template #peerLetter>
            <div class="avatar fallback">{{ avatarInitial(c.otherUsername) }}</div>
          </ng-template>
          <span class="peer-name">{{ '@' + c.otherUsername }}</span>
        </div>
      </header>

      <div *ngIf="loading()" class="state">Loading conversation…</div>
      <p *ngIf="errorMessage()" class="error-banner">{{ errorMessage() }}</p>

      <div
        class="messages-wrap"
        *ngIf="!loading() && !errorMessage()"
        #messagesEl
        (scroll)="onScroll()"
      >
        <div class="load-more" *ngIf="loadingMore()">Loading older messages…</div>
        <div
          class="message-row"
          *ngFor="let msg of messages(); trackBy: trackMessage"
          [id]="'msg-' + msg.id"
          [class.own]="isOwn(msg)"
        >
          <div class="bubble" [class.deleted]="msg.isDeleted">
            <div
              class="reply-preview"
              *ngIf="msg.replyToMessageId"
              role="button"
              tabindex="0"
              (click)="scrollToReplyMessage(msg.replyToMessageId)"
              (keydown.enter)="scrollToReplyMessage(msg.replyToMessageId)"
            >
              <span class="reply-user">{{ msg.replyToUsername || 'User' }}</span>
              <span class="reply-text">{{ replyPreview(msg) }}</span>
            </div>
            <p class="text" [class.italic]="msg.isDeleted">{{ displayText(msg) }}</p>
            <div class="meta">
              <span>{{ formatTime(msg.createdDateTime) }}</span>
              <span *ngIf="isEdited(msg)" class="edited">edited</span>
            </div>
            <div class="msg-actions" *ngIf="!msg.isDeleted">
              <button type="button" class="act" (click)="startReply(msg)">Reply</button>
              <button type="button" class="act" *ngIf="isOwn(msg)" (click)="startEdit(msg)">Edit</button>
              <button type="button" class="act danger" *ngIf="isOwn(msg)" (click)="removeMessage(msg)">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="composer" *ngIf="!loading() && !errorMessage()">
        <div class="reply-bar" *ngIf="replyingTo() as reply">
          <div>
            <span class="reply-label">Replying to {{ '@' + (reply.fromUsername || '') }}</span>
            <p class="reply-snippet">{{ messagePreviewText(reply) }}</p>
          </div>
          <button type="button" class="act" (click)="cancelReply()">✕</button>
        </div>
        <div class="edit-bar" *ngIf="editingMessage() as edit">
          <span>Editing message</span>
          <button type="button" class="act" (click)="cancelEdit()">Cancel</button>
        </div>
        <div class="input-row">
          <textarea
            rows="2"
            [(ngModel)]="draftText"
            placeholder="Write a message…"
            (keydown.enter)="onEnter($event)"
          ></textarea>
          <button
            type="button"
            class="send"
            [disabled]="sending() || !draftText.trim()"
            (click)="editingMessage() ? saveEdit() : send()"
          >
            {{ sending() ? '…' : editingMessage() ? 'Save' : 'Send' }}
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: calc(100vh - 120px);
        min-height: 420px;
      }
      .page {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        max-width: 820px;
        margin: 0 auto;
        width: 100%;
        padding: 4px 4px 0;
      }
      .chat-header {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 8px 14px;
        border-bottom: 1px solid #334155;
        margin-bottom: 8px;
      }
      .back {
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .back:hover {
        color: #e2e8f0;
      }
      .peer {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .peer-name {
        color: #f8fafc;
        font-weight: 600;
        font-size: 1.05rem;
      }
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        overflow: hidden;
        background: #334155;
        display: grid;
        place-items: center;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar.fallback {
        color: #e2e8f0;
        font-weight: 700;
      }
      .messages-wrap {
        flex: 1;
        overflow-y: auto;
        padding: 12px 8px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 0;
      }
      .load-more {
        text-align: center;
        color: #94a3b8;
        font-size: 0.85rem;
        padding: 8px;
      }
      .message-row {
        display: flex;
      }
      .message-row.own {
        justify-content: flex-end;
      }
      .bubble {
        max-width: min(78%, 520px);
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid #334155;
        background: #1e293b;
        position: relative;
      }
      .message-row.own .bubble {
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.45), rgba(67, 56, 202, 0.35));
        border-color: rgba(99, 102, 241, 0.5);
      }
      .bubble.deleted {
        opacity: 0.85;
      }
      .reply-preview {
        border-left: 3px solid #6366f1;
        padding-left: 8px;
        margin-bottom: 8px;
        font-size: 0.82rem;
        cursor: pointer;
      }
      .reply-preview:hover {
        opacity: 0.92;
      }
      .reply-user {
        display: block;
        color: #a5b4fc;
        font-weight: 600;
      }
      .reply-text {
        color: #94a3b8;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 240px;
      }
      .text {
        margin: 0 0 6px;
        color: #e2e8f0;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .text.italic {
        font-style: italic;
        color: #94a3b8;
      }
      .meta {
        display: flex;
        gap: 8px;
        font-size: 0.72rem;
        color: #64748b;
      }
      .edited {
        color: #94a3b8;
      }
      .msg-actions {
        display: none;
        gap: 6px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .bubble:hover .msg-actions {
        display: flex;
      }
      .act {
        border: 1px solid #475569;
        background: transparent;
        color: #cbd5e1;
        border-radius: 8px;
        padding: 4px 8px;
        font-size: 0.75rem;
        cursor: pointer;
        font-family: inherit;
      }
      .act.danger {
        border-color: #b91c1c;
        color: #fecaca;
      }
      .composer {
        border-top: 1px solid #334155;
        padding: 10px 8px 14px;
        background: rgba(15, 23, 42, 0.92);
      }
      .reply-bar,
      .edit-bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 10px;
        margin-bottom: 8px;
        border-radius: 10px;
        background: rgba(49, 46, 129, 0.35);
        border: 1px solid rgba(99, 102, 241, 0.4);
      }
      .reply-label {
        color: #c7d2fe;
        font-size: 0.82rem;
        font-weight: 600;
      }
      .reply-snippet {
        margin: 4px 0 0;
        color: #94a3b8;
        font-size: 0.85rem;
      }
      .edit-bar span {
        color: #c7d2fe;
        font-size: 0.88rem;
      }
      .input-row {
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }
      textarea {
        flex: 1;
        resize: none;
        border-radius: 12px;
        border: 1px solid #334155;
        background: #0f172a;
        color: #e2e8f0;
        padding: 10px 12px;
        font-family: inherit;
      }
      .send {
        border: none;
        border-radius: 12px;
        padding: 12px 18px;
        font-weight: 600;
        cursor: pointer;
        background: linear-gradient(90deg, #4f46e5, #4338ca);
        color: #fff;
        font-family: inherit;
      }
      .send:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .state,
      .error-banner {
        padding: 12px;
      }
      .error-banner {
        color: #fecaca;
        background: rgba(127, 29, 29, 0.45);
        border-radius: 12px;
      }
    `,
  ],
})
export class ChatDetailComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEl') messagesEl?: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly avatarInitial = avatarInitial;
  readonly formatTime = formatMessageTime;
  readonly messagePreviewText = messagePreviewText;

  readonly currentChat = signal<ChatDto | null>(null);
  readonly messages = signal<MessageDto[]>([]);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly sending = signal(false);
  readonly errorMessage = signal('');
  readonly replyingTo = signal<MessageDto | null>(null);
  readonly editingMessage = signal<MessageDto | null>(null);

  draftText = '';
  private chatId = '';
  private currentUserId = '';
  private messagePage = 1;
  private readonly messagePageSize = 30;
  private canLoadMore = true;
  private shouldScrollToBottom = false;
  private initialScrollDone = false;

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('chatId') ?? '';
    if (!this.chatId) {
      this.loading.set(false);
      this.errorMessage.set('Invalid chat.');
      return;
    }

    this.auth
      .getProfile()
      .pipe(take(1))
      .subscribe({
        next: (p) => {
          this.currentUserId = p.id;
        },
      });

    this.chatService.setActiveChatId(this.chatId);

    this.destroyRef.onDestroy(() => {
      this.chatService.setActiveChatId(null);
      void this.chatService.refreshTotalUnread().pipe(take(1)).subscribe();
    });

    this.chatService.onMessage$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((msg) => {
      if (msg.chatId !== this.chatId) {
        return;
      }
      this.ngZone.run(() => {
        const exists = this.messages().some((m) => m.id === msg.id);
        if (!exists) {
          this.messages.update((list) => [...list, msg]);
          this.shouldScrollToBottom = true;
        }
        this.markCurrentChatRead();
        this.cdr.markForCheck();
      });
    });

    this.chatService.onMessageEdited$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((msg) => {
      if (msg.chatId !== this.chatId) {
        return;
      }
      this.ngZone.run(() => {
        this.patchMessage(msg);
        this.cdr.markForCheck();
      });
    });

    this.chatService.onMessageDeleted$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((evt) => {
      if (evt.chatId !== this.chatId) {
        return;
      }
      this.ngZone.run(() => {
        this.messages.update((list) =>
          list.map((m) =>
            m.id === evt.messageId
              ? { ...m, isDeleted: true, messageText: null }
              : m,
          ),
        );
        this.cdr.markForCheck();
      });
    });

    this.loadChat();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.messagesEl) {
      const el = this.messagesEl.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScrollToBottom = false;
    }
    if (!this.initialScrollDone && this.messages().length && this.messagesEl) {
      const el = this.messagesEl.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.initialScrollDone = true;
    }
  }

  peerAvatar(): string | null {
    const c = this.currentChat();
    return c ? chatAvatarUrl(c.otherUserProfileImageUrl) : null;
  }

  trackMessage(_: number, msg: MessageDto): number {
    return msg.id;
  }

  isOwn(msg: MessageDto): boolean {
    return msg.fromUserId === this.currentUserId;
  }

  isEdited(msg: MessageDto): boolean {
    return !msg.isDeleted && Boolean(msg.modifiedDateTime?.trim());
  }

  displayText(msg: MessageDto): string {
    if (msg.isDeleted) {
      return 'This message was deleted';
    }
    return (msg.messageText ?? '').trim() || 'This message was deleted';
  }

  replyPreview(msg: MessageDto): string {
    if (msg.replyToIsDeleted) {
      return 'This message was deleted';
    }
    return (msg.replyToMessageText ?? '').trim() || '…';
  }

  scrollToReplyMessage(messageId: number | null): void {
    if (messageId == null) return;

    const el = document.getElementById('msg-' + messageId);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      el.style.transition = 'none';
      el.style.backgroundColor = 'rgba(250, 204, 21, 0.35)';
      el.style.borderLeft = '3px solid #facc15';
      el.style.borderRadius = '12px';
      el.style.paddingLeft = '8px';

      setTimeout(() => {
        el.style.transition = 'all 1.5s ease-out';
        el.style.backgroundColor = 'transparent';
        el.style.borderLeft = 'none';
        el.style.paddingLeft = '';

        setTimeout(() => {
          el.style.transition = '';
          el.style.borderRadius = '';
        }, 1500);
      }, 1500);
    }, 400);
  }

  onScroll(): void {
    const el = this.messagesEl?.nativeElement;
    if (!el || this.loadingMore() || !this.canLoadMore) {
      return;
    }
    if (el.scrollTop < 80) {
      this.loadOlder();
    }
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) {
      return;
    }
    ke.preventDefault();
    if (this.editingMessage()) {
      this.saveEdit();
    } else {
      this.send();
    }
  }

  startReply(msg: MessageDto): void {
    this.replyingTo.set(msg);
    this.editingMessage.set(null);
  }

  cancelReply(): void {
    this.replyingTo.set(null);
  }

  startEdit(msg: MessageDto): void {
    this.editingMessage.set(msg);
    this.replyingTo.set(null);
    this.draftText = msg.messageText ?? '';
  }

  cancelEdit(): void {
    this.editingMessage.set(null);
    this.draftText = '';
  }

  send(): void {
    const text = this.draftText.trim();
    if (!text) {
      return;
    }
    const replyId = this.replyingTo()?.id ?? null;
    this.sending.set(true);
    this.chatService
      .sendMessage(this.chatId, text, replyId)
      .pipe(
        take(1),
        finalize(() => this.sending.set(false)),
      )
      .subscribe({
        next: (msg) => {
          this.ngZone.run(() => {
            const exists = this.messages().some((m) => m.id === msg.id);
            if (!exists) {
              this.messages.update((list) => [...list, msg]);
              this.shouldScrollToBottom = true;
            }
            this.draftText = '';
            this.replyingTo.set(null);
            this.cdr.markForCheck();
          });
        },
        error: (e) => this.toast.show(this.formatError(e), false),
      });
  }

  saveEdit(): void {
    const edit = this.editingMessage();
    const text = this.draftText.trim();
    if (!edit || !text) {
      return;
    }
    this.sending.set(true);
    this.chatService
      .editMessage(edit.id, text)
      .pipe(
        take(1),
        finalize(() => this.sending.set(false)),
      )
      .subscribe({
        next: (msg) => {
          this.ngZone.run(() => {
            this.patchMessage(msg);
            this.cancelEdit();
            this.cdr.markForCheck();
          });
        },
        error: (e) => this.toast.show(this.formatError(e), false),
      });
  }

  removeMessage(msg: MessageDto): void {
    if (!confirm('Delete this message?')) {
      return;
    }
    this.chatService
      .deleteMessage(msg.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.messages.update((list) =>
              list.map((m) => (m.id === msg.id ? { ...m, isDeleted: true, messageText: null } : m)),
            );
            this.cdr.markForCheck();
          });
        },
        error: (e) => this.toast.show(this.formatError(e), false),
      });
  }

  private loadChat(): void {
    this.loading.set(true);
    this.chatService
      .getChatById(this.chatId)
      .pipe(take(1))
      .subscribe({
        next: (c) => {
          this.currentChat.set(c);
          this.loadMessages(true);
          this.markCurrentChatRead();
        },
        error: (e) => {
          this.loading.set(false);
          this.errorMessage.set(this.formatError(e));
        },
      });
  }

  private loadMessages(initial: boolean): void {
    if (initial) {
      this.messagePage = 1;
      this.canLoadMore = true;
    }
    this.chatService
      .getMessages(this.chatId, {
        page: this.messagePage,
        pageSize: this.messagePageSize,
      })
      .pipe(
        take(1),
        finalize(() => {
          this.loading.set(false);
          this.loadingMore.set(false);
        }),
      )
      .subscribe({
        next: (page) => {
          this.ngZone.run(() => {
            const rows = page.rows ?? [];
            if (initial) {
              this.messages.set(rows);
              this.shouldScrollToBottom = true;
            } else {
              const el = this.messagesEl?.nativeElement;
              const prevHeight = el?.scrollHeight ?? 0;
              this.messages.update((existing) => {
                const ids = new Set(existing.map((m) => m.id));
                const older = rows.filter((m) => !ids.has(m.id));
                return [...older, ...existing];
              });
              if (el) {
                setTimeout(() => {
                  el.scrollTop = el.scrollHeight - prevHeight;
                }, 0);
              }
            }
            this.canLoadMore = rows.length >= this.messagePageSize;
            this.cdr.markForCheck();
          });
        },
        error: (e) => {
          this.errorMessage.set(this.formatError(e));
        },
      });
  }

  private loadOlder(): void {
    if (!this.canLoadMore) {
      return;
    }
    this.loadingMore.set(true);
    this.messagePage += 1;
    this.loadMessages(false);
  }

  private patchMessage(msg: MessageDto): void {
    this.messages.update((list) => list.map((m) => (m.id === msg.id ? msg : m)));
  }

  private markCurrentChatRead(): void {
    if (!this.chatId) {
      return;
    }
    this.chatService
      .markAsRead(this.chatId)
      .pipe(take(1))
      .subscribe({
        next: () => void this.chatService.refreshTotalUnread(this.chatId).pipe(take(1)).subscribe(),
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
