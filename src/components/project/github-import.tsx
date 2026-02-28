"use client";

import { useState, useRef, useEffect } from "react";
import { GlassPanel, GlowButton, Input, Textarea, ImageUpload } from "@/components/ui";
import type { GitHubImportData } from "@/types/github";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ImportState = "idle" | "loading" | "enhancing" | "preview" | "error";

interface RawPreview {
  stars: number;
  primaryLanguage: string | null;
  topics: string[];
  languages: string[];
  openGraphImageUrl: string;
}

interface GitHubImportProps {
  onImport: (data: GitHubImportData) => void;
}

/**
 * Parse the structured LLM output into separate fields.
 */
function parseGenerateOutput(raw: string): {
  description: string;
  content: string;
  techStack: string[];
} {
  const descMatch = raw.match(
    /---SHORT_DESCRIPTION---\s*([\s\S]*?)(?=---DETAILED_CONTENT---|$)/
  );
  const contentMatch = raw.match(
    /---DETAILED_CONTENT---\s*([\s\S]*?)(?=---TECH_STACK---|$)/
  );
  const techMatch = raw.match(/---TECH_STACK---\s*([\s\S]*?)$/);

  const description = descMatch?.[1]?.trim() || "";
  const content = contentMatch?.[1]?.trim() || "";
  const techStackRaw = techMatch?.[1]?.trim() || "";
  const techStack = techStackRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return { description, content, techStack };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GitHubImport({ onImport }: GitHubImportProps) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ImportState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Editable project fields (populated after fetch + AI enhancement)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [githubOwner, setGithubOwner] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubStars, setGithubStars] = useState(0);
  const [githubLanguage, setGithubLanguage] = useState("");
  const [githubTopics, setGithubTopics] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);

  // Raw preview data (non-editable display)
  const [rawPreview, setRawPreview] = useState<RawPreview | null>(null);

  // Streaming state for AI enhancement
  const [streamedText, setStreamedText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamOutputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the stream output
  useEffect(() => {
    if (state === "enhancing" && streamOutputRef.current) {
      streamOutputRef.current.scrollTop = streamOutputRef.current.scrollHeight;
    }
  }, [streamedText, state]);

  /**
   * Stream AI enhancement for the fetched GitHub data.
   */
  async function enhanceWithAI(
    repoTitle: string,
    repoDescription: string,
    topics: string[],
    primaryLanguage: string | null,
    readme: string,
    languages: string[]
  ) {
    setState("enhancing");
    setStreamedText("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const keywords = [
        repoDescription,
        primaryLanguage,
        ...topics,
        ...languages,
      ]
        .filter(Boolean)
        .join(", ");

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: repoTitle,
          keywords,
          context: readme ? readme.slice(0, 4000) : undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage = `AI enhancement failed (${response.status})`;
        try {
          const errorBody = await response.json();
          if (errorBody?.error) errorMessage = errorBody.error;
        } catch {
          // ignore
        }
        // Fall through to preview with raw data on AI failure
        console.warn("AI enhancement failed:", errorMessage);
        setState("preview");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setState("preview");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            // Parse and apply the generated content
            const parsed = parseGenerateOutput(accumulated);
            if (parsed.description) setDescription(parsed.description);
            if (parsed.content) setContent(parsed.content);
            if (parsed.techStack.length > 0) setTechStack(parsed.techStack);
            setState("preview");
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              // AI error — fall through to preview with raw data
              console.warn("AI stream error:", parsed.error);
              setState("preview");
              return;
            }
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamedText(accumulated);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      // Stream ended without [DONE]
      if (accumulated) {
        const parsed = parseGenerateOutput(accumulated);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.content) setContent(parsed.content);
        if (parsed.techStack.length > 0) setTechStack(parsed.techStack);
      }
      setState("preview");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setState("preview");
        return;
      }
      // Network error — fall through to preview with raw data
      console.warn("AI enhancement error:", err);
      setState("preview");
    } finally {
      abortControllerRef.current = null;
    }
  }

  async function handleFetch() {
    if (!url.trim()) {
      setError("Введите URL репозитория GitHub");
      setState("error");
      return;
    }

    setState("loading");
    setError(null);

    try {
      const res = await fetch("/api/github/repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Запрос не удался (${res.status})`);
        setState("error");
        return;
      }

      // Populate base fields from GitHub data
      const repoTitle = data.title || "";
      const repoDescription = data.description || "";
      const repoContent = data.content || "";
      const topics: string[] = data.githubTopics ? JSON.parse(data.githubTopics) : [];
      const languages: string[] = data._raw?.languages || [];
      const primaryLanguage: string | null = data._raw?.primaryLanguage || null;

      setTitle(repoTitle);
      setDescription(repoDescription);
      setContent(repoContent);
      setSourceUrl(data.sourceUrl || "");
      setLiveUrl(data.liveUrl || "");
      setImageUrl(data.imageUrl || "");
      setGithubOwner(data.githubOwner || "");
      setGithubRepo(data.githubRepo || "");
      setGithubStars(data.githubStars ?? 0);
      setGithubLanguage(data.githubLanguage || "");
      setGithubTopics(topics);
      setTechStack(data.techStack ? JSON.parse(data.techStack) : []);
      setRawPreview(data._raw || null);

      // Auto-enhance with AI
      await enhanceWithAI(
        repoTitle,
        repoDescription,
        topics,
        primaryLanguage,
        repoContent,
        languages
      );
    } catch {
      setError("Ошибка сети — не удалось подключиться к серверу");
      setState("error");
    }
  }

  function handleCancelEnhancement() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  function handleImport() {
    const importData: GitHubImportData = {
      title,
      description: description || null,
      content: content || null,
      sourceUrl,
      liveUrl: liveUrl || null,
      imageUrl: imageUrl || null,
      githubOwner,
      githubRepo,
      githubStars,
      githubLanguage: githubLanguage || null,
      githubTopics: JSON.stringify(githubTopics),
      techStack: techStack.length > 0 ? JSON.stringify(techStack) : null,
      source: "github",
    };
    onImport(importData);
  }

  function handleReset() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState("idle");
    setError(null);
    setUrl("");
    setTitle("");
    setDescription("");
    setContent("");
    setSourceUrl("");
    setLiveUrl("");
    setImageUrl("");
    setGithubOwner("");
    setGithubRepo("");
    setGithubStars(0);
    setGithubLanguage("");
    setGithubTopics([]);
    setTechStack([]);
    setRawPreview(null);
    setStreamedText("");
  }

  return (
    <div className="space-y-6">
      {/* URL input + Fetch button */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="URL репозитория GitHub"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFetch();
              }
            }}
            disabled={state === "loading" || state === "enhancing"}
          />
        </div>
        <GlowButton
          type="button"
          variant="primary"
          size="md"
          onClick={handleFetch}
          disabled={
            state === "loading" ||
            state === "enhancing" ||
            !url.trim()
          }
          className="shrink-0"
        >
          {state === "loading" ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Загрузка...
            </span>
          ) : (
            "Загрузить"
          )}
        </GlowButton>
      </div>

      {/* Error state */}
      {state === "error" && error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading shimmer — fetching GitHub data */}
      {state === "loading" && (
        <GlassPanel variant="default" padding="lg">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-ancient-teal/10 rounded w-2/3" />
            <div className="h-4 bg-ancient-teal/5 rounded w-full" />
            <div className="h-4 bg-ancient-teal/5 rounded w-4/5" />
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-ancient-teal/10 rounded-full w-16" />
              <div className="h-6 bg-ancient-teal/10 rounded-full w-20" />
              <div className="h-6 bg-ancient-teal/10 rounded-full w-14" />
            </div>
          </div>
        </GlassPanel>
      )}

      {/* AI Enhancement streaming panel */}
      {state === "enhancing" && (
        <div className="space-y-4">
          {/* Repo preview header (already loaded) */}
          {rawPreview && (
            <GlassPanel variant="accent" padding="md">
              <div className="space-y-3">
                {rawPreview.openGraphImageUrl && (
                  <div className="rounded-lg overflow-hidden border border-ancient-teal/10 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rawPreview.openGraphImageUrl}
                      alt={`${title} preview`}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-base)]">
                      {githubOwner}/{githubRepo}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-ancient-teal/10 text-ancient-teal border border-ancient-teal/20 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                    </svg>
                    {githubStars.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rawPreview.primaryLanguage && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-ancient-blue/30 text-ancient-aqua border border-ancient-blue/30">
                      {rawPreview.primaryLanguage}
                    </span>
                  )}
                  {githubTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-full text-xs bg-ancient-teal/5 text-ancient-teal/70 border border-ancient-teal/10"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </GlassPanel>
          )}

          {/* AI streaming output */}
          <GlassPanel variant="dark" padding="md">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-ancient-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-ancient-aqua/70">
                    ИИ улучшает описание...
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-ancient-teal animate-[glow-pulse_1.5s_ease-in-out_infinite]" />
                </div>
                <GlowButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEnhancement}
                >
                  Пропустить
                </GlowButton>
              </div>

              <div
                ref={streamOutputRef}
                className="max-h-48 overflow-y-auto rounded-lg bg-ancient-bg/50 border border-ancient-teal/10 p-4 font-mono text-xs text-ancient-aqua/60 leading-relaxed whitespace-pre-wrap break-words"
              >
                {streamedText || (
                  <span className="text-ancient-aqua/30">Анализирую репозиторий...</span>
                )}
                <span className="inline-block w-0.5 h-3.5 bg-ancient-teal ml-0.5 animate-[glow-pulse_1s_ease-in-out_infinite]" />
              </div>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Preview card */}
      {state === "preview" && (
        <div className="space-y-6">
          {/* Read-only preview header */}
          <GlassPanel variant="accent" padding="md">
            <div className="space-y-3">
              {/* OG image preview */}
              {rawPreview?.openGraphImageUrl && (
                <div className="rounded-lg overflow-hidden border border-ancient-teal/10 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rawPreview.openGraphImageUrl}
                    alt={`${title} preview`}
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-base)]">
                    {githubOwner}/{githubRepo}
                  </h3>
                  {description && (
                    <p className="text-sm text-ancient-aqua/60 mt-1 line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>

                {/* Stars badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-ancient-teal/10 text-ancient-teal border border-ancient-teal/20 shrink-0">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                  </svg>
                  {githubStars.toLocaleString()}
                </span>
              </div>

              {/* AI enhancement badge */}
              {streamedText && (
                <div className="flex items-center gap-1.5 text-xs text-ancient-teal/60">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                  Описание улучшено с помощью ИИ
                </div>
              )}

              {/* Language + Topics */}
              <div className="flex flex-wrap gap-2">
                {rawPreview?.primaryLanguage && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-ancient-blue/30 text-ancient-aqua border border-ancient-blue/30">
                    {rawPreview.primaryLanguage}
                  </span>
                )}
                {githubTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 rounded-full text-xs bg-ancient-teal/5 text-ancient-teal/70 border border-ancient-teal/10"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Editable fields */}
          <GlassPanel variant="default" padding="lg">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-ancient-aqua/70 uppercase tracking-wider">
                Редактирование перед импортом
              </h4>

              <Input
                label="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Textarea
                label="Краткое описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />

              <Textarea
                label="Подробное описание"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Технологии"
                  value={techStack.join(", ")}
                  onChange={(e) =>
                    setTechStack(
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder="TypeScript, React, Next.js"
                />
                <Input
                  label="Основной язык"
                  value={githubLanguage}
                  onChange={(e) => setGithubLanguage(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="URL проекта"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  type="url"
                  placeholder="https://myproject.com"
                />
                <Input
                  label="URL исходного кода"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  type="url"
                />
              </div>

              <ImageUpload
                label="Изображение"
                value={imageUrl}
                onChange={setImageUrl}
              />
            </div>
          </GlassPanel>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <GlowButton
              type="button"
              variant="ghost"
              size="md"
              onClick={handleReset}
            >
              Сбросить
            </GlowButton>
            <GlowButton
              type="button"
              variant="primary"
              size="md"
              onClick={handleImport}
              disabled={!title.trim()}
            >
              Импортировать проект
            </GlowButton>
          </div>
        </div>
      )}
    </div>
  );
}
