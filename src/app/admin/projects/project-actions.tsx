"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleProjectStatus, deleteProject } from "@/lib/actions/projects";
import { GlassPanel } from "@/components/ui";

interface ProjectActionsProps {
  projectId: number;
  projectTitle: string;
  currentStatus: string;
}

/**
 * Client component for project row actions: Edit, Toggle Status, Delete.
 * Uses Server Actions for mutations with optimistic UI feedback.
 */
export function ProjectActions({
  projectId,
  projectTitle,
  currentStatus,
}: ProjectActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleToggleStatus() {
    setError(null);
    startTransition(async () => {
      const result = await toggleProjectStatus(projectId);
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (!result.success) {
        setError(result.error);
      } else {
        setShowDeleteConfirm(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/projects/${projectId}/edit`}
          className="text-xs text-ancient-teal hover:text-ancient-aqua-light transition-colors px-2 py-1 rounded hover:bg-ancient-teal/5"
        >
          Ред.
        </Link>
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={isPending}
          className="text-xs text-ancient-aqua/60 hover:text-ancient-teal transition-colors px-2 py-1 rounded hover:bg-ancient-teal/5 disabled:opacity-50"
        >
          {currentStatus === "published" ? "Снять с публикации" : "Опубликовать"}
        </button>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isPending}
          className="text-xs text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/5 disabled:opacity-50"
        >
          Удалить
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1 text-right">{error}</p>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !isPending && setShowDeleteConfirm(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <GlassPanel
            variant="accent"
            padding="lg"
            className="relative z-10 max-w-md w-full"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-base)]">
                  Удалить проект
                </h3>
                <p className="text-sm text-ancient-aqua/60 mt-2">
                  Вы уверены, что хотите удалить{" "}
                  <span className="text-[var(--text-base)] font-medium">
                    &ldquo;{projectTitle}&rdquo;
                  </span>
                  ? Это действие нельзя отменить.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-sm rounded-lg text-ancient-aqua/70 hover:text-[var(--text-base)] border border-ancient-teal/20 hover:border-ancient-teal/40 transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Удаление..." : "Удалить"}
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}
    </>
  );
}
