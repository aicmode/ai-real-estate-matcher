import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * 物件画像はリポジトリ内で生成した自前の SVG (public/images/properties) のみを扱う。
     * 外部入力の SVG は読み込まないため、CSP を併記したうえで SVG 配信を許可する。
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
