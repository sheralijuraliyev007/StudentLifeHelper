import type { TokenDto, UserDto } from '../contracts';

function asRecord(raw: unknown): Record<string, unknown> | null {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
}

/** Coerces login/register JSON (camelCase or PascalCase) into `TokenDto`. */
export function normalizeTokenDto(raw: unknown): TokenDto {
  const r = asRecord(raw);
  const accessToken = String(r?.['accessToken'] ?? r?.['AccessToken'] ?? '').trim();
  const refreshToken = String(r?.['refreshToken'] ?? r?.['RefreshToken'] ?? '').trim();
  if (!accessToken || !refreshToken) {
    throw new Error('Login response did not include tokens.');
  }
  return { accessToken, refreshToken };
}

/** Coerces register/profile JSON into `UserDto` so `subscribe.next` always runs on success. */
export function normalizeUserDto(raw: unknown): UserDto {
  const r = asRecord(raw);
  if (!r) {
    throw new Error('Invalid user response from server.');
  }
  return {
    id: String(r['id'] ?? r['Id'] ?? ''),
    firstName: String(r['firstName'] ?? r['FirstName'] ?? ''),
    lastName: String(r['lastName'] ?? r['LastName'] ?? ''),
    middleName: (r['middleName'] ?? r['MiddleName'] ?? null) as string | null,
    username: String(r['username'] ?? r['Username'] ?? ''),
    birthDate: (r['birthDate'] ?? r['BirthDate'] ?? null) as string | null,
    role: String(r['role'] ?? r['Role'] ?? ''),
    state: String(r['state'] ?? r['State'] ?? ''),
    gender: String(r['gender'] ?? r['Gender'] ?? ''),
    birthCountry: String(r['birthCountry'] ?? r['BirthCountry'] ?? ''),
    residenceCountry: String(r['residenceCountry'] ?? r['ResidenceCountry'] ?? ''),
    region: String(r['region'] ?? r['Region'] ?? ''),
    languageCode: Number(r['languageCode'] ?? r['LanguageCode'] ?? 0) || undefined,
    imgId: (r['imgId'] ?? r['ImgId'] ?? null) as number | null,
    imgUrl: (r['imgUrl'] ?? r['ImgUrl'] ?? null) as string | null,
  };
}
