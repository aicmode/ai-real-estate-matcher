"use client";

import { PropertyImage } from "@/components/property/PropertyImage";
import Link from "next/link";
import { Check, ExternalLink, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { providerLabel } from "@/lib/ai/labels";
import { PropertyFacts } from "./PropertyFacts";
import { ScoreBreakdown } from "./ScoreBreakdown";
import type { MatchResult } from "@/types";

export function PropertyDetailModal({
  result,
  onClose,
}: {
  result: MatchResult | null;
  onClose: () => void;
}) {
  if (!result) return null;
  const { property: p, recommendation } = result;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={p.name}
      subtitle={`${p.prefecture}${p.city} ${p.area}／${p.nearestStation}駅 徒歩${p.walkMinutes}分`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-[var(--color-ink-muted)]">
            推薦理由の生成: {providerLabel(recommendation.provider)}
          </p>
          <Link href={`/properties/${p.id}`}>
            <Button type="button" variant="outline" size="sm">
              物件ページを開く
              <ExternalLink className="size-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-[var(--color-line)]">
            <PropertyImage
              src={p.imageUrl}
              alt={`${p.name}の外観イメージ`}
              width={1024}
              height={768}
              sizes="(max-width: 639px) calc(100vw - 64px), (max-width: 1023px) 88vw, 600px"
              className="h-48 w-full object-cover sm:h-60"
            />
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-[var(--color-line)] bg-navy-50/40 p-4">
            <ScoreRing score={result.score} size="lg" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-wide text-[var(--color-ink-subtle)] uppercase">
                推薦理由
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-navy-900">
                {recommendation.summary}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-100 bg-accent-50 p-4">
              <p className="flex items-center gap-1.5 text-[12px] font-bold text-accent-700">
                <Check className="size-4" aria-hidden="true" />
                条件に合っている点
              </p>
              <ul className="mt-2 space-y-1.5">
                {recommendation.strengths.map((item) => (
                  <li key={item} className="text-[12px] leading-relaxed text-accent-700/90">
                    ・{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#f0e0c4] bg-[var(--color-warn-50)] p-4">
              <p className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-warn-600)]">
                <TriangleAlert className="size-4" aria-hidden="true" />
                妥協が必要な点
              </p>
              {recommendation.compromises.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {recommendation.compromises.map((item) => (
                    <li
                      key={item}
                      className="text-[12px] leading-relaxed text-[var(--color-warn-600)]/90"
                    >
                      ・{item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[12px] text-[var(--color-warn-600)]/90">
                  希望条件をすべて満たしています。
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[12px] font-bold text-navy-800">おすすめポイント</p>
            <ul className="space-y-1.5">
              {p.appealPoints.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)]"
                >
                  <Check className="mt-1 size-3.5 shrink-0 text-accent-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {p.cautionPoints.length > 0 ? (
            <div>
              <p className="mb-2 text-[12px] font-bold text-navy-800">注意点</p>
              <ul className="space-y-1.5">
                {p.cautionPoints.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[13px] leading-relaxed text-[var(--color-ink-muted)]"
                  >
                    <TriangleAlert
                      className="mt-1 size-3.5 shrink-0 text-[var(--color-warn-600)]"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <ScoreBreakdown breakdown={result.breakdown} score={result.score} />
          <div>
            <p className="mb-2 text-[12px] font-bold text-navy-800">基本情報</p>
            <PropertyFacts property={p} />
          </div>
          {p.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <Badge key={tag} tone="brand">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
