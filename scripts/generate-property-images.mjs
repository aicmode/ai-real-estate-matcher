/**
 * 物件カード用のプレースホルダー画像を生成するスクリプト。
 *
 * 外部の画像 CDN に依存するとオフラインやネットワーク制限下で表示が崩れるため、
 * リポジトリ内で完結する SVG のアーキテクチャイラストを生成している。
 *
 *   node scripts/generate-property-images.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "images", "properties");

/** ネイビー〜ブルー〜エメラルドの落ち着いた配色 */
const PALETTES = [
  { sky: "#EEF2F7", far: "#C8D4E3", near: "#1E3A5F", win: "#7FB2D9", accent: "#0F9D77" },
  { sky: "#F1F4F8", far: "#CBD9E6", near: "#16304F", win: "#8FC1E0", accent: "#12805F" },
  { sky: "#EDF1F6", far: "#C2D0E0", near: "#22456D", win: "#9CC6E4", accent: "#0E8C6B" },
  { sky: "#F3F5F8", far: "#D2DCE8", near: "#1A3557", win: "#86B8DC", accent: "#149B79" },
  { sky: "#EFF3F7", far: "#C6D3E2", near: "#25406A", win: "#93BFE2", accent: "#0D7F62" },
  { sky: "#F2F4F7", far: "#CDD9E5", near: "#132C4A", win: "#7CADD6", accent: "#10926E" },
];

/** 決定的な擬似乱数 (同じ index なら常に同じ画像になる) */
function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function windows(x, y, w, h, cols, rows, fill, opacity) {
  const padX = w * 0.12;
  const padY = h * 0.1;
  const cw = (w - padX * 2) / cols;
  const ch = (h - padY * 2) / rows;
  const parts = [];
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      const wx = x + padX + c * cw + cw * 0.15;
      const wy = y + padY + r * ch + ch * 0.15;
      parts.push(
        `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${(cw * 0.7).toFixed(1)}" height="${(ch * 0.6).toFixed(1)}" rx="1.5" fill="${fill}" opacity="${opacity}"/>`,
      );
    }
  }
  return parts.join("");
}

function buildSvg(index) {
  const p = PALETTES[index % PALETTES.length];
  const rand = rng(index + 7);
  const W = 800;
  const H = 560;
  // 建物が画面の大部分を占めるように地平線を低めに取る。
  // カード上でトリミングされても空だけが映らないようにするため。
  const ground = 505;

  // 奥のビル群
  let far = "";
  let x = -20;
  while (x < W) {
    const w = 60 + rand() * 70;
    const h = 210 + rand() * 190;
    far += `<rect x="${x.toFixed(0)}" y="${(ground - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${p.far}"/>`;
    x += w + 8;
  }

  // 手前の主役となる建物
  const mainW = 300 + rand() * 90;
  const mainH = 355 + rand() * 90;
  const mainX = 90 + rand() * 120;
  const mainY = ground - mainH;
  const cols = 4 + Math.floor(rand() * 2);
  const rows = 6 + Math.floor(rand() * 3);

  // 隣接する低層棟
  const subW = 130 + rand() * 60;
  const subH = 245 + rand() * 70;
  const subX = mainX + mainW + 12;
  const subY = ground - subH;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
  <rect width="${W}" height="${H}" fill="${p.sky}"/>
  <circle cx="${(660).toFixed(0)}" cy="72" r="38" fill="#FFFFFF" opacity="0.55"/>
  ${far}
  <rect x="0" y="${ground}" width="${W}" height="${H - ground}" fill="${p.near}" opacity="0.08"/>
  <rect x="${subX.toFixed(0)}" y="${subY.toFixed(0)}" width="${subW.toFixed(0)}" height="${subH.toFixed(0)}" fill="${p.near}" opacity="0.75"/>
  ${windows(subX, subY, subW, subH, 3, 6, p.win, 0.75)}
  <rect x="${mainX.toFixed(0)}" y="${mainY.toFixed(0)}" width="${mainW.toFixed(0)}" height="${mainH.toFixed(0)}" fill="${p.near}"/>
  ${windows(mainX, mainY, mainW, mainH, cols, rows, p.win, 0.9)}
  <rect x="${mainX.toFixed(0)}" y="${(mainY - 10).toFixed(0)}" width="${mainW.toFixed(0)}" height="10" fill="${p.accent}"/>
  <rect x="${(mainX + mainW * 0.4).toFixed(0)}" y="${(ground - 46).toFixed(0)}" width="${(mainW * 0.2).toFixed(0)}" height="46" fill="${p.accent}" opacity="0.85"/>
  <rect x="0" y="${ground}" width="${W}" height="3" fill="${p.near}" opacity="0.35"/>
</svg>`;
}

mkdirSync(OUT_DIR, { recursive: true });
const COUNT = 12;
for (let i = 1; i <= COUNT; i += 1) {
  writeFileSync(join(OUT_DIR, `property-${String(i).padStart(2, "0")}.svg`), buildSvg(i), "utf8");
}
console.log(`generated ${COUNT} placeholder images -> public/images/properties/`);
