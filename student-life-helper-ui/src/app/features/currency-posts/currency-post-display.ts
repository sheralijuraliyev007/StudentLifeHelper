import type { CurrencyPostDto } from '../../contracts';

export function currencyExchangeLabel(post: CurrencyPostDto): string {
  const from = (post.fromCurrencySymbol || post.fromCurrencyName || '?').trim();
  const to = (post.toCurrencySymbol || post.toCurrencyName || '?').trim();
  return `${from} → ${to}`;
}

export function currencyPostExcerpt(text: string, max = 160): string {
  const t = (text ?? '').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
