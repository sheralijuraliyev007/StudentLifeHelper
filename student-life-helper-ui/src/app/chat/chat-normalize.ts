import type { ChatDto, MessageDto } from '../contracts';

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value == null) {
    return fallback;
  }
  return String(value);
}

function unwrap(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const o = raw as Record<string, unknown>;
  return o['data'] ?? o['Data'] ?? raw;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1;
}

function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const s = String(value).trim();
  return s.length ? s : null;
}

function normalizeChatDtoInner(raw: unknown): ChatDto | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const r = raw as Record<string, unknown>;
  const id = asString(r['id'] ?? r['Id']);
  if (!id) {
    return null;
  }
  return {
    id,
    statusCode: asNumber(r['statusCode'] ?? r['StatusCode']),
    statusName: asString(r['statusName'] ?? r['StatusName']),
    otherUserId: asString(r['otherUserId'] ?? r['OtherUserId']),
    otherUsername: asString(r['otherUsername'] ?? r['OtherUsername']),
    otherUserProfileImageUrl: asNullableString(r['otherUserProfileImageUrl'] ?? r['OtherUserProfileImageUrl']),
    lastMessageText: asNullableString(r['lastMessageText'] ?? r['LastMessageText']),
    lastMessageAt: asNullableString(r['lastMessageAt'] ?? r['LastMessageAt']),
    lastMessageFromUserId: asNullableString(r['lastMessageFromUserId'] ?? r['LastMessageFromUserId']),
    unreadCount: asNumber(r['unreadCount'] ?? r['UnreadCount']),
  };
}

function normalizeMessageDtoInner(raw: unknown): MessageDto | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const r = raw as Record<string, unknown>;
  const id = asNumber(r['id'] ?? r['Id'], 0);
  const chatId = asString(r['chatId'] ?? r['ChatId']);
  if (!id || !chatId) {
    return null;
  }
  return {
    id,
    chatId,
    fromUserId: asString(r['fromUserId'] ?? r['FromUserId']),
    fromUsername: asString(r['fromUsername'] ?? r['FromUsername']),
    isDeleted: asBool(r['isDeleted'] ?? r['IsDeleted']),
    messageText: asNullableString(r['messageText'] ?? r['MessageText']),
    statusCode: asNumber(r['statusCode'] ?? r['StatusCode']),
    statusName: asString(r['statusName'] ?? r['StatusName']),
    createdDateTime: asString(r['createdDateTime'] ?? r['CreatedDateTime']),
    modifiedDateTime: asNullableString(r['modifiedDateTime'] ?? r['ModifiedDateTime']),
    replyToMessageId:
      r['replyToMessageId'] != null || r['ReplyToMessageId'] != null
        ? asNumber(r['replyToMessageId'] ?? r['ReplyToMessageId'])
        : null,
    replyToMessageText: asNullableString(r['replyToMessageText'] ?? r['ReplyToMessageText']),
    replyToUsername: asNullableString(r['replyToUsername'] ?? r['ReplyToUsername']),
    replyToIsDeleted: asBool(r['replyToIsDeleted'] ?? r['ReplyToIsDeleted']),
    readAt: asNullableString(r['readAt'] ?? r['ReadAt']),
  };
}

function normalizePaginationRowsInner<T>(
  raw: unknown,
  mapRow: (row: unknown) => T | null,
): { rows: T[]; total: number } {
  if (!raw || typeof raw !== 'object') {
    return { rows: [], total: 0 };
  }
  const o = raw as Record<string, unknown>;
  const rowsRaw = o['rows'] ?? o['Rows'];
  const rows = Array.isArray(rowsRaw)
    ? rowsRaw.map(mapRow).filter((x): x is T => x != null)
    : [];
  const total = asNumber(o['total'] ?? o['Total'], rows.length);
  return { rows, total };
}

export function normalizeChatDto(raw: unknown): ChatDto | null {
  return normalizeChatDtoInner(unwrap(raw));
}

export function normalizeMessageDto(raw: unknown): MessageDto | null {
  return normalizeMessageDtoInner(unwrap(raw));
}

export function normalizePaginationRows<T>(
  raw: unknown,
  mapRow: (row: unknown) => T | null,
): { rows: T[]; total: number } {
  return normalizePaginationRowsInner(unwrap(raw), mapRow);
}

export function messagePreviewText(message: MessageDto): string {
  if (message.isDeleted) {
    return 'This message was deleted';
  }
  return (message.messageText ?? '').trim() || 'This message was deleted';
}
