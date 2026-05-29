import type { CurrencyPostDto } from '../../contracts';

function asFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : value != null ? String(value) : fallback;
}

export function normalizeCurrencyPostDto(raw: unknown): CurrencyPostDto {
  const r = (raw ?? {}) as Record<string, unknown>;
  const post = raw as Partial<CurrencyPostDto>;
  return {
    id: asFiniteNumber(post.id ?? r['Id'], 0),
    title: asString(post.title ?? r['Title']),
    description: asString(post.description ?? r['Description']),
    userId: asString(post.userId ?? r['UserId']),
    username: asString(post.username ?? r['Username']),
    fromCurrencyCode: asFiniteNumber(post.fromCurrencyCode ?? r['FromCurrencyCode'], 0),
    fromCurrencyName: asString(post.fromCurrencyName ?? r['FromCurrencyName']),
    fromCurrencySymbol: asString(post.fromCurrencySymbol ?? r['FromCurrencySymbol']),
    toCurrencyCode: asFiniteNumber(post.toCurrencyCode ?? r['ToCurrencyCode'], 0),
    toCurrencyName: asString(post.toCurrencyName ?? r['ToCurrencyName']),
    toCurrencySymbol: asString(post.toCurrencySymbol ?? r['ToCurrencySymbol']),
    amount: asFiniteNumber(post.amount ?? r['Amount'], 0),
    statusCode: asFiniteNumber(post.statusCode ?? r['StatusCode'], 0),
    statusName: asString(post.statusName ?? r['StatusName']),
    createdDateTime: asString(post.createdDateTime ?? r['CreatedDateTime']),
  };
}
