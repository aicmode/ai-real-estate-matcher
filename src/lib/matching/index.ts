import type { MatchCriteria, MatchResult, Property } from "@/types";
import { getRecommendationProvider } from "@/lib/ai";
import { MIN_MATCH_SCORE } from "./constants";
import { isViableCandidate } from "./filter";
import { scoreAndRank } from "./score";

export * from "./constants";
export * from "./filter";
export * from "./score";
export * from "./weights";

export interface MatchingOutcome {
  results: MatchResult[];
  totalCount: number;
  /** 候補として成立した件数 (表示件数の上限より多い場合がある) */
  matchedCount: number;
  /** 実際に返却した件数 */
  displayedCount: number;
  provider: string;
}

/** 上位何件まで推薦理由を生成するか (LLM 利用時のコスト上限を兼ねる) */
const MAX_RESULTS = 12;

/**
 * マッチング処理の入口。
 *
 *   1. 事前フィルタ  : 明らかに提案として成立しない物件を除外
 *   2. スコアリング  : 重視条件で重み付けした 0〜100 のマッチ度を算出
 *   3. ランキング    : マッチ度の降順に並べ、下限スコア未満を除外
 *   4. 推薦理由生成  : ルールベース (既定) または LLM で文章化
 */
export async function runMatching(
  properties: Property[],
  criteria: MatchCriteria,
): Promise<MatchingOutcome> {
  const candidates = properties.filter((p) => isViableCandidate(p, criteria));
  const qualified = scoreAndRank(candidates, criteria).filter(
    (item) => item.score >= MIN_MATCH_SCORE,
  );
  // 推薦理由の生成対象は上位 MAX_RESULTS 件に絞る
  const ranked = qualified.slice(0, MAX_RESULTS);

  const provider = getRecommendationProvider();
  const inputs = ranked.map((item, index) => ({
    property: item.property,
    criteria,
    score: item.score,
    rank: index + 1,
    breakdown: item.breakdown,
  }));

  const recommendations = await provider.generate(inputs);

  const results: MatchResult[] = ranked.map((item, index) => ({
    property: item.property,
    score: item.score,
    rank: index + 1,
    breakdown: item.breakdown,
    recommendation: recommendations[index],
  }));

  return {
    results,
    totalCount: properties.length,
    matchedCount: qualified.length,
    displayedCount: results.length,
    provider: provider.name,
  };
}
