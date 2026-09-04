import { RuleBasedRecommendationProvider } from "./rule-based";
import { ClaudeRecommendationProvider } from "./claude";
import type { RecommendationProvider } from "./types";

export type { RecommendationInput, RecommendationProvider } from "./types";
export { RuleBasedRecommendationProvider } from "./rule-based";

let cached: RecommendationProvider | null = null;

/**
 * 実行環境に応じた推薦理由プロバイダを返す。
 *
 * - 既定 (API キー無し) : ルールベース
 * - AI_PROVIDER=claude かつ ANTHROPIC_API_KEY あり : Claude API
 *
 * API キーが無い状態でもエラーにせず、必ずルールベースへフォールバックする。
 */
export function getRecommendationProvider(): RecommendationProvider {
  if (cached) return cached;

  const requested = (process.env.AI_PROVIDER ?? "rule-based").toLowerCase();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (requested === "claude" && apiKey) {
    cached = new ClaudeRecommendationProvider(
      apiKey,
      process.env.ANTHROPIC_MODEL,
    );
  } else {
    cached = new RuleBasedRecommendationProvider();
  }

  return cached;
}
