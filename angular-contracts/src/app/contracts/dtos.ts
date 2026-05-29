export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserDto {
  id: string; // Guid
  firstName: string;
  lastName: string;
  middleName?: string | null;
  username: string;
  birthDate?: string | null; // ISO DateTime
  role: string;
  state: string;
  gender: string;
  birthCountry: string;
  residenceCountry: string;
  region: string;
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
  refreshTokenExpireTime: string; // ISO DateTimeOffset
  canActivate: boolean;
  canDeactivate: boolean;
}

export interface BaseInfoDto {
  id: number;
  code: number;
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
  birthDate?: string | null; // ISO DateTime
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
