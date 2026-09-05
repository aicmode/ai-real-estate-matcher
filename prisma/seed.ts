/** 固定seedの架空188物件。対象確認済みの専用DBに限り実行する。 */
import { PrismaClient } from "@prisma/client";
import { generateProperties } from "./seed-data/generate";
import { assertNationwide, assertReplaceable, toSeedRecord } from "./seed-data/safety";

const prisma = new PrismaClient({ log: [] });

async function main() {
  if (process.env.MATCHER_SEED_TARGET !== "verified-fictional-demo") {
    throw new Error("専用DB・架空データの確認後にMATCHER_SEED_TARGETを設定してください。");
  }
  const properties = generateProperties();
  assertNationwide(properties);
  await prisma.$transaction(async (tx) => {
    // 検証と置換の間の同時更新を防ぎ、途中失敗時は全体をロールバックする。
    await tx.$executeRawUnsafe('LOCK TABLE "Property" IN ACCESS EXCLUSIVE MODE');
    const tables = await tx.$queryRaw<{ table_name: string }[]>`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`;
    if (tables.some(({ table_name }) => !["Property", "_prisma_migrations"].includes(table_name))) {
      throw new Error("専用デモDB以外のテーブルがあるため中止しました。");
    }
    const existing = await tx.property.findMany();
    assertReplaceable(existing, properties);
    // 既存全国IDは保持。旧36件のみを検証後に置換する。
    await tx.property.deleteMany({ where: { id: { notIn: properties.map((p) => p.id) } } });
    for (const p of properties) {
      const data = toSeedRecord(p);
      await tx.property.upsert({ where: { id: p.id }, create: data, update: data });
    }
    const groups = await tx.property.groupBy({ by: ["prefecture"], _count: true });
    if (groups.length !== 47 || groups.some((group) => group._count !== 4)) throw new Error("DB件数検証に失敗しました。");
  }, { timeout: 60000 });
  console.log("seed検証成功: total=188, prefectures=47, each=4");
}

main().catch(() => {
  // 接続URLやDBの内容をエラーログへ出さない。
  console.error("seed失敗: 対象確認、接続、既存データ照合を確認してください。変更はトランザクション内で保護されています。");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
