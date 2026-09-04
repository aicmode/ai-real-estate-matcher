"use client";

import { Cpu, ListFilter, SearchX } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { providerLabel } from "@/lib/ai/labels";
import { PropertyCard } from "./PropertyCard";
import { PRIORITY_OPTIONS, type MatchResponse } from "@/types";

export function ResultsSection({
  data,
  compareIds,
  maxCompare,
  onToggleCompare,
  onOpenDetail,
}: {
  data: MatchResponse;
  compareIds: string[];
  maxCompare: number;
  onToggleCompare: (id: string) => void;
  onOpenDetail: (id: string) => void;
}) {
  const priority = PRIORITY_OPTIONS.find((p) => p.key === data.criteria.priority);
  const top = data.results.slice(0, 3);
  const rest = data.results.slice(3);
  const compareDisabled = compareIds.length >= maxCompare;

  if (data.results.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-navy-50 text-navy-500">
          <SearchX className="size-6" aria-hidden="true" />
        </span>
        <p className="text-base font-bold text-navy-900">
          条件に合う物件が見つかりませんでした
        </p>
        <p className="max-w-md text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
          登録物件 {data.totalCount} 件のうち、候補として提案できる物件はありませんでした。
          家賃上限を上げる、駅徒歩を緩める、「必須」条件を「あれば尚可」に変更するなどをお試しください。
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-line)] bg-white px-5 py-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-base font-bold tracking-tight text-navy-900">
            登録{data.totalCount}件中{" "}
            <span className="tabular text-accent-600">{data.matchedCount}件</span>{" "}
            が候補になりました
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--color-ink-muted)]">
            マッチ度の高い順に表示しています。上位3件を特におすすめします。
            {data.displayedCount < data.matchedCount
              ? `（マッチ度上位${data.displayedCount}件を表示中）`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {priority ? (
            <Badge tone="brand">
              <ListFilter className="size-3" aria-hidden="true" />
              {priority.label}
            </Badge>
          ) : null}
          <Badge tone="neutral">
            <Cpu className="size-3" aria-hidden="true" />
            推薦理由: {providerLabel(data.provider)}
          </Badge>
        </div>
      </div>

      <section>
        <h2 className="mb-3 flex items-baseline gap-2 text-sm font-bold tracking-tight text-navy-900">
          おすすめ TOP{top.length}
          <span className="text-[11px] font-medium text-[var(--color-ink-subtle)]">
            条件との相性が特に高い物件
          </span>
        </h2>
        <div className="space-y-4">
          {top.map((result) => (
            <PropertyCard
              key={result.property.id}
              result={result}
              featured
              compareSelected={compareIds.includes(result.property.id)}
              compareDisabled={compareDisabled}
              onToggleCompare={onToggleCompare}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      </section>

      {rest.length > 0 ? (
        <section>
          <h2 className="mb-3 flex items-baseline gap-2 text-sm font-bold tracking-tight text-navy-900">
            その他の候補
            <span className="tabular text-[11px] font-medium text-[var(--color-ink-subtle)]">
              {rest.length}件
            </span>
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {rest.map((result) => (
              <PropertyCard
                key={result.property.id}
                result={result}
                compareSelected={compareIds.includes(result.property.id)}
                compareDisabled={compareDisabled}
                onToggleCompare={onToggleCompare}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
