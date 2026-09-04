import type { CriterionKey, MatchCriteria } from "@/types";
import { BASE_WEIGHTS, CRITERION_ORDER, PRIORITY_MULTIPLIERS } from "./constants";

export type Weights = Record<CriterionKey, number>;

/**
 * 「重視したい条件」に応じて基礎配点へ倍率を掛け、合計が 100 点になるよう
 * 再正規化した重みを返す。
 *
 * 例) コスパ重視 → 家賃 25 点 x 2.0 = 50 点 -> 再正規化して 40 点、
 *     その分ほかの軸の満点が相対的に下がる。
 */
export function resolveWeights(criteria: MatchCriteria): Weights {
  const multipliers = PRIORITY_MULTIPLIERS[criteria.priority] ?? {};

  const raw = {} as Weights;
  for (const key of CRITERION_ORDER) {
    raw[key] = BASE_WEIGHTS[key] * (multipliers[key] ?? 1);
  }

  const total = CRITERION_ORDER.reduce((sum, key) => sum + raw[key], 0);

  const normalized = {} as Weights;
  for (const key of CRITERION_ORDER) {
    normalized[key] = round1((raw[key] / total) * 100);
  }
  return normalized;
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
