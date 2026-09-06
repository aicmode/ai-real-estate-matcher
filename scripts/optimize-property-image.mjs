import sharp from "sharp";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [propertyId, input] = process.argv.slice(2);
const dataset = JSON.parse(readFileSync("assets/property-images/prompts.json", "utf8"));
const entry = dataset.find(e => e.propertyId === propertyId);
if (!entry || !input) throw new Error("Usage: node scripts/optimize-property-image.mjs <propertyId> <source-image>");
mkdirSync("public/images/properties", { recursive: true });
const output = path.join("public/images/properties", entry.imageFilename);
let buffer;
let quality = 78;
for (; quality >= 66; quality -= 3) {
  buffer = await sharp(input).rotate().resize(1024, 768, { fit: "cover" }).webp({ quality, effort: 6 }).toBuffer();
  if (buffer.length <= 200_000) break;
}
if (buffer.length > 200_000) throw new Error(`${propertyId} exceeds 200KB; review before publishing`);
writeFileSync(output, buffer);
console.log(JSON.stringify({ propertyId, output, bytes: buffer.length, quality, width: 1024, height: 768 }));
