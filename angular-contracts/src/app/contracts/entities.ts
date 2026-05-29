export interface BaseCommonEntity {
  createdUserId: string; // Guid
  createdDateTime: string; // ISO DateTime
  modifiedUserId?: string | null; // Guid
  modifiedDateTime?: string | null; // ISO DateTime
}

export interface InfoRef {
  code: number;
  shortName?: string;
  fullName?: string;
}

export interface RoomPost extends BaseCommonEntity {
  id: number;
  roomPostTypeCode: number;
  roomTypeCode: number;
  userId: string; // Guid
  title: string;
  description: string;
  forGenderCode: number;
  monthlyRentFee: number;
  currencyCode: number;
  depositAmount: number;
  statusCode: number;
  regionCode: number;
  addressLink: string;

  // Navigation fields (optional in API payloads)
  roomPostType?: InfoRef | null;
  roomType?: InfoRef | null;
  user?: User | null;
  gender?: InfoRef | null;
  currencyType?: InfoRef | null;
  status?: InfoRef | null;
  region?: InfoRef | null;
}

export interface CurrencyPost extends BaseCommonEntity {
  id: number;
  title: string;
  description: string;
  userId: string; // Guid
  fromCurrencyCode: number;
  toCurrencyCode: number;
  amount: number;
  statusCode: number;

  // Navigation fields (optional in API payloads)
  user?: User | null;
  fromCurrencyType?: InfoRef | null;
  toCurrencyType?: InfoRef | null;
  status?: InfoRef | null;
}

export interface User extends BaseCommonEntity {
  id: string; // Guid
  firstName: string;
  lastName: string;
  middleName?: string | null;
  birthCountryCode: number;
  residenceCountryCode: number;
  birthDate?: string | null; // ISO DateTime
  passwordHash: string;
  username: string;
  stateCode: number;
  roleCode: number;
  refreshToken?: string | null;
  refreshTokenExpireTime: string; // ISO DateTimeOffset
  languageCode: number;
  imgId?: number | null;
  genderCode: number;
  regionCode: number;

  // Navigation fields (optional in API payloads)
  birthCountry?: InfoRef | null;
  residenceCountry?: InfoRef | null;
  state?: InfoRef | null;
  role?: InfoRef | null;
  language?: InfoRef | null;
  gender?: InfoRef | null;
  region?: InfoRef | null;
}

export interface Chat extends BaseCommonEntity {
  id: string; // Guid
  statusCode: number;

  // Navigation fields (optional in API payloads)
  status?: InfoRef | null;
  messages?: Message[] | null;
}

export interface Message extends BaseCommonEntity {
  id: number;
  fromUserId: string; // Guid
  chatId: string; // Guid
  statusCode: number;
  messageText: string;
  replyToMessageId?: number | null;

  // Navigation fields (optional in API payloads)
  fromUser?: User | null;
  chat?: Chat | null;
  status?: InfoRef | null;
  replyToMessage?: Message | null;
  replies?: Message[] | null;
}
