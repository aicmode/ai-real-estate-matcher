import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { generateImageDataset } from "../scripts/property-image-dataset";
import { generateProperties } from "../prisma/seed-data/generate";
import { resolvePropertyImage, PROPERTY_IMAGE_FALLBACK } from "../src/lib/property-images";
import manifest from "../src/lib/property-image-manifest.json";
import displayOrder from "../assets/property-images/list-display-order.json";

test("188 image prompts are reproducible, unique, and match the actual property data", () => {
  const dataset = generateImageDataset();
  assert.deepEqual(JSON.parse(readFileSync("assets/property-images/prompts.json", "utf8")), dataset);
  assert.equal(dataset.length, 188);
  assert.equal(new Set(dataset.map(e => e.imageGenerationPrompt)).size, 188);
  for (const [i, p] of generateProperties().entries()) {
    assert.equal(dataset[i].propertyId, p.id);
    assert.equal(dataset[i].buildingAge, p.buildingAge);
    assert.ok(dataset[i].imageGenerationPrompt.includes(p.structure));
    assert.ok(dataset[i].imageGenerationPrompt.includes(`floor ${p.floor}`));
  }
});

test("published image paths exist; non-demo records keep their original image", () => {
  for (const id of manifest) {
    const url = resolvePropertyImage(id, "old.svg");
    assert.equal(url, `/images/properties/${id}.webp`);
    assert.ok(existsSync(`public${url}`));
  }
  assert.equal(resolvePropertyImage("customer-property", "/custom.webp"), "/custom.webp");
  assert.ok(existsSync(`public${PROPERTY_IMAGE_FALLBACK}`));
});

test("全188物件が実在する物件写真へ解決され、種別が一致する", () => {
  const rows = generateProperties().map(p => ({ id: p.id, url: resolvePropertyImage(p.id, p.imageUrl) }));
  assert.equal(rows.length, 188);
  for (const { id, url } of rows) {
    assert.match(url, /^\/images\/properties\/demo-jp-\d{2}-[abcd]\.webp$/, id);
    assert.ok(existsSync(`public${url}`), `${id}: ${url} が存在しない`);
    // 未生成分の流用でも建物タイプ(駅近・コスト重視・ファミリー・設備重視)は必ず一致させる。
    assert.equal(url.slice(-6, -5), id.slice(-1), `${id}: 種別が一致しない`);
  }
});

test("画像の重複が露骨に並ばない", () => {
  const byId = new Map(generateProperties().map(p => [p.id, resolvePropertyImage(p.id, p.imageUrl)]));
  // 一覧は1/2/3カラムなので、表示順で距離3以内に同じ画像が出ないことを確認する。
  const orders: Record<string, string[]> = {
    ID順: [...byId.keys()].sort(),
    表示順: displayOrder.order,
  };
  for (const [label, ids] of Object.entries(orders)) {
    assert.equal(new Set(ids).size, 188, `${label}: 188件の並びではない`);
    const rows = ids.map(id => byId.get(id));
    for (const distance of [1, 2, 3]) {
      for (let i = distance; i < rows.length; i++) {
        assert.notEqual(rows[i], rows[i - distance], `${label}: ${ids[i]} が距離${distance}で重複`);
      }
    }
  }
  // 都道府県ごとの4件はすべて異なる画像。
  for (let code = 1; code <= 47; code++) {
    const slice = "abcd".split("").map(t => byId.get(`demo-jp-${String(code).padStart(2, "0")}-${t}`));
    assert.equal(new Set(slice).size, 4, `${code}: 同一県内で画像が重複`);
  }
  // 流用が特定の画像へ偏らない。
  const uses = new Map<string, number>();
  for (const url of byId.values()) uses.set(url, (uses.get(url) ?? 0) + 1);
  assert.equal(uses.size, manifest.length, "生成済み画像がすべて使われていない");
  assert.ok(Math.max(...uses.values()) - Math.min(...uses.values()) <= 3, "使用回数の偏りが大きい");
});

test("生成済み画像が無いIDは既存URL、既存URLも無ければfallback", () => {
  assert.equal(resolvePropertyImage("demo-jp-99-z", "/images/properties/property-03.svg"), "/images/properties/property-03.svg");
  assert.equal(resolvePropertyImage("demo-jp-99-z", ""), PROPERTY_IMAGE_FALLBACK);
});
