import { mkdirSync, writeFileSync } from "node:fs";
import { generateImageDataset, PILOT_IDS } from "./property-image-dataset";

const entries = generateImageDataset();
if (entries.length !== 188 || new Set(entries.map(e => e.imageGenerationPrompt)).size !== 188) throw new Error("Expected 188 unique prompts");
mkdirSync("assets/property-images", { recursive: true });
writeFileSync("assets/property-images/prompts.json", JSON.stringify(entries, null, 2) + "\n");
writeFileSync("assets/property-images/pilot.json", JSON.stringify(entries.filter(e => PILOT_IDS.includes(e.propertyId)), null, 2) + "\n");
console.log(`Exported ${entries.length} deterministic prompts and ${PILOT_IDS.length} pilot prompts`);
