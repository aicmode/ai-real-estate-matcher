import type { MatchCriteria, Property } from "@/types";
import { totalMonthlyCost } from "@/types";
import { layoutRank } from "./constants";

/**
 * 事前フィルタ。
 *
 * 設計方針: 「完全一致しないものを落とす」のではなく、
 * 明らかに提案として成立しない物件だけを除外する。
 * 例) 予算 8 万円に対し 8.2 万円は残す（スコアで減点）、10.5 万円は除外する。
 *
 * 「必須」と明示された条件（駐車場 / ペット / 在宅ワーク）だけは
 * 実務上の絶対条件とみなして除外する。
 */
export function isViableCandidate(p: Property, c: MatchCriteria): boolean {
  // 都道府県が違うものは提案対象外
  if (c.prefecture && p.prefecture !== c.prefecture) return false;

  // 予算の 25% 超過は現実的でない
  if (totalMonthlyCost(p) > c.maxRent * 1.25) return false;

  // 希望より 15 分以上遠い駅距離は対象外
  if (p.walkMinutes > c.maxWalkMinutes + 15) return false;

  // 最低面積の 70% を下回るものは対象外
  if (c.minSizeSqm > 0 && p.sizeSqm < c.minSizeSqm * 0.7) return false;

  // 間取りが 3 ランク以上小さいものは対象外
  const want = layoutRank(c.minLayout);
  if (want && layoutRank(p.layout) < want - 2) return false;

  // 必須条件
  if (c.parking === "required" && !p.hasParking) return false;
  if (c.pet === "required" && !p.petAllowed) return false;
  if (c.remoteWork === "required" && p.remoteWorkScore <= 2) return false;

  return true;
}
