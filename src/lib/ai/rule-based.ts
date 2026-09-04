import type { Recommendation } from "@/types";
import type { RecommendationInput, RecommendationProvider } from "./types";

/**
 * ルールベースの推薦理由ジェネレータ。
 *
 * 外部 API キーが無い環境でも必ず動作する既定の実装であり、
 * LLM 実装が失敗したときのフォールバックも兼ねる。
 * スコア内訳 (CriterionScore) をそのまま根拠として文章に変換するため、
 * 表示されるマッチ度と説明が常に一致する。
 */
export class RuleBasedRecommendationProvider implements RecommendationProvider {
  readonly name = "rule-based";

  async generate(inputs: RecommendationInput[]): Promise<Recommendation[]> {
    return inputs.map((input) => this.build(input));
  }

  private build({ breakdown, score }: RecommendationInput): Recommendation {
    // 重み付け後の獲得点が高い軸ほど「この物件の強み」として説得力がある
    const strengths = breakdown
      .filter((item) => item.satisfied && item.ratio >= 0.7)
      .sort((a, b) => b.score - a.score);

    const compromises = breakdown
      .filter((item) => !item.satisfied)
      // 失点が大きい (max - score) 順に並べ、影響の大きい妥協点を先に見せる
      .sort((a, b) => b.max - b.score - (a.max - a.score));

    return {
      summary: this.buildSummary(strengths, compromises, score),
      strengths: strengths.slice(0, 5).map((item) => item.detail),
      compromises: compromises.map((item) => item.detail),
      provider: this.name,
    };
  }

  private buildSummary(
    strengths: RecommendationInput["breakdown"],
    compromises: RecommendationInput["breakdown"],
    score: number,
  ): string {
    const top = strengths.slice(0, 3).map((item) => item.label);
    const topText = top.length > 0 ? top.join("・") : "総合的な条件";

    if (compromises.length === 0) {
      return `希望条件をすべて満たしており、特に${topText}の評価が高い物件です。今回の条件との相性は非常に良く、マッチ度は${score}%となりました。`;
    }

    const main = compromises[0];
    if (compromises.length === 1) {
      return `${main.detail}が、${topText}を高い水準で満たしているため、マッチ度${score}%で候補に残りました。`;
    }

    return `${main.detail}。ほか${compromises.length - 1}点の妥協が必要ですが、${topText}の条件を満たしており、総合的なマッチ度は${score}%です。`;
  }
}
