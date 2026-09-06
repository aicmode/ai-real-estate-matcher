import type { Metadata } from "next";
import { PropertyImage } from "@/components/property/PropertyImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, TriangleAlert } from "lucide-react";

import { PropertyFacts } from "@/components/match/PropertyFacts";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { findPropertyById } from "@/lib/repositories/property-repository";
import { formatSqm, formatYen } from "@/lib/format";
import { totalMonthlyCost } from "@/types";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await findPropertyById(id);
  if (!property) return { title: "物件が見つかりません" };
  return {
    title: property.name,
    description: property.description,
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const p = await findPropertyById(id);
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/properties"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-navy-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        物件一覧に戻る
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
          {p.name}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">
          {p.prefecture}
          {p.city} {p.area}／{p.nearestLine} {p.nearestStation}駅 徒歩{p.walkMinutes}分
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-[var(--color-line)]">
            <PropertyImage
              src={p.imageUrl}
              alt={`${p.name}の外観イメージ`}
              width={1024}
              height={768}
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 94vw, 600px"
              className="h-56 w-full object-cover sm:h-72"
              preload
            />
          </div>

          <Card className="px-5 py-4">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="tabular text-2xl font-bold text-navy-900">
                {formatYen(p.rent)}
              </span>
              <span className="tabular text-[12px] text-[var(--color-ink-subtle)]">
                管理費 {formatYen(p.managementFee)}／月額総額{" "}
                {formatYen(totalMonthlyCost(p))}
              </span>
            </p>
            <p className="tabular mt-1 text-sm font-semibold text-navy-800">
              {p.layout}／{formatSqm(p.sizeSqm)}／
              {p.buildingAge === 0 ? "新築" : `築${p.buildingAge}年`}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
              {p.description}
            </p>
            {p.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((tag) => (
                  <Badge key={tag} tone="brand">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </Card>

          <Card className="px-5 py-4">
            <h2 className="text-[13px] font-bold text-navy-900">おすすめポイント</h2>
            <ul className="mt-2 space-y-1.5">
              {p.appealPoints.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)]"
                >
                  <Check className="mt-1 size-3.5 shrink-0 text-accent-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            {p.cautionPoints.length > 0 ? (
              <>
                <h2 className="mt-5 text-[13px] font-bold text-navy-900">注意点</h2>
                <ul className="mt-2 space-y-1.5">
                  {p.cautionPoints.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)]"
                    >
                      <TriangleAlert
                        className="mt-1 size-3.5 shrink-0 text-[var(--color-warn-600)]"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-[13px] font-bold text-navy-900">基本情報</h2>
          <PropertyFacts property={p} />
          <p className="rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            マッチ度とスコア内訳は
            <Link href="/" className="mx-1 font-bold text-brand-600 hover:underline">
              マッチング画面
            </Link>
            で希望条件を入力すると確認できます。
          </p>
        </div>
      </div>
    </div>
  );
}
