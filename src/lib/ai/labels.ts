/** 推薦理由の生成元をユーザー向けの表記へ変換する */
export const PROVIDER_LABEL: Record<string, string> = {
  "rule-based": "ルールベース生成",
  claude: "Claude API 生成",
};

export function providerLabel(provider: string): string {
  return PROVIDER_LABEL[provider] ?? provider;
}
