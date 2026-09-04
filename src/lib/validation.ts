import { z } from "zod";

import { LAYOUT_OPTIONS } from "@/lib/matching/constants";
import type { MatchCriteria } from "@/types";

const requirementLevel = z.enum(["required", "preferred", "any"]);

/** 希望条件のバリデーション (API 境界で必ず通す) */
export const matchCriteriaSchema = z.object({
  prefecture: z.string().max(20).default(""),
  city: z.string().max(30).default(""),
  maxRent: z.number().int().min(10000).max(1000000),
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

/** 「デモ条件を入力」ボタンで投入される条件 */
export const DEMO_CRITERIA: MatchCriteria = {
  prefecture: "鹿児島県",
  city: "鹿児島市",
  maxRent: 80000,
  minLayout: "1LDK",
  maxWalkMinutes: 15,
  maxBuildingAge: 20,
  minSizeSqm: 35,
  parking: "required",
  pet: "any",
  remoteWork: "required",
  priority: "lifestyle",
};
