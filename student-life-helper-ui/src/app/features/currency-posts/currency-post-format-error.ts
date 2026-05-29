import { HttpErrorResponse } from '@angular/common/http';

function errorBodyToString(body: unknown): string {
  if (typeof body === 'string') {
    return body;
  }
  if (body == null || typeof body !== 'object') {
    return '';
  }
  const o = body as Record<string, unknown>;
  const msg = o['message'] ?? o['title'];
  if (typeof msg === 'string' && msg.length) {
    return msg;
  }
  const errors = o['errors'];
  if (errors && typeof errors === 'object') {
    const parts: string[] = [];
    for (const v of Object.values(errors as Record<string, unknown>)) {
      if (typeof v === 'string') {
        parts.push(v);
      } else if (Array.isArray(v)) {
        parts.push(...v.map((x) => String(x)));
      }
    }
    if (parts.length) {
      return parts.join(' ');
    }
  }
  return '';
}

export function formatCurrencyPostError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (typeof body === 'string' && body.length) {
      return body;
    }
    if (Array.isArray(body)) {
      return body
        .map((x) => (typeof x === 'string' ? x : errorBodyToString(x)))
        .filter((s) => s.length > 0)
        .join(' ');
    }
    if (body && typeof body === 'object') {
      const fromObject = errorBodyToString(body);
      if (fromObject) {
        return fromObject;
      }
    }
    if (err.status === 404) {
      return 'Currency post not found.';
    }
    if (err.status === 408) {
      return 'Request timed out. Please try again.';
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Something went wrong.';
}
