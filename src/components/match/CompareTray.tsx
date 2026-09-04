"use client";

import { Scale, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { MatchResult } from "@/types";

/**
 * 比較トレイ。
 * 2〜3 件選択すると比較できることを常時提示する画面下部の固定バー。
 */
export function CompareTray({
  selected,
  max,
  onRemove,
  onClear,
  onCompare,
}: {
  selected: MatchResult[];
  max: number;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
}) {
  if (selected.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex shrink-0 items-center gap-1.5 text-[12px] font-bold text-navy-800">
            <Scale className="size-4" aria-hidden="true" />
            比較リスト
            <span className="tabular text-[var(--color-ink-subtle)]">
              {selected.length}/{max}
            </span>
          </span>
          <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {selected.map((result) => (
              <li key={result.property.id}>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line-strong)] bg-white py-1.5 pr-1.5 pl-2.5 text-[12px] font-semibold whitespace-nowrap text-navy-800">
                  {result.property.name}
                  <button
                    type="button"
                    onClick={() => onRemove(result.property.id)}
                    aria-label={`${result.property.name}を比較から外す`}
                    className="flex size-5 items-center justify-center rounded text-[var(--color-ink-subtle)] transition-colors hover:bg-navy-50 hover:text-navy-800"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            クリア
          </Button>
          <Button
            type="button"
            variant="accent"
            size="sm"
            disabled={selected.length < 2}
            onClick={onCompare}
          >
            {selected.length < 2 ? "あと1件で比較できます" : "比較する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
