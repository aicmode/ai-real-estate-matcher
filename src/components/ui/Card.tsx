import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-line)] bg-white shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex items-start gap-3">
        {icon ? (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-bold tracking-tight text-navy-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}
