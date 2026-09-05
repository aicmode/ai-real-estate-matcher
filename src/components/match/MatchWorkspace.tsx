"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { CompareModal } from "./CompareModal";
import { CompareTray } from "./CompareTray";
import { PropertyDetailModal } from "./PropertyDetailModal";
import { ResultsSection } from "./ResultsSection";
import { SearchForm, type AreaOption } from "./SearchForm";
import { DEFAULT_CRITERIA, DEMO_PRESETS } from "@/lib/validation";
import type { MatchCriteria, MatchResponse } from "@/types";

const MAX_COMPARE = 3;

/**
 * マッチング画面の状態を束ねるコンテナ。
 * 計算ロジックはサーバー側 (/api/match -> lib/matching) にあり、
 * ここでは入力・結果・比較選択の状態管理だけを担当する。
 */
export function MatchWorkspace({ areas }: { areas: AreaOption[] }) {
  const [demoOpen, setDemoOpen] = useState(false);
  const [criteria, setCriteria] = useState<MatchCriteria>(DEFAULT_CRITERIA);
  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (next: MatchCriteria) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message ?? "検索に失敗しました。");
      }

      const payload = (await response.json()) as MatchResponse;
      setData(payload);
      setCompareIds((current) =>
        current.filter((id) => payload.results.some((r) => r.property.id === id)),
      );
      // 結果セクションまでスクロールして、検索結果に注意を向ける
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "予期しないエラーが発生しました。",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDemo = () => setDemoOpen(true);
  const selectDemo = (next: MatchCriteria) => {
    setDemoOpen(false);
    setCriteria({ ...next });
    void search(next);
  };

  const toggleCompare = useCallback((id: string) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, id];
    });
  }, []);

  const selectedResults = useMemo(
    () =>
      compareIds
        .map((id) => data?.results.find((r) => r.property.id === id))
        .filter((r): r is NonNullable<typeof r> => Boolean(r)),
    [compareIds, data],
  );

  const detailResult =
    data?.results.find((r) => r.property.id === detailId) ?? null;

  return (
    <div className="space-y-8 pb-28">
      <SearchForm
        value={criteria}
        onChange={setCriteria}
        onSubmit={() => void search(criteria)}
        onDemo={handleDemo}
        loading={loading}
        areas={areas}
      />

      <div ref={resultsRef} className="scroll-mt-20">
        {error ? (
          <Card className="flex items-start gap-3 border-[#f3d3d3] bg-[var(--color-danger-50)] px-5 py-4">
            <AlertCircle
              className="mt-0.5 size-5 shrink-0 text-[var(--color-danger-600)]"
              aria-hidden="true"
            />
            <div>
              <p className="text-[13px] font-bold text-[var(--color-danger-600)]">
                {error}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--color-ink-muted)]">
                条件を変更して、もう一度お試しください。
              </p>
            </div>
          </Card>
        ) : null}

        {loading ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <Loader2
              className="size-6 animate-spin text-brand-600"
              aria-hidden="true"
            />
            <p className="text-[13px] font-semibold text-navy-800">
              登録物件を分析しています...
            </p>
          </Card>
        ) : data ? (
          <ResultsSection
            data={data}
            compareIds={compareIds}
            maxCompare={MAX_COMPARE}
            onToggleCompare={toggleCompare}
            onOpenDetail={setDetailId}
          />
        ) : (
          <Card className="flex flex-col items-center gap-4 px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-navy-50 text-navy-600">
              <Sparkles className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-base font-bold text-navy-900">
                条件を設定して検索してください
              </p>
              <p className="mx-auto mt-1 max-w-md text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
                初期値はすでに入力済みです。そのまま「おすすめ物件を探す」を押すか、
                すぐ試したい場合は下のボタンでデモ条件を投入できます。
              </p>
            </div>
            <Button type="button" variant="outline" onClick={handleDemo}>
              デモ地域を選んで検索する
            </Button>
          </Card>
        )}
      </div>

      <Modal open={demoOpen} onClose={() => setDemoOpen(false)} title="デモ地域を選択" subtitle="地域を選ぶと条件を入力して検索します。掲載物件はすべて架空です。">
        <div className="grid gap-3 sm:grid-cols-2">
          {DEMO_PRESETS.map((preset) => (
            <Button key={preset.label} type="button" variant="outline" disabled={loading || !areas.some((area) => area.prefecture === preset.criteria.prefecture)} onClick={() => selectDemo(preset.criteria)} className="min-h-11 justify-start">
              {preset.label}
            </Button>
          ))}
        </div>
      </Modal>

      <CompareTray
        selected={selectedResults}
        max={MAX_COMPARE}
        onRemove={(id) => toggleCompare(id)}
        onClear={() => setCompareIds([])}
        onCompare={() => setCompareOpen(true)}
      />

      <CompareModal
        results={selectedResults}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
      />

      <PropertyDetailModal
        result={detailResult}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
