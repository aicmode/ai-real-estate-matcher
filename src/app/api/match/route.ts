import { NextResponse } from "next/server";

import { runMatching } from "@/lib/matching";
import { findPublishedProperties } from "@/lib/repositories/property-repository";
import { matchCriteriaSchema } from "@/lib/validation";
import type { MatchCriteria, MatchResponse } from "@/types";

// Prisma を使うため Node.js ランタイムで実行する
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/match
 * 希望条件を受け取り、DB の物件をスコアリングしてランキングを返す。
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "リクエストボディの形式が正しくありません。" },
      { status: 400 },
    );
  }

  const parsed = matchCriteriaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "入力条件が正しくありません。",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const criteria = parsed.data as MatchCriteria;

  try {
    const properties = await findPublishedProperties();
    const outcome = await runMatching(properties, criteria);

    const response: MatchResponse = {
      criteria,
      totalCount: outcome.totalCount,
      matchedCount: outcome.matchedCount,
      displayedCount: outcome.displayedCount,
      results: outcome.results,
      provider: outcome.provider,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/match] マッチング処理に失敗しました", error);
    return NextResponse.json(
      { message: "マッチング処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
