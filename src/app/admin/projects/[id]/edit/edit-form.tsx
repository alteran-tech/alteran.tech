"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProject } from "@/lib/actions/projects";
import { GlassPanel, GlowButton, Input, Textarea, ImageUpload } from "@/components/ui";
import type { Project } from "@/types/project";

interface EditProjectFormProps {
  project: Project;
}

/**
 * Client-side form for editing an existing project.
 * Pre-populated with current project data.
 * Submits via Server Action updateProject.
 */
export function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Parse techStack from JSON string to comma-separated
  function parseTechStack(raw: string | null): string {
    if (!raw) return "";
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.join(", ") : "";
    } catch {
      return raw;
    }
  }

  // Form fields, pre-populated from project
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description ?? "");
  const [content, setContent] = useState(project.content ?? "");
  const [techStack, setTechStack] = useState(parseTechStack(project.techStack));
  const [category, setCategory] = useState(project.category ?? "");
  const [liveUrl, setLiveUrl] = useState(project.liveUrl ?? "");
  const [sourceUrl, setSourceUrl] = useState(project.sourceUrl ?? "");
  const [imageUrl, setImageUrl] = useState(project.imageUrl ?? "");
  const [featured, setFeatured] = useState(project.featured === 1);
  const [status, setStatus] = useState<"draft" | "published">(
    project.status as "draft" | "published"
  );

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

      const result = await updateProject(project.id, {
        title: title.trim(),
        description: description.trim() || null,
        content: content.trim() || null,
        techStack:
          techStackArray.length > 0 ? JSON.stringify(techStackArray) : null,
        category: category.trim() || null,
        liveUrl: liveUrl.trim() || null,
        sourceUrl: sourceUrl.trim() || null,
        imageUrl: imageUrl.trim() || null,
        featured: featured ? 1 : 0,
        status,
      });

      if (!result.success) {
        setError(result.error);
      } else {
        router.push("/admin/projects");
      }
    });
  }

  return (
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

        {/* Source info (read-only) */}
        <div className="flex items-center gap-2 text-xs text-ancient-aqua/40 pt-2 border-t border-ancient-teal/10">
          <span>Источник: {project.source}</span>
          <span>|</span>
          <span>Создано: {new Date(project.createdAt).toLocaleDateString()}</span>
          {project.updatedAt && (
            <>
              <span>|</span>
              <span>
                Обновлено: {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </>
          )}
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
            {isPending ? "Сохранение..." : "Сохранить"}
          </GlowButton>
        </div>
      </form>
    </GlassPanel>
  );
}
