import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { generateProjectContent } from "@/lib/openrouter";
import type { GenerateInput } from "@/types/openrouter";

/**
 * POST /api/generate
 *
 * Protected endpoint that generates project content using OpenRouter LLM.
 * Returns a streaming SSE response with text chunks.
 *
 * Body: { title: string, keywords: string, context?: string }
 * Response: text/event-stream with SSE data lines
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse request body
  let body: GenerateInput;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate required fields
  if (!body.title?.trim()) {
    return new Response(
      JSON.stringify({ error: "Title is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const input: GenerateInput = {
    title: body.title.trim(),
    keywords: body.keywords?.trim() || "",
    context: body.context?.trim(),
  };

  // Check if API key is configured
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your environment variables.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Generate streaming response
    const stream = generateProjectContent(input, request.signal);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate content";
    console.error("POST /api/generate error:", err);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
