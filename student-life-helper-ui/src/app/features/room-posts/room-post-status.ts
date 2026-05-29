/** Mirrors `StudentLifeHelper.Common.Constants.StatusConstants` for room posts. */
export const RoomPostStatusCode = {
  Created: 1,
  Active: 2,
  Updated: 3,
  Archived: 4,
  Deleted: 5,
  Passive: 6,
} as const;

/** Short English labels for optimistic UI (server refresh replaces with translated names). */
export const roomPostStatusLabelEn: Record<number, string> = {
  [RoomPostStatusCode.Created]: 'Created',
  [RoomPostStatusCode.Active]: 'Active',
  [RoomPostStatusCode.Updated]: 'Updated',
  [RoomPostStatusCode.Archived]: 'Archived',
  [RoomPostStatusCode.Deleted]: 'Deleted',
  [RoomPostStatusCode.Passive]: 'Passive',
};

export function roomPostCoerceStatusCode(statusCode: unknown): number {
  if (typeof statusCode === 'number' && Number.isFinite(statusCode)) {
    return statusCode;
  }
  const n = Number(statusCode);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

/** `CanUpdate` on the API — Created, Active, Updated, Archived, Passive. */
export function roomPostCanEdit(statusCode: unknown): boolean {
  const c = roomPostCoerceStatusCode(statusCode);
  const editable: number[] = [
    RoomPostStatusCode.Created,
    RoomPostStatusCode.Active,
    RoomPostStatusCode.Updated,
    RoomPostStatusCode.Archived,
    RoomPostStatusCode.Passive,
  ];
  return editable.includes(c);
}

/** `CanActivate` on the API. */
export function roomPostCanActivate(statusCode: unknown): boolean {
  const c = roomPostCoerceStatusCode(statusCode);
  return [1, 4, 6].includes(c);
}

/** `CanDeactivate` (→ Passive) on the API. */
export function roomPostCanDeactivate(statusCode: unknown): boolean {
  const c = roomPostCoerceStatusCode(statusCode);
  return [2, 3].includes(c);
}

/** `CanDelete` on the API. */
export function roomPostCanDelete(statusCode: unknown): boolean {
  const c = roomPostCoerceStatusCode(statusCode);
  return [1, 2, 3, 4, 6].includes(c);
}
