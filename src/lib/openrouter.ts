import type {
  OpenRouterMessage,
  OpenRouterRequest,
  OpenRouterStreamChunk,
  GenerateInput,
} from "@/types/openrouter";

/** OpenRouter API endpoint */
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Default model -- Claude Sonnet 4 via OpenRouter */
const DEFAULT_MODEL = "anthropic/claude-sonnet-4";

/** Fallback model if primary is unavailable */
const FALLBACK_MODEL = "google/gemini-flash-1.5";

/**
 * System prompt for generating portfolio project content.
 * Instructs the LLM to output in a specific parseable format.
 */
const SYSTEM_PROMPT = `Ты опытный технический писатель, специализирующийся на описаниях проектов для портфолио разработчиков.
По названию проекта, ключевым словам и контексту сгенерируй:

1. SHORT_DESCRIPTION: Compelling 1-2 предложения для карточки портфолио — кратко и цепляюще
2. DETAILED_CONTENT: Подробное описание проекта в красивом Markdown-формате со структурой:
   - ## Обзор — 2-3 предложения что это и зачем
   - ## Ключевые возможности — bullet-список с **жирными** названиями фич и их описанием
   - ## Технические решения — что было сложного, как решили, интересные архитектурные решения
   - ## Результат — итог, что получилось, какую проблему решает
   Используй **жирный текст** для акцентов, \`inline code\` для технических терминов, заголовки ## и ### для структуры.
3. TECH_STACK: Список технологий через запятую (максимум 8 штук)

ВАЖНО: Весь текст пиши ТОЛЬКО на русском языке. Технологии в TECH_STACK пиши на английском.

Формат ответа СТРОГО:
---SHORT_DESCRIPTION---
[краткое описание на русском]
---DETAILED_CONTENT---
[подробное описание в Markdown на русском]
---TECH_STACK---
[Tech, Stack, через, запятую]`;

/**
 * Build the user message from generation input.
 */
function buildUserMessage(input: GenerateInput): string {
  let message = `Project Title: ${input.title}`;
  if (input.keywords) {
    message += `\nKeywords / Description: ${input.keywords}`;
  }
  if (input.context) {
    message += `\nAdditional Context: ${input.context}`;
  }
  return message;
}

/**
 * Stream a chat completion from OpenRouter.
 *
 * Returns a ReadableStream that emits text chunks as they arrive from the API.
 * The stream uses SSE (Server-Sent Events) format internally and yields
 * plain text content strings.
 *
 * @param input - Project title, keywords, and optional context
 * @param signal - Optional AbortSignal for cancellation
 * @returns ReadableStream of text content chunks
 * @throws Error if OPENROUTER_API_KEY is not set, or on API errors
 */
export function generateProjectContent(
  input: GenerateInput,
  signal?: AbortSignal
): ReadableStream<Uint8Array> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Set it in your environment variables."
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alteran.tech";

  const messages: OpenRouterMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserMessage(input) },
  ];

  const body: OpenRouterRequest = {
    model: DEFAULT_MODEL,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
  };

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        let response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": siteUrl,
            "X-Title": "alteran.tech",
          },
          body: JSON.stringify(body),
          signal,
        });

        // If primary model fails with 404 or 503, try fallback model
        if (response.status === 404 || response.status === 503) {
          const fallbackBody: OpenRouterRequest = {
            ...body,
            model: FALLBACK_MODEL,
          };
          response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": siteUrl,
              "X-Title": "alteran.tech",
            },
            body: JSON.stringify(fallbackBody),
            signal,
          });
        }

        if (!response.ok) {
          let errorMessage = `OpenRouter API error: ${response.status}`;
          try {
            const errorBody = await response.json();
            if (errorBody?.error?.message) {
              errorMessage = errorBody.error.message;
            }
          } catch {
            // Ignore JSON parse errors
          }

          if (response.status === 401) {
            errorMessage = "Invalid OpenRouter API key. Check your OPENROUTER_API_KEY.";
          } else if (response.status === 429) {
            errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "No response body from OpenRouter" })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          const lines = buffer.split("\n");
          // Keep the last potentially incomplete line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;

            if (trimmed.startsWith("data: ")) {
              const data = trimmed.slice(6);

              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return;
              }

              try {
                const chunk: OpenRouterStreamChunk = JSON.parse(data);
                const content = chunk.choices?.[0]?.delta?.content;
                if (content) {
                  // Forward as SSE with the text content
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ text: content })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          const trimmed = buffer.trim();
          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data !== "[DONE]") {
              try {
                const chunk: OpenRouterStreamChunk = JSON.parse(data);
                const content = chunk.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ text: content })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip
              }
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Client cancelled the request -- close cleanly
          controller.close();
          return;
        }
        // Network or other errors
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: errorMessage })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },

    cancel() {
      // Stream was cancelled by the consumer
    },
  });
}

/**
 * Parse the structured LLM output into separate fields.
 * The output follows the format with ---SHORT_DESCRIPTION---, ---DETAILED_CONTENT---, ---TECH_STACK--- markers.
 */
export function parseGenerateOutput(raw: string): {
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
