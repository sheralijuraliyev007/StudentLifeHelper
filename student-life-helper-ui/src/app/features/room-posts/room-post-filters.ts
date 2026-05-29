import type { RoomPostFilterOptions } from '../../contracts';
import type { SelectListItem } from '../../services/manual.service';

/** Business `code` stored on `RoomPost` FK columns (not manual row `id`). */
export function filterOptionCode(item: SelectListItem<number>): number {
  return item.orderCode > 0 ? item.orderCode : item.value;
}

/** Fields sent to `POST …/RoomPosts/GetAll` and `GetUserRoomPosts` (excluding page). */
export type RoomPostFilterCriteria = Omit<RoomPostFilterOptions, 'page' | 'pageSize'>;

export const ROOM_POST_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Default (newest)' },
  { value: 'Id', label: 'Id' },
  { value: 'Title', label: 'Title' },
  { value: 'MonthlyRentFee', label: 'Monthly rent' },
  { value: 'CreatedDateTime', label: 'Created date' },
];

export function emptyRoomPostFilterCriteria(): RoomPostFilterCriteria {
  return {};
}

/** Merge UI criteria with paging for the API body builder in `roomPostService`. */
export function toRoomPostFilterRequest(
  criteria: RoomPostFilterCriteria,
  page: number,
  pageSize: number,
): RoomPostFilterOptions {
  return { ...criteria, page, pageSize };
}
