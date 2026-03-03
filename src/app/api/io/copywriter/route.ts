/**
 * POST /api/io/copywriter
 * AI Copywriter agent — generates marketing copy:
 *   - Landing page copy (hero, features, CTA)
 *   - Email welcome sequence (3 emails)
 *   - Google/Facebook ad copy (3 variations)
 *   - Product description
 *   - Social proof copy
 *
 * Costs 3 credits (ai-copywriter agent). Starter+ plan required. Admin bypass.
 */
import Anthropic from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeCredits, isAdminUser } from "@/lib/agent-credits";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminUser(userId)) {
    const check = await checkAndConsumeCredits(userId, "ai-copywriter");
    if (!check.ok) {
      return NextResponse.json(
        { error: check.message, code: check.code, balance: check.balance },
        { status: check.code === "NO_ACCESS" ? 403 : 402 },
      );
    }
  }

  let prompt: string;
  let industry: string | undefined;
  let tone: string | undefined;
  let html: string | undefined;
  try {
    const body = await req.json();
    prompt = body.prompt;
    industry = body.industry;
    tone = body.tone;
    html = body.html;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const htmlContext = html ? `\n\nExisting website HTML (first 4000 chars):\n${html.slice(0, 4000)}` : "";

  const systemPrompt = `You are an elite direct-response copywriter who has generated over $100M in revenue. You write copy that converts. Every word earns its place.

Generate a complete marketing copy package. Be specific, benefit-driven, and action-oriented.

Output a single valid JSON object:
{
  "businessName": "Extracted or suggested business name",
  "tagline": "Punchy one-liner (under 10 words)",
  "landingPage": {
    "heroHeadline": "Benefit-driven H1 (under 12 words)",
    "heroSubheadline": "Supporting copy (1-2 sentences)",
    "ctaPrimary": "Main CTA button text",
    "ctaSecondary": "Secondary CTA text",
    "features": [
      { "title": "Feature name", "description": "Benefit-focused description (2 sentences)", "icon": "emoji" }
    ],
    "socialProof": "Social proof statement",
    "urgency": "Urgency or scarcity element"
  },
  "emailSequence": [
    { "subject": "Email subject line", "preview": "Preview text", "body": "Full email body (2-3 paragraphs)", "cta": "Email CTA", "sendDay": 0 }
  ],
  "adCopy": {
    "google": [
      { "headline1": "Max 30 chars", "headline2": "Max 30 chars", "description": "Max 90 chars" }
    ],
    "facebook": [
      { "primaryText": "Ad copy (2-3 sentences)", "headline": "Under 40 chars", "description": "Under 30 chars", "cta": "Button text" }
    ]
  },
  "productDescription": {
    "short": "One paragraph (50 words)",
    "medium": "Two paragraphs (100 words)",
    "long": "Three paragraphs with bullet points (200 words)"
  },
  "toneGuide": "Brief tone/voice description for consistency"
}

Include 4-6 features, 3 welcome emails (day 0, 1, 3), 3 Google ads, and 3 Facebook ads.`;

  const userMsg = `Create a complete marketing copy package for: "${prompt.slice(0, 400)}". Industry: ${industry ?? "business"}. Desired tone: ${tone ?? "professional but approachable"}.${htmlContext}`;

  try {
    let content = "";

    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      });
      const block = msg.content[0];
      content = block.type === "text" ? block.text : "";
    } else if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const resp = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        max_tokens: 4096,
      });
      content = resp.choices[0]?.message?.content ?? "";
    } else {
      return NextResponse.json({ error: "No AI key configured" }, { status: 503 });
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const copyPackage = JSON.parse(jsonMatch[0]);

    return NextResponse.json(copyPackage);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
