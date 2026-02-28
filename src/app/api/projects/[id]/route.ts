import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]
 * Public endpoint: returns a single project by ID.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Protected endpoint: updates a project. Requires authentication.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Regenerate slug if title changed
    let slug = existing.slug;
    if (body.title && body.title.trim() !== existing.title) {
      const baseSlug = slugify(body.title.trim()) || `project-${Date.now()}`;
      slug = baseSlug;
      let counter = 0;
      for (;;) {
        const dup = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.slug, slug))
          .limit(1);
        if (dup.length === 0 || dup[0]?.id === projectId) break;
        counter++;
        slug = `${baseSlug}-${counter}`;
      }
    }

    const now = new Date().toISOString();

    const [updated] = await db
      .update(projects)
      .set({
        slug,
        title: body.title?.trim() ?? existing.title,
        description: body.description !== undefined ? (body.description?.trim() || null) : existing.description,
        content: body.content !== undefined ? (body.content?.trim() || null) : existing.content,
        imageUrl: body.imageUrl !== undefined ? (body.imageUrl || null) : existing.imageUrl,
        liveUrl: body.liveUrl !== undefined ? (body.liveUrl || null) : existing.liveUrl,
        sourceUrl: body.sourceUrl !== undefined ? (body.sourceUrl || null) : existing.sourceUrl,
        techStack: body.techStack !== undefined ? body.techStack : existing.techStack,
        category: body.category !== undefined ? (body.category || null) : existing.category,
        featured: body.featured !== undefined ? body.featured : existing.featured,
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : existing.sortOrder,
        status: body.status ?? existing.status,
        source: body.source ?? existing.source,
        updatedAt: now,
      })
      .where(eq(projects.id, projectId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Protected endpoint: deletes a project. Requires authentication.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
