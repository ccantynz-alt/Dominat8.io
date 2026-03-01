import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Deep SEO Audit with Citations
 *
 * Uses Claude's citations feature to provide SOURCED recommendations.
 * Instead of "your meta description is too short", you get:
 *   "Your meta description is 80 chars [1]. Google recommends 150-160 chars [2]."
 *   [1] Extracted from your HTML: <meta name="description" content="...">
 *   [2] Source: Google Search Central documentation
 *
 * This adds trust and specificity to every recommendation.
 * Each issue points directly to the HTML that caused it.
 */

const DEEP_SEO_PROMPT = `You are a senior SEO consultant. Perform a comprehensive audit of this website HTML.

For EVERY issue you find, cite the specific HTML element that caused it by quoting the exact text from the document.

Return JSON:
{
  "overallScore": <0-100>,
  "grade": "<A+|A|B|C|D|F>",
  "summary": "<2-3 sentence executive summary>",
  "categories": {
    "meta": {
      "score": <0-100>,
      "items": [
        {
          "check": "<what was checked>",
          "status": "pass" | "fail" | "warning",
          "found": "<what we found in the HTML — quote the exact element>",
          "recommendation": "<specific fix with best practice reference>",
          "impact": "high" | "medium" | "low"
        }
      ]
    },
    "content": { "score": <0-100>, "items": [<same structure>] },
    "structure": { "score": <0-100>, "items": [<same structure>] },
    "technical": { "score": <0-100>, "items": [<same structure>] },
    "links": { "score": <0-100>, "items": [<same structure>] }
  },
  "topPriorities": [
    {
      "rank": 1,
      "action": "<specific action to take>",
      "impact": "<expected improvement>",
      "effort": "quick" | "medium" | "complex"
    }
  ],
  "competitorInsight": "<1 sentence about what top-ranking sites in this niche do differently>"
}

META CHECKS: title (50-60 chars), description (150-160 chars), OG tags (og:title, og:description, og:image, og:url), Twitter card, canonical URL, robots meta, viewport, charset, language tag, favicon.

CONTENT CHECKS: H1 count (exactly 1), heading hierarchy (H1→H2→H3), keyword density, content length (300+ words), image alt text, content freshness signals, CTA presence and clarity.

STRUCTURE CHECKS: semantic HTML (header, nav, main, section, article, footer), schema.org/JSON-LD, breadcrumbs, internal linking, URL structure hints, mobile-first signals.

TECHNICAL CHECKS: CSS in <style> vs external, JS in <script> vs external, font loading (display:swap), image optimization hints, lazy loading, preconnect/preload, Core Web Vitals signals.

LINK CHECKS: total links, internal vs external, anchor text quality, CTA link quality, nofollow usage, dead anchors (#), mailto/tel links.

Quote the EXACT HTML elements you're evaluating. Be specific, not generic.`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const { html } = await req.json();
  if (!html?.trim()) {
    return Response.json({ error: "html required" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  // Use citations: pass the HTML as a document source so Claude can cite
  // specific parts of it in its analysis.
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 4000,
    temperature: 0.1,
    system: [
      {
        type: "text",
        text: DEEP_SEO_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "content",
              media_type: "text/html",
              content: html.slice(0, 30000), // limit size for analysis
            },
            title: "Website HTML",
            citations: { enabled: true },
          },
          {
            type: "text",
            text: "Perform a deep SEO audit of this website. Cite specific HTML elements in your findings.",
          },
        ],
      },
    ],
  });

  // Extract text and citations from the response
  const textBlocks: string[] = [];
  const citations: Array<{ text: string; source: string }> = [];

  for (const block of msg.content) {
    if (block.type === "text") {
      textBlocks.push(block.text);
      // Extract inline citations if present
      if ("citations" in block && Array.isArray(block.citations)) {
        for (const cite of block.citations) {
          citations.push({
            text: (cite as Record<string, string>).cited_text ?? "",
            source: (cite as Record<string, string>).document_title ?? "HTML",
          });
        }
      }
    }
  }

  const raw = textBlocks.join("");
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };

  return Response.json({
    ok: true,
    audit: result,
    citations,
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
      model: "claude-sonnet-4-6-20250514",
    },
  });
}
