import { Database, Gauge, ListOrdered, MessageSquareText } from "lucide-react";

import { MatchWorkspace } from "@/components/match/MatchWorkspace";
import { findAvailableAreas } from "@/lib/repositories/property-repository";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Database,
    title: "物件DBを検索",
    body: "登録された物件データベースから、条件に近い候補を抽出します。",
  },
  {
    icon: Gauge,
    title: "9項目でスコアリング",
    body: "家賃・エリア・駅距離など9つの評価軸を重み付けして採点します。",
  },
  {
    icon: ListOrdered,
    title: "マッチ度でランキング",
    body: "0〜100%のマッチ度を算出し、おすすめ順に並べ替えます。",
  },
  {
    icon: MessageSquareText,
    title: "推薦理由を自動生成",
    body: "合致する点と妥協が必要な点を分けて、提案文を生成します。",
  },
];

export default async function HomePage() {
  const [areas, totalCount] = await Promise.all([
    findAvailableAreas(),
    prisma.property.count({ where: { isPublished: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Hero */}
      <section className="mb-10">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-3 py-1 text-[11px] font-bold text-navy-700">
          <span className="size-1.5 rounded-full bg-accent-500" aria-hidden="true" />
          登録物件 {totalCount} 件で稼働中
        </p>
        <h1 className="max-w-3xl text-2xl leading-snug font-bold tracking-tight text-navy-900 sm:text-4xl sm:leading-tight">
          条件を入力するだけで、
          <br />
          あなたに合う物件をランキング。
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
          家賃・立地・間取り・生活条件を分析し、登録物件から相性の高い物件を自動で選定します。
          マッチ度は評価軸ごとのスコア内訳まで確認できるため、根拠を示しながら顧客へ提案できます。
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-[var(--color-line)] bg-white p-4 shadow-card"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-navy-800 text-white">
                  <step.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="tabular text-[11px] font-bold text-[var(--color-ink-subtle)]">
                  STEP {index + 1}
                </span>
              </div>
              <p className="mt-3 text-[13px] font-bold text-navy-900">{step.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
                {step.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <MatchWorkspace areas={areas} />
    </div>
  );
}
