"use client";

import type { ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";

/** ラベル + 補足 + コントロール をまとめるフォーム行 */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-[13px] font-semibold text-navy-800"
      >
        {label}
      </label>
      {children(id)}
      {hint ? (
        <p className="text-[11px] leading-relaxed text-[var(--color-ink-subtle)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const CONTROL_BASE =
  "h-11 w-full rounded-lg border border-[var(--color-line-strong)] bg-white px-3 text-sm text-navy-900 transition-colors hover:border-navy-300 focus:border-brand-500 focus:outline-none";

export function Select({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(CONTROL_BASE, "appearance-none pr-9")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[var(--color-ink-subtle)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M5.5 8l4.5 4.5L14.5 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** スライダー + 現在値表示 (数値入力よりも操作が速い) */
export function RangeControl({
  id,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="tabular text-lg font-bold text-navy-900">
          {format(value)}
        </span>
        <span className="tabular text-[11px] text-[var(--color-ink-subtle)]">
          {format(min)} 〜 {format(max)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-navy-100 accent-[var(--color-brand-600)]"
      />
    </div>
  );
}

/** 「必須 / あれば尚可 / こだわらない」のような 2〜3 択 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-1 rounded-lg border border-[var(--color-line-strong)] bg-navy-50/60 p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-md px-2 text-[12px] font-semibold transition-colors",
              active
                ? "bg-white text-navy-900 shadow-card"
                : "text-[var(--color-ink-muted)] hover:text-navy-800",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
