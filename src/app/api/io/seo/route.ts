import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdminUser, checkAndConsumeCredits } from "@/lib/agent-credits";

export const runtime = "nodejs";
export const maxDuration = 30;

const SEO_SYSTEM_PROMPT = `You are an expert SEO analyst. Analyse the provided HTML and return a JSON object with this exact structure:

{
  "score": <number 0-100>,
  "grade": "<A|B|C|D|F>",
  "summary": "<one sentence overall assessment>",
  "issues": [
    {
      "severity": "<critical|warning|info>",
      "category": "<title|meta|headings|images|performance|structured-data|mobile|content>",
      "message": "<short description of the issue>",
      "fix": "<specific actionable fix in one sentence>"
    }
  ],
  "strengths": ["<thing done well>", ...]
}

WHAT TO CHECK:
- <title> tag: present, 50-60 chars, includes brand name
- <meta name="description">: present, 150-160 chars, compelling
- Open Graph tags: og:title, og:description, og:image
- H1: exactly one, contains primary keyword
- H2/H3: logical hierarchy, keyword-rich
- Images: alt attributes present, descriptive
- Canonical URL tag
- Structured data (JSON-LD): LocalBusiness, Product, etc.
- Mobile viewport meta tag
- Lang attribute on <html>
- Internal links working (href not empty)
- Page speed signals: inline CSS (good), external resources (flag if many)
- Content length: at least 300 words of real content
- CTA presence: at least one clear call-to-action

Return ONLY valid JSON. No markdown, no explanation, no code fences.`;

export async function POST(req: NextRequest) {
  // ── Auth + credit check ────────────────────────────────────────────────────
  const { userId } = await auth();
  if (userId && !isAdminUser(userId)) {
    const check = await checkAndConsumeCredits(userId, "seo-sweep");
    if (!check.ok) {
      return Response.json(
        { error: check.message, code: check.code, balance: check.balance },
        { status: check.code === "NO_ACCESS" ? 403 : 402 },
      );
    }
  }

  const { html } = await req.json();

  if (!html?.trim()) {
    return new Response("HTML required", { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!anthropicKey && !openaiKey) {
    return new Response("No AI provider configured", { status: 500 });
  }

  // Truncate HTML to keep costs low — first 8000 chars covers all meta + structure
  const truncated = html.length > 8000 ? html.slice(0, 8000) + "\n<!-- truncated -->" : html;
  const userContent = `Analyse this HTML:\n\n${truncated}`;

  // ── Prefer Claude Haiku for analysis (fast, cheap, excellent structured JSON) ─
  if (anthropicKey) {
    const client = new Anthropic({ apiKey: anthropicKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      temperature: 0.1,
      system: SEO_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });
    const block = msg.content[0];
    const raw = block.type === "text" ? block.text : "{}";
    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return new Response(jsonMatch ? jsonMatch[0] : raw, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-D8-Model": "claude-haiku-4-5",
      },
    });
  }

  // ── OpenAI fallback ──────────────────────────────────────────────────────
  const openai = new OpenAI({ apiKey: openaiKey });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SEO_SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
    max_tokens: 1200,
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  return new Response(raw, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
