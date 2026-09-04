"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";

import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "マッチング" },
  { href: "/properties", label: "物件一覧" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 text-white">
            <Building2 className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-bold tracking-tight whitespace-nowrap text-navy-900 sm:text-[15px]">
              AI Real Estate Matcher
            </span>
            <span className="block text-[10px] font-medium whitespace-nowrap text-[var(--color-ink-subtle)] sm:text-[11px]">
              AI物件選定支援
            </span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-[12px] font-semibold whitespace-nowrap transition-colors sm:px-3 sm:text-[13px]",
                  active
                    ? "bg-navy-50 text-navy-900"
                    : "text-[var(--color-ink-muted)] hover:bg-navy-50 hover:text-navy-800",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
