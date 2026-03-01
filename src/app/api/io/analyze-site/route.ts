import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * 1M Context Window — Multi-Page Site Analysis
 *
 * Uses Claude's extended 1M token context window to analyze
 * entire multi-page websites in a single API call:
 *   - Feed ALL pages of a site at once
 *   - Cross-page consistency analysis
 *   - Navigation flow review
 *   - Design system extraction
 *   - Content audit across all pages
 *   - Internal linking analysis
 *
 * This is impossible with standard 200K context — a full 10-page
 * site with CSS/JS can easily exceed 200K tokens.
 *
 * Pricing: Standard token pricing applies. Long context (>200K)
 * may have additional pricing but the capability is what matters.
 */

const MULTI_PAGE_SYSTEM_PROMPT = `You are a senior web consultant performing a holistic analysis of a multi-page website.

You have been given ALL pages of the website. Analyze them as a complete system, not individually.

Return JSON:
{
  "siteOverview": {
    "totalPages": <n>,
    "estimatedContentWords": <n>,
    "primaryPurpose": "<e-commerce | portfolio | SaaS | blog | corporate | etc>",
    "overallQuality": <0-100>
  },
  "designConsistency": {
    "score": <0-100>,
    "issues": [
      {
        "type": "color-mismatch" | "font-inconsistency" | "spacing-drift" | "component-variation" | "nav-inconsistency",
        "pages": ["<page names affected>"],
        "description": "<specific inconsistency>",
        "fix": "<how to fix>"
      }
    ],
    "designSystem": {
      "colors": ["<hex colors used across the site>"],
      "fonts": ["<font families detected>"],
      "spacingScale": "<detected spacing pattern>",
      "componentPatterns": ["<reusable component patterns found>"]
    }
  },
  "navigation": {
    "score": <0-100>,
    "structure": "<flat | hierarchical | mixed>",
    "issues": [
      {
        "type": "dead-link" | "orphan-page" | "missing-nav-item" | "inconsistent-menu",
        "description": "<issue>",
        "fix": "<fix>"
      }
    ],
    "userFlowAssessment": "<how well does the navigation guide users to conversion?>"
  },
  "contentAudit": {
    "score": <0-100>,
    "pageBreakdown": [
      {
        "page": "<page name>",
        "wordCount": <n>,
        "headingStructure": "<good | needs-work | poor>",
        "cta": "<strong | weak | missing>",
        "seoReadiness": "<good | needs-work | poor>"
      }
    ],
    "crossPageIssues": ["<content gaps, redundancies, or inconsistencies>"],
    "missingPages": ["<pages that should exist but don't>"]
  },
  "technicalConsistency": {
    "score": <0-100>,
    "sharedAssets": ["<CSS/JS files shared across pages>"],
    "issues": ["<technical inconsistencies between pages>"]
  },
  "topPriorities": [
    {
      "rank": <1-5>,
      "action": "<what to do>",
      "impact": "<why it matters>",
      "effort": "quick" | "medium" | "complex",
      "affectedPages": ["<which pages>"]
    }
  ]
}`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { pages } = await req.json();

  if (!Array.isArray(pages) || pages.length === 0) {
    return Response.json(
      { error: "pages array required: [{name: string, html: string}]" },
      { status: 400 },
    );
  }

  if (pages.length > 20) {
    return Response.json({ error: "Maximum 20 pages per analysis" }, { status: 400 });
  }

  // Build the combined content
  const pageContents = pages.map((p: { name: string; html: string }, i: number) => {
    return `\n\n${"=".repeat(60)}\nPAGE ${i + 1}: ${p.name}\n${"=".repeat(60)}\n\n${p.html}`;
  }).join("\n");

  const totalChars = pageContents.length;
  const estimatedTokens = Math.ceil(totalChars / 4);

  const client = new Anthropic({ apiKey: anthropicKey });

  // Use 1M context window beta for large sites
  const createParams: Record<string, unknown> = {
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 6000,
    temperature: 0.1,
    system: [
      {
        type: "text",
        text: MULTI_PAGE_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Analyze this ${pages.length}-page website holistically:\n${pageContents}`,
      },
    ],
  };

  // Enable 1M context for large sites (>150K estimated tokens)
  if (estimatedTokens > 150000) {
    createParams.betas = ["context-1m-2025-08-07"];
  }

  const msg = await client.messages.create(
    createParams as unknown as Parameters<typeof client.messages.create>[0]
  );

  const block = msg.content[0];
  const raw = block.type === "text" ? block.text : "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };

  return Response.json({
    ok: true,
    analysis,
    meta: {
      pagesAnalyzed: pages.length,
      totalChars,
      estimatedTokens,
      used1MContext: estimatedTokens > 150000,
    },
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    },
  });
}
