import type { RoomPostContentDto, RoomPostDto } from '../../contracts';

function asFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapContentRow(raw: unknown): RoomPostContentDto {
  const r = raw as Record<string, unknown>;
  return {
    id: asFiniteNumber(r['id'] ?? r['Id'], 0),
    roomPostId: asFiniteNumber(r['roomPostId'] ?? r['RoomPostId'], 0),
    contentId: asFiniteNumber(r['contentId'] ?? r['ContentId'], 0),
    isCover: Boolean(r['isCover'] ?? r['IsCover']),
    url: (typeof r['url'] === 'string' ? r['url'] : typeof r['Url'] === 'string' ? r['Url'] : null) ?? null,
  };
}

/**
 * Coerces numeric/status fields so UI rules (`includes(statusCode)`) work when JSON sends strings or PascalCase.
 */
export function normalizeRoomPostDto(post: RoomPostDto): RoomPostDto {
  const r = post as unknown as Record<string, unknown>;
  const contentsRaw = post.roomPostContents ?? r['RoomPostContents'];
  const contents: RoomPostContentDto[] = Array.isArray(contentsRaw)
    ? contentsRaw.map((x) => mapContentRow(x))
    : [];

  const ownerIdRaw = post.ownerId ?? r['ownerId'] ?? r['OwnerId'];
  const ownerId =
    typeof ownerIdRaw === 'string' && ownerIdRaw.trim()
      ? ownerIdRaw.trim()
      : ownerIdRaw != null
        ? String(ownerIdRaw)
        : '';

  return {
    ...post,
    id: asFiniteNumber(post.id ?? r['Id'], 0),
    ownerId,
    roomPostTypeCode: asFiniteNumber(post.roomPostTypeCode ?? r['RoomPostTypeCode'], 0),
    roomTypeCode: asFiniteNumber(post.roomTypeCode ?? r['RoomTypeCode'], 0),
    forGenderCode: asFiniteNumber(post.forGenderCode ?? r['ForGenderCode'], 0),
    currencyCode: asFiniteNumber(post.currencyCode ?? r['CurrencyCode'], 0),
    regionCode: asFiniteNumber(post.regionCode ?? r['RegionCode'], 0),
    statusCode: asFiniteNumber(post.statusCode ?? r['StatusCode'], 0),
    monthlyRentFee: asFiniteNumber(post.monthlyRentFee ?? r['MonthlyRentFee'], 0),
    depositAmount: asFiniteNumber(post.depositAmount ?? r['DepositAmount'], 0),
    roomPostContents: contents,
    coverImageUrl:
      typeof post.coverImageUrl === 'string'
        ? post.coverImageUrl
        : typeof r['CoverImageUrl'] === 'string'
          ? r['CoverImageUrl']
          : post.coverImageUrl ?? null,
    username: typeof post.username === 'string' ? post.username : String(r['Username'] ?? ''),
    title: typeof post.title === 'string' ? post.title : String(r['Title'] ?? ''),
    description: typeof post.description === 'string' ? post.description : String(r['Description'] ?? ''),
    roomPostName: typeof post.roomPostName === 'string' ? post.roomPostName : String(r['RoomPostName'] ?? ''),
    roomTypeName: typeof post.roomTypeName === 'string' ? post.roomTypeName : String(r['RoomTypeName'] ?? ''),
    forGenderName: post.forGenderName ?? (typeof r['ForGenderName'] === 'string' ? r['ForGenderName'] : null),
    currencyName: typeof post.currencyName === 'string' ? post.currencyName : String(r['CurrencyName'] ?? ''),
    statusName: typeof post.statusName === 'string' ? post.statusName : String(r['StatusName'] ?? ''),
    regionName: typeof post.regionName === 'string' ? post.regionName : String(r['RegionName'] ?? ''),
    addressLink: typeof post.addressLink === 'string' ? post.addressLink : String(r['AddressLink'] ?? ''),
  };
}
