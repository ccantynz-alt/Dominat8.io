/**
 * Structured Outputs — Native JSON Mode
 *
 * Claude's native JSON mode via output_config.format guarantees
 * responses match a provided JSON schema. This is STRONGER than
 * tool use because:
 *   - No tool_choice workaround needed
 *   - The entire response IS the JSON (not wrapped in tool_use blocks)
 *   - Supports deeply nested schemas
 *   - Works with streaming
 *
 * We use this for the site plan, audit results, and any structured data.
 */

import Anthropic from "@anthropic-ai/sdk";

// ── Site Plan Schema ─────────────────────────────────────────────────────────

export const SITE_PLAN_SCHEMA = {
  type: "object" as const,
  properties: {
    businessName: { type: "string" as const },
    tagline: { type: "string" as const },
    industry: { type: "string" as const },
    palette: {
      type: "object" as const,
      properties: {
        brand: { type: "string" as const, description: "Primary brand color hex" },
        brandLight: { type: "string" as const },
        surface0: { type: "string" as const, description: "Darkest background" },
        surface1: { type: "string" as const, description: "Panel background" },
        text1: { type: "string" as const, description: "Primary text" },
        text2: { type: "string" as const, description: "Secondary text" },
      },
      required: ["brand", "brandLight", "surface0", "surface1", "text1", "text2"] as const,
    },
    typography: {
      type: "object" as const,
      properties: {
        headingFont: { type: "string" as const },
        bodyFont: { type: "string" as const },
        heroSize: { type: "string" as const },
      },
      required: ["headingFont", "bodyFont", "heroSize"] as const,
    },
    sections: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          id: { type: "string" as const },
          type: { type: "string" as const },
          headline: { type: "string" as const },
          content: { type: "string" as const },
          style: { type: "string" as const, enum: ["dark", "light"] },
        },
        required: ["id", "type", "headline", "content"] as const,
      },
    },
    testimonials: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          role: { type: "string" as const },
          quote: { type: "string" as const },
        },
        required: ["name", "role", "quote"] as const,
      },
    },
    cta: {
      type: "object" as const,
      properties: {
        primary: { type: "string" as const },
        secondary: { type: "string" as const },
      },
      required: ["primary", "secondary"] as const,
    },
    designNotes: { type: "string" as const },
  },
  required: [
    "businessName", "tagline", "industry", "palette",
    "typography", "sections", "testimonials", "cta", "designNotes",
  ] as const,
};

// ── Audit Result Schema ──────────────────────────────────────────────────────

export const AUDIT_RESULT_SCHEMA = {
  type: "object" as const,
  properties: {
    overallScore: { type: "number" as const },
    grade: { type: "string" as const },
    summary: { type: "string" as const },
    issues: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          severity: { type: "string" as const, enum: ["critical", "major", "minor"] },
          category: { type: "string" as const },
          message: { type: "string" as const },
          fix: { type: "string" as const },
        },
        required: ["severity", "category", "message", "fix"] as const,
      },
    },
    strengths: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    topFix: { type: "string" as const },
  },
  required: ["overallScore", "grade", "summary", "issues", "strengths", "topFix"] as const,
};

// ── Generic helper: call Claude with structured output ───────────────────────

export async function callWithStructuredOutput<T>(
  client: Anthropic,
  options: {
    model: string;
    systemPrompt: string;
    userMessage: string;
    schema: Record<string, unknown>;
    schemaName: string;
    maxTokens?: number;
    temperature?: number;
  },
): Promise<T> {
  const msg = await client.messages.create({
    model: options.model,
    max_tokens: options.maxTokens ?? 4000,
    temperature: options.temperature ?? 0.2,
    system: [
      {
        type: "text",
        text: options.systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: options.userMessage }],
    // Native JSON mode — response MUST match the schema
    response_format: {
      type: "json_schema",
      json_schema: {
        name: options.schemaName,
        schema: options.schema,
        strict: true,
      },
    },
  } as unknown as Anthropic.MessageCreateParamsNonStreaming);

  const block = msg.content[0];
  const raw = block.type === "text" ? block.text : "{}";
  return JSON.parse(raw) as T;
}
