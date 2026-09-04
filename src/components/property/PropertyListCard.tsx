import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, MapPin, PawPrint } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { formatSqm, formatYen } from "@/lib/format";
import { totalMonthlyCost, type Property } from "@/types";

/** 物件一覧ページ用のカード (マッチ度を持たない純粋な物件表示) */
export function PropertyListCard({ property: p }: { property: Property }) {
  return (
    <Link
      href={`/properties/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-card transition-colors hover:border-navy-300"
    >
      <Image
        src={p.imageUrl}
        alt={`${p.name}の外観イメージ`}
        width={800}
        height={560}
        className="h-40 w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <h2 className="truncate text-[15px] font-bold tracking-tight text-navy-900">
          {p.name}
        </h2>
        <p className="mt-0.5 flex items-start gap-1 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
          <MapPin className="mt-1 size-3 shrink-0" aria-hidden="true" />
          {p.prefecture}
          {p.city} {p.area}／{p.nearestStation}駅 徒歩{p.walkMinutes}分
        </p>

        <p className="mt-3 flex items-baseline gap-2">
          <span className="tabular text-lg font-bold whitespace-nowrap text-navy-900">
            {formatYen(p.rent)}
          </span>
          <span className="tabular text-[11px] whitespace-nowrap text-[var(--color-ink-subtle)]">
            総額 {formatYen(totalMonthlyCost(p))}
          </span>
        </p>

        <p className="tabular mt-1 text-[12px] font-semibold text-navy-800">
          {p.layout}／{formatSqm(p.sizeSqm)}／
          {p.buildingAge === 0 ? "新築" : `築${p.buildingAge}年`}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
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
        </div>

        <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-brand-600 group-hover:gap-2">
          詳細を見る
          <ArrowRight className="size-3.5 transition-all" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
