/**
 * scripts/seed.mjs
 * Seeds the SQLite database with example projects for development.
 * Idempotent — skips projects whose slug already exists.
 */

import { createClient } from "@libsql/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Resolve DATABASE_URL ──────────────────────────────────────────────────────
function getDbUrl() {
  const envFile = resolve(ROOT, ".env.local");
  if (existsSync(envFile)) {
    const content = readFileSync(envFile, "utf8");
    const match = content.match(/^DATABASE_URL=(.+)$/m);
    if (match) return match[1].trim();
  }
  return process.env.DATABASE_URL ?? "file:./alteran.db";
}

const DB_URL = getDbUrl();
const client = createClient({ url: DB_URL });

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_PROJECTS = [
  {
    slug: "alteran-portfolio",
    title: "alteran.tech — Portfolio",
    description:
      "Personal portfolio site built with the aesthetic of the Ancients from Stargate. Features glassmorphism UI, admin panel, GitHub repo import, and AI-generated project descriptions via OpenRouter.",
    content: `## Overview

A portfolio website inspired by the visual language of the Alterans — the ancient civilization from the Stargate universe. The design combines deep space colors, glassmorphism panels, and subtle glow effects to create a distinctive sci-fi aesthetic.

## Key Features

- **Admin Panel** protected by Clerk authentication
- **GitHub Integration** — import projects directly from public repositories
- **AI Generation** — generate project descriptions via OpenRouter LLM with streaming output
- **ISR** — Incremental Static Regeneration for sub-second public page loads
- **SQLite** via @libsql/client with Drizzle ORM for type-safe queries

## Technical Challenges

Implementing streaming LLM responses required building an SSE pipeline from the OpenRouter API through a Next.js Route Handler to the client. The glassmorphism effects required careful tuning of backdrop-filter values to maintain performance across devices.`,
    techStack: JSON.stringify(["Next.js 15", "TypeScript", "Tailwind CSS v4", "Drizzle ORM", "Clerk", "OpenRouter"]),
    category: "web",
    featured: 1,
    sortOrder: 0,
    status: "published",
    source: "manual",
    liveUrl: "https://alteran.tech",
    sourceUrl: "https://github.com/igorgerasimov/alteran.tech",
    githubLanguage: "TypeScript",
    githubStars: 12,
    githubTopics: JSON.stringify(["nextjs", "portfolio", "tailwindcss", "typescript"]),
  },
  {
    slug: "neural-dashboard",
    title: "Neural Dashboard",
    description:
      "Real-time analytics dashboard for monitoring ML model inference metrics. Visualises throughput, latency percentiles, and error rates across distributed inference nodes.",
    content: `## Overview

Neural Dashboard is a real-time monitoring interface for machine learning pipelines. It aggregates telemetry from distributed inference nodes and presents it as actionable operational intelligence.

## Key Features

- **WebSocket streams** for live metric ingestion (< 100ms latency)
- **Time-series visualisation** with configurable rolling windows (1m / 5m / 1h / 24h)
- **Alert rules engine** — threshold-based alerts with Slack/webhook delivery
- **Multi-model support** — track multiple model versions side by side
- **Export** — Prometheus-compatible metrics endpoint

## Architecture

The backend is a Rust service that aggregates StatsD UDP packets and exposes them over WebSocket. The frontend subscribes on mount and reconciles incoming deltas into a client-side time-series store, keeping the DOM update budget under 16ms.`,
    techStack: JSON.stringify(["React", "Rust", "WebSocket", "D3.js", "PostgreSQL", "Docker"]),
    category: "web",
    featured: 1,
    sortOrder: 1,
    status: "published",
    source: "manual",
    liveUrl: null,
    sourceUrl: "https://github.com/igorgerasimov/neural-dashboard",
    githubLanguage: "Rust",
    githubStars: 47,
    githubTopics: JSON.stringify(["rust", "websocket", "monitoring", "machine-learning"]),
  },
  {
    slug: "codex-cli",
    title: "Codex CLI",
    description:
      "Command-line tool that generates boilerplate code from annotated schemas. Supports TypeScript, Go, and Rust targets with customisable templates.",
    content: `## Overview

Codex CLI bridges the gap between schema definitions and implementation. You define your data model once in a dialect-agnostic YAML schema, and Codex generates fully-typed boilerplate for your target language.

## Supported Targets

- **TypeScript** — Zod schemas + inferred types + fetch client
- **Go** — struct definitions + JSON tags + validation helpers
- **Rust** — serde-annotated structs + builder pattern

## Usage

\`\`\`bash
codex generate --schema api.yaml --target typescript --out ./src/generated
\`\`\`

## Technical Highlights

Plugin architecture allows community-contributed targets. Each plugin is a WASM module loaded at runtime, making the CLI itself language-agnostic for plugin authors.`,
    techStack: JSON.stringify(["Go", "WASM", "YAML", "TypeScript", "Rust"]),
    category: "tool",
    featured: 0,
    sortOrder: 2,
    status: "published",
    source: "github",
    liveUrl: null,
    sourceUrl: "https://github.com/igorgerasimov/codex-cli",
    githubOwner: "igorgerasimov",
    githubRepo: "codex-cli",
    githubLanguage: "Go",
    githubStars: 89,
    githubTopics: JSON.stringify(["cli", "codegen", "go", "wasm", "developer-tools"]),
  },
  {
    slug: "vector-gateway",
    title: "Vector Gateway",
    description:
      "HTTP gateway that proxies requests to multiple vector database backends (Qdrant, Weaviate, Pinecone) behind a unified API. Built for multi-tenant RAG pipelines.",
    content: `## Overview

Vector Gateway provides a single consistent API surface over heterogeneous vector database deployments. Teams can switch backends, run A/B experiments between engines, or spread load across providers without changing application code.

## Features

- **Unified API** — one endpoint regardless of backend (Qdrant / Weaviate / Pinecone)
- **Tenant isolation** — per-tenant namespace routing with JWT-scoped access
- **Query rewriting** — normalise filter syntax across backends
- **Observability** — OpenTelemetry traces + structured JSON logs
- **Hot reload** — update routing config without restarts

## Performance

Benchmarks against direct Qdrant access show < 2ms overhead at p99 for 768-dim vectors with a 10k collection.`,
    techStack: JSON.stringify(["Go", "Qdrant", "gRPC", "OpenTelemetry", "Docker", "Kubernetes"]),
    category: "api",
    featured: 1,
    sortOrder: 3,
    status: "published",
    source: "github",
    liveUrl: null,
    sourceUrl: "https://github.com/igorgerasimov/vector-gateway",
    githubOwner: "igorgerasimov",
    githubRepo: "vector-gateway",
    githubLanguage: "Go",
    githubStars: 134,
    githubTopics: JSON.stringify(["vector-database", "gateway", "rag", "go", "grpc"]),
  },
  {
    slug: "shelf",
    title: "Shelf",
    description:
      "Self-hosted read-it-later app with full-text search, AI summaries, and a browser extension. Designed for researchers and knowledge workers.",
    content: `## Overview

Shelf is a self-hosted bookmarking and reading tool that respects your data. Everything lives in a SQLite database you own, and the optional AI layer summarises long-form content so you can triage your reading queue efficiently.

## Features

- **Browser extension** (Chrome / Firefox) — one-click save with auto-extracted metadata
- **Full-text search** — FTS5-powered with phrase matching and BM25 ranking
- **AI summaries** — optional summarisation via local Ollama or cloud LLM
- **Tags & collections** — flexible organisation with nested collections
- **RSS ingestion** — subscribe to feeds and auto-archive matching articles
- **Export** — Markdown / JSON / Pocket-compatible format

## Self-hosting

Single Docker image, mounts a SQLite file. No external database required. Runs on a \$5 VPS or a Raspberry Pi 4.`,
    techStack: JSON.stringify(["Next.js", "SQLite", "FTS5", "TypeScript", "Ollama", "Docker"]),
    category: "web",
    featured: 0,
    sortOrder: 4,
    status: "published",
    source: "generated",
    liveUrl: "https://shelf.demo.alteran.tech",
    sourceUrl: "https://github.com/igorgerasimov/shelf",
    githubLanguage: "TypeScript",
    githubStars: 211,
    githubTopics: JSON.stringify(["read-it-later", "self-hosted", "sqlite", "nextjs", "ai"]),
  },
];

