import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { HubConnectionState } from '@microsoft/signalr';
import { SqlPanelService } from '../services/SqlPanelService';
import { Observable, Subject, firstValueFrom, map, tap } from 'rxjs';
import {
  API_ENDPOINTS,
  SqlQueryEntry,
  type ChatDto,
  type ChatFilterOptions,
  type MessageDto,
  type MessageFilterOptions,
  type PaginationModel,
} from '../contracts';
import { AuthService } from '../auth/auth.service';
import { normalizeChatDto, normalizeMessageDto, normalizePaginationRows } from '../chat/chat-normalize';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sqlPanel = inject(SqlPanelService);

  private hub: signalR.HubConnection | null = null;
  private startPromise: Promise<void> | null = null;

  private readonly messageReceivedSubject = new Subject<MessageDto>();
  private readonly messageEditedSubject = new Subject<MessageDto>();
  private readonly messageDeletedSubject = new Subject<{ messageId: number; chatId: string }>();
  private readonly chatCreatedSubject = new Subject<ChatDto>();

  readonly onMessage$ = this.messageReceivedSubject.asObservable();
  readonly onMessageEdited$ = this.messageEditedSubject.asObservable();
  readonly onMessageDeleted$ = this.messageDeletedSubject.asObservable();
  readonly onChatCreated$ = this.chatCreatedSubject.asObservable();

  readonly totalUnreadCount = signal(0);

  private currentUserId: string | null = null;
  private activeChatId: string | null = null;

  constructor() {
    void this.resolveUserIdOnce().then((id) => {
      this.currentUserId = id;
    });
    void this.startConnection();
    this.destroyRef.onDestroy(() => {
      void this.disconnect();
    });
  }

  setActiveChatId(chatId: string | null): void {
    this.activeChatId = chatId?.trim() ? chatId.trim() : null;
  }

getMyChats(filter: ChatFilterOptions, excludeChatId?: string | null): Observable<PaginationModel<ChatDto>> {
  const exclude = excludeChatId ?? this.activeChatId;
  return this.http.post<unknown>(API_ENDPOINTS.chat.getMyChats, filter).pipe(
    tap((raw) => this.forwardQueries(raw)),  // ← add this
    map((raw) => {
      const p = normalizePaginationRows(raw, normalizeChatDto);
      return {
        rows: p.rows,
        pageIndex: filter.page,
        pageSize: filter.pageSize,
        total: p.total,
      };
    }),
    tap((page) => {
      if (filter.page === 1 && !filter.username?.trim()) {
        this.totalUnreadCount.set(this.sumUnread(page.rows, exclude));
      }
    }),
  );
}

  refreshTotalUnread(excludeChatId?: string | null): Observable<void> {
    const exclude = excludeChatId ?? this.activeChatId;
    return this.getMyChats({ page: 1, pageSize: 100 }, exclude).pipe(map(() => undefined));
  }

  private sumUnread(chats: ChatDto[], excludeChatId: string | null): number {
    return chats.reduce((sum, c) => {
      if (excludeChatId && c.id === excludeChatId) {
        return sum;
      }
      return sum + (c.unreadCount ?? 0);
    }, 0);
  }

  

private forwardQueries(raw: unknown): void {
  if (!raw || typeof raw !== 'object') return;
  const o = raw as Record<string, unknown>;
  const queries = o['queries'] ?? o['Queries'];
  if (Array.isArray(queries) && queries.length) {
    this.sqlPanel.pushSilent(queries as SqlQueryEntry[]);
  }
}
  private shouldIncrementUnread(message: MessageDto): boolean {
    if (this.currentUserId && message.fromUserId === this.currentUserId) {
      return false;
    }
    if (this.activeChatId && message.chatId === this.activeChatId) {
      return false;
    }
    return true;
  }

getChatById(chatId: string): Observable<ChatDto> {
  return this.http
    .get<unknown>(API_ENDPOINTS.chat.getChatById(chatId))
    .pipe(
      tap((raw) => this.forwardQueries(raw)),
      map((raw) => normalizeChatDto(raw) as ChatDto)
    );
}

