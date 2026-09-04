/** 表示用フォーマッタ (サーバー / クライアント双方で利用) */

const yen = new Intl.NumberFormat("ja-JP");

export function formatYen(value: number): string {
  return `${yen.format(Math.round(value))}円`;
}

/** 家賃は「万円」表記のほうが不動産の現場に馴染むため併用する */
export function formatManYen(value: number): string {
  return `${(value / 10000).toFixed(1)}万円`;
}

export function formatSqm(value: number): string {
  return `${value.toFixed(1)}m²`;
}

export function formatAge(years: number): string {
  return years === 0 ? "新築" : `築${years}年`;
}

export function formatWalk(minutes: number): string {
  return `徒歩${minutes}分`;
}
