import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { CompareModal } from "../src/components/match/CompareModal";
import { PropertyDetailModal } from "../src/components/match/PropertyDetailModal";
import { ResultsSection } from "../src/components/match/ResultsSection";
import { generateProperties } from "../prisma/seed-data/generate";
import { runMatching } from "../src/lib/matching";
import { DEMO_PRESETS } from "../src/lib/validation";

const noop = () => {};
test("TEST-15: 比較は2件以上で11項目と対象名を表示", async () => {
  const { results } = await runMatching(generateProperties(), DEMO_PRESETS[1].criteria);
  assert.equal(renderToStaticMarkup(<CompareModal results={results.slice(0, 1)} open onClose={noop} />), "");
  for (const count of [2, 3]) {
    const html = renderToStaticMarkup(<CompareModal results={results.slice(0, count)} open onClose={noop} />);
    assert.ok(html.includes("物件比較") && html.includes("月額総額") && html.includes("在宅ワーク適性"));
    for (const r of results.slice(0, count)) assert.ok(html.includes(r.property.name));
    assert.equal((html.match(/<tr>/g) ?? []).length, 12);
  }
});
test("TEST-16: 詳細モーダルは画像・推薦理由・9軸・詳細ページリンクを表示", async () => {
  const { results } = await runMatching(generateProperties(), DEMO_PRESETS[6].criteria);
  const r = results[0];
  const html = renderToStaticMarkup(<PropertyDetailModal result={r} onClose={noop} />);
  for (const text of [r.property.name, r.property.imageUrl, `/properties/${r.property.id}`, "推薦理由", "おすすめポイント", "注意点", "基本情報", "スコア内訳"]) assert.ok(html.includes(text), text);
  for (const axis of r.breakdown) assert.ok(html.includes(axis.label));
});
test("TEST-18: TOP3・その他候補・空結果の表示", async () => {
  const criteria = { ...DEMO_PRESETS[1].criteria, prefecture: "", city: "", minLayout: "" };
  const outcome = await runMatching(generateProperties(), criteria);
  const data = { ...outcome, criteria };
  const html = renderToStaticMarkup(<ResultsSection data={data} compareIds={[]} maxCompare={3} onToggleCompare={noop} onOpenDetail={noop} />);
  assert.ok(html.includes("その他"));
  for (const r of outcome.results) assert.ok(html.includes(r.property.name));
  const empty = renderToStaticMarkup(<ResultsSection data={{ ...data, results: [], matchedCount: 0, displayedCount: 0 }} compareIds={[]} maxCompare={3} onToggleCompare={noop} onOpenDetail={noop} />);
  assert.ok(empty.includes("候補として提案できる物件はありません"));
});
