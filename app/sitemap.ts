import type { MetadataRoute } from "next";
import { MAPS } from "@/data/maps";

const APP_URL = "https://valorant-quiz-eight.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${APP_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/guide/tachimawari`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/quiz`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...MAPS.map((m) => ({
      url: `${APP_URL}/quiz?map=${m.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
