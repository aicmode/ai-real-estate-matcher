import type { CriterionKey, MatchCriteria, Property } from "@/types";
import { totalMonthlyCost } from "@/types";
import { formatSqm, formatYen } from "@/lib/format";
import { layoutRank } from "./constants";

/** 1 つの評価軸の判定結果 (0〜1 の達成率 + 説明文) */
export interface CriterionEvaluation {
  ratio: number;
  detail: string;
  satisfied: boolean;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * 家賃 (管理費込み)。
 * 予算内なら満点に近く、超過した場合は「即除外」ではなく超過幅に応じて減衰させる。
 * 予算 +20% で 0 点になる。
 */
function evaluateRent(p: Property, c: MatchCriteria): CriterionEvaluation {
  const cost = totalMonthlyCost(p);
  const budget = c.maxRent;

  if (cost <= budget) {
    // 予算内でも「どれだけ余裕があるか」で差がつくようにする
    const margin = clamp01((budget - cost) / (budget * 0.25));
    return {
      ratio: 0.72 + 0.28 * margin,
      detail:
        budget - cost === 0
          ? `管理費込 ${formatYen(cost)}。希望予算ちょうどです`
          : `管理費込 ${formatYen(cost)}。希望予算内に収まっています（${formatYen(budget - cost)}の余裕）`,
      satisfied: true,
    };
  }

  const over = cost - budget;
  const tolerance = budget * 0.2;
  return {
    ratio: clamp01(0.7 * (1 - over / tolerance)),
    detail: `管理費込 ${formatYen(cost)}。希望より ${formatYen(over)} 高くなります`,
    satisfied: false,
  };
}

/** エリア。市区町村一致が満点、同一県内は部分点。 */
function evaluateLocation(p: Property, c: MatchCriteria): CriterionEvaluation {
  if (!c.prefecture) {
    return {
      ratio: 1,
      detail: `${p.prefecture}${p.city} ${p.area}（エリア指定なし）`,
      satisfied: true,
    };
  }
  if (p.prefecture !== c.prefecture) {
    return {
      ratio: 0.15,
      detail: `${p.prefecture}${p.city}。希望エリアとは異なる都道府県です`,
      satisfied: false,
    };
  }
  if (!c.city || p.city === c.city) {
    return {
      ratio: 1,
      detail: `希望エリアの ${p.city} ${p.area} に立地しています`,
      satisfied: true,
    };
  }
  return {
    ratio: 0.5,
    detail: `${p.city} ${p.area}。希望の ${c.city} ではありませんが同一県内です`,
    satisfied: false,
  };
}

/** 駅徒歩。条件内でも「より近い」ほど加点される。 */
function evaluateWalk(p: Property, c: MatchCriteria): CriterionEvaluation {
  const limit = Math.max(1, c.maxWalkMinutes);
  if (p.walkMinutes <= limit) {
    return {
      ratio: 0.7 + 0.3 * clamp01(1 - p.walkMinutes / limit),
      detail: `${p.nearestStation}まで徒歩${p.walkMinutes}分。希望の${limit}分以内を満たしています`,
      satisfied: true,
    };
  }
  const over = p.walkMinutes - limit;
  const tolerance = Math.max(6, limit * 0.6);
  return {
    ratio: clamp01(0.65 * (1 - over / tolerance)),
    detail: `${p.nearestStation}まで徒歩${p.walkMinutes}分。希望より${over}分遠くなります`,
    satisfied: false,
  };
}

/** 間取り。希望以上なら満点、1 ランク下からは段階的に減点。 */
function evaluateLayout(p: Property, c: MatchCriteria): CriterionEvaluation {
  const want = layoutRank(c.minLayout);
  const has = layoutRank(p.layout);
  const diff = has - want;

  if (!want || diff >= 0) {
    return {
      ratio: 1,
      detail: `${p.layout}。希望の間取り条件（${c.minLayout || "指定なし"}以上）を満たしています`,
      satisfied: true,
    };
  }
  const ratio = diff === -1 ? 0.65 : diff === -2 ? 0.35 : 0.1;
  return {
    ratio,
    detail: `${p.layout}。希望の ${c.minLayout} より小さい間取りです`,
    satisfied: false,
  };
}

/** 専有面積。最低面積を下回る場合は不足幅に応じて減衰 (-25% で 0 点)。 */
function evaluateSize(p: Property, c: MatchCriteria): CriterionEvaluation {
  const min = Math.max(1, c.minSizeSqm);
  if (p.sizeSqm >= min) {
    return {
      ratio: 0.75 + 0.25 * clamp01((p.sizeSqm - min) / (min * 0.5)),
      detail: `専有面積 ${formatSqm(p.sizeSqm)}。希望の ${formatSqm(min)} 以上を満たしています`,
      satisfied: true,
    };
  }
  const deficit = min - p.sizeSqm;
  return {
    ratio: clamp01(0.7 * (1 - deficit / (min * 0.25))),
    detail: `専有面積 ${formatSqm(p.sizeSqm)}。希望より ${formatSqm(deficit)} 狭くなります`,
    satisfied: false,
  };
}

/** 築年数。条件内でも新しいほど加点。 */
function evaluateAge(p: Property, c: MatchCriteria): CriterionEvaluation {
  const limit = Math.max(1, c.maxBuildingAge);
  if (p.buildingAge <= limit) {
    return {
      ratio: 1 - 0.55 * clamp01(p.buildingAge / limit),
      detail:
        p.buildingAge === 0
          ? "新築物件です"
          : `築${p.buildingAge}年。希望の${limit}年以内を満たしています`,
      satisfied: true,
    };
  }
  const over = p.buildingAge - limit;
  const tolerance = Math.max(5, limit * 0.8);
  return {
    ratio: clamp01(0.42 * (1 - over / tolerance)),
    detail: `築${p.buildingAge}年。希望の${limit}年以内を${over}年超えています`,
    satisfied: false,
  };
}

/** 駐車場・ペットのような「有無」条件は要望レベルで重みが変わる。 */
function evaluateBoolean(
  has: boolean,
  level: MatchCriteria["parking"],
  labels: { yes: string; no: string },
): CriterionEvaluation {
  if (level === "required") {
    return {
      ratio: has ? 1 : 0,
      detail: has ? `${labels.yes}（必須条件を満たしています）` : labels.no,
      satisfied: has,
    };
  }
  if (level === "preferred") {
    return {
      ratio: has ? 1 : 0.35,
      detail: has ? labels.yes : `${labels.no}（希望条件は「あれば尚可」）`,
      satisfied: has,
    };
  }
  return {
    ratio: has ? 1 : 0.75,
    detail: has ? labels.yes : `${labels.no}（希望条件では重視していません）`,
    satisfied: true,
  };
}

/** 在宅ワーク適性は 5 段階評価を 0〜1 に正規化して使う。 */
function evaluateRemoteWork(p: Property, c: MatchCriteria): CriterionEvaluation {
  const norm = clamp01((p.remoteWorkScore - 1) / 4);
  const base = `在宅ワーク適性 ${p.remoteWorkScore}/5（${p.internet}）`;

  if (c.remoteWork === "required") {
    return {
      ratio: norm,
      detail:
        p.remoteWorkScore >= 4
          ? `${base}。在宅ワーク向きの環境です`
          : `${base}。在宅ワーク重視の条件としてはやや物足りません`,
      satisfied: p.remoteWorkScore >= 4,
    };
  }
  if (c.remoteWork === "preferred") {
    return {
      ratio: 0.4 + 0.6 * norm,
      detail: base,
      satisfied: p.remoteWorkScore >= 3,
    };
  }
  return { ratio: 0.7 + 0.3 * norm, detail: base, satisfied: true };
}

/** 評価軸 -> 判定関数のマップ。軸を増やすときはここに追加する。 */
export const EVALUATORS: Record<
  CriterionKey,
  (p: Property, c: MatchCriteria) => CriterionEvaluation
> = {
  rent: evaluateRent,
  location: evaluateLocation,
  walk: evaluateWalk,
  layout: evaluateLayout,
  size: evaluateSize,
  age: evaluateAge,
  parking: (p, c) =>
    evaluateBoolean(p.hasParking, c.parking, {
      yes: "駐車場を確保できます",
      no: "駐車場がありません",
    }),
  pet: (p, c) =>
    evaluateBoolean(p.petAllowed, c.pet, {
      yes: "ペット飼育が可能です",
      no: "ペット不可の物件です",
    }),
  remoteWork: evaluateRemoteWork,
};
