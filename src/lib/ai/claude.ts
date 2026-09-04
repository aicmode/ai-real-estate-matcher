import Anthropic from "@anthropic-ai/sdk";

import type { Recommendation } from "@/types";
import { totalMonthlyCost } from "@/types";
import { RuleBasedRecommendationProvider } from "./rule-based";
import type { RecommendationInput, RecommendationProvider } from "./types";

/** 差し替え可能なモデル ID (環境変数 ANTHROPIC_MODEL で上書き可) */
const DEFAULT_MODEL = "claude-opus-5";

const SYSTEM_PROMPT = `あなたは日本の賃貸仲介に精通した不動産アドバイザーです。
渡された「顧客の希望条件」と「物件のスコア内訳」だけを根拠に、営業担当が顧客へそのまま提示できる推薦理由を作成してください。

制約:
- スコア内訳に無い事実を推測して書かない。
- summary は 1〜2 文、120 文字以内の日本語。
- strengths は条件に合致している点、compromises は妥協が必要な点。
- compromises は妥協点が無ければ空配列にする。
- 出力は JSON のみ。前後に説明文やコードフェンスを付けない。`;

/**
 * Claude (Anthropic Messages API) を用いた推薦理由ジェネレータ。
 *
 * 本アプリの既定はルールベースであり、こちらは環境変数が揃っている場合のみ
 * 有効化される「差し替え先」の実装。API 呼び出しが失敗した場合や
 * レスポンスが想定形式でない場合は、必ずルールベースの結果へフォールバックする。
 */
export class ClaudeRecommendationProvider implements RecommendationProvider {
  readonly name = "claude";

  private readonly client: Anthropic;
  private readonly model: string;
  private readonly fallback = new RuleBasedRecommendationProvider();

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generate(inputs: RecommendationInput[]): Promise<Recommendation[]> {
    const fallbacks = await this.fallback.generate(inputs);
    if (inputs.length === 0) return fallbacks;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: this.buildPrompt(inputs) }],
      });

      // 安全系の理由で応答が拒否された場合もルールベースへ退避する
      if (response.stop_reason === "refusal") return fallbacks;

      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("");

      const parsed = parseRecommendations(text, inputs.length);
      if (!parsed) return fallbacks;

      // 欠損した要素はルールベースの結果で補完する
      return parsed.map((item, index) =>
        item ? { ...item, provider: this.name } : fallbacks[index],
      );
    } catch {
      // ネットワーク障害・認証エラー等でもアプリ全体は止めない
      return fallbacks;
    }
  }

  private buildPrompt(inputs: RecommendationInput[]): string {
    const criteria = inputs[0].criteria;
    const properties = inputs.map((input) => ({
      index: input.rank,
      name: input.property.name,
      area: `${input.property.prefecture}${input.property.city} ${input.property.area}`,
      monthlyCost: totalMonthlyCost(input.property),
      layout: input.property.layout,
      sizeSqm: input.property.sizeSqm,
      buildingAge: input.property.buildingAge,
      walkMinutes: input.property.walkMinutes,
      matchScore: input.score,
      breakdown: input.breakdown.map((item) => ({
        label: item.label,
        score: `${item.score}/${item.max}`,
        satisfied: item.satisfied,
        detail: item.detail,
      })),
    }));

    return [
      "# 顧客の希望条件",
      JSON.stringify(criteria, null, 2),
      "",
      "# 物件とスコア内訳",
      JSON.stringify(properties, null, 2),
      "",
      "# 出力形式",
      '{"recommendations":[{"index":1,"summary":"...","strengths":["..."],"compromises":["..."]}]}',
      `物件は ${inputs.length} 件です。すべての index について 1 件ずつ返してください。`,
    ].join("\n");
  }
}

/** LLM のテキスト応答を Recommendation[] へ変換する (失敗時は null) */
function parseRecommendations(
  text: string,
  expected: number,
): (Omit<Recommendation, "provider"> | null)[] | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }

  const list = (payload as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(list)) return null;

  const results: (Omit<Recommendation, "provider"> | null)[] = new Array(
    expected,
  ).fill(null);

  for (const raw of list) {
    if (typeof raw !== "object" || raw === null) continue;
    const item = raw as Record<string, unknown>;
    const index = Number(item.index);
    if (!Number.isInteger(index) || index < 1 || index > expected) continue;
    if (typeof item.summary !== "string" || item.summary.trim() === "") continue;

    results[index - 1] = {
      summary: item.summary,
      strengths: toStringArray(item.strengths),
      compromises: toStringArray(item.compromises),
    };
  }

  return results;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
