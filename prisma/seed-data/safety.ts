import { createHash } from "node:crypto";
import type { Property as PrismaProperty } from "@prisma/client";
import type { Property } from "../../src/types";
import legacyFingerprints from "./legacy-fingerprints.json";

export function toSeedRecord(p: Property) {
  return { ...p, appealPoints: JSON.stringify(p.appealPoints), cautionPoints: JSON.stringify(p.cautionPoints), tags: JSON.stringify(p.tags), isPublished: true };
}

/** ID/監査日時以外の全フィールドを照合。名前だけで架空データと判断しない。 */
export function fingerprint(record: Record<string, unknown>): string {
  const fields = Object.entries(record)
    .filter(([key]) => !["id", "createdAt", "updatedAt"].includes(key))
    .map(([key, value]) => [key, ["appealPoints", "cautionPoints", "tags"].includes(key) && typeof value === "string" ? JSON.parse(value) : value] as const)
    .sort(([a], [b]) => a.localeCompare(b, "en"));
  return createHash("sha256").update(JSON.stringify(Object.fromEntries(fields))).digest("hex");
}

export function assertReplaceable(records: PrismaProperty[], generated: Property[]) {
  if (!records.length) return;
  const actual = records.map((record) => fingerprint(record)).sort();
  const legacy = [...legacyFingerprints].sort();
  const national = generated.map((p) => fingerprint(toSeedRecord(p))).sort();
  if (JSON.stringify(actual) !== JSON.stringify(legacy) && JSON.stringify(actual) !== JSON.stringify(national)) {
    throw new Error("既知の架空デモデータと一致しないためseedを中止しました。");
  }
}

export function assertNationwide(properties: Property[]) {
  const counts = new Map<string, number>();
  for (const p of properties) counts.set(p.prefecture, (counts.get(p.prefecture) ?? 0) + 1);
  if (properties.length !== 188 || counts.size !== 47 || [...counts.values()].some((n) => n !== 4) || new Set(properties.map((p) => p.id)).size !== 188) {
    throw new Error("全国データの件数またはID検証に失敗しました。");
  }
}
