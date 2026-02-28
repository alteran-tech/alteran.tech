import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alteran.tech";

/**
 * Generates robots.txt via Next.js metadata API.
 * Allows crawlers on public routes, blocks /admin/* and /api/*.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/sign-in/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
