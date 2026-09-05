import { z } from "zod";

import { LAYOUT_OPTIONS } from "@/lib/matching/constants";
import type { MatchCriteria } from "@/types";

export const RENT_RANGE = { min: 30000, max: 300000 } as const;

const requirementLevel = z.enum(["required", "preferred", "any"]);

/** 希望条件のバリデーション (API 境界で必ず通す) */
export const matchCriteriaSchema = z.object({
  prefecture: z.string().max(20).default(""),
  city: z.string().max(30).default(""),
  maxRent: z.number().int().min(RENT_RANGE.min).max(RENT_RANGE.max),
  minLayout: z.enum(["", ...LAYOUT_OPTIONS] as [string, ...string[]]).default(""),
  maxWalkMinutes: z.number().int().min(1).max(60),
  maxBuildingAge: z.number().int().min(0).max(60),
  minSizeSqm: z.number().min(0).max(200),
  parking: requirementLevel,
  pet: requirementLevel,
  remoteWork: requirementLevel,
  priority: z.enum(["cost", "commute", "space", "newness", "lifestyle"]),
});

export type ValidatedCriteria = z.infer<typeof matchCriteriaSchema>;

/** フォームの初期値 (デモ条件ではなく、無難な既定値) */
export const DEFAULT_CRITERIA: MatchCriteria = {
  prefecture: "",
  city: "",
  maxRent: 90000,
  minLayout: "1LDK",
  maxWalkMinutes: 15,
  maxBuildingAge: 25,
  minSizeSqm: 30,
  parking: "preferred",
  pet: "any",
  remoteWork: "preferred",
  priority: "cost",
};

/** 地域を明示して選択する、予測可能なデモ条件。 */
export const DEMO_PRESETS: { label: string; criteria: MatchCriteria }[] = [
  { label: "北海道 / 札幌市", criteria: { ...DEFAULT_CRITERIA, prefecture: "北海道", city: "札幌市", maxRent: 130000 } },
  { label: "東京都 / 新宿区", criteria: { ...DEFAULT_CRITERIA, prefecture: "東京都", city: "新宿区", maxRent: 240000 } },
  { label: "愛知県 / 名古屋市", criteria: { ...DEFAULT_CRITERIA, prefecture: "愛知県", city: "名古屋市", maxRent: 170000 } },
  { label: "大阪府 / 大阪市", criteria: { ...DEFAULT_CRITERIA, prefecture: "大阪府", city: "大阪市", maxRent: 170000 } },
  { label: "福岡県 / 福岡市", criteria: { ...DEFAULT_CRITERIA, prefecture: "福岡県", city: "福岡市", maxRent: 130000 } },
  { label: "鹿児島県 / 鹿児島市", criteria: { ...DEFAULT_CRITERIA, prefecture: "鹿児島県", city: "鹿児島市", maxRent: 110000 } },
  { label: "沖縄県 / 那覇市", criteria: { ...DEFAULT_CRITERIA, prefecture: "沖縄県", city: "那覇市", maxRent: 130000 } },
];

export const DEMO_CRITERIA: MatchCriteria = DEMO_PRESETS[0].criteria;
