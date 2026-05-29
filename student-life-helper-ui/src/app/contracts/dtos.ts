export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  username: string;
  birthDate?: string | null;
  role: string;
  state: string;
  gender: string;
  birthCountry: string;
  residenceCountry: string;
  region: string;
  /** Matches `User.LanguageCode` / `info_language.code` from profile. */
  languageCode?: number;
  /** Nullable content id for avatar; null means no uploaded image. */
  imgId?: number | null;
  /** Absolute presigned MinIO URL from API (or null). */
  imgUrl?: string | null;
}

export interface UserDtoForAdmin extends UserDto {
  roleId: number;
  stateId: number;
  genderId: number;
  birthCountryId: number;
  residenceCountryId: number;
  regionId: number;
  imgId?: number | null;
  refreshTokenExpireTime: string;
  canActivate: boolean;
  canDeactivate: boolean;
}

export interface PaginationModel<T> {
  rows: T[];
  pageIndex: number;
  pageSize: number;
  total: number;
}

export interface AdminUserFilterOptions {
  page: number;
  pageSize: number;
  stateCode?: number | null;
  roleCode?: number | null;
  userName?: string | null;
  regionCode?: number | null;
  genderCode?: number | null;
  residenceCountryCode?: number | null;
  birthCountryCode?: number | null;
}

export interface UpdateUserModelForAdmin {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  birthCountryCode?: number | null;
  residenceCountryCode?: number | null;
  birthDate?: string | null;
  username?: string | null;
  roleCode?: number | null;
  languageCode?: number | null;
  genderCode?: number | null;
}

export interface BaseInfoDto {
  id: number;
  code: number;
  stateCode: number;
  shortName: string;
  fullName: string;
}

export interface InfoDto extends BaseInfoDto {}

export interface ContentTypeDto extends InfoDto {
  typeName: string;
}

export interface CurrencyTypeDto extends InfoDto {
  symbol: string;
}

/** Region FK matches `info_country.code` (JSON: countryCode). */
export interface RegionDto extends InfoDto {
  countryCode?: number;
}

export interface InfoTranslationDto {
  tableCode: number;
  languageCode: number;
  recordCode: number;
  columnName: string;
  translatedText: string;
}

export interface RegisterModel {
  firstName: string;
  lastName: string;
  middleName?: string | null;
  birthDate?: string | null;
  imageFile?: File | null;
  username: string;
  password: string;
  birthCountryCode: number;
  residenceCountryCode: number;
  genderCode: number;
  regionCode: number;
}

export interface LoginModel {
  username: string;
  password: string;
}

export interface UpdateUserModel {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  birthCountryCode?: number | null;
  residenceCountryCode?: number | null;
  birthDate?: string | null;
  languageCode?: number | null;
  genderCode?: number | null;
}

/** Matches `RoomPostContentDto` from the API (camelCase JSON). */
export interface RoomPostContentDto {
  id: number;
  roomPostId: number;
  contentId: number;
  isCover: boolean;
  /** May be empty until the API maps download URLs for each content row. */
  url?: string | null;
}

/** Matches `RoomPostDto` from the API (camelCase JSON). */
export interface RoomPostDto {
  id: number;
  ownerId: string;
  roomPostTypeCode: number;
  roomPostName: string;
  roomTypeCode: number;
  roomTypeName: string;
  username: string;
  title: string;
  description: string;
  forGenderCode: number;
  forGenderName: string | null;
  monthlyRentFee: number;
  currencyCode: number;
  currencyName: string;
  depositAmount: number;
  statusCode: number;
  statusName: string;
  regionCode: number;
  regionName: string;
  addressLink: string;
  coverImageUrl?: string | null;
  roomPostContents: RoomPostContentDto[];
}

/** Body for `PUT .../RoomPosts/Update/{id}` — all fields optional on the server. */
export interface UpdateRoomPostModel {
  roomPostTypeCode?: number | null;
  roomTypeCode?: number | null;
  title?: string | null;
  description?: string | null;
  forGenderCode?: number | null;
  monthlyRentFee?: number | null;
  currencyCode?: number | null;
  depositAmount?: number | null;
  statusCode?: number | null;
  regionCode?: number | null;
  addressLink?: string | null;
}

/** Body for `POST .../RoomPosts/GetAll` (subset of server filter; extras ignored). */
export interface RoomPostFilterOptions {
  page?: number;
  pageSize?: number;
  search?: string | null;
  sortBy?: string | null;
  orderType?: string | null;
  roomPostTypeCode?: number | null;
  roomTypeCode?: number | null;
  title?: string | null;
  forGenderCode?: number | null;
  currencyCode?: number | null;
  minimumMonthlyRentFee?: number | null;
  maximumMonthlyRentFee?: number | null;
  minimumDepositAmount?: number | null;
  maximumDepositAmount?: number | null;
  depositExists?: boolean | null;
  regionCode?: number | null;
}