getOrCreateChat(targetUserId: string): Observable<ChatDto> {
  return this.http
    .post<unknown>(API_ENDPOINTS.chat.getOrCreateChat(targetUserId), {})
    .pipe(
      tap((raw) => this.forwardQueries(raw)),
      map((raw) => normalizeChatDto(raw) as ChatDto)
    );
}

getMessages(chatId: string, filter: MessageFilterOptions): Observable<PaginationModel<MessageDto>> {
  return this.http.post<unknown>(API_ENDPOINTS.chat.getMessages(chatId), filter).pipe(
    tap((raw) => this.forwardQueries(raw)),
    map((raw) => {
      const p = normalizePaginationRows(raw, normalizeMessageDto);
      const rows = [...p.rows].sort(
        (a, b) => new Date(a.createdDateTime).getTime() - new Date(b.createdDateTime).getTime(),
      );
      return { rows, pageIndex: filter.page, pageSize: filter.pageSize, total: p.total };
    }),
  );
}

sendMessage(chatId: string, messageText: string, replyToMessageId?: number | null): Observable<MessageDto> {
  return this.http
    .post<unknown>(API_ENDPOINTS.chat.sendMessage(chatId, messageText, replyToMessageId), {})
    .pipe(
      tap((raw) => this.forwardQueries(raw)),
      map((raw) => normalizeMessageDto(raw) as MessageDto)
    );
}

editMessage(messageId: number, newMessageText: string): Observable<MessageDto> {
  return this.http
    .put<unknown>(API_ENDPOINTS.chat.editMessage(messageId, newMessageText), {})
    .pipe(
      tap((raw) => this.forwardQueries(raw)),
      map((raw) => normalizeMessageDto(raw) as MessageDto)
    );
}

  deleteMessage(messageId: number): Observable<string> {
    return this.http.delete(API_ENDPOINTS.chat.deleteMessage(messageId), { responseType: 'text' });
  }
markAsRead(chatId: string): Observable<void> {
  return this.http
    .post<unknown>(API_ENDPOINTS.chat.markAsRead(chatId), {})
    .pipe(
      tap((raw) => this.forwardQueries(raw)),
      map(() => undefined)
    );
}

  async startConnection(): Promise<void> {
    if (this.hub?.state === HubConnectionState.Connected) {
      return;
    }
    if (this.startPromise) {
      return this.startPromise;
    }

    const token = this.auth.getAccessToken() ?? '';
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(API_ENDPOINTS.chat.hubUrl, {
        accessTokenFactory: () => this.auth.getAccessToken() ?? token,
      })
      .withAutomaticReconnect()
      .build();

    this.hub.on('ReceiveMessage', (message: MessageDto) => {
      const normalized = normalizeMessageDto(message);
      if (normalized) {
        this.messageReceivedSubject.next(normalized);
        if (this.shouldIncrementUnread(normalized)) {
          this.totalUnreadCount.update((n) => n + 1);
        }
      }
    });

    this.hub.on('MessageEdited', (message: MessageDto) => {
      const normalized = normalizeMessageDto(message);
      if (normalized) {
        this.messageEditedSubject.next(normalized);
      }
    });

    this.hub.on('MessageDeleted', (messageId: number, chatId: string) => {
      this.messageDeletedSubject.next({ messageId, chatId: String(chatId) });
    });

    this.hub.on('ChatCreated', (chat: ChatDto) => {
      const normalized = normalizeChatDto(chat);
      if (normalized) {
        this.chatCreatedSubject.next(normalized);
      }
    });

    this.startPromise = this.hub
      .start()
      .catch(() => undefined)
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }

  async disconnect(): Promise<void> {
    if (!this.hub) {
      return;
    }
    try {
      await this.hub.stop();
    } catch {
      // ignore
    }
    this.hub = null;
  }

  resolveUserId(): Observable<string> {
    return this.auth.getProfile().pipe(map((p) => p.id));
  }

  async resolveUserIdOnce(): Promise<string> {
    return firstValueFrom(this.resolveUserId());
  }
}
