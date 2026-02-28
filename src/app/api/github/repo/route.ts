import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getCachedGitHubRepo,
  parseGitHubUrl,
  mapRepoToProject,
  GitHubApiError,
} from "@/lib/github";

/**
 * POST /api/github/repo
 * Protected endpoint: fetches GitHub repository data and returns mapped project fields.
 *
 * Body: { url: string } or { owner: string, repo: string }
 *
 * Returns: GitHubImportData (mapped project fields)
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    let owner: string;
    let repo: string;

    if (body.url) {
      // Parse from URL
      const parts = parseGitHubUrl(body.url);
      owner = parts.owner;
      repo = parts.repo;
    } else if (body.owner && body.repo) {
      owner = body.owner;
      repo = body.repo;
    } else {
      return NextResponse.json(
        { error: "Request body must contain either 'url' or both 'owner' and 'repo'" },
        { status: 400 },
      );
    }

    // Fetch repo data (with caching)
    const repoData = await getCachedGitHubRepo(owner, repo);

    // Map to project fields
    const projectData = mapRepoToProject(repoData, owner, repo);

    return NextResponse.json({
      ...projectData,
      // Also include raw repo data for the preview card
      _raw: {
        stars: repoData.stargazerCount,
        primaryLanguage: repoData.primaryLanguage,
        topics: repoData.topics,
        languages: repoData.languages,
        openGraphImageUrl: repoData.openGraphImageUrl,
      },
    });
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    console.error("POST /api/github/repo error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository data" },
      { status: 500 },
    );
  }
}
