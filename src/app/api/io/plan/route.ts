import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Two-pass generation — Pass 1: Plan
 *
 * Uses Claude Haiku (fast + cheap) to create a detailed site plan JSON
 * before the expensive HTML generation pass. This gives:
 *   1. A reviewable plan the user can approve/tweak
 *   2. Much more consistent output from the builder
 *   3. Lower total cost (Haiku plan + targeted Sonnet build)
 */

const PLAN_SYSTEM_PROMPT = `You are an elite web design architect. Given a business brief, produce a detailed site plan as JSON.

Return ONLY valid JSON (no markdown, no code fences):
{
  "businessName": "<creative, memorable invented name>",
  "tagline": "<punchy 5-8 word tagline>",
  "industry": "<detected or given industry>",
  "palette": {
    "brand": "<hex>",
    "brandLight": "<hex>",
    "surface0": "<hex — darkest bg>",
    "surface1": "<hex — panel bg>",
    "text1": "<hex — primary text>",
    "text2": "<hex — secondary text>"
  },
  "typography": {
    "headingFont": "<Google Font name>",
    "bodyFont": "<Google Font name>",
    "heroSize": "<e.g. clamp(56px, 8vw, 100px)>"
  },
  "sections": [
    {
      "id": "<section-id>",
      "type": "<nav|hero|social-proof|features|about|testimonials|process|cta|footer>",
      "headline": "<section headline>",
      "content": "<brief description of what goes here>",
      "stats": ["<any numbers/stats to display>"],
      "style": "<dark|light>"
    }
  ],
  "testimonials": [
    { "name": "<full name>", "role": "<title at company>", "quote": "<specific, outcome-focused quote>" }
  ],
  "pricing": [
    { "name": "<tier name>", "price": "<e.g. $49/mo>", "features": ["<feature>"] }
  ],
  "contact": {
    "address": "<full invented address>",
    "phone": "<+country code number>",
    "email": "<matching email>"
  },
  "cta": {
    "primary": "<main CTA text>",
    "secondary": "<secondary CTA text>"
  },
  "designNotes": "<2-3 sentences on the overall design direction>"
}

RULES:
• Invent ALL content — specific, real, compelling. Zero placeholders.
• Choose colours that are perfect for the industry and vibe.
• Plan exactly 9 sections in the standard order.
• Each testimonial must reference a specific outcome or number.`;

export async function POST(req: NextRequest) {
  const { prompt, industry, vibe } = await req.json();

  if (!prompt?.trim()) {
    return Response.json({ error: "Prompt required" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  // Auth (optional — allow anonymous for plan step)
  try { await auth(); } catch { /* continue */ }

  const client = new Anthropic({ apiKey: anthropicKey });

  const userContent = [
    `Create a site plan for: ${prompt.trim()}`,
    industry ? `Industry: ${industry}` : "",
    vibe ? `Design vibe: ${vibe}` : "",
  ].filter(Boolean).join("\n");

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    temperature: 0.3,
    system: [
      {
        type: "text",
        text: PLAN_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const block = msg.content[0];
  const raw = block.type === "text" ? block.text : "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse plan" };

  return Response.json({
    ok: true,
    plan,
    model: "claude-haiku-4-5-20251001",
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    },
  });
}
