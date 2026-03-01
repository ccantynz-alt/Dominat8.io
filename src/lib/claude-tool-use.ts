/**
 * Claude Tool Use — Guaranteed Structured Output
 *
 * Instead of asking Claude to "return JSON" and hoping it's valid,
 * we define a tool schema and force Claude to call it. The Anthropic API
 * GUARANTEES the tool call parameters match the JSON schema.
 *
 * This eliminates:
 *   - JSON parse errors from malformed output
 *   - Missing fields
 *   - Wrong types
 *   - Extra markdown/text around the JSON
 *
 * How it works:
 *   1. Define a tool with an input_schema (JSON Schema)
 *   2. Set tool_choice to force that specific tool
 *   3. Claude MUST return valid JSON matching the schema
 *   4. Extract the structured data from the tool_use block
 */

import Anthropic from "@anthropic-ai/sdk";

// ── SEO Audit Tool Schema ────────────────────────────────────────────────────

export const SEO_AUDIT_TOOL: Anthropic.Tool = {
  name: "submit_seo_audit",
  description: "Submit the SEO audit results for this website",
  input_schema: {
    type: "object" as const,
    properties: {
      score: { type: "number", description: "SEO score 0-100" },
      grade: { type: "string", enum: ["A", "B", "C", "D", "F"] },
      summary: { type: "string", description: "One sentence summary" },
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["high", "medium", "low"] },
            category: { type: "string", enum: ["Meta", "Content", "Structure", "Performance", "Links"] },
            message: { type: "string" },
            fix: { type: "string" },
          },
          required: ["severity", "category", "message", "fix"],
        },
      },
      strengths: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["score", "grade", "summary", "issues", "strengths"],
  },
};

// ── Responsive Audit Tool Schema ─────────────────────────────────────────────

export const RESPONSIVE_AUDIT_TOOL: Anthropic.Tool = {
  name: "submit_responsive_audit",
  description: "Submit the responsive design audit results",
  input_schema: {
    type: "object" as const,
    properties: {
      score: { type: "number", description: "Responsive score 0-100" },
      summary: { type: "string" },
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["high", "medium", "low"] },
            element: { type: "string" },
            problem: { type: "string" },
            fix: { type: "string" },
          },
          required: ["severity", "element", "problem", "fix"],
        },
      },
      missing_features: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["score", "summary", "issues", "missing_features"],
  },
};

// ── Performance Audit Tool Schema ────────────────────────────────────────────

export const PERFORMANCE_AUDIT_TOOL: Anthropic.Tool = {
  name: "submit_performance_audit",
  description: "Submit the performance audit results",
  input_schema: {
    type: "object" as const,
    properties: {
      score: { type: "number", description: "Performance score 0-100" },
      summary: { type: "string" },
      vitals: {
        type: "object",
        properties: {
          lcp_risk: { type: "string", enum: ["low", "medium", "high"] },
          cls_risk: { type: "string", enum: ["low", "medium", "high"] },
          fid_risk: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["lcp_risk", "cls_risk", "fid_risk"],
      },
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            impact: { type: "string", enum: ["high", "medium", "low"] },
            detail: { type: "string" },
          },
          required: ["title", "impact", "detail"],
        },
      },
    },
    required: ["score", "summary", "vitals", "suggestions"],
  },
};

// ── Accessibility Audit Tool Schema ──────────────────────────────────────────

export const ACCESSIBILITY_AUDIT_TOOL: Anthropic.Tool = {
  name: "submit_accessibility_audit",
  description: "Submit the accessibility audit results",
  input_schema: {
    type: "object" as const,
    properties: {
      score: { type: "number", description: "Accessibility score 0-100" },
      grade: { type: "string", enum: ["A", "B", "C", "D", "F"] },
      summary: { type: "string" },
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            wcag: { type: "string", description: "WCAG criterion (e.g. 1.1.1)" },
            severity: { type: "string", enum: ["critical", "major", "minor"] },
            problem: { type: "string" },
            fix: { type: "string" },
          },
          required: ["wcag", "severity", "problem", "fix"],
        },
      },
      strengths: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["score", "grade", "summary", "issues", "strengths"],
  },
};

// ── Link Scanner Tool Schema ─────────────────────────────────────────────────

export const LINK_SCANNER_TOOL: Anthropic.Tool = {
  name: "submit_link_scan",
  description: "Submit the link scan results",
  input_schema: {
    type: "object" as const,
    properties: {
      total_links: { type: "number" },
      summary: { type: "string" },
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["empty-href", "placeholder", "weak-cta", "dead-anchor", "missing-text", "javascript-void"] },
            element: { type: "string" },
            fix: { type: "string" },
          },
          required: ["type", "element", "fix"],
        },
      },
      cta_quality: { type: "string", enum: ["strong", "adequate", "weak", "missing"] },
    },
    required: ["total_links", "summary", "issues", "cta_quality"],
  },
};

// ── Tool mapping ─────────────────────────────────────────────────────────────

export const AGENT_TOOLS: Partial<Record<string, Anthropic.Tool>> = {
  "seo-sweep": SEO_AUDIT_TOOL,
  "responsive-audit": RESPONSIVE_AUDIT_TOOL,
  "performance-optimizer": PERFORMANCE_AUDIT_TOOL,
  "accessibility-checker": ACCESSIBILITY_AUDIT_TOOL,
  "link-scanner": LINK_SCANNER_TOOL,
};

// ── Helper: run with tool use ────────────────────────────────────────────────

export async function runWithToolUse(
  client: Anthropic,
  model: string,
  systemPrompt: string,
  userContent: string,
  tool: Anthropic.Tool,
): Promise<Record<string, unknown>> {
  const msg = await client.messages.create({
    model,
    max_tokens: 2048,
    temperature: 0.1,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
    tools: [tool],
    tool_choice: { type: "tool", name: tool.name },
  });

  // Extract the tool call — guaranteed to exist and be valid JSON
  const toolBlock = msg.content.find((b) => b.type === "tool_use");
  if (toolBlock && toolBlock.type === "tool_use") {
    return toolBlock.input as Record<string, unknown>;
  }

  // Fallback (should never happen with tool_choice: tool)
  const textBlock = msg.content.find((b) => b.type === "text");
  if (textBlock && textBlock.type === "text") {
    const match = textBlock.text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
  return {};
}
