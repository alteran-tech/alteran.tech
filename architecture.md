# alteran.tech — Architecture

> **alteran.tech** — корпоративный сайт-портфолио компании Alteran. Showcases company projects, tech expertise, and services. Built with Next.js 15 App Router, custom auth, Turso DB, and AI-powered content generation.

## Tech Stack

| Category | Choice | Details |
|----------|--------|---------|
| Framework | **Next.js 15** | App Router, Server Components, ISR |
| Language | **TypeScript** | Strict mode enabled |
| Styling | **Tailwind CSS v4** | CSS-native `@theme` for design tokens |
| Theming | **next-themes** | Dark/light theme via `data-theme` attribute, localStorage persistence |
| Fonts | **Inter** (body) + **Alteran** (decorative) | next/font for optimization |
| Utilities | **clsx** + **tailwind-merge** | `cn()` helper for class merging |
| Linting | **ESLint** | eslint-config-next, flat config format |
| Build | **PostCSS** | @tailwindcss/postcss plugin |
| Deployment | **Vercel** (planned) | Native Next.js integration |
| Database | **Turso** + **Drizzle ORM** | Serverless libSQL, `drizzle-orm` + `@libsql/client` |
| Auth | **Custom (Web Crypto API)** | HMAC-SHA256 signed session cookie, no external service |
| Storage | **public/uploads/** | Image uploads saved to filesystem, served as static files |
| GitHub API | GraphQL + Turso cache | Project import from GitHub repos |
| LLM | **OpenRouter** (streaming) | AI-generated project descriptions via SSE |

## Project Structure

```
alteran.tech/
├── public/
│   └── fonts/
│       └── alteran.ttf                          # Decorative Alteran font
├── src/
│   ├── app/
│   │   ├── globals.css                          # Tailwind v4 @theme + design system keyframes + Clerk layer
│   │   ├── layout.tsx                           # Root layout: ClerkProvider, fonts, metadata, viewport
│   │   ├── page.tsx                             # Public home page (hero, about, projects, contact)
│   │   ├── admin/
│   │   │   ├── layout.tsx                        # Protected admin layout (auth check + sidebar)
│   │   │   ├── page.tsx                          # Admin dashboard (stats overview)
│   │   │   └── projects/
│   │   │       ├── page.tsx                      # Projects list (table, actions, empty state)
│   │   │       ├── project-actions.tsx           # Client: Edit/Toggle/Delete with confirm modal
│   │   │       ├── new/
│   │   │       │   └── page.tsx                  # New project form (3 tabs: Manual, GitHub, AI)
│   │   │       └── [id]/
│   │   │           └── edit/
│   │   │               ├── page.tsx              # Edit project (Server Component wrapper)
│   │   │               └── edit-form.tsx          # Client: pre-populated edit form
│   │   ├── api/
│   │   │   ├── upload/
│   │   │   │   └── route.ts                  # POST (auth): image upload to public/uploads/
│   │   │   ├── uploads/
│   │   │   │   └── [filename]/
│   │   │   │       └── route.ts              # GET (public): serves uploaded images from public/uploads/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts                  # POST: password check, sets admin_session cookie
│   │   │   │   └── logout/
│   │   │   │       └── route.ts                  # POST: clears admin_session cookie
│   │   │   ├── generate/
│   │   │   │   └── route.ts                      # POST (auth): OpenRouter LLM streaming generation
│   │   │   ├── github/
│   │   │   │   └── repo/
│   │   │   │       └── route.ts                  # POST (auth): fetch GitHub repo data
│   │   │   ├── projects/
│   │   │   │   ├── route.ts                      # GET (public) + POST (auth) for projects
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts                  # GET + PUT (auth) + DELETE (auth) per project
│   │   │   └── revalidate/
│   │   │       └── route.ts                      # POST (auth): ISR revalidation trigger
│   │   ├── not-found.tsx                        # Custom 404 page (Alteran themed)
│   │   ├── robots.ts                            # robots.txt via Next.js metadata API
│   │   ├── sitemap.ts                           # Dynamic sitemap (static + published projects)
│   │   ├── manifest.ts                          # PWA Web App Manifest
│   │   ├── projects/
│   │   │   └── [slug]/
│   │   │       └── page.tsx                     # Project detail page (SSG + ISR, generateMetadata)
│   │   ├── sign-in/[[...sign-in]]/page.tsx      # Sign-in page: password form, posts to /api/auth/login
│   │   └── favicon.ico                          # Site favicon
│   ├── components/
│   │   ├── layout/
│   │   │   ├── admin-sidebar.tsx                 # Admin sidebar nav (Dashboard, Projects, Settings)
│   │   │   ├── header.tsx                        # Sticky site header (Client, glassmorphism, mobile menu)
│   │   │   └── footer.tsx                        # Site footer (social links, copyright, decorative text)
│   │   ├── ui/
│   │   │   ├── index.ts                         # Barrel exports for UI components
│   │   │   ├── glass-panel.tsx                  # Glassmorphism container (3 variants)
│   │   │   ├── glow-button.tsx                  # Button with glow effects (3 variants)
│   │   │   ├── input.tsx                        # Input + Textarea with glass styling
│   │   │   ├── ancient-text.tsx                 # Decorative Alteran font text
│   │   │   ├── shimmer-border.tsx               # Animated shimmer border effect
│   │   │   ├── theme-toggle.tsx                 # Dark/light theme toggle button (sun/moon icons)
│   │   └── image-upload.tsx                 # Image upload: file picker + drag-and-drop + Vercel Blob + URL fallback
│   │   ├── project/
│   │   │   ├── index.ts                         # Barrel exports for project components
│   │   │   ├── project-card.tsx                 # Project card for public pages
│   │   │   ├── github-import.tsx                # GitHub repo import UI (Client Component)
│   │   │   └── text-generator.tsx               # AI text generation with streaming UI (Client Component)
│   │   ├── sections/
│   │   │   ├── hero.tsx                         # Full-screen hero section (Stargate ring, parallax)
│   │   │   ├── about.tsx                        # About section (bio, tech stack grid)
│   │   │   ├── projects-grid.tsx                # Projects grid (from DB, scroll-reveal)
│   │   │   └── contact.tsx                      # Contact section (social links, shimmer border)
│   │   └── effects/
│   │       ├── index.ts                         # Barrel exports for effects
│   │       ├── stargate-ring.tsx                # SVG Stargate ring with rotating glyphs
│   │       ├── particle-field.tsx               # CSS-only floating particles
│   │       ├── chevron-divider.tsx              # SVG chevron section divider
│   │       ├── scroll-reveal.tsx                # Scroll-triggered fade+slide animation (Client)
│   │       └── hero-parallax.tsx                # Parallax scroll wrapper for Hero (Client)
│   ├── hooks/
│   │   └── use-intersection.ts                  # IntersectionObserver hook (visibility detection)
│   ├── lib/
│   │   ├── actions/
│   │   │   └── projects.ts                      # Server Actions: CRUD + getProjects/ById/BySlug
│   │   ├── db/
│   │   │   ├── index.ts                         # Turso client + Drizzle ORM instance (singleton)
│   │   │   └── schema.ts                        # Drizzle schema: projects, site_settings, github_cache
│   │   ├── github.ts                            # GitHub GraphQL client + Turso caching
│   │   ├── openrouter.ts                        # OpenRouter streaming LLM client + output parser
│   │   └── utils.ts                             # cn() class merger + slugify()
│   ├── types/
│   │   ├── project.ts                           # Project, ProjectInsert, ProjectStatus, ProjectSource
│   │   ├── github.ts                            # GitHub API types (GraphQL response, import data)
│   │   └── openrouter.ts                        # OpenRouter API types (messages, requests, streaming chunks)
│   └── middleware.ts                             # Clerk auth middleware (protects /admin/*)
├── drizzle/                                     # Generated SQL migrations (drizzle-kit)
│   ├── 0000_rich_devos.sql                      # Initial migration: 3 tables
│   └── meta/                                    # Migration metadata (journal, snapshots)
├── drizzle.config.ts                            # Drizzle Kit config (dialect: turso)
├── .env.local.example                           # Environment variable template (9 vars)
├── .gitignore                                   # Git ignore rules
├── eslint.config.mjs                            # ESLint flat config
├── next.config.ts                               # Next.js config (compress, security headers, image domains)
├── next-env.d.ts                                # Next.js TypeScript declarations
├── package.json                                 # Dependencies and scripts
├── postcss.config.mjs                           # PostCSS with Tailwind plugin
├── tsconfig.json                                # TypeScript config (strict mode)
└── architecture.md                              # This file
```

## File Descriptions

### [src/app/globals.css](src/app/globals.css)
Tailwind CSS v4 configuration using `@theme` directive. Defines:
- **Clerk CSS layer**: `@layer clerk` for Tailwind v4 compatibility (allows Tailwind utilities to override Clerk defaults)
- **Alteran color palette**: `--color-ancient-bg` (#050510), `--color-ancient-teal` (#71d7b4), `--color-ancient-blue` (#273d8d), `--color-ancient-aqua` (#A7C6ED), and more
- **Font variables**: `--font-sans` (Inter), `--font-alteran` (Alteran decorative)
- **Runtime CSS vars** on `:root`: `--text-base`, `--glass-bg`, `--glass-bg-strong`, `--glass-border`, `--glass-border-strong`, `--glass-border-accent`, `--glow-rgb`, `--header-bg`, `--particle-color-1/2`, `--letter-color-teal/aqua` — dark defaults, overridden by `html[data-theme="light"]`
- **Light (Parchment) theme**: `html[data-theme="light"]` block overrides all runtime vars (bg #f5f0e8, text #1a1400, teal #0e7a5a)
- **Animations**: `glow-pulse`, `fade-in`, `float`, `shimmer-rotate`, `stargate-spin`, `stargate-spin-reverse`, `particle-float-1/2/3`, `alteran-float-1/2/3`, `chevron-glow`
- **Utility classes**: `.glass-panel`, `.glass-panel-strong`, `.glow-text`, `.glow-text-subtle`, `.glow-box`, `.glow-box-subtle`, `.glow-border` — all use `rgba(var(--glow-rgb), α)` for theme-awareness
- **Helper classes**: `.glass-panel-accent-shadow`, `.btn-glow-primary`, `.btn-glow-secondary`, `.btn-glow-ghost`, `.input-focus-glow` — CSS-var-aware shadow/glow effects
- **Accessibility**: `prefers-reduced-motion: reduce` disables all animations and transitions; global `focus-visible` outline in teal
- **Custom scrollbar** and **selection** styling

### [src/app/layout.tsx](src/app/layout.tsx)
Root layout (Server Component). Responsibilities:
- Loads Inter via `next/font/google` with CSS variable `--font-inter`
- Loads Alteran via `next/font/local` with CSS variable `--font-alteran-face`
- Wraps children in `<ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>` (next-themes)
- `<html suppressHydrationWarning>` — prevents hydration mismatch from next-themes injecting `data-theme`
- Exports `metadata` (title template, description, keywords, authors, OG, Twitter card, metadataBase)
- Exports `viewport` (device-width, themeColor: #050510)
- Skip-navigation link (visually hidden, visible on focus, links to `#main-content`)
- Body: `bg-ancient-bg min-h-screen font-sans antialiased` (text color via CSS `var(--text-base)`)

### [src/app/page.tsx](src/app/page.tsx)
Public home page (Server Component with ISR, revalidate=3600). Composes:
- JSON-LD Organization structured data in `<script type="application/ld+json">`
- Header (sticky) -> Hero -> About -> Projects Grid (from DB) -> Contact -> Footer
- `<main id="main-content" role="main">` semantic landmark
- ISR revalidation every hour

### [src/app/sign-in/[[...sign-in]]/page.tsx](src/app/sign-in/[[...sign-in]]/page.tsx)
Clerk sign-in page (Server Component). Features:
- Catch-all route for Clerk's multi-step sign-in flow
- Centered layout with decorative glow backdrop (radial gradient)
- `glass-panel` + `glow-box-subtle` wrapper
- Alteran font decorative header ("alteran" + "Authentication Required")
- `<SignIn>` component with path routing, redirect to `/admin` after sign-in
- Responsive on mobile (max-w-md, px-4)

### [src/app/admin/layout.tsx](src/app/admin/layout.tsx)
Protected admin layout (Server Component). Responsibilities:
- Calls `auth()` from `@clerk/nextjs/server` on every request
- Redirects unauthenticated users to `/sign-in?redirect_url=/admin`
- Renders `AdminSidebar` component
- Content area offset by sidebar width on desktop (`lg:pl-64`)
- Exports `metadata` with title "Admin"

### [src/app/admin/page.tsx](src/app/admin/page.tsx)
Admin dashboard page (Server Component). Features:
- Displays project statistics (total, published, draft, featured counts)
- Fetches all projects via `getProjects()`
- Stat cards in GlassPanel with color-coded accents
- Quick action links to Projects list and New Project

### [src/app/admin/projects/page.tsx](src/app/admin/projects/page.tsx)
Admin projects list page (Server Component). Features:
- Table with columns: Title (+ slug), Status (badge), Source, Stars, Actions
- Status badges: Published (teal), Draft (gray)
- "New Project" button linking to `/admin/projects/new`
- Empty state with Alteran font and CTA
- Responsive: table scrollable on mobile, columns hidden on small screens
- `force-dynamic` rendering

### [src/app/admin/projects/project-actions.tsx](src/app/admin/projects/project-actions.tsx)
Client component for project row actions. Features:
- Edit link to `/admin/projects/[id]/edit`
- Toggle status button (Publish/Unpublish) via `toggleProjectStatus` Server Action
- Delete button with confirmation modal (GlassPanel accent variant)
- Uses `useTransition` for pending state feedback
- Error display for failed operations

### [src/app/admin/projects/new/page.tsx](src/app/admin/projects/new/page.tsx)
New project creation page (Client Component). Features:
- Three-tab UI: Manual, GitHub Import, AI Generate
- **Manual tab**: full form with title, description, content (markdown textarea), techStack (comma-separated), category, liveUrl, sourceUrl, imageUrl, featured checkbox, status select
- **GitHub Import tab**: `GitHubImport` component -- enter GitHub URL, fetch repo data, edit fields, import as project (source: "github")
- **AI Generate tab**: `TextGenerator` component -- enter title + keywords, stream AI-generated content, parse structured output (description, content, techStack), click "Use This Content" to populate Manual form fields and switch to Manual tab
- Client-side validation (title required)
- Submits via `createProject` Server Action
- Redirects to `/admin/projects` on success

### [src/app/admin/projects/\[id\]/edit/page.tsx](src/app/admin/projects/[id]/edit/page.tsx)
Edit project page (Server Component wrapper). Responsibilities:
- Parses `id` from route params (Next.js 15 async params)
- Fetches project via `getProjectById`
- Returns `notFound()` for invalid ID or missing project
- Passes project data to `EditProjectForm` client component

### [src/app/admin/projects/\[id\]/edit/edit-form.tsx](src/app/admin/projects/[id]/edit/edit-form.tsx)
Edit project form (Client Component). Features:
- Pre-populated fields from existing project data
- Parses techStack from JSON string to comma-separated display
- Same field layout as new project form (title, description, content, techStack, category, URLs, featured, status)
- Displays read-only metadata (source, created/updated dates)
- Submits via `updateProject` Server Action
- Redirects to `/admin/projects` on success

### [src/app/api/projects/route.ts](src/app/api/projects/route.ts)
Projects API route handler. Endpoints:
- `GET /api/projects` -- public, returns published projects sorted by featured/sortOrder/date
- `POST /api/projects` -- auth required, creates a new project with auto-generated unique slug

### [src/app/api/projects/\[id\]/route.ts](src/app/api/projects/[id]/route.ts)
Single project API route handler. Endpoints:
- `GET /api/projects/[id]` -- public, returns project by ID
- `PUT /api/projects/[id]` -- auth required, updates project fields with slug regeneration on title change
- `DELETE /api/projects/[id]` -- auth required, deletes project by ID

### [src/app/api/revalidate/route.ts](src/app/api/revalidate/route.ts)
ISR revalidation API endpoint. Endpoints:
- `POST /api/revalidate` -- auth required, accepts `{ path: string }` and calls `revalidatePath()`

### [src/app/api/github/repo/route.ts](src/app/api/github/repo/route.ts)
GitHub repository data API endpoint. Endpoints:
- `POST /api/github/repo` -- auth required, accepts `{ url: string }` or `{ owner: string, repo: string }`
- Parses GitHub URL, fetches repo data via `getCachedGitHubRepo` (with 1-hour Turso caching)
- Maps response to `GitHubImportData` via `mapRepoToProject`
- Returns mapped project fields + `_raw` preview data (stars, language, topics, languages, OG image)
- Error codes: 400 (invalid URL), 401 (unauthorized), 404 (repo not found), 429 (rate limit), 500 (server error)

### [src/app/api/generate/route.ts](src/app/api/generate/route.ts)
OpenRouter LLM streaming endpoint. Endpoints:
- `POST /api/generate` -- auth required, accepts `{ title: string, keywords: string, context?: string }`, returns SSE stream
- Auth check via Clerk `auth()`
- Returns 503 with clear message if `OPENROUTER_API_KEY` is not configured
- Streams SSE `data:` lines with `{ text: string }` chunks and `data: [DONE]` terminator
- Passes `request.signal` to `generateProjectContent` for client-side abort support
- Content-Type: `text/event-stream` with `no-cache` headers

### [src/components/layout/admin-sidebar.tsx](src/components/layout/admin-sidebar.tsx)
Admin sidebar navigation (Client Component). Features:
- Navigation items: Dashboard, Projects, Settings (with SVG icons, `aria-hidden="true"`)
- Active link highlighting with teal glow and `aria-current="page"`
- `aria-label="Admin navigation"` on nav element
- Clerk `UserButton` for auth management
- "Back to Site" link
- Responsive: hamburger toggle on mobile, fixed sidebar on desktop (`w-64`)
- Focus-visible rings on all interactive elements
- GlassPanel dark variant background

### [src/lib/actions/settings.ts](src/lib/actions/settings.ts)
Server Actions for `siteSettings` key-value store (`"use server"`). Exports:
- `getSetting(key)` — fetch a single setting value by key
- `getSettings(keys)` — fetch multiple settings, returns `Record<string, string>`
- `saveContactSettings(data)` — upsert `contact_github` and `contact_email` keys, revalidates `/` and `/admin/settings`

### [src/app/admin/settings/page.tsx](src/app/admin/settings/page.tsx)
Admin settings page (Server Component, `force-dynamic`). Features:
- Reads `contact_github` and `contact_email` from `siteSettings` via `getSettings()`
- Falls back to hardcoded defaults if keys not yet set
- Renders `SettingsForm` with current values

### [src/app/admin/settings/settings-form.tsx](src/app/admin/settings/settings-form.tsx)
Settings form (Client Component). Features:
- Input fields: GitHub URL, Email
- Submits via `saveContactSettings` Server Action using `useTransition`
- Success/error feedback inline

### [src/lib/actions/projects.ts](src/lib/actions/projects.ts)
Server Actions for project CRUD operations (`"use server"`). Exports:
- `ActionResult<T>` -- discriminated union type for action results
- `createProject(data)` -- creates project with unique slug, revalidates paths
- `updateProject(id, data)` -- updates project, regenerates slug on title change
- `deleteProject(id)` -- deletes project, revalidates paths
- `toggleProjectStatus(id)` -- toggles between "draft" and "published"
- `getProjects(filters?)` -- fetches projects with optional status/featured filters, ordered by featured/sortOrder/date
- `getProjectById(id)` -- fetches single project by ID
- `getProjectBySlug(slug)` -- fetches single project by slug
- Helper: `generateUniqueSlug(title, excludeId?)` -- increments suffix to avoid duplicates
- Helper: `revalidateProjectPaths(slug?)` -- revalidates `/`, `/projects`, `/projects/[slug]`, `/admin`, `/admin/projects`

### [src/lib/auth.ts](src/lib/auth.ts)
Self-hosted session auth using Web Crypto API (Edge + Node.js compatible). Exports:
- `createSessionToken()` — creates HMAC-SHA256 signed token with 7-day expiry (`{exp}` payload, base64 encoded)
- `verifySessionToken(token)` — verifies HMAC signature and expiry
- `isAuthenticated(request)` — reads `admin_session` cookie from `NextRequest`, returns boolean (for middleware + API routes)
- `isAuthenticatedServer()` — reads `admin_session` cookie via `next/headers` cookies(), returns boolean (for Server Components)
- `SESSION_COOKIE = "admin_session"` — cookie name constant

### [src/middleware.ts](src/middleware.ts)
Custom auth middleware (no external dependencies). Responsibilities:
- Matches `/admin(.*)` with regex, calls `isAuthenticated(request)` from `src/lib/auth.ts`
- Redirects unauthenticated users to `/sign-in?redirect_url=<path>`
- All other routes: pass through
- Config matcher skips Next.js internals, static files, and always runs for API/TRPC routes

### [src/lib/db/index.ts](src/lib/db/index.ts)
Turso database client and Drizzle ORM instance. Features:
- Creates `@libsql/client` with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` env vars
- Singleton pattern via `globalThis` to prevent multiple clients during HMR in development
- Exports `db` -- Drizzle ORM instance with schema type inference

### [src/lib/db/schema.ts](src/lib/db/schema.ts)
Drizzle ORM schema definition (SQLite/Turso). Tables:
- `projects` (21 columns): portfolio projects with slug (unique), title, description, content (markdown), imageUrl, liveUrl, sourceUrl, GitHub fields (owner, repo, stars, language, topics), techStack (JSON), category, featured (int 0/1), sortOrder, status (draft/published), source (github/manual/generated), timestamps
- `siteSettings` (4 columns): key-value pairs with unique key, value, updatedAt
- `githubCache` (5 columns): API cache with unique cacheKey, data (JSON), expiresAt (unix timestamp), createdAt

### [src/types/project.ts](src/types/project.ts)
TypeScript types inferred from Drizzle schema:
- `Project` -- `typeof projects.$inferSelect`
- `ProjectInsert` -- `typeof projects.$inferInsert`
- `ProjectStatus` -- `"draft" | "published"`
- `ProjectSource` -- `"github" | "manual" | "generated"`

### [src/types/github.ts](src/types/github.ts)
TypeScript types for GitHub API integration:
- `GitHubRepoRaw` -- raw GraphQL response shape for a repository
- `GitHubGraphQLResponse` -- full GraphQL response envelope (data + errors)
- `GitHubRepo` -- normalised repository data (name, description, stars, language, topics, languages, readme, etc.)
- `GitHubImportData` -- project-compatible fields ready for `createProject` (title, description, URLs, GitHub fields, source: "github")
- `GitHubUrlParts` -- `{ owner: string, repo: string }` from URL parsing
- Helper interfaces: `GitHubLanguage`, `GitHubTopicNode`, `GitHubLanguageNode`

### [src/types/openrouter.ts](src/types/openrouter.ts)
TypeScript types for OpenRouter API integration:
- `OpenRouterRole` -- `"system" | "user" | "assistant"`
- `OpenRouterMessage` -- chat message with role and content
- `OpenRouterRequest` -- request body (model, messages, stream, temperature, max_tokens)
- `OpenRouterStreamChunk` -- SSE stream chunk with delta content
- `OpenRouterError` -- error response shape
- `GenerateInput` -- input for generation: `{ title, keywords, context? }`
- `GenerateResult` -- parsed output: `{ description, content, techStack[] }`

### [drizzle.config.ts](drizzle.config.ts)
Drizzle Kit configuration:
- `dialect`: `"sqlite"`
- `schema`: `"./src/lib/db/schema.ts"`
- `out`: `"./drizzle"` (migration output directory)
- `dbCredentials`: reads `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` from env

### [next.config.ts](next.config.ts)
Next.js configuration:
- `outputFileTracingRoot`: resolves multiple lockfile warnings
- `compress`: true (gzip compression)
- `poweredByHeader`: false (removes X-Powered-By header)
- `images.remotePatterns`: GitHub domains (opengraph.githubassets.com, repository-images.githubusercontent.com, avatars.githubusercontent.com, github.com)
- Security headers via `headers()`: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (camera/microphone/geolocation denied), X-DNS-Prefetch-Control (on)

### [src/lib/openrouter.ts](src/lib/openrouter.ts)
OpenRouter streaming LLM client (server-only). Exports:
- `generateProjectContent(input, signal?)` -- creates a `ReadableStream<Uint8Array>` that streams SSE from OpenRouter
  - Uses `OPENROUTER_API_KEY` from server env (never exposed to client)
  - Sends `HTTP-Referer` header with `NEXT_PUBLIC_SITE_URL`
  - Default model: `anthropic/claude-sonnet-4`, fallback: `google/gemini-flash-1.5` (on 404/503)
  - System prompt instructs LLM to output structured format: `---SHORT_DESCRIPTION---`, `---DETAILED_CONTENT---`, `---TECH_STACK---`
  - Parses OpenRouter SSE stream and re-emits as simplified `data: {"text":"..."}` lines
  - Error handling: 401 (bad key), 429 (rate limit), network errors, AbortSignal cancellation
- `parseGenerateOutput(raw)` -- parses structured LLM output into `{ description, content, techStack[] }`

### [src/lib/github.ts](src/lib/github.ts)
GitHub GraphQL API client with Turso caching. Exports:
- `GitHubApiError` -- error class with statusCode property
- `parseGitHubUrl(url)` -- parses "https://github.com/owner/repo" into `{ owner, repo }`
- `fetchGitHubRepo(owner, repo)` -- sends GraphQL query to GitHub API, returns `GitHubRepo`
- `getCachedGitHubRepo(owner, repo)` -- checks Turso `github_cache` table (TTL 1 hour), falls back to API
- `invalidateGitHubCache(owner, repo)` -- deletes cache entry for a specific repo
- `mapRepoToProject(data, owner, repo)` -- maps `GitHubRepo` to `GitHubImportData` (project-compatible fields)
- GraphQL query fetches: name, description, url, homepageUrl, stargazerCount, primaryLanguage, repositoryTopics, openGraphImageUrl, languages, README content
- Uses `GITHUB_TOKEN` env var (server-only); falls back to unauthenticated for public repos
- Cache key format: `github:owner/repo` (lowercase)

### [src/lib/utils.ts](src/lib/utils.ts)
Shared utility functions:
- `cn(...inputs: ClassValue[]): string` -- combines class names via clsx, resolves Tailwind conflicts via twMerge
- `slugify(text: string): string` -- generates URL-safe slugs with Cyrillic transliteration

### [src/components/ui/index.ts](src/components/ui/index.ts)
Barrel exports: `GlassPanel`, `GlowButton`, `Input`, `Textarea`, `AncientText`, `ShimmerBorder`, `ImageUpload`, `ThemeToggle`

### [src/components/ui/glass-panel.tsx](src/components/ui/glass-panel.tsx)
Glassmorphism container (Server Component). Props:
- `variant`: `"default"` (semi-transparent), `"dark"` (deeper bg), `"accent"` (teal glow border + shadow)
- `padding`: `"none"` | `"sm"` (p-3) | `"md"` (p-6) | `"lg"` (p-8)
- `className`: merged via cn()

### [src/components/ui/glow-button.tsx](src/components/ui/glow-button.tsx)
Button with Alteran glow effects (Server Component, CSS-only hover). Props:
- `variant`: `"primary"` (solid teal bg), `"secondary"` (outlined), `"ghost"` (text-only)
- `size`: `"sm"` | `"md"` | `"lg"`
- Extends `ButtonHTMLAttributes<HTMLButtonElement>`
- `focus-visible` outline for accessibility; `disabled` state supported

### [src/components/ui/input.tsx](src/components/ui/input.tsx)
Glass-styled form fields (Client Component -- `"use client"`). Exports:
- `Input` -- `forwardRef` input with label, error state, aria attributes
- `Textarea` -- `forwardRef` textarea with same features, `resize-y`, min-height
- Both use glass background + focus glow; error state shows red border + alert text

### [src/components/ui/ancient-text.tsx](src/components/ui/ancient-text.tsx)
Decorative Alteran font text (Server Component). Props:
- `as`: polymorphic tag (`"h1"` | `"h2"` | `"h3"` | `"p"` | `"span"`)
- `glow`: boolean for teal text-shadow
- Responsive font sizes per tag (text-4xl to text-6xl for h1, etc.)

### [src/components/ui/theme-toggle.tsx](src/components/ui/theme-toggle.tsx)
Dark/light theme toggle button (Client Component — `"use client"`). Features:
- `useTheme()` from next-themes; mounted guard prevents SSR hydration mismatch
- Dark mode → sun SVG icon (click → switch to light parchment theme)
- Light mode → moon SVG icon (click → switch to dark theme)
- Styled as icon button with `text-ancient-teal` and `hover:bg-ancient-teal/10`
- `aria-label` communicates current action (not current state)

### [src/components/ui/shimmer-border.tsx](src/components/ui/shimmer-border.tsx)
Container with animated shimmer border (Server Component). Props:
- `active`: boolean -- animated conic-gradient rotation when true, static teal border when false
- Uses CSS `@keyframes shimmer-rotate` (4s linear infinite)
- Inner content on `bg-ancient-bg` background

### [src/components/project/index.ts](src/components/project/index.ts)
Barrel exports: `ProjectCard`, `GitHubImport`, `TextGenerator`

### [src/components/project/github-import.tsx](src/components/project/github-import.tsx)
GitHub repository import UI (Client Component). Features:
- Input field for GitHub URL + "Fetch" button
- Four states: idle, loading (shimmer placeholder), preview, error
- Preview card: OG image, owner/repo title, description, stars badge, primary language, topic tags
- Editable fields: title, description, content (README), tech stack, language, live URL, source URL, image URL
- "Import" button calls `onImport(GitHubImportData)` callback
- "Reset" button returns to idle state
- Loading spinner animation on Fetch button
- Error display with red accent panel
- Props: `onImport: (data: GitHubImportData) => void`

### [src/components/project/text-generator.tsx](src/components/project/text-generator.tsx)
AI text generation component (Client Component -- `"use client"`). Features:
- Input fields: "Project Title" (required) and "Keywords / Description" (textarea)
- Streams content from `/api/generate` via SSE using `fetch` + `ReadableStream` reader
- Real-time typewriter display with cursor blink animation during generation
- State machine: `idle` -> `generating` -> `done` / `error`
- Cancel button (AbortController) stops generation mid-stream
- Regenerate button resets state for another attempt
- "Use This Content" button parses structured output and calls `onGenerate` callback
- Inline `parseGenerateOutput()` -- parses `---SHORT_DESCRIPTION---`, `---DETAILED_CONTENT---`, `---TECH_STACK---` markers
- Props: `onGenerate(data: { description, content, techStack }) => void`
- Auto-scrolls output area as text streams in
- Error display for API errors (missing key, rate limit, network)

### [src/app/robots.ts](src/app/robots.ts)
Generates `/robots.txt` via Next.js metadata API:
- Allow all crawlers on `/`
- Disallow `/admin/`, `/api/`, `/sign-in/`
- References sitemap at `{SITE_URL}/sitemap.xml`

### [src/app/sitemap.ts](src/app/sitemap.ts)
Dynamic sitemap generated via Next.js metadata API:
- Static routes: `/` (priority 1.0, monthly), `/projects` (priority 0.8, weekly)
- Dynamic routes: all published projects from DB as `/projects/[slug]` (priority 0.7, weekly)
- `lastModified` from project `updatedAt` field
- Gracefully handles missing DB (returns static routes only)

### [src/app/manifest.ts](src/app/manifest.ts)
PWA Web App Manifest:
- Name: "alteran.tech"
- Display: standalone
- Theme/background colors: `#050510`
- Icon: `/favicon.ico`

### [src/app/not-found.tsx](src/app/not-found.tsx)
Custom 404 page (Server Component):
- Decorative StargateRing, Alteran-font heading
- Error message with gate network metaphor
- "Return to Origin" button
- `<main>` semantic landmark

### [src/app/projects/\[slug\]/page.tsx](src/app/projects/[slug]/page.tsx)
Project detail page (SSG + ISR, revalidate=3600). Features:
- `generateStaticParams()` for all published projects
- `generateMetadata()` with OG/Twitter card per project
- JSON-LD `SoftwareApplication` structured data
- Hero image, title, description, action buttons (Live Demo, Source Code)
- Markdown content rendered via `renderMarkdown()`
- Sidebar: Tech Stack tags, GitHub info (stars, language), Topics, Category
- `<main>` semantic landmark

### [src/components/layout/header.tsx](src/components/layout/header.tsx)
Sticky site header (Client Component). Features:
- Glassmorphism background on scroll (uses `var(--header-bg)` CSS var for theme-aware background)
- Desktop nav: About, Projects, Contact anchors + Sign In link + `ThemeToggle`
- Mobile hamburger menu with smooth slide animation, includes `ThemeToggle`
- Smooth scroll to sections via `scrollIntoView`
- `aria-label="Main navigation"`, `aria-expanded` on hamburger, focus-visible rings

### [src/components/layout/footer.tsx](src/components/layout/footer.tsx)
Site footer (Server Component). Features:
- ChevronDivider separator
- Decorative Alteran text ("per aspera ad astra")
- Social links (GitHub, Email) with `aria-label`
- Copyright with dynamic year

### [src/components/sections/hero.tsx](src/components/sections/hero.tsx)
Full-screen hero section (Server Component). Features:
- ParticleField background
- StargateRing wrapped in HeroParallax for scroll parallax
- Alteran decorative text, name (h1), tagline, CTA button
- Bottom fade gradient

### [src/components/sections/about.tsx](src/components/sections/about.tsx)
About section (Server Component). Features:
- ChevronDivider separator
- Company description text in GlassPanel
- Tech stack grid (Languages, Frontend, Backend, DevOps)
- All content wrapped in ScrollReveal for entrance animation

### [src/components/sections/projects-grid.tsx](src/components/sections/projects-grid.tsx)
Projects grid section (async Server Component). Features:
- Fetches published projects from DB
- Grid of ProjectCard components (1/2/3 columns responsive)
- Empty state with Alteran font
- ScrollReveal on heading and grid

### [src/components/sections/contact.tsx](src/components/sections/contact.tsx)
Contact section (async Server Component). Features:
- Reads `contact_github` and `contact_email` from `siteSettings` via `getSettings()`
- Contact links (GitHub, Email) with hover effects — editable via admin settings
- ShimmerBorder + GlassPanel wrapper
- "Написать" CTA button linked to current email
- ScrollReveal on heading and content

### [src/hooks/use-intersection.ts](src/hooks/use-intersection.ts)
Custom React hook wrapping IntersectionObserver (`"use client"`). Features:
- Returns `{ ref, isVisible }` for attaching to elements
- Options: `threshold` (default 0.1), `rootMargin`, `triggerOnce` (default true)
- Respects `prefers-reduced-motion` (treats element as always visible)
- Proper cleanup on unmount

### [src/components/effects/scroll-reveal.tsx](src/components/effects/scroll-reveal.tsx)
Scroll-triggered reveal animation wrapper (Client Component). Props:
- `children`: content to reveal
- `delay`: animation delay in ms (default 0)
- `direction`: `"up"` | `"left"` | `"right"` (default "up")
- Uses `useIntersection` hook for visibility detection
- CSS transitions only (opacity + transform), 700ms ease-out

### [src/components/effects/hero-parallax.tsx](src/components/effects/hero-parallax.tsx)
Parallax scroll wrapper (Client Component). Props:
- `children`: content to parallax
- `speed`: parallax factor (default 0.3, moves at 30% of scroll speed)
- Uses `requestAnimationFrame` for smooth 60fps updates
- Respects `prefers-reduced-motion` (disables parallax)
- `will-change: transform` for GPU acceleration

### [src/components/effects/index.ts](src/components/effects/index.ts)
Barrel exports: `StargateRing`, `ParticleField`, `AlteranLetterField`, `ChevronDivider`, `ScrollReveal`, `HeroParallax`

### [src/components/effects/alteran-letter-field.tsx](src/components/effects/alteran-letter-field.tsx)
Decorative background layer of barely-visible Alteran font glyphs (Server Component, `aria-hidden="true"`). Props:
- `count`: number of letter elements (default 30)
- `className`: additional CSS classes
- Fixed positioning (`fixed inset-0`) covers the full viewport across all scroll positions
- Latin characters (a-z) rendered as alien glyphs via Alteran TTF font
- Seeded PRNG for deterministic SSR rendering
- Opacity range 0.025–0.07 (barely perceptible)
- Sizes 18–70px, random rotation –25° to +25°, drift durations 25–65s
- Reuses `alteran-float-1/2/3` keyframes; colors use `var(--letter-color-teal)` / `var(--letter-color-aqua)` for theme-awareness
- `z-0`, `pointer-events-none` — purely decorative, does not block interaction

### [src/components/effects/stargate-ring.tsx](src/components/effects/stargate-ring.tsx)
SVG Stargate-inspired ring (Server Component, `aria-hidden="true"`). Props:
- `size`: `"sm"` (200px) | `"md"` (300px) | `"lg"` (400px) | `"hero"` (560px)
- `spinning`: boolean -- outer ring clockwise (30s), inner ring counter-clockwise (60s)
- 9 outer glyphs + 6 inner glyphs (6 unique Ancient geometric patterns)
- SVG glow filter on glyphs, tick marks between outer glyphs

### [src/components/effects/particle-field.tsx](src/components/effects/particle-field.tsx)
CSS-only floating particle background (Server Component, `aria-hidden="true"`). Props:
- `density`: `"low"` (8) | `"medium"` (15) | `"high"` (22) particles
- Seeded PRNG for deterministic SSR rendering
- Colors use `var(--particle-color-1)` / `var(--particle-color-2)` in inline styles for theme-awareness
- 3 float animation variants (10-25s duration)
- `position: absolute`, `pointer-events: none` -- does not affect layout

### [src/components/effects/chevron-divider.tsx](src/components/effects/chevron-divider.tsx)
Horizontal divider with SVG chevron (Server Component, `aria-hidden="true"`). Props:
- `glowing`: boolean -- animated glow pulse on chevron (3s ease-in-out)
- Gradient lines fading from transparent to teal on each side
- Dual chevron shape (outer + inner) with center dot

### [.env.local.example](.env.local.example)
Template for environment variables (9 total):
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — Turso database
- `ADMIN_PASSWORD` — admin panel password
- `AUTH_SECRET` — secret for HMAC session token signing (min 32 chars)
- `GITHUB_TOKEN` — GitHub API access
- `OPENROUTER_API_KEY` — LLM API
- `NEXT_PUBLIC_SITE_URL` — Public site URL

## Design System — Alteran Palette

| Token | Value | Usage |
|-------|-------|-------|
| `ancient-bg` | `#050510` | Page background (deep space) |
| `ancient-surface` | `rgba(14,20,40,0.6)` | Glass panel fill |
| `ancient-surface-solid` | `#0e1428` | Opaque surface |
| `ancient-teal` | `#71d7b4` | Primary accent, glow color |
| `ancient-teal-dark` | `#4e8672` | Secondary teal |
| `ancient-blue` | `#273d8d` | Blue accent |
| `ancient-blue-deep` | `#090a4b` | Deep blue |
| `ancient-aqua` | `#A7C6ED` | Light accent text |
| `ancient-aqua-light` | `#E1F5FE` | Lightest accent |

## Utility Classes (globals.css)

| Class | Effect |
|-------|--------|
| `glass-panel` | Glassmorphism: semi-transparent bg + blur(12px) + teal border |
| `glass-panel-strong` | Stronger glassmorphism: denser bg + blur(20px) |
| `glow-text` | Teal text-shadow with 3 layers (10/20/40px) |
| `glow-text-subtle` | Lighter teal text-shadow (8/16px) |
| `glow-box` | Teal box-shadow + inset glow |
| `glow-box-subtle` | Lighter teal box-shadow |
| `glow-border` | 1px teal border + subtle shadow |
| `font-alteran` | Alteran decorative font family |

## Component Import Patterns

```typescript
// UI components (barrel export)
import { GlassPanel, GlowButton, Input, Textarea, AncientText, ShimmerBorder, ThemeToggle } from "@/components/ui";

// Effects (barrel export)
import { StargateRing, ParticleField, AlteranLetterField, ChevronDivider, ScrollReveal, HeroParallax } from "@/components/effects";

// Hooks
import { useIntersection } from "@/hooks/use-intersection";

// Project components (barrel export)
import { ProjectCard, GitHubImport, TextGenerator } from "@/components/project";

// Utilities
import { cn, slugify } from "@/lib/utils";

// Server Actions — projects
import { createProject, updateProject, deleteProject, toggleProjectStatus, getProjects, getProjectById, getProjectBySlug } from "@/lib/actions/projects";

// Server Actions — settings
import { getSetting, getSettings, saveContactSettings } from "@/lib/actions/settings";

// OpenRouter types (for API routes)
import type { GenerateInput, GenerateResult, OpenRouterStreamChunk } from "@/types/openrouter";

// GitHub types (for API routes and components)
import type { GitHubRepo, GitHubImportData, GitHubUrlParts } from "@/types/github";

// GitHub client (server-only)
import { fetchGitHubRepo, getCachedGitHubRepo, parseGitHubUrl, mapRepoToProject, invalidateGitHubCache, GitHubApiError } from "@/lib/github";

// OpenRouter client (server-only)
import { generateProjectContent, parseGenerateOutput } from "@/lib/openrouter";
```

## CSS Animations (globals.css @keyframes)

| Animation | Duration | Usage |
|-----------|----------|-------|
| `glow-pulse` | 3s ease-in-out infinite | Pulsing brightness/opacity |
| `fade-in` | 0.6s ease-out | Entry animation (translateY + opacity) |
| `float` | 6s ease-in-out infinite | Gentle vertical bobbing |
| `shimmer-rotate` | 4s linear infinite | ShimmerBorder gradient rotation |
| `stargate-spin` | 30s linear infinite | Outer ring clockwise rotation |
| `stargate-spin-reverse` | 60s linear infinite | Inner ring counter-clockwise |
| `particle-float-1/2/3` | 10-25s ease-in-out infinite | Particle movement variants |
| `alteran-float-1/2/3` | 10-28s ease-in-out infinite | AlteranLetterField wide-arc drift (±60-100px XY + rotation via CSS vars) |
| `chevron-glow` | 3s ease-in-out infinite | Chevron drop-shadow pulse |

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle SQL migrations from schema |
| `npm run db:migrate` | Apply migrations to Turso database |
| `npm run db:push` | Push schema directly to Turso (dev mode) |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
