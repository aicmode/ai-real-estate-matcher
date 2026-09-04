import type {
  CriterionScore,
  MatchCriteria,
  Property,
  Recommendation,
} from "@/types";

/** 推薦理由を生成するための入力 */
export interface RecommendationInput {
  property: Property;
  criteria: MatchCriteria;
  score: number;
  rank: number;
  breakdown: CriterionScore[];
}

/**
 * 推薦理由の生成プロバイダ。
 *
 * この抽象を挟むことで「ルールベース」「外部 LLM」を差し替え可能にしている。
 * 新しいプロバイダを追加する場合はこのインターフェースを実装し、
 * src/lib/ai/index.ts の解決ロジックに登録するだけでよい。
 */
export interface RecommendationProvider {
  readonly name: string;
  /** 複数件をまとめて生成する (LLM 実装では 1 リクエストにまとめられる) */
  generate(inputs: RecommendationInput[]): Promise<Recommendation[]>;
}
