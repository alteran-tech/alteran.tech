import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// projects -- main portfolio projects table
// ---------------------------------------------------------------------------
export const projects = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    content: text("content"), // markdown
    imageUrl: text("image_url"),
    liveUrl: text("live_url"),
    sourceUrl: text("source_url"),

    // GitHub-specific fields
    githubOwner: text("github_owner"),
    githubRepo: text("github_repo"),
    githubStars: integer("github_stars").default(0),
    githubLanguage: text("github_language"),
    githubTopics: text("github_topics"), // JSON string array
    techStack: text("tech_stack"), // JSON string array

    category: text("category"),
    featured: integer("featured").default(0), // boolean 0/1 for SQLite
    sortOrder: integer("sort_order").default(0),
    status: text("status").default("draft").notNull(), // "draft" | "published"
    source: text("source").default("manual").notNull(), // "github" | "manual" | "generated"

    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [uniqueIndex("projects_slug_unique").on(table.slug)]
);

// ---------------------------------------------------------------------------
// site_settings -- key-value pairs (title, bio, socials, etc.)
// ---------------------------------------------------------------------------
export const siteSettings = sqliteTable(
  "site_settings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [uniqueIndex("site_settings_key_unique").on(table.key)]
);

// ---------------------------------------------------------------------------
// github_cache -- cache for GitHub API responses (TTL-based)
// ---------------------------------------------------------------------------
export const githubCache = sqliteTable(
  "github_cache",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cacheKey: text("cache_key").notNull(),
    data: text("data").notNull(), // JSON string
    expiresAt: integer("expires_at").notNull(), // unix timestamp
    createdAt: text("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
  },
  (table) => [uniqueIndex("github_cache_cache_key_unique").on(table.cacheKey)]
);
