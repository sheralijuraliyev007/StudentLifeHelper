import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_ENDPOINTS, type RoomPostDto } from '../../contracts';

const NAME_FALLBACKS: { pattern: RegExp; symbol: string }[] = [
  { pattern: /south korean won|korean won/i, symbol: '₩' },
  { pattern: /\bus dollar\b|united states dollar/i, symbol: '$' },
  { pattern: /\beuro\b/i, symbol: '€' },
  { pattern: /british pound|pound sterling/i, symbol: '£' },
  { pattern: /japanese yen/i, symbol: '¥' },
  { pattern: /chinese yuan|renminbi/i, symbol: '¥' },
  { pattern: /uzbekistan som|uzbek som/i, symbol: "so'm" },
];

@Injectable({ providedIn: 'root' })
export class CurrencySymbolService {
  private readonly http = inject(HttpClient);
  private readonly byCode = new Map<number, string>();
  private loadPromise: Promise<void> | null = null;

  /** Loads `CurrencyType` symbols once (cached). Safe to call multiple times. */
  ensureLoaded(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }
    this.loadPromise = firstValueFrom(
      this.http.get<unknown>(API_ENDPOINTS.admin.info.currencyType.getAll).pipe(
        map((raw) => this.ingestRows(raw)),
        catchError(() => of(undefined)),
      ),
    ).then(() => undefined);
    return this.loadPromise;
  }

  /** Symbol for rent/deposit display; falls back to a short label from the currency name. */
  labelFor(post: RoomPostDto): string {
    const fromCode = this.byCode.get(post.currencyCode);
    if (fromCode) {
      return fromCode;
    }
    return symbolFromName(post.currencyName) ?? post.currencyName;
  }

  private ingestRows(raw: unknown): void {
    const rows = Array.isArray(raw) ? raw : [];
    for (const item of rows) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const row = item as Record<string, unknown>;
      const code = Number(row['code'] ?? row['Code']);
      const symbol = row['symbol'] ?? row['Symbol'];
      if (Number.isFinite(code) && typeof symbol === 'string' && symbol.trim()) {
        this.byCode.set(code, symbol.trim());
      }
    }
  }
}

function symbolFromName(name: string | null | undefined): string | null {
  const n = (name ?? '').trim();
  if (!n) {
    return null;
  }
  for (const { pattern, symbol } of NAME_FALLBACKS) {
    if (pattern.test(n)) {
      return symbol;
    }
  }
  return null;
}
