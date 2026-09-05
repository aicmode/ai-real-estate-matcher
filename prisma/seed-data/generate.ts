import type { Property } from "../../src/types";
import { PREFECTURES, PRICE_FACTORS } from "./geography";
import { PROPERTY_TEMPLATES } from "./templates";

export const DEMO_SEED = 20260905;
export const IMAGE_COUNT = 12;
/** Mulberry32。状態は生成関数ごとに作り直し、日時・Math.randomに依存しない。 */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateProperties(seed = DEMO_SEED): Property[] {
  return PREFECTURES.flatMap((region, regionIndex) => PROPERTY_TEMPLATES.map((t, typeIndex) => {
    // 地域ごとに独立した乱数系列。別地域の調整で値がずれない。
    const random = createRandom(seed + Number(region.code) * 100 + typeIndex);
    const integer = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
    const pick = <T,>(values: readonly T[]) => values[integer(0, values.length - 1)];
    const place = region.areas[typeIndex === 1 ? region.areas.length - 1 : 0];
    const factor = PRICE_FACTORS[region.priceTier] * (typeIndex === 1 && region.areas.length > 1 ? 0.9 : 1);
    const rent = Math.round(t.rent * factor * (0.94 + random() * 0.12) / 1000) * 1000;
    const managementFee = integer(typeIndex === 1 ? 1 : 3, typeIndex === 1 ? 3 : 9) * 1000;
    const layout = pick(t.layouts);
    const sizeSqm = Math.round((integer(t.size[0], t.size[1]) + random()) * 10) / 10;
    const buildingAge = integer(t.age[0], t.age[1]);
    const hasParking = typeIndex === 2 || (typeIndex !== 0 && random() > 0.35);
    const petAllowed = typeIndex === 2 || (typeIndex === 3 && random() > 0.4);
    const remoteWorkScore = integer(t.remote[0], t.remote[1]);
    const internet = typeIndex === 3 ? "全戸光回線無料" : typeIndex === 1 ? pick(["回線引込工事要", "光回線相談"]) : pick(["光回線対応", "全戸光回線無料"]);
    const hasAutoLock = typeIndex === 0 || typeIndex === 3 || (typeIndex === 2 && random() > 0.5);
    const hasBathToilet = typeIndex !== 1 || random() > 0.5;
    const floor = integer(t.floors[0], t.floors[1]);
    const tags = [t.label, ...(hasParking ? ["駐車場あり"] : []), ...(petAllowed ? ["ペット相談可"] : []), ...(hasAutoLock ? ["オートロック"] : []), ...(typeIndex === 3 ? ["ワークスペース", "ネット無料"] : [])];
    return {
      id: `demo-jp-${region.code}-${t.key.toLowerCase()}`,
      name: `【架空】${t.name}${place.nearestStation} ${floor}0${typeIndex + 1}号室`,
      prefecture: region.prefecture, ...place,
      rent, managementFee, deposit: typeIndex === 1 ? 0 : rent * integer(0, 2),
      keyMoney: typeIndex === 1 ? 0 : rent * integer(0, 1),
      layout, sizeSqm, buildingAge, floor, structure: pick(t.structures),
      walkMinutes: integer(t.walk[0], t.walk[1]), hasParking, petAllowed, remoteWorkScore,
      internet, hasAutoLock, hasBathToilet,
      appealPoints: [t.appeal, `専有面積${sizeSqm}m²の${layout}`, ...(hasBathToilet ? ["バス・トイレ別の設定"] : ["コンパクトな水回りで居室を確保"])],
      cautionPoints: [t.caution, ...(hasParking ? [] : ["敷地内駐車場なしの設定"]), ...(petAllowed ? ["ペットは小型犬または猫1匹までの架空条件"] : ["ペット不可の設定"])],
      tags,
      description: `${region.prefecture}${place.city}の${place.area}を想定した、${t.label}タイプの架空物件です。${sizeSqm}m²・${layout}、築${buildingAge}年の設定。${petAllowed ? "ペット相談可" : "ペット不可"}。物件・設備・価格・募集条件はすべて創作で、実際の相場や募集状況とは関係ありません。`,
      imageUrl: `/images/properties/property-${String((regionIndex * 4 + typeIndex) % IMAGE_COUNT + 1).padStart(2, "0")}.svg`,
    };
  }));
}
