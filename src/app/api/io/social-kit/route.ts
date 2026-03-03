/**
 * POST /api/io/social-kit
 * Social Media Kit agent — generates a complete social media content package:
 *   - Posts for all major platforms (X/Twitter, LinkedIn, Facebook, Instagram)
 *   - 7-day posting schedule
 *   - Hashtag strategy per platform
 *   - Content themes and pillars
 *   - Bio/profile suggestions
 *
 * Costs 3 credits (social-kit agent). Starter+ plan required. Admin bypass.
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
    const check = await checkAndConsumeCredits(userId, "social-kit");
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
  try {
    const body = await req.json();
    prompt = body.prompt;
    industry = body.industry;
    tone = body.tone;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const systemPrompt = `You are a social media strategist who builds viral content strategies for brands. You know what performs on each platform and how to build engaged audiences.

Generate a complete 7-day social media content kit.

Output a single valid JSON object:
{
  "brandVoice": "Description of recommended brand voice/personality",
  "contentPillars": [
    { "pillar": "Theme name", "description": "What this pillar covers", "percentage": 30 }
  ],
  "profiles": {
    "twitter": { "bio": "160 chars max", "pinned": "Suggested pinned tweet" },
    "linkedin": { "headline": "Professional headline", "about": "2-sentence summary" },
    "instagram": { "bio": "150 chars max with line breaks", "highlights": ["Story highlight names"] },
    "facebook": { "about": "Short description", "cta": "Suggested CTA button" }
  },
  "weeklySchedule": [
    {
      "day": "Monday",
      "posts": [
        {
          "platform": "twitter/linkedin/instagram/facebook",
          "time": "9:00 AM",
          "type": "Text/Image/Carousel/Video/Poll/Thread",
          "content": "Full post text ready to copy-paste",
          "hashtags": ["relevant", "hashtags"],
          "notes": "Visual/design direction if applicable"
        }
      ]
    }
  ],
  "hashtagStrategy": {
    "branded": ["Your brand hashtags"],
    "industry": ["Industry hashtags"],
    "trending": ["Trending/viral hashtags to use"],
    "perPlatform": {
      "instagram": ["IG-specific hashtags (20-30)"],
      "twitter": ["Twitter hashtags (3-5)"],
      "linkedin": ["LinkedIn hashtags (3-5)"]
    }
  },
  "engagementTips": ["5-7 specific tactics to boost engagement"],
  "kpis": ["3-5 metrics to track weekly"]
}

Generate at least 2 posts per day across platforms. Make posts specific and ready to publish.`;

  const userMsg = `Create a complete 7-day social media kit for: "${prompt.slice(0, 400)}". Industry: ${industry ?? "business"}. Tone: ${tone ?? "professional but relatable"}.`;

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
    const kit = JSON.parse(jsonMatch[0]);

    return NextResponse.json(kit);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
