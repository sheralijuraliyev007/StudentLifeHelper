import { environment } from '../../../environments/environment';

/** Turns API-relative paths into absolute URLs for `<img src>`. Leaves `http(s)://` unchanged. */
export function toAbsoluteApiResourceUrl(pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) {
    return t;
  }
  const base = environment.apiBaseUrl.replace(/\/+$/, '');
  const path = t.startsWith('/') ? t : `/${t}`;
  return `${base}${path}`;
}
