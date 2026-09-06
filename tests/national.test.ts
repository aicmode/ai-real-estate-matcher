import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { generateProperties } from "../prisma/seed-data/generate";
import { PREFECTURES } from "../prisma/seed-data/geography";
import { assertReplaceable, toSeedRecord } from "../prisma/seed-data/safety";
import { isViableCandidate, runMatching, scoreProperty, resolveWeights } from "../src/lib/matching";
import { DEFAULT_CRITERIA, DEMO_PRESETS, RENT_RANGE, matchCriteriaSchema } from "../src/lib/validation";
import { toPropertyDTO } from "../src/lib/repositories/property-repository";
import { resolvePropertyImage } from "../src/lib/property-images";
import type { MatchCriteria } from "../src/types";
import { POST } from "../src/app/api/match/route";

const properties = generateProperties();
const all: MatchCriteria = { ...DEFAULT_CRITERIA, maxRent: RENT_RANGE.max, minLayout: "", minSizeSqm: 0, maxWalkMinutes: 60, maxBuildingAge: 60, parking: "any", pet: "any", remoteWork: "any" };
const expectedPrefectures = "北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県".split(" ");

test("TEST-01/02/03: 188件・独立した47都道府県一覧・各4件", () => {
  assert.equal(properties.length, 188);
  assert.deepEqual([...new Set(properties.map(p => p.prefecture))], expectedPrefectures);
  for (const name of expectedPrefectures) assert.equal(properties.filter(p => p.prefecture === name).length, 4);
});
test("TEST-04/05: 固定seed・一意ID/物件名", () => {
  assert.deepEqual(generateProperties(), generateProperties());
  assert.notDeepEqual(generateProperties(1), properties);
  assert.equal(new Set(properties.map(p => p.id)).size, 188);
  assert.equal(new Set(properties.map(p => `${p.prefecture}:${p.name}`)).size, 188);
});
test("地理マスタの組を維持し、全国座標範囲・沖縄の鉄道が整合", () => {
  for (const p of properties) {
    const region = PREFECTURES.find(r => r.prefecture === p.prefecture)!;
    assert.ok(region.areas.some(a => a.city === p.city && a.area === p.area && a.nearestLine === p.nearestLine && a.nearestStation === p.nearestStation && a.latitude === p.latitude && a.longitude === p.longitude));
    assert.ok(p.latitude! > 24 && p.latitude! < 46 && p.longitude! > 122 && p.longitude! < 146);
    if (p.prefecture === "沖縄県") assert.equal(p.nearestLine, "ゆいレール");
  }
});
test("4タイプと設備・価格のバリエーション、UI予算内", () => {
  for (const region of PREFECTURES) {
    const [a, b, c, d] = properties.filter(p => p.prefecture === region.prefecture);
    assert.ok(a.walkMinutes <= 5 && a.buildingAge <= 5);
    assert.ok(b.rent < a.rent && b.deposit === 0 && b.keyMoney === 0);
    assert.ok(c.sizeSqm > a.sizeSqm && c.hasParking && c.petAllowed);
    assert.equal(d.remoteWorkScore, 5);
    assert.ok(d.internet.includes("無料"));
  }
  assert.ok(properties.every(p => p.rent + p.managementFee <= RENT_RANGE.max));
  assert.ok(properties.find(p => p.id === "demo-jp-13-a")!.rent > properties.find(p => p.id === "demo-jp-46-a")!.rent);
  for (const field of ["rent", "managementFee", "layout", "buildingAge", "structure", "internet", "hasParking", "petAllowed", "hasAutoLock", "hasBathToilet"] as const) assert.ok(new Set(properties.map(p => p[field])).size > 1);
});
for (const prefecture of expectedPrefectures) test(`TEST-06: ${prefecture}以外が混入しない`, () => {
  const candidates = properties.filter(p => isViableCandidate(p, { ...all, prefecture }));
  assert.equal(candidates.length, 4);
  assert.ok(candidates.every(p => p.prefecture === prefecture));
});
test("TEST-07: 都道府県なしは全国188件の検索母集団", async () => {
  assert.equal(properties.filter(p => isViableCandidate(p, all)).length, 188);
  const result = await runMatching(properties, all);
  assert.equal(result.totalCount, 188);
  assert.equal(result.matchedCount, 188);
  assert.equal(result.displayedCount, 12);
});
for (const preset of DEMO_PRESETS) test(`TEST-08/09/10: ${preset.label}の検索とランキング`, async () => {
  assert.ok(matchCriteriaSchema.safeParse(preset.criteria).success);
  const outcome = await runMatching(properties, preset.criteria);
  assert.ok(outcome.results.length >= 3);
  assert.ok(outcome.results.every(r => r.property.prefecture === preset.criteria.prefecture));
});
test("同一県・別市区町村は候補に残り、エリアのみ部分点", () => {
  const p = properties.find(p => p.prefecture === "東京都" && p.city === "杉並区")!;
  const criteria = { ...all, prefecture: "東京都", city: "新宿区" };
  assert.ok(isViableCandidate(p, criteria));
  assert.equal(scoreProperty(p, criteria).breakdown.find(b => b.key === "location")!.ratio, 0.5);
});
for (const [key, eligible] of [["parking", (p: typeof properties[number]) => p.hasParking], ["pet", (p: typeof properties[number]) => p.petAllowed], ["remoteWork", (p: typeof properties[number]) => p.remoteWorkScore > 2]] as const) test(`TEST-11/12/13: ${key}必須`, () => {
  const candidates = properties.filter(p => isViableCandidate(p, { ...all, [key]: "required" }));
  assert.ok(candidates.length > 0 && candidates.length < 188);
  assert.deepEqual(candidates, properties.filter(eligible));
});
test("TEST-14/18: 9軸・順位・範囲・推薦理由・動的重み", async () => {
  const outcome = await runMatching(properties, all);
  assert.equal(outcome.provider, "rule-based");
  outcome.results.forEach((r, i) => {
    assert.equal(r.rank, i + 1);
    assert.equal(r.breakdown.length, 9);
    assert.ok(r.score >= 45 && r.score <= 100);
    if (i) assert.ok(outcome.results[i - 1].score >= r.score);
    assert.ok(r.recommendation.summary.length > 0);
    assert.equal(r.recommendation.provider, "rule-based");
  });
  const cost = resolveWeights({ ...all, priority: "cost" });
  const space = resolveWeights({ ...all, priority: "space" });
  assert.ok(cost.rent > space.rent && space.size > cost.size);
  assert.ok(Math.abs(Object.values(cost).reduce((a,b) => a+b, 0) - 100) < 0.5);
});
test("TEST-17: 全画像が既存12ファイルの範囲内", () => {
  for (const p of properties) {
    assert.match(p.imageUrl, /^\/images\/properties\/property-(0[1-9]|1[0-2])\.svg$/);
    assert.ok(existsSync(`public${p.imageUrl}`));
  }
});
test("DTO変換と未知データの置換拒否", () => {
  const records = properties.map(p => ({ ...toSeedRecord(p), createdAt: new Date(0), updatedAt: new Date(0) }));
  assert.deepEqual(records.map(toPropertyDTO), properties.map(p => ({ ...p, imageUrl: resolvePropertyImage(p.id, p.imageUrl) })));
  assert.doesNotThrow(() => assertReplaceable(records, properties));
  assert.throws(() => assertReplaceable([{ ...records[0], rent: 1 }, ...records.slice(1)], properties));
  assert.throws(() => assertReplaceable(records.slice(1), properties));
});
test("家賃UI/Zod共通範囲・既定値・不正API入力", async () => {
  for (const maxRent of [RENT_RANGE.min, RENT_RANGE.max]) assert.ok(matchCriteriaSchema.safeParse({ ...all, maxRent }).success);
  for (const maxRent of [RENT_RANGE.min - 1, RENT_RANGE.max + 1]) assert.equal(matchCriteriaSchema.safeParse({ ...all, maxRent }).success, false);
  assert.ok(matchCriteriaSchema.safeParse(DEFAULT_CRITERIA).success);
  assert.match(readFileSync("src/components/match/SearchForm.tsx", "utf8"), /max=\{RENT_RANGE.max\}/);
  for (const body of ["{", JSON.stringify({ ...all, maxRent: RENT_RANGE.max + 1 })]) {
    assert.equal((await POST(new Request("http://localhost/api/match", { method: "POST", body }))).status, 400);
  }
});
test("事前フィルタの既存境界を維持", () => {
  const p = properties[0];
  const c = { ...all, maxRent: 80000, maxWalkMinutes: 10, minSizeSqm: 40, minLayout: "1LDK" };
  const base = { ...p, rent: 100000, managementFee: 0, walkMinutes: 25, sizeSqm: 28, layout: "1DK" };
  assert.ok(isViableCandidate(base, c));
  assert.equal(isViableCandidate({ ...base, rent: 100001 }, c), false);
  assert.equal(isViableCandidate({ ...base, walkMinutes: 26 }, c), false);
  assert.equal(isViableCandidate({ ...base, sizeSqm: 27.9 }, c), false);
  assert.equal(isViableCandidate({ ...base, layout: "1K" }, c), false);
});
