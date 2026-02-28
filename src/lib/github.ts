import { db } from "@/lib/db";
import { githubCache } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type {
  GitHubRepo,
  GitHubGraphQLResponse,
  GitHubImportData,
  GitHubUrlParts,
} from "@/types/github";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

/** Cache TTL in seconds (1 hour) */
const CACHE_TTL = 3600;

// ---------------------------------------------------------------------------
// GraphQL query
// ---------------------------------------------------------------------------

const REPO_QUERY = `
  query GetRepository($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      name
      description
      url
      homepageUrl
      stargazerCount
      primaryLanguage {
        name
      }
      repositoryTopics(first: 20) {
        nodes {
          topic {
            name
          }
        }
      }
      openGraphImageUrl
      languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
        nodes {
          name
          color
        }
      }
      object(expression: "HEAD:README.md") {
        ... on Blob {
          text
        }
      }
      createdAt
      updatedAt
    }
  }
`;

// ---------------------------------------------------------------------------
// Error classes
// ---------------------------------------------------------------------------

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

// ---------------------------------------------------------------------------
// URL parsing
// ---------------------------------------------------------------------------

/**
 * Parses a GitHub URL into owner and repo parts.
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/...
 * - github.com/owner/repo
 */
export function parseGitHubUrl(url: string): GitHubUrlParts {
  try {
    // Normalise bare "github.com/..." inputs
    const normalised = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(normalised);

    if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
      throw new GitHubApiError("URL must be a github.com URL", 400);
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      throw new GitHubApiError(
        "Invalid GitHub URL: expected https://github.com/owner/repo",
        400,
      );
    }

    // Remove .git suffix if present
    const repo = parts[1].replace(/\.git$/, "");

    return { owner: parts[0], repo };
  } catch (error) {
    if (error instanceof GitHubApiError) throw error;
    throw new GitHubApiError(
      "Invalid URL format: expected https://github.com/owner/repo",
      400,
    );
  }
}

// ---------------------------------------------------------------------------
// Raw fetch (calls GitHub GraphQL API)
// ---------------------------------------------------------------------------

/**
 * Fetches repository data from GitHub GraphQL API.
 * Uses GITHUB_TOKEN env var if available; falls back to unauthenticated
 * requests for public repos (lower rate limit).
 */
export async function fetchGitHubRepo(
  owner: string,
  repo: string,
): Promise<GitHubRepo> {
  const token = process.env.GITHUB_TOKEN;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "alteran.tech",
  };

  if (token) {
    headers["Authorization"] = `bearer ${token}`;
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: REPO_QUERY,
      variables: { owner, repo },
    }),
  });

  // Handle HTTP-level errors
  if (response.status === 401) {
    throw new GitHubApiError("GitHub authentication failed — check GITHUB_TOKEN", 401);
  }

  if (response.status === 403) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      throw new GitHubApiError("GitHub API rate limit exceeded", 429);
    }
    throw new GitHubApiError("GitHub API access forbidden", 403);
  }

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub API returned ${response.status}`,
      response.status,
    );
  }

  const json = (await response.json()) as GitHubGraphQLResponse;

  // Handle GraphQL-level errors
  if (json.errors && json.errors.length > 0) {
    const firstError = json.errors[0];
    if (firstError.type === "NOT_FOUND") {
      throw new GitHubApiError(
        `Repository not found: ${owner}/${repo}`,
        404,
      );
    }
    throw new GitHubApiError(
      firstError.message || "GitHub GraphQL error",
      400,
    );
  }

  // Handle REST-style error (e.g., bad credentials)
  if (json.message) {
    throw new GitHubApiError(json.message, 401);
  }

  const repository = json.data?.repository;
  if (!repository) {
    throw new GitHubApiError(`Repository not found: ${owner}/${repo}`, 404);
  }

  // Parse into clean GitHubRepo
  return {
    name: repository.name,
    description: repository.description,
    url: repository.url,
    homepageUrl: repository.homepageUrl,
    stargazerCount: repository.stargazerCount,
    primaryLanguage: repository.primaryLanguage?.name ?? null,
    topics: repository.repositoryTopics.nodes.map((n) => n.topic.name),
    languages: repository.languages.nodes.map((n) => n.name),
    openGraphImageUrl: repository.openGraphImageUrl,
    readme: repository.object?.text ?? null,
    createdAt: repository.createdAt,
    updatedAt: repository.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Caching layer (Turso github_cache table)
// ---------------------------------------------------------------------------

function cacheKey(owner: string, repo: string): string {
  return `github:${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

/**
 * Fetches repository data with Turso caching (1-hour TTL).
 * Returns cached data if fresh; otherwise fetches from GitHub and stores.
 */
export async function getCachedGitHubRepo(
  owner: string,
  repo: string,
): Promise<GitHubRepo> {
  const key = cacheKey(owner, repo);
  const now = Math.floor(Date.now() / 1000);

  // Check cache
  try {
    const [cached] = await db
      .select()
      .from(githubCache)
      .where(and(eq(githubCache.cacheKey, key), gt(githubCache.expiresAt, now)))
      .limit(1);

    if (cached) {
      return JSON.parse(cached.data) as GitHubRepo;
    }
  } catch (error) {
    // Cache read failure is non-fatal; fall through to API
    console.warn("GitHub cache read error:", error);
  }

  // Fetch from API
  const data = await fetchGitHubRepo(owner, repo);

  // Store in cache (upsert)
  try {
    // Delete old entry if exists, then insert fresh one
    await db.delete(githubCache).where(eq(githubCache.cacheKey, key));
    await db.insert(githubCache).values({
      cacheKey: key,
      data: JSON.stringify(data),
      expiresAt: now + CACHE_TTL,
    });
  } catch (error) {
    // Cache write failure is non-fatal
    console.warn("GitHub cache write error:", error);
  }

  return data;
}

/**
 * Invalidates the cache entry for a specific repository.
 */
export async function invalidateGitHubCache(
  owner: string,
  repo: string,
): Promise<void> {
  const key = cacheKey(owner, repo);
  await db.delete(githubCache).where(eq(githubCache.cacheKey, key));
}

// ---------------------------------------------------------------------------
// Mapping: GitHubRepo → GitHubImportData (ready for project creation)
// ---------------------------------------------------------------------------

/**
 * Maps raw GitHub repository data to project-compatible fields.
 */
export function mapRepoToProject(
  data: GitHubRepo,
  owner: string,
  repo: string,
): GitHubImportData {
  return {
    title: data.name,
    description: data.description,
    content: data.readme,
    sourceUrl: data.url,
    liveUrl: data.homepageUrl || null,
    imageUrl: data.openGraphImageUrl || null,
    githubOwner: owner,
    githubRepo: repo,
    githubStars: data.stargazerCount,
    githubLanguage: data.primaryLanguage,
    githubTopics: JSON.stringify(data.topics),
    techStack:
      data.languages.length > 0 ? JSON.stringify(data.languages) : null,
    source: "github",
  };
}
