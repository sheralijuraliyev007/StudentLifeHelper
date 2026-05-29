export interface BaseCommonEntity {
  createdUserId: string;
  createdDateTime: string;
  modifiedUserId?: string | null;
  modifiedDateTime?: string | null;
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
  userId: string;
  title: string;
  description: string;
  forGenderCode: number;
  monthlyRentFee: number;
  currencyCode: number;
  depositAmount: number;
  statusCode: number;
  regionCode: number;
  addressLink: string;
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
  userId: string;
  fromCurrencyCode: number;
  toCurrencyCode: number;
  amount: number;
  statusCode: number;
  user?: User | null;
  fromCurrencyType?: InfoRef | null;
  toCurrencyType?: InfoRef | null;
  status?: InfoRef | null;
}

export interface User extends BaseCommonEntity {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  birthCountryCode: number;
  residenceCountryCode: number;
  birthDate?: string | null;
  passwordHash: string;
  username: string;
  stateCode: number;
  roleCode: number;
  refreshToken?: string | null;
  refreshTokenExpireTime: string;
  languageCode: number;
  imgId?: number | null;
  genderCode: number;
  regionCode: number;
  birthCountry?: InfoRef | null;
  residenceCountry?: InfoRef | null;
  state?: InfoRef | null;
  role?: InfoRef | null;
  languavge?: InfoRef | null;
  gender?: InfoRef | null;
  region?: InfoRef | null;
}

export interface Chat extends BaseCommonEntity {
  id: string;
  statusCode: number;
  status?: InfoRef | null;
  messages?: Message[] | null;
}

export interface Message extends BaseCommonEntity {
  id: number;
  fromUserId: string;
  chatId: string;
  statusCode: number;
  messageText: string;
  replyToMessageId?: number | null;
  fromUser?: User | null;
  chat?: Chat | null;
  status?: InfoRef | null;
  replyToMessage?: Message | null;
  replies?: Message[] | null;
}
