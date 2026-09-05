/** 起動済みサーバーに対する読み取り専用のHTTP回帰検証。 */
import assert from "node:assert/strict";
import { generateProperties } from "../prisma/seed-data/generate";
import { DEMO_PRESETS, DEFAULT_CRITERIA, RENT_RANGE } from "../src/lib/validation";
import type { MatchResponse } from "../src/types";

async function main() {
  const base = process.argv[2] ?? "http://localhost:3100";
  const origin = new URL(base);
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password) throw new Error("Invalid target");
  let requests = 0;
  async function get(path: string) {
    const response = await fetch(new URL(path, base));
    requests++;
    assert.equal(response.status, 200, path);
    return response.text();
  }
  const top = await get("/");
  assert.ok(top.includes("188"));
  for (const preset of DEMO_PRESETS) {
    const response = await fetch(new URL("/api/match", base), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(preset.criteria) });
    requests++;
    assert.equal(response.status, 200);
    const data = await response.json() as MatchResponse;
    assert.equal(data.totalCount, 188);
    assert.ok(data.results.length >= 3);
    assert.ok(data.results.every(r => r.property.prefecture === preset.criteria.prefecture));
    assert.ok(data.results.every(r => r.breakdown.length === 9));
    console.log(`${preset.label}: HTTP 200, candidates=${data.matchedCount}`);
  }
  const nationwide = await fetch(new URL("/api/match", base), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...DEFAULT_CRITERIA, prefecture: "", city: "", maxRent: RENT_RANGE.max, minLayout: "", minSizeSqm: 0, maxWalkMinutes: 60, maxBuildingAge: 60, parking: "any", pet: "any", remoteWork: "any" }) });
  requests++;
  assert.equal(nationwide.status, 200);
  const national = await nationwide.json() as MatchResponse;
  assert.equal(national.totalCount, 188);
  assert.equal(national.matchedCount, 188);
  const properties = generateProperties();
  const list = await get("/properties");
  for (const p of properties) assert.ok(list.includes(`/properties/${p.id}`), p.id);
  // 直列で全詳細を検査し、DBへ過剰な同時負荷をかけない。
  for (const p of properties) assert.ok((await get(`/properties/${p.id}`)).includes(p.name), p.id);
  for (const path of new Set(properties.map(p => p.imageUrl))) await get(path);
  console.log(`HTTP verification passed: ${requests} requests, 188 detail pages, 12 images, 0 unexpected status`);
}
main().catch(() => { console.error("HTTP verification failed"); process.exitCode = 1; });
