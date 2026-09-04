"use client";

import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  Footprints,
  LayoutGrid,
  MapPin,
  PawPrint,
  Ruler,
  TriangleAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RankBadge } from "@/components/ui/RankBadge";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { cn } from "@/lib/cn";
import { formatSqm, formatYen } from "@/lib/format";
import { totalMonthlyCost, type MatchResult } from "@/types";

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-semibold tracking-wide text-[var(--color-ink-subtle)] uppercase">
        <Icon className="size-3" aria-hidden="true" />
        {label}
      </p>
      <p className="tabular truncate text-[13px] font-bold text-navy-900">{value}</p>
    </div>
  );
}

export function PropertyCard({
  result,
  featured = false,
  compareSelected,
  compareDisabled,
  onToggleCompare,
  onOpenDetail,
}: {
  result: MatchResult;
  featured?: boolean;
  compareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  const { property: p, recommendation } = result;
  const monthly = totalMonthlyCost(p);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow",
        featured
          ? "border-navy-200 shadow-card sm:flex-row"
          : "border-[var(--color-line)] shadow-card",
        compareSelected && "ring-2 ring-accent-500/60",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 bg-navy-50",
          featured ? "sm:w-64 lg:w-72" : "",
        )}
      >
        <Image
          src={p.imageUrl}
          alt={`${p.name}の外観イメージ`}
          width={800}
          height={560}
          className={cn(
            "h-40 w-full object-cover object-[center_65%]",
            featured && "sm:h-full sm:min-h-[220px]",
          )}
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <RankBadge rank={result.rank} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate font-bold tracking-tight text-navy-900",
                featured ? "text-lg" : "text-base",
              )}
            >
              {p.name}
            </h3>
            <p className="mt-0.5 flex items-start gap-1 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
              <MapPin className="mt-1 size-3 shrink-0" aria-hidden="true" />
              {p.prefecture}
              {p.city} {p.area}／{p.nearestStation}駅 徒歩{p.walkMinutes}分
            </p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="tabular text-xl font-bold whitespace-nowrap text-navy-900">
                {formatYen(p.rent)}
              </span>
              <span className="tabular text-[11px] text-[var(--color-ink-subtle)]">
                管理費 {formatYen(p.managementFee)}
                <span className="whitespace-nowrap">／総額 {formatYen(monthly)}</span>
              </span>
            </p>
          </div>
          <ScoreRing
            score={result.score}
            size="md"
            className={featured ? "sm:hidden" : undefined}
          />
          {featured ? (
            <ScoreRing score={result.score} size="lg" className="hidden sm:block" />
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 border-y border-[var(--color-line)] bg-navy-50/40 px-4 py-3 sm:grid-cols-4 sm:px-5">
          <SpecItem icon={LayoutGrid} label="間取り" value={p.layout} />
          <SpecItem icon={Ruler} label="面積" value={formatSqm(p.sizeSqm)} />
          <SpecItem
            icon={Footprints}
            label="駅徒歩"
            value={`${p.walkMinutes}分`}
          />
          <SpecItem
            icon={CalendarDays}
            label="築年数"
            value={p.buildingAge === 0 ? "新築" : `築${p.buildingAge}年`}
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <p
            className={cn(
              "text-[13px] leading-relaxed text-[var(--color-ink-muted)]",
              featured ? "" : "line-clamp-3",
            )}
          >
            {recommendation.summary}
          </p>

          {featured ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-accent-50 px-3 py-2">
                <p className="flex items-center gap-1 text-[11px] font-bold text-accent-700">
                  <Check className="size-3.5" aria-hidden="true" />
                  条件に合っている点
                </p>
                <ul className="mt-1 space-y-0.5">
                  {recommendation.strengths.slice(0, 3).map((item) => (
                    <li
                      key={item}
                      className="text-[12px] leading-snug text-accent-700/90"
                    >
                      ・{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-[var(--color-warn-50)] px-3 py-2">
                <p className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-warn-600)]">
                  <TriangleAlert className="size-3.5" aria-hidden="true" />
                  妥協が必要な点
                </p>
                {recommendation.compromises.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {recommendation.compromises.slice(0, 3).map((item) => (
                      <li
                        key={item}
                        className="text-[12px] leading-snug text-[var(--color-warn-600)]/90"
                      >
                        ・{item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[12px] text-[var(--color-warn-600)]/90">
                    妥協が必要な点はありません
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {p.hasParking ? (
                <Badge tone="neutral">
                  <Car className="size-3" aria-hidden="true" />
                  駐車場
                </Badge>
              ) : null}
              {p.petAllowed ? (
                <Badge tone="neutral">
                  <PawPrint className="size-3" aria-hidden="true" />
                  ペット可
                </Badge>
              ) : null}
              <Badge tone="neutral">在宅適性 {p.remoteWorkScore}/5</Badge>
              {recommendation.compromises.length === 0 ? (
                <Badge tone="accent">全条件クリア</Badge>
              ) : (
                <Badge tone="warn">
                  妥協 {recommendation.compromises.length}点
                </Badge>
              )}
            </div>
          )}

          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onOpenDetail(p.id)}
            >
              詳細を見る
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant={compareSelected ? "accent" : "outline"}
              size="sm"
              disabled={!compareSelected && compareDisabled}
              onClick={() => onToggleCompare(p.id)}
            >
              {compareSelected ? (
                <>
                  <Check className="size-4" aria-hidden="true" />
                  比較に追加済み
                </>
              ) : (
                "比較に追加"
              )}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
