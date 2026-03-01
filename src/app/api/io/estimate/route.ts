import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { calculateCost, MODEL_COSTS } from "@/lib/cost-tracker";

export const runtime = "nodejs";
export const maxDuration = 10;

/**
 * Token Count + Cost Estimation
 *
 * Pre-flight endpoint that tells the user BEFORE generation:
 *   - How many tokens their prompt will use
 *   - Estimated cost per model
 *   - Recommended model for their use case
 *   - Expected generation time
 *
 * Uses Claude's token counting API to get exact input token counts.
 * Output tokens are estimated based on historical averages.
 */

// Average output tokens by model (based on typical website generation)
const AVG_OUTPUT_TOKENS: Record<string, number> = {
  "claude-opus-4-6-20250514":   12000,
  "claude-sonnet-4-6-20250514": 10000,
  "claude-haiku-4-5-20251001":  6000,
  "gpt-4o":                     8000,
  "gpt-4o-mini":                6000,
};

const AVG_THINKING_TOKENS: Record<string, number> = {
  "claude-opus-4-6-20250514":   12000,
  "claude-sonnet-4-6-20250514": 6000,
  "claude-haiku-4-5-20251001":  0,
  "gpt-4o":                     0,
  "gpt-4o-mini":                0,
};

const AVG_GENERATION_SECONDS: Record<string, number> = {
  "claude-opus-4-6-20250514":   45,
  "claude-sonnet-4-6-20250514": 25,
  "claude-haiku-4-5-20251001":  8,
  "gpt-4o":                     20,
  "gpt-4o-mini":                10,
};

export async function POST(req: NextRequest) {
  try { await auth(); } catch { /* allow anonymous estimates */ }

  const { prompt, model } = await req.json();

  if (!prompt?.trim()) {
    return Response.json({ error: "prompt required" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Build the full message as it would be sent to the API
  const systemPrompt = "You are a world-class web designer. Build a complete website as a single HTML file.";
  const userMessage = `Build a world-class website for: ${prompt.trim()}`;

  let inputTokens: number;

  // Use Claude's token counting API if available
  if (anthropicKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey });
      const countResult = await client.messages.countTokens({
        model: "claude-sonnet-4-6-20250514",
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });
      inputTokens = countResult.input_tokens;
    } catch {
      // Fallback: estimate ~4 chars per token
      inputTokens = Math.ceil((systemPrompt.length + userMessage.length) / 4);
    }
  } else {
    inputTokens = Math.ceil((systemPrompt.length + userMessage.length) / 4);
  }

  // Calculate costs for each model
  const models = Object.keys(MODEL_COSTS);
  const estimates = models.map((modelId) => {
    const avgOutput = AVG_OUTPUT_TOKENS[modelId] ?? 8000;
    const avgThinking = AVG_THINKING_TOKENS[modelId] ?? 0;
    const cost = calculateCost(modelId, inputTokens, avgOutput, avgThinking, 0, "pro");
    const shortName = modelId.includes("opus") ? "Opus"
      : modelId.includes("sonnet") ? "Sonnet"
      : modelId.includes("haiku") ? "Haiku"
      : modelId.includes("4o-mini") ? "GPT-4o Mini"
      : "GPT-4o";

    return {
      model: modelId,
      shortName,
      inputTokens,
      estimatedOutputTokens: avgOutput,
      estimatedThinkingTokens: avgThinking,
      estimatedCostCents: cost.apiCostCents,
      estimatedTimeSec: AVG_GENERATION_SECONDS[modelId] ?? 20,
      quality: modelId.includes("opus") ? "highest"
        : modelId.includes("sonnet") ? "high"
        : modelId.includes("haiku") ? "good"
        : modelId.includes("4o-mini") ? "good"
        : "high",
    };
  });

  // Pick recommended model
  const recommended = estimates.find((e) => e.model.includes("sonnet"))!;

  return Response.json({
    ok: true,
    inputTokens,
    promptLength: prompt.trim().length,
    estimates,
    recommended: {
      model: recommended.model,
      shortName: recommended.shortName,
      reason: "Best balance of quality, speed, and cost",
      estimatedCostCents: recommended.estimatedCostCents,
      estimatedTimeSec: recommended.estimatedTimeSec,
    },
    tips: [
      inputTokens > 500 ? "Your prompt is detailed — great for quality, but adds cost." : null,
      inputTokens < 50 ? "Try adding more detail to your prompt for better results." : null,
      "Prompt caching saves ~50% on repeated generations with similar prompts.",
      "Extended thinking (Sonnet/Opus) adds cost but dramatically improves output.",
    ].filter(Boolean),
  });
}
