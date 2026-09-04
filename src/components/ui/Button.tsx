import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-navy-800 text-white hover:bg-navy-900 disabled:bg-navy-300 border border-transparent",
  accent:
    "bg-accent-600 text-white hover:bg-accent-700 disabled:bg-accent-500/50 border border-transparent",
  secondary:
    "bg-navy-50 text-navy-800 hover:bg-navy-100 border border-transparent",
  outline:
    "bg-white text-navy-800 border border-[var(--color-line-strong)] hover:bg-navy-50",
  ghost: "bg-transparent text-[var(--color-ink-muted)] hover:bg-navy-50 border border-transparent",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-lg",
  lg: "h-13 px-6 text-[15px] gap-2 rounded-xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-colors duration-150",
        "disabled:cursor-not-allowed disabled:opacity-70",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
