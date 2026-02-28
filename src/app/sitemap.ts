import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alteran.tech";

/**
 * Dynamic sitemap generated via Next.js metadata API.
 * Includes static routes and all published project pages.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic project routes
  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    if (process.env.TURSO_DATABASE_URL) {
      const publishedProjects = await db
        .select({
          slug: projects.slug,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .where(eq(projects.status, "published"));

      projectRoutes = publishedProjects.map((project) => ({
        url: `${siteUrl}/projects/${project.slug}`,
        lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // DB not available at build time -- return static routes only
  }

  return [...staticRoutes, ...projectRoutes];
}
