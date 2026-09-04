"use client";

import {
  Building,
  Coins,
  Info,
  MapPin,
  Maximize,
  Search,
  Sparkles,
  TrainFront,
  Trees,
  Wand2,
} from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, RangeControl, SegmentedControl, Select } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { formatManYen } from "@/lib/format";
import { LAYOUT_OPTIONS } from "@/lib/matching/constants";
import { PRIORITY_OPTIONS, type MatchCriteria, type PriorityKey, type RequirementLevel } from "@/types";

export interface AreaOption {
  prefecture: string;
  cities: string[];
}

const PRIORITY_ICONS: Record<PriorityKey, ComponentType<{ className?: string }>> = {
  cost: Coins,
  commute: TrainFront,
  space: Maximize,
  newness: Sparkles,
  lifestyle: Trees,
};

const LEVEL_OPTIONS: { value: RequirementLevel; label: string }[] = [
  { value: "required", label: "必須" },
  { value: "preferred", label: "あれば尚可" },
  { value: "any", label: "こだわらない" },
];

const REMOTE_OPTIONS: { value: RequirementLevel; label: string }[] = [
  { value: "required", label: "重視する" },
  { value: "preferred", label: "できれば" },
  { value: "any", label: "気にしない" },
];

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: string;
}) {
  return (
    <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase">
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </p>
  );
}

