const JWT_PARTS_COUNT = 3;

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== JWT_PARTS_COUNT || !parts[1]) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  const exp = payload?.['exp'];
  if (typeof exp !== 'number') {
    return true;
  }

  return exp <= Math.floor(Date.now() / 1000);
}

export function getRoleCodeFromToken(token: string): number | null {
  const payload = parseJwtPayload(token);
  const roleCodeRaw = payload?.['role_code'];
  const roleCode = typeof roleCodeRaw === 'string' ? Number(roleCodeRaw) : roleCodeRaw;
  return typeof roleCode === 'number' && Number.isFinite(roleCode) ? roleCode : null;
}

export function getUsernameFromToken(token: string): string | null {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return null;
  }
  const raw =
    payload['unique_name'] ??
    payload['name'] ??
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : null;
}
