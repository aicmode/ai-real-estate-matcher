import { createRandom, DEMO_SEED, generateProperties } from "../prisma/seed-data/generate";
import { PROPERTY_TEMPLATES } from "../prisma/seed-data/templates";

function landscape(code: number) {
  if (code === 1) return "Hokkaido: broad pavement, cold-climate windows, restrained conifer planting";
  if (code <= 7) return "Tohoku: cool temperate planting, practical snow-conscious entrance";
  if (code <= 14) return "Kanto: compact urban streets, close neighboring residential buildings";
  if (code <= 23) return "Chubu: mixed temperate planting, modest residential side street";
  if (code <= 30) return "Kansai: narrow residential street, compact lots and warm gray pavement";
  if (code <= 35) return "Chugoku: gently sloping residential street, small leafy shrubs";
  if (code <= 39) return "Shikoku: mild-climate greenery, quiet residential streets";
  if (code <= 46) return "Kyushu: warm-climate broadleaf greenery and light-colored pavement";
  return "Okinawa: subtropical planting, bright subtropical daylight; climate-appropriate details consistent with the specified building structure";
}

export function generateImageDataset() {
  return generateProperties().map((p) => {
    const [, , codeText, type] = p.id.split("-");
    const code = Number(codeText);
    const index = "abcd".indexOf(type);
    const random = createRandom(DEMO_SEED + code * 1009 + index * 9176);
    const pick = (values: string[]) => values[Math.floor(random() * values.length)];
    const stories = Math.max(p.floor, [6, 2, 3, 4][index]) + Math.floor(random() * (index === 1 ? 1 : 3));
    const age = p.buildingAge <= 5 ? "new contemporary construction, clean crisp surfaces" : p.buildingAge <= 15 ? "relatively recent construction, subtle natural wear" : p.buildingAge <= 25 ? "ordinary established building, mildly faded surfaces and realistic weathering" : "older building with visibly aged materials, gentle discoloration, maintained but not renovated to look new";
    const concept = [
      "modern mid-to-high-rise rental building in a dense urban neighborhood, tile and concrete facade, modest glass accents",
      "ordinary economical two-story rental apartment, simple practical facade, modest fixtures, no luxury features",
      "quiet low-to-mid-rise family rental building, usable balconies and planted residential surroundings",
      "contemporary well-equipped rental building in a quiet residential neighborhood, generous windows, good quality but realistic",
    ][index];
    const imageGenerationPrompt = [
      "Use case: photorealistic-natural. Create one landscape 4:3 exterior photograph for a Japanese rental listing, approximately 1024x768 pixels.",
      `Entirely invented property design ${p.id}; never recreate an existing building or actual address. ${concept}.`,
      `Exactly ${stories} above-ground stories, compatible with a unit on floor ${p.floor}. Structure: ${p.structure}. Building age ${p.buildingAge} years: ${age}.`,
      `Facade: ${pick(["warm ivory", "light beige", "muted gray", "pale taupe", "soft sand", "off-white", "earth brown", "cool gray"])} with ${pick(["slender vertical accents", "subtle horizontal bands", "a recessed central entrance", "an offset stairwell", "a simple corner entrance", "contrasting balcony edges"])}. Balconies: ${pick(["rectangular solid parapets", "simple metal railings", "recessed square balconies", "alternating shallow balconies"])}.`,
      `Regional atmosphere only: ${landscape(code)}. Planting: ${pick(["small shrubs near the entrance", "two modest street trees", "sparse planters along the boundary", "a small planted entrance strip"])}.`,
      `Composition: ${pick(["three-quarter view from the left", "three-quarter view from the right", "nearly frontal view from across the street", "slightly off-center eye-level view"])}; normal architectural photography, straight verticals, whole building visible with breathing room, facade centered for card crops. Daytime natural light, ${pick(["soft overcast sky", "pale blue sky with thin clouds", "clear sky with gentle shadows", "scattered white clouds and soft sunlight"])}.`,
      "Believable Japanese rental listing photograph, natural texture and minor imperfections, neutral colors. No people, no vehicles, no logos, no signs or lettering, no watermark, no landmark, no luxury mansion, no illustration, no CGI or architectural render appearance. Do not write the design ID in the image.",
    ].join("\n");
    return { propertyId: p.id, propertyName: p.name, prefecture: p.prefecture, city: p.city, propertyType: PROPERTY_TEMPLATES[index].label, buildingAge: p.buildingAge, imageFilename: `${p.id}.webp`, imageGenerationPrompt };
  });
}

export const PILOT_IDS = ["demo-jp-01-a", "demo-jp-04-b", "demo-jp-13-c", "demo-jp-20-d", "demo-jp-27-a", "demo-jp-34-b", "demo-jp-40-c", "demo-jp-47-d"];
