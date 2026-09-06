import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const pilot = process.argv.includes("--pilot");
const entries = JSON.parse(readFileSync(`assets/property-images/${pilot ? "pilot" : "prompts"}.json`, "utf8"));
assert.equal(entries.length, pilot ? 8 : 188);
const hashes = new Map();
const records = [];
const missing = [];
for (const e of entries) {
  const path = `public/images/properties/${e.imageFilename}`;
  // 未生成分は失敗ではなく残作業として記録し、生成済み分だけを検証・公開する。
  if (!pilot && !existsSync(path)) { missing.push(e.propertyId); continue; }
  const bytes = readFileSync(path);
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.format, "webp", e.propertyId);
  assert.equal(metadata.width, 1024, e.propertyId);
  assert.equal(metadata.height, 768, e.propertyId);
  assert.ok(bytes.length <= 200_000, `${e.propertyId}: over 200KB`);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  assert.ok(!hashes.has(sha256), `${e.propertyId}: duplicate of ${hashes.get(sha256)}`);
  hashes.set(sha256, e.propertyId);
  records.push({ propertyId: e.propertyId, bytes: bytes.length, sha256 });
}
const sizes = records.map(r => r.bytes);
const totalBytes = sizes.reduce((a, b) => a + b, 0);
const report = { count: records.length, expected: entries.length, missingCount: missing.length, format: "webp", width: 1024, height: 768, totalBytes, averageBytes: Math.round(totalBytes / sizes.length), minBytes: Math.min(...sizes), maxBytes: Math.max(...sizes), missing, records };
writeFileSync(`assets/property-images/${pilot ? "pilot" : "full"}-verification.json`, JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--publish-manifest")) {
  assert.ok(!pilot, "Publish from the full dataset, not the pilot subset");
  writeFileSync("src/lib/property-image-manifest.json", JSON.stringify(records.map(r => r.propertyId), null, 2) + "\n");
}
console.log(JSON.stringify({ ...report, missing: undefined, records: undefined }, null, 2));