export function SearchForm({
  value,
  onChange,
  onSubmit,
  onDemo,
  loading,
  areas,
}: {
  value: MatchCriteria;
  onChange: (next: MatchCriteria) => void;
  onSubmit: () => void;
  onDemo: () => void;
  loading: boolean;
  areas: AreaOption[];
}) {
  const patch = <K extends keyof MatchCriteria>(key: K, next: MatchCriteria[K]) =>
    onChange({ ...value, [key]: next });

  const cities = areas.find((a) => a.prefecture === value.prefecture)?.cities ?? [];

  return (
    <Card>
      <CardHeader
        icon={<Search className="size-[18px]" aria-hidden="true" />}
        title="希望条件を入力"
        description="入力した条件をもとに、登録物件との相性を100点満点で採点します。"
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDemo}
            className="shrink-0"
          >
            <Wand2 className="size-4" aria-hidden="true" />
            デモ条件を入力
          </Button>
        }
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-2">
          {/* --- エリア --- */}
          <section className="lg:col-span-2">
            <SectionTitle icon={MapPin}>エリア</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="希望エリア（都道府県）">
                {(id) => (
                  <Select
                    id={id}
                    value={value.prefecture}
                    onChange={(next) =>
                      onChange({ ...value, prefecture: next, city: "" })
                    }
                    options={[
                      { value: "", label: "指定なし（全エリア）" },
                      ...areas.map((a) => ({
                        value: a.prefecture,
                        label: a.prefecture,
                      })),
                    ]}
                  />
                )}
              </Field>
              <Field
                label="希望エリア（市区町村）"
                hint="市区町村が異なっても同一県内なら候補として残します。"
              >
                {(id) => (
                  <Select
                    id={id}
                    value={value.city}
                    onChange={(next) => patch("city", next)}
                    options={[
                      { value: "", label: "指定なし" },
                      ...cities.map((city) => ({ value: city, label: city })),
                    ]}
                  />
                )}
              </Field>
            </div>
          </section>

          {/* --- 予算・広さ --- */}
          <section className="lg:col-span-2">
            <SectionTitle icon={Coins}>予算・広さ</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-3 sm:gap-4">
              <Field
                label="家賃上限（管理費込み）"
                hint="上限を少し超える物件も、他の条件が良ければ候補に残します。"
              >
                {(id) => (
                  <RangeControl
                    id={id}
                    value={value.maxRent}
                    onChange={(next) => patch("maxRent", next)}
                    min={30000}
                    max={200000}
                    step={1000}
                    format={formatManYen}
                  />
                )}
              </Field>
              <Field label="間取り（これ以上）">
                {(id) => (
                  <Select
                    id={id}
                    value={value.minLayout}
                    onChange={(next) => patch("minLayout", next)}
                    options={[
                      { value: "", label: "指定なし" },
                      ...LAYOUT_OPTIONS.map((layout) => ({
                        value: layout,
                        label: `${layout} 以上`,
                      })),
                    ]}
                  />
                )}
              </Field>
              <Field label="最低専有面積">
                {(id) => (
                  <RangeControl
                    id={id}
                    value={value.minSizeSqm}
                    onChange={(next) => patch("minSizeSqm", next)}
                    min={15}
                    max={90}
                    step={1}
                    format={(v) => `${v}m²`}
                  />
                )}
              </Field>
            </div>
          </section>

          {/* --- 立地・築年数 --- */}
          <section className="lg:col-span-2">
            <SectionTitle icon={TrainFront}>立地・築年数</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
              <Field label="駅徒歩（以内）">
                {(id) => (
                  <RangeControl
                    id={id}
                    value={value.maxWalkMinutes}
                    onChange={(next) => patch("maxWalkMinutes", next)}
                    min={1}
                    max={30}
                    step={1}
                    format={(v) => `${v}分`}
                  />
                )}
              </Field>
              <Field label="築年数（以内）">
                {(id) => (
                  <RangeControl
                    id={id}
                    value={value.maxBuildingAge}
                    onChange={(next) => patch("maxBuildingAge", next)}
                    min={1}
                    max={40}
                    step={1}
                    format={(v) => `${v}年`}
                  />
                )}
              </Field>
            </div>
          </section>

          {/* --- 生活条件 --- */}
          <section className="lg:col-span-2">
            <SectionTitle icon={Building}>生活条件</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="駐車場">
                {() => (
                  <SegmentedControl
                    ariaLabel="駐車場"
                    value={value.parking}
                    onChange={(next) => patch("parking", next)}
                    options={LEVEL_OPTIONS}
                  />
                )}
              </Field>
              <Field label="ペット">
                {() => (
                  <SegmentedControl
                    ariaLabel="ペット"
                    value={value.pet}
                    onChange={(next) => patch("pet", next)}
                    options={LEVEL_OPTIONS}
                  />
                )}
              </Field>
              <Field label="在宅ワーク適性">
                {() => (
                  <SegmentedControl
                    ariaLabel="在宅ワーク適性"
                    value={value.remoteWork}
                    onChange={(next) => patch("remoteWork", next)}
                    options={REMOTE_OPTIONS}
                  />
                )}
              </Field>
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--color-ink-subtle)]">
              <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
              「必須」を選ぶとその条件を満たさない物件は候補から除外され、「あれば尚可」の場合は減点のうえ候補に残します。
            </p>
          </section>

          {/* --- 重視条件 --- */}
          <section className="lg:col-span-2">
            <SectionTitle icon={Sparkles}>重視したい条件（スコアの重み付けが変わります）</SectionTitle>
            <div
              role="radiogroup"
              aria-label="重視したい条件"
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
            >
              {PRIORITY_OPTIONS.map((option) => {
                const Icon = PRIORITY_ICONS[option.key];
                const active = value.priority === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => patch("priority", option.key)}
                    className={cn(
                      "flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-navy-800 bg-navy-800 text-white"
                        : "border-[var(--color-line-strong)] bg-white text-navy-800 hover:border-navy-300 hover:bg-navy-50",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="text-[13px] font-bold">{option.label}</span>
                    <span
                      className={cn(
                        "text-[11px] leading-snug",
                        active ? "text-navy-100" : "text-[var(--color-ink-subtle)]",
                      )}
                    >
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--color-line)] bg-navy-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[12px] text-[var(--color-ink-muted)]">
            条件を変更するたびに、マッチ度と順位が再計算されます。
          </p>
          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
            <Search className="size-[18px]" aria-hidden="true" />
            {loading ? "検索中..." : "おすすめ物件を探す"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
