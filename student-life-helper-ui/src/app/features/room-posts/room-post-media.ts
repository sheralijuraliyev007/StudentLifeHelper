import type { RoomPostContentDto, RoomPostDto } from '../../contracts';
import { toAbsoluteApiResourceUrl } from '../admin/profile-image-url';

/** Matches backend `CommonConstants.FileBaseUrl` (relative download path). */
const FILE_DOWNLOAD_RELATIVE = 'api/public/content/downloadfile?fileId=';

const GUID_ONLY =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function contentIsCover(c: RoomPostContentDto): boolean {
  const r = c as unknown as Record<string, unknown>;
  const v: unknown = c.isCover ?? r['IsCover'];
  return v === true;
}

/**
 * Turns API `coverImageUrl` / gallery `url` into an absolute download URL.
 * Handles full URLs, relative `api/public/content/downloadfile?fileId=…`, and bare file Guids.
 */
export function resolveRoomPostMediaUrl(pathOrUrl: string | null | undefined): string | null {
  const t = pathOrUrl?.trim();
  if (!t) {
    return null;
  }
  if (t.startsWith('http://') || t.startsWith('https://')) {
    return t;
  }
  if (GUID_ONLY.test(t)) {
    return toAbsoluteApiResourceUrl(`${FILE_DOWNLOAD_RELATIVE}${t}`);
  }
  return toAbsoluteApiResourceUrl(t);
}

/**
 * Main listing image: `coverImageUrl` from API, then cover-marked content, then first gallery url.
 */
export function roomPostMainImageUrl(post: RoomPostDto): string | null {
  const cover = resolveRoomPostMediaUrl(post.coverImageUrl);
  if (cover) {
    return cover;
  }
  const contents = post.roomPostContents ?? [];
  const markedCover = contents.find((c) => contentIsCover(c) && c.url?.trim());
  const coverUrl = resolveRoomPostMediaUrl(markedCover?.url);
  if (coverUrl) {
    return coverUrl;
  }
  const withUrl = contents.map((c) => c.url?.trim()).find((u) => u);
  return resolveRoomPostMediaUrl(withUrl);
}

export function roomPostContentImageUrl(url: string | null | undefined): string | null {
  return resolveRoomPostMediaUrl(url);
}
