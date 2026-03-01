import { OpenAI } from "openai";
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  // Truncate HTML to keep costs low — first 8000 chars covers all meta + structure
  const truncated = html.length > 8000 ? html.slice(0, 8000) + "\n<!-- truncated -->" : html;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SEO_SYSTEM_PROMPT },
      { role: "user", content: `Analyse this HTML:\n\n${truncated}` },
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
