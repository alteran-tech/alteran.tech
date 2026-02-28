"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/actions/projects";
import { GlassPanel, GlowButton, Input, Textarea, ImageUpload } from "@/components/ui";
import { GitHubImport, TextGenerator } from "@/components/project";
import type { GitHubImportData } from "@/types/github";

type Tab = "manual" | "github" | "ai";

/**
 * New project page with three tabs: Manual, GitHub Import, AI Generate.
 * All tabs are fully functional. AI Generate streams content from OpenRouter,
 * then populates form fields and switches to Manual tab for review.
 */
export default function NewProjectPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [techStack, setTechStack] = useState("");
  const [category, setCategory] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Название обязательно");
      return;
    }

    startTransition(async () => {
      const techStackArray = techStack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await createProject({
        title: title.trim(),
        description: description.trim() || null,
        content: content.trim() || null,
        techStack: techStackArray.length > 0 ? JSON.stringify(techStackArray) : null,
        category: category.trim() || null,
        liveUrl: liveUrl.trim() || null,
        sourceUrl: sourceUrl.trim() || null,
        imageUrl: imageUrl.trim() || null,
        featured: featured ? 1 : 0,
        status,
        source: "manual",
      });

      if (!result.success) {
        setError(result.error);
      } else {
        router.push("/admin/projects");
      }
    });
  }

  function handleGitHubImport(data: GitHubImportData) {
    setError(null);
    startTransition(async () => {
      const result = await createProject({
        title: data.title,
        description: data.description,
        content: data.content,
        sourceUrl: data.sourceUrl,
        liveUrl: data.liveUrl,
        imageUrl: data.imageUrl,
        githubOwner: data.githubOwner,
        githubRepo: data.githubRepo,
        githubStars: data.githubStars,
        githubLanguage: data.githubLanguage,
        githubTopics: data.githubTopics,
        techStack: data.techStack,
        source: "github",
        status: "draft",
      });

      if (!result.success) {
        setError(result.error);
      } else {
        router.push("/admin/projects");
      }
    });
  }

  function handleAIGenerate(data: {
    description: string;
    content: string;
    techStack: string;
  }) {
    // Populate form fields with AI-generated content
    setDescription(data.description);
    setContent(data.content);
    setTechStack(data.techStack);
    // Switch to manual tab so user can review and edit before saving
    setActiveTab("manual");
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "manual", label: "Вручную" },
    { key: "github", label: "Импорт из GitHub" },
    { key: "ai", label: "AI генерация" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-base)]">Новый проект</h1>
        <p className="text-sm text-ancient-aqua/60 mt-1">
          Добавить новый проект в портфолио
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-ancient-teal/10 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === tab.key
                ? "text-ancient-teal bg-ancient-teal/10 border border-ancient-teal/20 border-b-transparent -mb-px"
                : "text-ancient-aqua/50 hover:text-ancient-teal hover:bg-ancient-teal/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "manual" && (
        <GlassPanel variant="default" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Title */}
            <Input
              label="Название *"
              placeholder="Мой проект"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Description */}
            <Input
              label="Описание"
              placeholder="Краткое описание проекта"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Content (markdown) */}
            <Textarea
              label="Содержание"
              placeholder="Подробное описание в Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />

            {/* Two columns: Tech Stack + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Технологии"
                placeholder="React, TypeScript, Next.js"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
              <Input
                label="Категория"
                placeholder="web, mobile, cli и т.д."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="URL проекта"
                placeholder="https://myproject.com"
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
              />
              <Input
                label="URL исходного кода"
                placeholder="https://github.com/user/repo"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>

            {/* Image upload */}
            <ImageUpload
              label="Изображение"
              value={imageUrl}
              onChange={setImageUrl}
            />

            {/* Featured + Status row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              {/* Featured checkbox */}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm text-ancient-aqua/70 font-medium">
                  Избранное
                </span>
                <label className="flex items-center gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-ancient-teal/30 bg-ancient-surface text-ancient-teal focus:ring-ancient-teal/50 focus:ring-offset-0 accent-ancient-teal"
                  />
                  <span className="text-sm text-ancient-aqua/60">
                    Показывать на главной
                  </span>
                </label>
              </div>

              {/* Status select */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="status"
                  className="text-sm text-ancient-aqua/70 font-medium"
                >
                  Статус
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "published")
                  }
                  className="w-full rounded-lg px-4 py-2.5 bg-[var(--glass-bg)] backdrop-blur-[12px] border border-[var(--glass-border)] text-[var(--text-base)] transition-all duration-200 focus:outline-none focus:border-ancient-teal/50 input-focus-glow"
                >
                  <option value="draft" className="bg-ancient-bg">
                    Черновик
                  </option>
                  <option value="published" className="bg-ancient-bg">
                    Опубликовано
                  </option>
                </select>
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-ancient-teal/10">
              <GlowButton
                type="button"
                variant="ghost"
                size="md"
                onClick={() => router.push("/admin/projects")}
                disabled={isPending}
              >
                Отмена
              </GlowButton>
              <GlowButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isPending}
              >
                {isPending ? "Создание..." : "Создать проект"}
              </GlowButton>
            </div>
          </form>
        </GlassPanel>
      )}

      {activeTab === "github" && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {isPending && (
            <div className="p-3 rounded-lg bg-ancient-teal/10 border border-ancient-teal/20">
              <p className="text-sm text-ancient-teal">Создание проекта...</p>
            </div>
          )}
          <GitHubImport onImport={handleGitHubImport} />
        </div>
      )}

      {activeTab === "ai" && (
        <GlassPanel variant="default" padding="lg">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-base)] mb-1">
                AI генерация
              </h3>
              <p className="text-sm text-ancient-aqua/50">
                Генерация описаний проекта с помощью ИИ. Введите название и ключевые слова, затем
                нажмите «Сгенерировать». Контент будет выводиться в реальном времени.
              </p>
            </div>
            <TextGenerator onGenerate={handleAIGenerate} />
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
