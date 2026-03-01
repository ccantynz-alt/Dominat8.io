export const DISPATCHER_STAMP = 'ARCH_PHASE_B_2026-03-01';

/**
 * Dispatcher — routes builder requests to the appropriate agent/model.
 *
 * Phase B: active routing based on requested model + task type.
 */

export type BuilderModel = "gpt-4o" | "claude-haiku" | "claude-sonnet" | "claude-opus";

export type TaskType = "generate" | "fix" | "refine" | "seo" | "agent";

export interface DispatchRequest {
  model: BuilderModel;
  task: TaskType;
  prompt?: string;
  html?: string;
}

export interface DispatchResult {
  endpoint: string;
  model: string;
  provider: "anthropic" | "openai";
  maxTokens: number;
}

const MODEL_MAP: Record<BuilderModel, { provider: "anthropic" | "openai"; modelId: string }> = {
  "gpt-4o":         { provider: "openai",    modelId: "gpt-4o" },
  "claude-haiku":   { provider: "anthropic",  modelId: "claude-haiku-4-5-20251001" },
  "claude-sonnet":  { provider: "anthropic",  modelId: "claude-sonnet-4-6-20250514" },
  "claude-opus":    { provider: "anthropic",  modelId: "claude-opus-4-6-20250514" },
};

const TASK_ENDPOINTS: Record<TaskType, string> = {
  generate: "/api/io/generate",
  fix:      "/api/io/fix",
  refine:   "/api/io/agents/run",
  seo:      "/api/io/seo",
  agent:    "/api/io/agents/run",
};

const TOKEN_LIMITS: Record<TaskType, Record<"anthropic" | "openai", number>> = {
  generate: { anthropic: 16000, openai: 16000 },
  fix:      { anthropic: 16000, openai: 16000 },
  refine:   { anthropic: 16000, openai: 12000 },
  seo:      { anthropic: 1200,  openai: 1200 },
  agent:    { anthropic: 2048,  openai: 2000 },
};

export function dispatch(request: DispatchRequest): DispatchResult {
  const { model, task } = request;
  const resolved = MODEL_MAP[model] ?? MODEL_MAP["claude-sonnet"];
  const endpoint = TASK_ENDPOINTS[task] ?? TASK_ENDPOINTS.generate;
  const maxTokens = TOKEN_LIMITS[task]?.[resolved.provider] ?? 16000;

  // Opus gets higher token limits for generation tasks
  const adjustedTokens = model === "claude-opus" && (task === "generate" || task === "fix")
    ? 32000
    : maxTokens;

  return {
    endpoint,
    model: resolved.modelId,
    provider: resolved.provider,
    maxTokens: adjustedTokens,
  };
}
