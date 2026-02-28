"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import type { Project, ProjectInsert } from "@/types/project";

// ---------------------------------------------------------------------------
// Types for action results
// ---------------------------------------------------------------------------

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Helper: generate unique slug
// ---------------------------------------------------------------------------

async function generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
  const base = slugify(title);
  if (!base) {
    return `project-${Date.now()}`;
  }

  const slug = base;
  let counter = 0;

  for (;;) {
    const candidateSlug = counter === 0 ? slug : `${slug}-${counter}`;
    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, candidateSlug))
      .limit(1);

    if (existing.length === 0 || (excludeId && existing[0]?.id === excludeId)) {
      return candidateSlug;
    }
    counter++;
  }
}

// ---------------------------------------------------------------------------
// Helper: revalidate related paths
// ---------------------------------------------------------------------------

function revalidateProjectPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) {
    revalidatePath(`/projects/${slug}`);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
}

// ---------------------------------------------------------------------------
// createProject
// ---------------------------------------------------------------------------

export async function createProject(
  data: Omit<ProjectInsert, "id" | "slug" | "createdAt" | "updatedAt">
): Promise<ActionResult<Project>> {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "Title is required" };
    }

    const slug = await generateUniqueSlug(data.title);
    const now = new Date().toISOString();

    const [created] = await db
      .insert(projects)
      .values({
        ...data,
        slug,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        content: data.content?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    revalidateProjectPaths(slug);

    return { success: true, data: created };
  } catch (error) {
    console.error("createProject error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

// ---------------------------------------------------------------------------
// updateProject
// ---------------------------------------------------------------------------

export async function updateProject(
  id: number,
  data: Partial<Omit<ProjectInsert, "id" | "createdAt">>
): Promise<ActionResult<Project>> {
  try {
    // Check project exists
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) {
      return { success: false, error: "Project not found" };
    }

    // Regenerate slug if title changed
    let slug = existing.slug;
    if (data.title && data.title.trim() !== existing.title) {
      slug = await generateUniqueSlug(data.title.trim(), id);
    }

    const now = new Date().toISOString();

    const [updated] = await db
      .update(projects)
      .set({
        ...data,
        slug,
        title: data.title?.trim() ?? existing.title,
        updatedAt: now,
      })
      .where(eq(projects.id, id))
      .returning();

    // Revalidate old and new slugs
    revalidateProjectPaths(existing.slug);
    if (slug !== existing.slug) {
      revalidateProjectPaths(slug);
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("updateProject error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteProject
// ---------------------------------------------------------------------------

export async function deleteProject(id: number): Promise<ActionResult> {
  try {
    const [existing] = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) {
      return { success: false, error: "Project not found" };
    }

    await db.delete(projects).where(eq(projects.id, id));

    revalidateProjectPaths(existing.slug);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("deleteProject error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete project",
    };
  }
}

// ---------------------------------------------------------------------------
// toggleProjectStatus
// ---------------------------------------------------------------------------

export async function toggleProjectStatus(id: number): Promise<ActionResult<Project>> {
  try {
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) {
      return { success: false, error: "Project not found" };
    }

    const newStatus = existing.status === "published" ? "draft" : "published";
    const now = new Date().toISOString();

    const [updated] = await db
      .update(projects)
      .set({ status: newStatus, updatedAt: now })
      .where(eq(projects.id, id))
      .returning();

    revalidateProjectPaths(existing.slug);

    return { success: true, data: updated };
  } catch (error) {
    console.error("toggleProjectStatus error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle project status",
    };
  }
}

// ---------------------------------------------------------------------------
// getProjects
// ---------------------------------------------------------------------------

export async function getProjects(filters?: {
  status?: string;
  featured?: boolean;
}): Promise<Project[]> {
  try {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(projects.status, filters.status));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(projects.featured, filters.featured ? 1 : 0));
    }

    const query = db.select().from(projects);

    const result =
      conditions.length > 0
        ? await query
            .where(and(...conditions))
            .orderBy(desc(projects.featured), projects.sortOrder, desc(projects.createdAt))
        : await query.orderBy(
            desc(projects.featured),
            projects.sortOrder,
            desc(projects.createdAt)
          );

    return result;
  } catch (error) {
    console.error("getProjects error:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// getProjectById
// ---------------------------------------------------------------------------

export async function getProjectById(id: number): Promise<Project | null> {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    return project ?? null;
  } catch (error) {
    console.error("getProjectById error:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// getProjectBySlug
// ---------------------------------------------------------------------------

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    return project ?? null;
  } catch (error) {
    console.error("getProjectBySlug error:", error);
    return null;
  }
}
