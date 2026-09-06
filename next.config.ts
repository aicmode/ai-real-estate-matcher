import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * 物件写真は public/images/properties の圧縮済み WebP。
     * 既存の自前 SVG を fallback として保持。外部 SVG は扱わない。
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
