import { Award, Crown, Medal } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * 順位バッジ。
 * OS 依存の絵文字を使わず、アイコン + 配色でランクを表現する。
 */
const RANK_STYLES = [
  {
    icon: Crown,
    wrap: "bg-[#f8f1de] text-[#a37a20] border-[#ecdcb6]",
    label: "1st",
  },
  {
    icon: Medal,
    wrap: "bg-[#eef1f5] text-[#5f7185] border-[#dde3ea]",
    label: "2nd",
  },
  {
    icon: Award,
    wrap: "bg-[#f6ece3] text-[#9a6a3f] border-[#e8d5c4]",
    label: "3rd",
  },
] as const;

export function RankBadge({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}) {
  const style = RANK_STYLES[rank - 1];

  if (!style) {
    return (
      <span
        className={cn(
          "inline-flex h-7 items-center gap-1 rounded-md border border-[var(--color-line)] bg-navy-50 px-2 text-[12px] font-bold text-navy-700",
          className,
        )}
      >
        <span className="tabular">{rank}</span>
        <span className="text-[10px] font-semibold text-[var(--color-ink-subtle)]">
          位
        </span>
      </span>
    );
  }

  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-bold",
        style.wrap,
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={2.2} aria-hidden="true" />
      <span className="tabular">{rank}</span>
      <span className="text-[10px] font-semibold opacity-80">位</span>
    </span>
  );
}
