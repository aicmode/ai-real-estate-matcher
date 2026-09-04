import { cn } from "@/lib/cn";
import type { Property } from "@/types";
import { formatSqm, formatYen } from "@/lib/format";
import { totalMonthlyCost } from "@/types";

/** 物件の基本情報テーブル (詳細モーダル / 詳細ページで共用) */
export function PropertyFacts({ property: p }: { property: Property }) {
  const rows: { label: string; value: string }[] = [
    { label: "所在地", value: `${p.prefecture}${p.city} ${p.area}` },
    { label: "交通", value: `${p.nearestLine} ${p.nearestStation}駅 徒歩${p.walkMinutes}分` },
    { label: "賃料", value: formatYen(p.rent) },
    { label: "管理費", value: formatYen(p.managementFee) },
    { label: "月額総額", value: formatYen(totalMonthlyCost(p)) },
    { label: "敷金 / 礼金", value: `${formatYen(p.deposit)} / ${formatYen(p.keyMoney)}` },
    { label: "間取り", value: p.layout },
    { label: "専有面積", value: formatSqm(p.sizeSqm) },
    { label: "築年数", value: p.buildingAge === 0 ? "新築" : `築${p.buildingAge}年` },
    { label: "所在階", value: `${p.floor}階` },
    { label: "構造", value: p.structure },
    { label: "駐車場", value: p.hasParking ? "あり" : "なし" },
    { label: "ペット", value: p.petAllowed ? "相談可" : "不可" },
    { label: "在宅ワーク適性", value: `${p.remoteWorkScore} / 5` },
    { label: "インターネット", value: p.internet },
    { label: "オートロック", value: p.hasAutoLock ? "あり" : "なし" },
    { label: "バス・トイレ", value: p.hasBathToilet ? "別" : "一体型" },
  ];

  return (
    <dl className="overflow-hidden rounded-xl border border-[var(--color-line)]">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={cn(
            "flex items-baseline gap-4 px-4 py-2.5",
            index > 0 && "border-t border-[var(--color-line)]",
            index % 2 === 1 && "bg-navy-50/40",
          )}
        >
          <dt className="w-24 shrink-0 text-[12px] font-semibold text-[var(--color-ink-subtle)]">
            {row.label}
          </dt>
          <dd className="tabular min-w-0 flex-1 text-[13px] font-semibold text-navy-900">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