// ── Insert ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\n  Seeding database: ${DB_URL}\n`);

  // Ensure table exists (in case push hasn't run yet)
  await client.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      image_url TEXT,
      live_url TEXT,
      source_url TEXT,
      github_owner TEXT,
      github_repo TEXT,
      github_stars INTEGER DEFAULT 0,
      github_language TEXT,
      github_topics TEXT,
      tech_stack TEXT,
      category TEXT,
      featured INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  let inserted = 0;
  let skipped = 0;

  for (const project of SEED_PROJECTS) {
    const existing = await client.execute({
      sql: "SELECT id FROM projects WHERE slug = ?",
      args: [project.slug],
    });

    if (existing.rows.length > 0) {
      console.log(`  ⊘  skip   ${project.slug}`);
      skipped++;
      continue;
    }

    await client.execute({
      sql: `INSERT INTO projects
              (slug, title, description, content, live_url, source_url,
               github_owner, github_repo, github_stars, github_language, github_topics,
               tech_stack, category, featured, sort_order, status, source)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        project.slug,
        project.title,
        project.description ?? null,
        project.content ?? null,
        project.liveUrl ?? null,
        project.sourceUrl ?? null,
        project.githubOwner ?? null,
        project.githubRepo ?? null,
        project.githubStars ?? 0,
        project.githubLanguage ?? null,
        project.githubTopics ?? null,
        project.techStack ?? null,
        project.category ?? null,
        project.featured ?? 0,
        project.sortOrder ?? 0,
        project.status,
        project.source,
      ],
    });

    console.log(`  ✓  insert  ${project.slug}`);
    inserted++;
  }

  console.log(`\n  Done — ${inserted} inserted, ${skipped} skipped\n`);
  await client.close();
}

seed().catch((err) => {
  console.error("\n  Seed failed:", err.message);
  process.exit(1);
});
