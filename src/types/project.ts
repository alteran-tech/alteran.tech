import type { projects } from "@/lib/db/schema";

/** Row selected from the projects table */
export type Project = typeof projects.$inferSelect;

/** Data for inserting a new project */
export type ProjectInsert = typeof projects.$inferInsert;

/** Project publication status */
export type ProjectStatus = "draft" | "published";

/** How the project was created */
export type ProjectSource = "github" | "manual" | "generated";
