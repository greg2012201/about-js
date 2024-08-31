import { BASE_URL } from "@/config";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/", "/opengraph-image"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
