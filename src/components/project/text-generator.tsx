"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { GlassPanel, GlowButton, Input, Textarea } from "@/components/ui";

/**
 * Parse the structured LLM output into separate fields.
 * The output follows the format with ---SHORT_DESCRIPTION---, ---DETAILED_CONTENT---, ---TECH_STACK--- markers.
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

/** State machine for the generator */
type GeneratorState = "idle" | "generating" | "done" | "error";

interface TextGeneratorProps {
  /**
   * Callback when user clicks "Use This" with generated content.
   * Receives parsed description, content, and techStack.
   */
  onGenerate: (data: {
    description: string;
    content: string;
    techStack: string;
  }) => void;
}

/**
 * TextGenerator component for AI-powered project content generation.
 *
 * Streams text from the /api/generate endpoint via SSE,
 * parses the structured output into description/content/techStack,
 * and provides controls for cancel, regenerate, and applying results.
 */
export function TextGenerator({ onGenerate }: TextGeneratorProps) {
  // Input fields
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");

  // Generation state
  const [state, setState] = useState<GeneratorState>("idle");
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Abort controller for cancelling generation
  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref for auto-scrolling the output area
  const outputRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll the output area as text streams in.
   */
  useEffect(() => {
    if (state === "generating" && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamedText, state]);

  /**
   * Start streaming generation from the API.
   */
  const handleGenerate = useCallback(async () => {
    if (!title.trim()) {
      setError("Название проекта обязательно");
      return;
    }

    // Reset state
    setError(null);
    setStreamedText("");
    setState("generating");

    // Create new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          keywords: keywords.trim(),
        }),
        signal: controller.signal,
      });

      // Handle non-streaming error responses
      if (!response.ok) {
        let errorMessage = `Generation failed (${response.status})`;
        try {
          const errorBody = await response.json();
          if (errorBody?.error) {
            errorMessage = errorBody.error;
          }
        } catch {
          // Ignore parse errors
        }
        setError(errorMessage);
        setState("error");
        return;
      }

      // Read the SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        setError("Поток ответа недоступен");
        setState("error");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);

          if (data === "[DONE]") {
            setState("done");
            return;
          }

          try {
            const parsed = JSON.parse(data);

            // Check for streaming errors
            if (parsed.error) {
              setError(parsed.error);
              setState("error");
              return;
            }

            // Append text content
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamedText(accumulated);
            }
          } catch {
            // Skip malformed data lines
          }
        }
      }

      // Stream ended without [DONE] -- still mark as done
      if (accumulated) {
        setState("done");
      } else {
        setError("Контент не был сгенерирован. Попробуйте снова.");
        setState("error");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User cancelled
        setState(streamedText ? "done" : "idle");
        return;
      }
      const message =
        err instanceof Error ? err.message : "Произошла непредвиденная ошибка";
      setError(message);
      setState("error");
    } finally {
      abortControllerRef.current = null;
    }
  }, [title, keywords, streamedText]);

  /**
   * Cancel the current generation.
   */
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Apply the generated content to the form.
   * Parses the structured output and calls onGenerate callback.
   */
  const handleUseThis = useCallback(() => {
    const parsed = parseGenerateOutput(streamedText);
    onGenerate({
      description: parsed.description,
      content: parsed.content,
      techStack: parsed.techStack.join(", "),
    });
  }, [streamedText, onGenerate]);

  /**
   * Reset state so the user can click Generate again.
   */
  const handleRegenerate = useCallback(() => {
    setStreamedText("");
    setError(null);
    setState("idle");
  }, []);

  const isGenerating = state === "generating";
  const isDone = state === "done";
  const hasOutput = streamedText.length > 0;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <Input
          label="Название проекта *"
          placeholder="напр. Чат-приложение реального времени"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isGenerating}
        />

        <Textarea
          label="Ключевые слова / Описание"
          placeholder="напр. React, TypeScript, WebSocket, обмен сообщениями, групповые чаты, сквозное шифрование..."
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          rows={3}
          disabled={isGenerating}
        />

        <p className="text-xs text-ancient-aqua/40">
          Укажите ключевые слова, технологии и краткое описание для генерации ИИ.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isGenerating && (
          <GlowButton
            type="button"
            variant="primary"
            size="md"
            onClick={handleGenerate}
            disabled={!title.trim()}
          >
            <svg
              className="w-4 h-4"
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
            {isDone || hasOutput ? "Сгенерировать заново" : "Сгенерировать"}
          </GlowButton>
        )}

        {isGenerating && (
          <GlowButton
            type="button"
            variant="secondary"
            size="md"
            onClick={handleCancel}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Отмена
          </GlowButton>
        )}
      </div>

      {/* Streaming Output Display */}
      {(hasOutput || isGenerating) && (
        <GlassPanel variant="dark" padding="md">
          <div className="space-y-3">
            {/* Header with status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ancient-aqua/70">
                Сгенерированный контент
              </span>
              {isGenerating && (
                <span className="inline-flex items-center gap-2 text-xs text-ancient-teal">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-ancient-teal animate-[glow-pulse_1.5s_ease-in-out_infinite]" />
                  Генерация...
                </span>
              )}
              {isDone && (
                <span className="text-xs text-ancient-teal/60">
                  Генерация завершена
                </span>
              )}
            </div>

            {/* Streamed text output */}
            <div
              ref={outputRef}
              className="max-h-80 overflow-y-auto rounded-lg bg-ancient-bg/50 border border-ancient-teal/10 p-4 font-mono text-sm text-ancient-aqua/80 leading-relaxed whitespace-pre-wrap break-words"
            >
              {streamedText}
              {isGenerating && (
                <span className="inline-block w-0.5 h-4 bg-ancient-teal ml-0.5 animate-[glow-pulse_1s_ease-in-out_infinite]" />
              )}
            </div>

            {/* Apply button -- only when done */}
            {isDone && hasOutput && (
              <div className="flex justify-end gap-3 pt-2 border-t border-ancient-teal/10">
                <GlowButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                >
                  Сгенерировать заново
                </GlowButton>
                <GlowButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleUseThis}
                >
                  Использовать
                </GlowButton>
              </div>
            )}
          </div>
        </GlassPanel>
      )}

      {/* Empty state hint */}
      {!hasOutput && !isGenerating && state === "idle" && (
        <div className="text-center py-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ancient-teal/5 border border-ancient-teal/10">
            <svg
              className="w-6 h-6 text-ancient-teal/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
              />
            </svg>
          </div>
          <p className="text-sm text-ancient-aqua/40">
            Введите название проекта и ключевые слова, затем нажмите «Сгенерировать»
          </p>
        </div>
      )}
    </div>
  );
}
