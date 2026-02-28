/** Role for chat messages sent to OpenRouter */
export type OpenRouterRole = "system" | "user" | "assistant";

/** A single chat message in OpenRouter format */
export interface OpenRouterMessage {
  role: OpenRouterRole;
  content: string;
}

/** Request body sent to OpenRouter /chat/completions */
export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

/**
 * A single chunk in the SSE stream from OpenRouter.
 * When streaming, each chunk contains a delta with partial content.
 */
export interface OpenRouterStreamChunk {
  id: string;
  choices: Array<{
    index: number;
    delta: {
      role?: OpenRouterRole;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

/** Error response from OpenRouter API */
export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

/** Input for the project content generation endpoint */
export interface GenerateInput {
  title: string;
  keywords: string;
  context?: string;
}

/**
 * Parsed result from the LLM generation.
 * The LLM outputs structured text which is parsed into these fields.
 */
export interface GenerateResult {
  description: string;
  content: string;
  techStack: string[];
}
