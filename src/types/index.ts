/**
 * アプリ全体で共有するドメイン型。
 * Prisma のモデル型を直接 UI に流さず、この DTO を介することで
 * DB (PostgreSQL / Supabase) の実装差し替え時に UI 側を変更せずに済む。
 */

/** 物件 DTO (JSON 文字列カラムは string[] に変換済み) */
export interface Property {
  id: string;
  name: string;
  prefecture: string;
  city: string;
  area: string;
  rent: number;
  managementFee: number;
  deposit: number;
  keyMoney: number;
  layout: string;
  sizeSqm: number;
  buildingAge: number;
  floor: number;
  structure: string;
  nearestLine: string;
  nearestStation: string;
  walkMinutes: number;
  hasParking: boolean;
  petAllowed: boolean;
  /** 在宅ワーク適性 1(低)〜5(高) */
  remoteWorkScore: number;
  internet: string;
  hasAutoLock: boolean;
  hasBathToilet: boolean;
  appealPoints: string[];
  cautionPoints: string[];
  tags: string[];
  description: string;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
}

/** 家賃総額 (家賃 + 管理費) */
export function totalMonthlyCost(property: Property): number {
  return property.rent + property.managementFee;
}

/* ------------------------------------------------------------------ */
/* 希望条件                                                            */
/* ------------------------------------------------------------------ */

/** 必須 / どちらでもよい を表す 3 値 */
export type RequirementLevel = "required" | "preferred" | "any";

/** 重視したい条件 */
export type PriorityKey =
  | "cost"
  | "commute"
  | "space"
  | "newness"
  | "lifestyle";

export const PRIORITY_OPTIONS: {
  key: PriorityKey;
  label: string;
  description: string;
}[] = [
  { key: "cost", label: "コスパ重視", description: "家賃・初期費用の比重を高めます" },
  { key: "commute", label: "通勤重視", description: "駅からの距離の比重を高めます" },
  { key: "space", label: "広さ重視", description: "面積・間取りの比重を高めます" },
  { key: "newness", label: "新しさ重視", description: "築年数の比重を高めます" },
  {
    key: "lifestyle",
    label: "生活環境重視",
    description: "駐車場・ペット・在宅ワーク適性の比重を高めます",
  },
];

/** 検索フォームの入力値 (= マッチング条件) */
export interface MatchCriteria {
  /** 希望エリア。"" は指定なし */
  prefecture: string;
  city: string;
  /** 家賃上限 (管理費込みで判定する) */
  maxRent: number;
  /** 希望間取り (これ以上の広さの間取りを希望) */
  minLayout: string;
  /** 駅徒歩の上限 (分) */
  maxWalkMinutes: number;
  /** 築年数の上限 (年) */
  maxBuildingAge: number;
  /** 最低専有面積 (m2) */
  minSizeSqm: number;
  parking: RequirementLevel;
  pet: RequirementLevel;
  remoteWork: RequirementLevel;
  priority: PriorityKey;
}

/* ------------------------------------------------------------------ */
/* スコアリング結果                                                    */
/* ------------------------------------------------------------------ */

export type CriterionKey =
  | "rent"
  | "location"
  | "walk"
  | "layout"
  | "size"
  | "age"
  | "parking"
  | "pet"
  | "remoteWork";

/** 評価軸ごとのスコア内訳 (「なぜ 94% なのか」を説明するためのデータ) */
export interface CriterionScore {
  key: CriterionKey;
  label: string;
  /** 獲得点 (小数第1位まで) */
  score: number;
  /** 満点 (重み付け後) */
  max: number;
  /** 達成率 0〜1 */
  ratio: number;
  /** 内訳の説明文 */
  detail: string;
  /** 条件を満たしているか (true=強み / false=妥協点) */
  satisfied: boolean;
}

/** 推薦理由 (ルールベース or AI が生成) */
export interface Recommendation {
  summary: string;
  strengths: string[];
  compromises: string[];
  /** 生成元 ("rule-based" / "claude") */
  provider: string;
}

/** 1 物件のマッチング結果 */
export interface MatchResult {
  property: Property;
  /** 0〜100 のマッチ度 */
  score: number;
  rank: number;
  breakdown: CriterionScore[];
  recommendation: Recommendation;
}

/** API レスポンス */
export interface MatchResponse {
  criteria: MatchCriteria;
  /** DB 全体の公開物件数 */
  totalCount: number;
  /** 候補として成立した件数 */
  matchedCount: number;
  /** 画面に表示している件数 (上限あり) */
  displayedCount: number;
  results: MatchResult[];
  /** 推薦理由の生成に使ったプロバイダ */
  provider: string;
}
