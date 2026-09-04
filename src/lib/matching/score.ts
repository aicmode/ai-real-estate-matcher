import type { CriterionScore, MatchCriteria, Property } from "@/types";
import { CRITERION_LABEL, CRITERION_ORDER } from "./constants";
import { EVALUATORS } from "./criteria";
import { resolveWeights, round1, type Weights } from "./weights";

export interface ScoredProperty {
  property: Property;
  score: number;
  breakdown: CriterionScore[];
}

/**
 * 1 物件のマッチ度 (0〜100) と内訳を算出する。
 * 各評価軸の達成率 (0〜1) x 重み付け後の満点 の総和がマッチ度になる。
 */
export function scoreProperty(
  property: Property,
  criteria: MatchCriteria,
  weights: Weights = resolveWeights(criteria),
): ScoredProperty {
  const breakdown: CriterionScore[] = CRITERION_ORDER.map((key) => {
    const evaluation = EVALUATORS[key](property, criteria);
    const max = weights[key];
    return {
      key,
      label: CRITERION_LABEL[key],
      score: round1(evaluation.ratio * max),
      max,
      ratio: evaluation.ratio,
      detail: evaluation.detail,
      satisfied: evaluation.satisfied,
    };
  });

  const total = breakdown.reduce((sum, item) => sum + item.score, 0);

  return {
    property,
    // 表示上は整数の % に丸める
    score: Math.min(100, Math.round(total)),
    breakdown,
  };
}

/** 複数物件をスコアリングし、マッチ度の降順に並べる。 */
export function scoreAndRank(
  properties: Property[],
  criteria: MatchCriteria,
): ScoredProperty[] {
  const weights = resolveWeights(criteria);
  return properties
    .map((property) => scoreProperty(property, criteria, weights))
    .sort((a, b) => b.score - a.score);
}
