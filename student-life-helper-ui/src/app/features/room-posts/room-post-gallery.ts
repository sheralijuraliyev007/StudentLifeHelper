import type { RoomPostContentDto, RoomPostDto } from '../../contracts';
import { roomPostContentImageUrl, roomPostMainImageUrl } from './room-post-media';

export interface RoomPostGalleryItem {
  key: string;
  src: string;
  isCover: boolean;
}

/** All displayable images for a post (gallery rows + cover fallback). */
export function roomPostGalleryItems(post: RoomPostDto): RoomPostGalleryItem[] {
  const items: RoomPostGalleryItem[] = [];
  const seen = new Set<string>();

  for (const row of post.roomPostContents ?? []) {
    const src = roomPostContentImageUrl(row.url);
    if (!src || seen.has(src)) {
      continue;
    }
    seen.add(src);
    items.push({
      key: `content-${row.id}`,
      src,
      isCover: Boolean(row.isCover),
    });
  }

  const cover = roomPostMainImageUrl(post);
  if (cover && !seen.has(cover)) {
    items.unshift({ key: 'cover', src: cover, isCover: true });
  }

  return items.sort((a, b) => Number(b.isCover) - Number(a.isCover));
}
