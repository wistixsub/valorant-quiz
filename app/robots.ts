import type { MetadataRoute } from "next";

const APP_URL = "https://valorant-quiz-eight.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dev/", "/api/"], // 開発用エディタ・APIはインデックス不要
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
