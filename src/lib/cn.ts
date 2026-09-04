/** クラス名結合ユーティリティ (条件付きクラスを安全に連結する) */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}
