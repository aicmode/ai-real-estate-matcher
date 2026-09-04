"use client";

import { Check } from "lucide-react";

import { Modal } from "@/components/ui/Modal";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { cn } from "@/lib/cn";
import { formatSqm, formatYen } from "@/lib/format";
import { layoutRank } from "@/lib/matching/constants";
import { totalMonthlyCost, type MatchResult } from "@/types";

/** 比較行の定義。metric が同点判定・最良判定に使われる */
interface CompareRow {
  label: string;
  format: (result: MatchResult) => string;
  metric: (result: MatchResult) => number;
  /** 数値が小さいほど良いか */
  lowerIsBetter?: boolean;
}

const ROWS: CompareRow[] = [
  {
    label: "家賃",
    format: (r) => formatYen(r.property.rent),
    metric: (r) => r.property.rent,
    lowerIsBetter: true,
  },
  {
    label: "管理費",
    format: (r) => formatYen(r.property.managementFee),
    metric: (r) => r.property.managementFee,
    lowerIsBetter: true,
  },
  {
    label: "月額総額",
    format: (r) => formatYen(totalMonthlyCost(r.property)),
    metric: (r) => totalMonthlyCost(r.property),
    lowerIsBetter: true,
  },
  {
    label: "間取り",
    format: (r) => r.property.layout,
    metric: (r) => layoutRank(r.property.layout),
  },
  {
    label: "専有面積",
    format: (r) => formatSqm(r.property.sizeSqm),
    metric: (r) => r.property.sizeSqm,
  },
  {
    label: "築年数",
    format: (r) =>
      r.property.buildingAge === 0 ? "新築" : `築${r.property.buildingAge}年`,
    metric: (r) => r.property.buildingAge,
    lowerIsBetter: true,
  },
  {
    label: "駅徒歩",
    format: (r) => `${r.property.walkMinutes}分`,
    metric: (r) => r.property.walkMinutes,
    lowerIsBetter: true,
  },
  {
    label: "駐車場",
    format: (r) => (r.property.hasParking ? "あり" : "なし"),
    metric: (r) => (r.property.hasParking ? 1 : 0),
  },
  {
    label: "ペット",
    format: (r) => (r.property.petAllowed ? "相談可" : "不可"),
    metric: (r) => (r.property.petAllowed ? 1 : 0),
  },
  {
    label: "在宅ワーク適性",
    format: (r) => `${r.property.remoteWorkScore} / 5`,
    metric: (r) => r.property.remoteWorkScore,
  },
  {
    label: "マッチ度",
    format: (r) => `${r.score}%`,
    metric: (r) => r.score,
  },
];

/** その行で最も優秀な列の index 集合を返す (全て同値なら空集合) */
function bestIndexes(results: MatchResult[], row: CompareRow): Set<number> {
  const values = results.map(row.metric);
  const unique = new Set(values);
  if (unique.size <= 1) return new Set();

  const best = row.lowerIsBetter
    ? Math.min(...values)
    : Math.max(...values);

  const indexes = new Set<number>();
  values.forEach((value, index) => {
    if (value === best) indexes.add(index);
  });
  return indexes;
}

export function CompareModal({
  results,
  open,
  onClose,
}: {
  results: MatchResult[];
  open: boolean;
  onClose: () => void;
}) {
  if (!open || results.length < 2) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="物件比較"
      subtitle={`${results.length}件を比較しています。各項目で最も優れた値をハイライトしています。`}
    >
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[560px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-28 border-b border-[var(--color-line)] bg-white p-2 text-left text-[11px] font-bold text-[var(--color-ink-subtle)]">
                比較項目
              </th>
              {results.map((result) => (
                <th
                  key={result.property.id}
                  className="border-b border-[var(--color-line)] p-2 align-top"
                >
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-navy-50/50 px-3 py-3">
                    <ScoreRing score={result.score} size="sm" />
                    <span className="line-clamp-2 text-center text-[12px] font-bold text-navy-900">
                      {result.property.name}
                    </span>
                    <span className="text-center text-[10px] text-[var(--color-ink-subtle)]">
                      {result.property.city} {result.property.area}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const best = bestIndexes(results, row);
              return (
                <tr key={row.label}>
                  <th className="sticky left-0 z-10 border-b border-[var(--color-line)] bg-white p-3 text-left text-[12px] font-semibold text-[var(--color-ink-muted)]">
                    {row.label}
                  </th>
                  {results.map((result, index) => {
                    const isBest = best.has(index);
                    return (
                      <td
                        key={result.property.id}
                        className={cn(
                          "border-b border-[var(--color-line)] p-3 text-center",
                          isBest && "bg-accent-50",
                        )}
                      >
                        <span
                          className={cn(
                            "tabular inline-flex items-center gap-1 text-[13px] font-bold",
                            isBest ? "text-accent-700" : "text-navy-900",
                          )}
                        >
                          {isBest ? (
                            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                          ) : null}
                          {row.format(result)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
