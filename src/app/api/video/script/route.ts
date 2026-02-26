/**
 * POST /api/video/script
 * Generates a TikTok/Reels video script from a site prompt
 *
 * Body: { prompt, industry, vibe, siteId? }
 * Returns: { script: VideoScript }
 */
import Anthropic from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export interface VideoScript {
  hook: string;          // 0-3s: attention grabber
  problem: string;       // 3-8s: pain point
  solution: string;      // 8-15s: introduce product
  proof: string;         // 15-22s: social proof / result
  cta: string;           // 22-30s: call to action
  caption: string;       // Full TikTok/IG caption with hashtags
  hashtags: string[];    // Platform hashtags
  voiceover: string;     // Full 30s voiceover script
  overlayTexts: string[]; // On-screen text overlays (5-7 items)
  platform: "tiktok" | "facebook" | "instagram";
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prompt, industry, vibe, platform = "tiktok" } = await req.json() as {
    prompt: string;
    industry?: string;
    vibe?: string;
    platform?: "tiktok" | "facebook" | "instagram";
  };

  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  const systemPrompt = `You are a world-class social media content strategist specialising in viral short-form video for SaaS products. You create high-converting TikTok and Facebook Reels scripts for AI tools.

Your scripts follow the proven hook → problem → solution → proof → CTA structure that converts at 3-5%.

Product: Dominat8.io — AI that builds complete, professional websites from one sentence in under 30 seconds.
Price: Free to start, $9/mo for Pro.
URL: dominat8.io

Output must be a single valid JSON object matching this exact structure:
{
  "hook": "3-second attention grabber (shocking stat, bold claim, or question)",
  "problem": "Pain point the viewer feels (5 seconds)",
  "solution": "How Dominat8.io solves it (7 seconds)",
  "proof": "Result, stat, or social proof (7 seconds)",
  "cta": "Strong call to action (3 seconds)",
  "caption": "Full platform caption with emojis (150-200 chars)",
  "hashtags": ["array", "of", "10-15", "hashtags", "no", "hash", "symbol"],
  "voiceover": "Complete 30-second voiceover script, natural speech, energetic",
  "overlayTexts": ["5-7 short text overlays that appear on screen during the video"],
  "platform": "${platform}"
}`;

  const userMsg = `Create a viral ${platform} video script promoting Dominat8.io, tailored to someone who needs a ${industry ?? "business"} website. The site was built with a "${vibe ?? "modern"}" style. Prompt used: "${prompt.slice(0, 200)}"`;

  try {
    let content = "";

    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      });
      const block = msg.content[0];
      content = block.type === "text" ? block.text : "";
    } else if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        max_tokens: 1024,
      });
      content = resp.choices[0]?.message?.content ?? "";
    } else {
      return NextResponse.json({ error: "No AI key configured" }, { status: 503 });
    }

    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const script = JSON.parse(jsonMatch[0]) as VideoScript;

    return NextResponse.json({ script });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
