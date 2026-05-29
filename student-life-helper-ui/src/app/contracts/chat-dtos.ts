export interface ChatDto {
  id: string;
  statusCode: number;
  statusName: string;
  otherUserId: string;
  otherUsername: string;
  otherUserProfileImageUrl: string | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageFromUserId: string | null;
  unreadCount: number;
}

export interface MessageDto {
  id: number;
  chatId: string;
  fromUserId: string;
  fromUsername: string;
  isDeleted: boolean;
  messageText: string | null;
  statusCode: number;
  statusName: string;
  createdDateTime: string;
  modifiedDateTime: string | null;
  replyToMessageId: number | null;
  replyToMessageText: string | null;
  replyToUsername: string | null;
  replyToIsDeleted: boolean;
  readAt: string | null;
}

export interface UserChatDto {
  id: number;
  userId: string;
  username: string;
  profileImageUrl: string | null;
  chatId: string;
  statusCode: number;
  statusName: string;
}

export interface ChatFilterOptions {
  username?: string | null;
  search?: string | null;
  page: number;
  pageSize: number;
}

export interface MessageFilterOptions {
  search?: string | null;
  replyToMessageId?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
  page: number;
  pageSize: number;
}
