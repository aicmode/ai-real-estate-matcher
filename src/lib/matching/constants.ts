import type { CriterionKey, PriorityKey } from "@/types";

/**
 * 間取りを「広さの序列」として数値化する。
 * 例: 希望が 1LDK(=5) のとき、1K(=2) は 3 ランク下と判定できる。
 */
export const LAYOUT_RANK: Record<string, number> = {
  "1R": 1,
  "1K": 2,
  "1DK": 3,
  "2K": 4,
  "1LDK": 5,
  "2DK": 6,
  "2LDK": 7,
  "3DK": 8,
  "3LDK": 9,
  "4LDK": 11,
};

/** フォームの選択肢として使う間取り一覧 (序列順) */
export const LAYOUT_OPTIONS = Object.entries(LAYOUT_RANK)
  .sort((a, b) => a[1] - b[1])
  .map(([label]) => label);

export function layoutRank(layout: string): number {
  return LAYOUT_RANK[layout] ?? 0;
}

/** 評価軸の日本語ラベル */
export const CRITERION_LABEL: Record<CriterionKey, string> = {
  rent: "家賃",
  location: "エリア",
  walk: "駅距離",
  layout: "間取り",
  size: "面積",
  age: "築年数",
  parking: "駐車場",
  pet: "ペット",
  remoteWork: "在宅ワーク",
};

/**
 * 基礎配点 (合計 100 点)。
 * 「重視したい条件」が未指定の場合はこの配点がそのまま満点になる。
 */
export const BASE_WEIGHTS: Record<CriterionKey, number> = {
  rent: 25,
  location: 20,
  walk: 15,
  layout: 10,
  size: 10,
  age: 5,
  parking: 5,
  pet: 5,
  remoteWork: 5,
};

/**
 * 重視条件による重み倍率。
 * 倍率を掛けたあと合計 100 点になるよう再正規化するため、
 * 「重視した軸の比重が上がり、その分ほかの軸の比重が下がる」挙動になる。
 */
export const PRIORITY_MULTIPLIERS: Record<
  PriorityKey,
  Partial<Record<CriterionKey, number>>
> = {
  cost: { rent: 2.0 },
  commute: { walk: 2.2, location: 1.2 },
  space: { size: 2.2, layout: 1.6 },
  newness: { age: 4.0 },
  lifestyle: { parking: 1.8, pet: 1.6, remoteWork: 2.0, location: 1.3 },
};

/** 候補として残す最低マッチ度 (これ未満は条件から離れすぎと判断) */
export const MIN_MATCH_SCORE = 45;

export const CRITERION_ORDER: CriterionKey[] = [
  "rent",
  "location",
  "walk",
  "layout",
  "size",
  "age",
  "parking",
  "pet",
  "remoteWork",
];
