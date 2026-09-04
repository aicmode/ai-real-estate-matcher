import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "accent" | "warn" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-navy-50 text-navy-700 border-navy-100",
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  accent: "bg-accent-50 text-accent-700 border-accent-100",
  warn: "bg-[var(--color-warn-50)] text-[var(--color-warn-600)] border-[#f0e0c4]",
  danger:
    "bg-[var(--color-danger-50)] text-[var(--color-danger-600)] border-[#f3d3d3]",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
