import availableImages from "./property-image-manifest.json";

const available = new Set<string>(availableImages);
export const PROPERTY_IMAGE_FALLBACK = "/images/properties/property-01.svg";

/** 物件IDの末尾はテンプレート種別 (a:駅近・築浅 b:コスト重視 c:ファミリー d:設備重視)。 */
const TYPE_KEYS = ["a", "b", "c", "d"];
/**
 * 一覧の表示順 (都道府県→市区町村→家賃) とID順の双方で、
 * 3カード以内に同じ画像が現れず、使用回数が均等になるよう選んだ定数。
 */
const TYPE_SALTS = [328, 328, 456, 467];
const DEMO_ID = /^demo-jp-(\d{2})-([abcd])$/;

/** 生成済み画像を種別ごとに分ける。専用画像が増えるとpoolも自動的に育つ。 */
const pools = TYPE_KEYS.map(type =>
  availableImages.filter(id => id.endsWith(`-${type}`)).sort(),
);

/** 都道府県コードを撹拌し、poolへ決定論的かつ均等に散らす。 */
function poolIndex(code: number, salt: number, length: number) {
  let hash = Math.imul(code ^ salt, 2654435761);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 2246822519);
  hash ^= hash >>> 13;
  return (hash >>> 0) % length;
}

function imageUrl(propertyId: string) {
  return `/images/properties/${propertyId}.webp`;
}

/** Only published, verified assets override existing records; no DB write required. */
export function resolvePropertyImage(propertyId: string, existingUrl: string) {
  if (available.has(propertyId)) return imageUrl(propertyId);
  const match = DEMO_ID.exec(propertyId);
  if (match) {
    const typeIndex = TYPE_KEYS.indexOf(match[2]);
    const pool = pools[typeIndex];
    // 専用画像が未生成の間だけ、同種別の建物写真を流用する。生成後は上のif分岐が優先。
    if (pool.length > 0) {
      return imageUrl(pool[poolIndex(Number(match[1]), TYPE_SALTS[typeIndex], pool.length)]);
    }
  }
  return existingUrl || PROPERTY_IMAGE_FALLBACK;
}
