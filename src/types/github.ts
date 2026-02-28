// ---------------------------------------------------------------------------
// GitHub GraphQL API response types
// ---------------------------------------------------------------------------

/** Primary language of a GitHub repository */
export interface GitHubLanguage {
  name: string;
}

/** Single topic node from repositoryTopics connection */
export interface GitHubTopicNode {
  topic: {
    name: string;
  };
}

/** Single language node from languages connection */
export interface GitHubLanguageNode {
  name: string;
  color: string | null;
}

/** Shape of the `repository` object from GitHub GraphQL API */
export interface GitHubRepoRaw {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  primaryLanguage: GitHubLanguage | null;
  repositoryTopics: {
    nodes: GitHubTopicNode[];
  };
  openGraphImageUrl: string;
  languages: {
    nodes: GitHubLanguageNode[];
  };
  object: {
    text: string;
  } | null; // README content via object(expression: "HEAD:README.md")
  createdAt: string;
  updatedAt: string;
}

/** Full GraphQL response envelope */
export interface GitHubGraphQLResponse {
  data?: {
    repository: GitHubRepoRaw | null;
  };
  errors?: Array<{
    type: string;
    message: string;
    path?: string[];
  }>;
  message?: string; // REST-style error (e.g., "Bad credentials")
}

// ---------------------------------------------------------------------------
// Processed / normalised types
// ---------------------------------------------------------------------------

/** Cleaned-up repository data after parsing the GraphQL response */
export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  primaryLanguage: string | null;
  topics: string[];
  languages: string[];
  openGraphImageUrl: string;
  readme: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Data shape ready to be mapped onto a ProjectInsert */
export interface GitHubImportData {
  title: string;
  description: string | null;
  content: string | null;
  sourceUrl: string;
  liveUrl: string | null;
  imageUrl: string | null;
  githubOwner: string;
  githubRepo: string;
  githubStars: number;
  githubLanguage: string | null;
  githubTopics: string; // JSON string array
  techStack: string | null; // JSON string array (from languages)
  source: "github";
}

/** Result of parsing a GitHub URL */
export interface GitHubUrlParts {
  owner: string;
  repo: string;
}
