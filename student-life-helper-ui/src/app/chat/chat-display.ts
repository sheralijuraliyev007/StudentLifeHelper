import { toAbsoluteApiResourceUrl } from '../features/admin/profile-image-url';

export function chatAvatarUrl(pathOrUrl: string | null | undefined): string | null {
  const t = pathOrUrl?.trim();
  if (!t) {
    return null;
  }
  if (t.startsWith('http://') || t.startsWith('https://')) {
    return t;
  }
  return toAbsoluteApiResourceUrl(t);
}

export function avatarInitial(username: string): string {
  const t = (username ?? '').trim();
  if (!t) {
    return '?';
  }
  return t.charAt(0).toUpperCase();
}

export function lastMessagePreview(text: string | null | undefined, isDeleted = false): string {
  if (isDeleted || text == null) {
    return 'This message was deleted';
  }
  const t = text.trim();
  if (!t) {
    return 'This message was deleted';
  }
  return t.length > 80 ? `${t.slice(0, 77)}…` : t;
}
