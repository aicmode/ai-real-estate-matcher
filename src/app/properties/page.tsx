import type { Metadata } from "next";

import { PropertyListCard } from "@/components/property/PropertyListCard";
import { findPublishedProperties } from "@/lib/repositories/property-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "物件一覧",
  description: "データベースに登録されている全物件の一覧です。",
};

export default async function PropertiesPage() {
  const properties = await findPublishedProperties();

  const areaSummary = [...new Set(properties.map((p) => p.prefecture))].join("・");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
          物件一覧
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)] sm:text-sm">
          データベースに登録されている
          <span className="tabular font-bold text-navy-800"> {properties.length} </span>
          件の物件（{areaSummary}）です。
          マッチング画面で希望条件を入力すると、これらの物件がスコアリングされます。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyListCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
