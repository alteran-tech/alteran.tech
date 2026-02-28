import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";

/**
 * GET /api/projects
 * Public endpoint: returns published projects for ISR/public consumption.
 */
export async function GET() {
  try {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(desc(projects.featured), projects.sortOrder, desc(projects.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Protected endpoint: creates a new project. Requires authentication.
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = slugify(body.title) || `project-${Date.now()}`;
    let slug = baseSlug;
    let counter = 0;
    for (;;) {
      const existing = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.slug, slug))
        .limit(1);
      if (existing.length === 0) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const now = new Date().toISOString();

    const [created] = await db
      .insert(projects)
      .values({
        slug,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        content: body.content?.trim() || null,
        imageUrl: body.imageUrl || null,
        liveUrl: body.liveUrl || null,
        sourceUrl: body.sourceUrl || null,
        techStack: body.techStack || null,
        category: body.category || null,
        featured: body.featured ?? 0,
        sortOrder: body.sortOrder ?? 0,
        status: body.status ?? "draft",
        source: body.source ?? "manual",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
