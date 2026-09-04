import type { Property as PrismaProperty } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { Property } from "@/types";

/**
 * Prisma のレコードをアプリ用 DTO へ変換する。
 *
 * SQLite には配列型が無いため JSON 文字列で保持しているカラムを
 * ここで string[] に戻す。PostgreSQL へ移行して String[] にした際は
 * この関数だけを直せばよく、UI 側の変更は不要。
 */
export function toPropertyDTO(record: PrismaProperty): Property {
  return {
    id: record.id,
    name: record.name,
    prefecture: record.prefecture,
    city: record.city,
    area: record.area,
    rent: record.rent,
    managementFee: record.managementFee,
    deposit: record.deposit,
    keyMoney: record.keyMoney,
    layout: record.layout,
    sizeSqm: record.sizeSqm,
    buildingAge: record.buildingAge,
    floor: record.floor,
    structure: record.structure,
    nearestLine: record.nearestLine,
    nearestStation: record.nearestStation,
    walkMinutes: record.walkMinutes,
    hasParking: record.hasParking,
    petAllowed: record.petAllowed,
    remoteWorkScore: record.remoteWorkScore,
    internet: record.internet,
    hasAutoLock: record.hasAutoLock,
    hasBathToilet: record.hasBathToilet,
    appealPoints: parseStringArray(record.appealPoints),
    cautionPoints: parseStringArray(record.cautionPoints),
    tags: parseStringArray(record.tags),
    description: record.description,
    imageUrl: record.imageUrl,
    latitude: record.latitude,
    longitude: record.longitude,
  };
}

function parseStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/** 公開中の全物件 (マッチング対象母集団) */
export async function findPublishedProperties(): Promise<Property[]> {
  const records = await prisma.property.findMany({
    where: { isPublished: true },
    orderBy: [{ prefecture: "asc" }, { city: "asc" }, { rent: "asc" }],
  });
  return records.map(toPropertyDTO);
}

export async function findPropertyById(id: string): Promise<Property | null> {
  const record = await prisma.property.findUnique({ where: { id } });
  return record ? toPropertyDTO(record) : null;
}

/** 一覧画面のフィルタ用に、登録されているエリアを取得する */
export async function findAvailableAreas(): Promise<
  { prefecture: string; cities: string[] }[]
> {
  const records = await prisma.property.findMany({
    where: { isPublished: true },
    select: { prefecture: true, city: true },
    distinct: ["prefecture", "city"],
    orderBy: [{ prefecture: "asc" }, { city: "asc" }],
  });

  const map = new Map<string, string[]>();
  for (const { prefecture, city } of records) {
    const cities = map.get(prefecture) ?? [];
    if (!cities.includes(city)) cities.push(city);
    map.set(prefecture, cities);
  }

  return [...map.entries()].map(([prefecture, cities]) => ({
    prefecture,
    cities,
  }));
}
