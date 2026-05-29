import type { RoomPostDto } from '../../contracts';

/** Deposit to show on cards when present and positive. */
export function roomPostCardDeposit(post: RoomPostDto): number | null {
  const amount = post.depositAmount;
  if (amount == null || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return amount;
}
