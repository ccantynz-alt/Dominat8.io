import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

/**
 * Vision-Powered Screenshot QA Loop
 *
 * This is the killer feature competitors DON'T have:
 * 1. User generates a website → we get HTML
 * 2. We render the HTML to a screenshot (client-side via html2canvas or server via Puppeteer)
 * 3. We send the screenshot BACK to Claude Vision to review
 * 4. Claude spots visual bugs that text analysis CANNOT catch:
 *    - Overlapping elements
 *    - Cut-off text
 *    - Wrong colors rendering differently than CSS suggests
 *    - Image layout issues
 *    - Mobile rendering problems
 *    - Spacing/alignment issues only visible when rendered
 * 5. Returns specific fixes with line references
 *
 * This creates a feedback loop: generate → screenshot → review → fix → repeat
 */

const QA_SYSTEM_PROMPT = `You are an elite visual QA engineer reviewing a screenshot of a generated website.

TASK: Analyze this screenshot for visual bugs, design issues, and rendering problems.

Score the visual quality 0-100 and return JSON:
{
  "score": <0-100>,
  "grade": "<A+ | A | B | C | D | F>",
  "overallImpression": "<1 sentence summary>",
  "issues": [
    {
      "severity": "critical" | "major" | "minor" | "polish",
      "area": "<top-left | top-center | top-right | middle-left | center | middle-right | bottom-left | bottom-center | bottom-right>",
      "description": "<what's wrong visually>",
      "fix": "<specific CSS/HTML fix>",
      "affectsConversion": <true|false>
    }
  ],
  "strengths": ["<what looks great>"],
  "worstIssue": "<the single most impactful visual bug>",
  "quickWins": ["<3 fastest fixes for biggest visual improvement>"]
}

FOCUS ON:
- Text readability (contrast, size, line-height, truncation)
- Layout integrity (overlaps, gaps, alignment)
- Visual hierarchy (is the CTA obvious? is the hero compelling?)
- Spacing consistency (padding, margins)
- Color harmony (do colors work together in practice?)
- Mobile rendering if the screenshot appears mobile-sized
- Image/placeholder rendering
- Animation artifacts (frozen mid-state)
- Browser-specific rendering issues
- Overall "would you trust this business?" impression

Be brutally honest. Score harshly — most generated sites score 50-75.
Return ONLY valid JSON.`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  // Accept screenshot as base64 data URL or raw base64
  const { screenshot, viewport, url } = await req.json();

  if (!screenshot) {
    return Response.json({ error: "screenshot (base64) required" }, { status: 400 });
  }

  // Strip data URL prefix if present
  const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");
  const mediaType = screenshot.startsWith("data:image/png")
    ? "image/png"
    : screenshot.startsWith("data:image/webp")
      ? "image/webp"
      : "image/jpeg";

  const client = new Anthropic({ apiKey: anthropicKey });

  const contextNote = [
    viewport ? `Viewport: ${viewport}` : "",
    url ? `URL: ${url}` : "",
    "Review this website screenshot for visual quality issues.",
  ].filter(Boolean).join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 2000,
    temperature: 0.1,
    system: [
      {
        type: "text",
        text: QA_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64Data,
            },
          },
          {
            type: "text",
            text: contextNote,
          },
        ],
      },
    ],
  });

  const block = msg.content[0];
  const raw = block.type === "text" ? block.text : "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };

  return Response.json({
    ok: true,
    qa: result,
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
      model: "claude-sonnet-4-6-20250514",
    },
  });
}
