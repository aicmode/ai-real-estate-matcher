import { Check, Minus } from "lucide-react";

import { scoreColor } from "@/components/ui/ScoreRing";
import { cn } from "@/lib/cn";
import type { CriterionScore } from "@/types";

/**
 * スコア内訳。
 * 「なぜこのマッチ度なのか」を評価軸ごとに開示し、
 * AI 推薦のブラックボックス感を減らすためのコンポーネント。
 */
export function ScoreBreakdown({
  breakdown,
  score,
}: {
  breakdown: CriterionScore[];
  score: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-line)]">
      <div className="flex items-center justify-between bg-navy-50/60 px-4 py-2.5">
        <p className="text-[12px] font-bold text-navy-800">
          スコア内訳（重視条件による重み付け後）
        </p>
        <p className="tabular text-[12px] font-bold" style={{ color: scoreColor(score) }}>
          合計 {score} / 100
        </p>
      </div>

      <ul className="divide-y divide-[var(--color-line)]">
        {breakdown.map((item) => {
          const percent = item.max === 0 ? 0 : (item.score / item.max) * 100;
          return (
            <li key={item.key} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full",
                      item.satisfied
                        ? "bg-accent-100 text-accent-700"
                        : "bg-[var(--color-warn-50)] text-[var(--color-warn-600)]",
                    )}
                  >
                    {item.satisfied ? (
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    ) : (
                      <Minus className="size-3" strokeWidth={3} aria-hidden="true" />
                    )}
                  </span>
                  <span className="text-[13px] font-bold text-navy-900">
                    {item.label}
                  </span>
                </div>
                <span className="tabular text-[13px] font-bold text-navy-800">
                  {item.score.toFixed(1)}
                  <span className="text-[11px] font-medium text-[var(--color-ink-subtle)]">
                    {" "}
                    / {item.max.toFixed(1)}
                  </span>
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, percent)}%`,
                    backgroundColor: item.satisfied
                      ? "var(--color-accent-500)"
                      : "var(--color-warn-600)",
                  }}
                />
              </div>

              <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
                {item.detail}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
