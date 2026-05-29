export interface CurrencyPostDto {
  id: number;
  title: string;
  description: string;
  userId: string;
  username: string;
  fromCurrencyCode: number;
  fromCurrencyName: string;
  fromCurrencySymbol: string;
  toCurrencyCode: number;
  toCurrencyName: string;
  toCurrencySymbol: string;
  amount: number;
  statusCode: number;
  statusName: string;
  createdDateTime: string;
}

export interface CreateCurrencyPostModel {
  title: string;
  description: string;
  fromCurrencyCode: number;
  toCurrencyCode: number;
  amount: number;
}

export interface UpdateCurrencyPostModel {
  title?: string | null;
  description?: string | null;
  fromCurrencyCode?: number | null;
  toCurrencyCode?: number | null;
  amount?: number | null;
}

export interface CurrencyPostFilterOptions {
  fromCurrencyCode?: number | null;
  toCurrencyCode?: number | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  username?: string | null;
  search?: string | null;
  page?: number;
  pageSize?: number;
  sortBy?: string | null;
  orderType?: string | null;
}
