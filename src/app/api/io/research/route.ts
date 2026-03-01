import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

/**
 * Web Search Tool — Competitor Research During Generation
 *
 * Before building a website, Claude searches the web to:
 *   1. Research the user's industry + competitors
 *   2. Find design trends and best practices
 *   3. Pull real stats and social proof patterns
 *   4. Discover pricing models in the niche
 *   5. Find real testimonial patterns to emulate
 *
 * This makes generated sites MORE relevant and competitive because
 * they're based on actual market research, not just Claude's training data.
 *
 * Pricing: $10 per 1,000 searches + standard token costs
 * At our volume, this is ~$0.01 per generation — negligible.
 */

const RESEARCH_SYSTEM_PROMPT = `You are a business strategist and web design researcher.

Given a business description, search the web to research:
1. What competitors in this space look like
2. Design trends for this industry
3. Common pricing models
4. What messaging resonates
5. Social proof patterns (testimonials, stats, trust badges)

Then synthesize your findings into a comprehensive brief that a web designer can use to build a competitive website.

Return JSON:
{
  "industry": "<identified industry>",
  "competitors": [
    {
      "name": "<competitor name>",
      "url": "<their website>",
      "strengths": ["<what they do well>"],
      "weaknesses": ["<gaps we can exploit>"]
    }
  ],
  "designTrends": [
    "<specific design pattern popular in this industry>"
  ],
  "messagingPatterns": [
    "<common headlines, CTAs, or value props used>"
  ],
  "pricingInsights": {
    "models": ["<subscription|one-time|freemium|etc>"],
    "ranges": "<typical price range in this market>",
    "recommendation": "<what pricing to feature on the site>"
  },
  "socialProofPatterns": [
    "<types of social proof competitors use>"
  ],
  "differentiators": [
    "<opportunities to stand out from competitors>"
  ],
  "buildRecommendation": "<2-3 sentences describing the ideal website approach based on research>",
  "enhancedPrompt": "<A detailed prompt incorporating all research findings that can be passed directly to the website generator for a highly competitive result>"
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

  const { prompt, industry } = await req.json();
  if (!prompt?.trim()) {
    return Response.json({ error: "prompt required" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  const userContent = [
    `Research the market and competitors for this business: ${prompt.trim()}`,
    industry ? `Industry: ${industry}` : "",
    "Search for competitors, design trends, and pricing patterns.",
  ].filter(Boolean).join("\n");

  // Use web_search tool so Claude can research the market
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 4000,
    temperature: 0.2,
    system: [
      {
        type: "text",
        text: RESEARCH_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      } as unknown as Anthropic.Tool,
    ],
  });

  // Extract the final text response (after search results)
  const textBlocks: string[] = [];
  let searchesUsed = 0;

  for (const block of msg.content) {
    if (block.type === "text") {
      textBlocks.push(block.text);
    } else if (block.type === "server_tool_use") {
      searchesUsed++;
    }
  }

  const fullText = textBlocks.join("\n");
  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  const research = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: fullText };

  return Response.json({
    ok: true,
    research,
    enhancedPrompt: research.enhancedPrompt ?? null,
    searchesUsed,
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    },
  });
}
