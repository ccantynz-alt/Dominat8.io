/**
 * POST /api/video/produce
 * Premium video production agent — generates a complete video production package:
 *   - Storyboard with scene-by-scene breakdown
 *   - Shot list with camera angles + transitions
 *   - B-roll suggestions for each scene
 *   - Music/sound design cues
 *   - Voiceover script with timing marks
 *   - On-screen text + motion graphics specs
 *   - Export-ready production brief for editors or AI video tools
 *
 * Costs 10 credits (video-pro agent). Pro+ plan required. Admin bypass.
 */
import Anthropic from "@anthropic-ai/sdk";
import { OpenAI } from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeCredits, isAdminUser } from "@/lib/agent-credits";

export const runtime = "nodejs";
export const maxDuration = 60;

export interface VideoProduction {
  title: string;
  platform: "tiktok" | "facebook" | "instagram" | "youtube";
  duration: string;
  concept: string;
  storyboard: {
    scene: number;
    timeCode: string;
    visual: string;
    audio: string;
    text: string;
    transition: string;
  }[];
  shotList: {
    shot: number;
    type: string;
    angle: string;
    movement: string;
    description: string;
  }[];
  bRoll: string[];
  musicCues: {
    timeCode: string;
    mood: string;
    suggestion: string;
  }[];
  voiceover: {
    fullScript: string;
    timedSegments: { timeCode: string; text: string }[];
  };
  motionGraphics: string[];
  productionNotes: string[];
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminUser(userId)) {
    const check = await checkAndConsumeCredits(userId, "video-pro");
    if (!check.ok) {
      return NextResponse.json(
        { error: check.message, code: check.code, balance: check.balance },
        { status: check.code === "NO_ACCESS" ? 403 : 402 },
      );
    }
  }

  let prompt: string;
  let industry: string | undefined;
  let platform: "tiktok" | "facebook" | "instagram" | "youtube" = "tiktok";
  let duration: "15" | "30" | "60" = "30";
  try {
    const body = await req.json();
    prompt = body.prompt;
    industry = body.industry;
    if (body.platform) platform = body.platform;
    if (body.duration) duration = body.duration;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  const systemPrompt = `You are a premium video production director who creates broadcast-quality production packages for social media marketing videos. You deliver complete, actionable production briefs that can be handed directly to a video editor or fed into AI video generation tools.

Generate a comprehensive ${duration}-second video production package for ${platform}.

Output must be a single valid JSON object matching this structure:
{
  "title": "Creative title for the video",
  "platform": "${platform}",
  "duration": "${duration}s",
  "concept": "One-paragraph creative concept / big idea",
  "storyboard": [
    { "scene": 1, "timeCode": "0:00-0:03", "visual": "What the viewer sees", "audio": "What they hear", "text": "On-screen text", "transition": "Cut/Fade/Zoom" }
  ],
  "shotList": [
    { "shot": 1, "type": "Close-up/Wide/Medium/POV", "angle": "Eye-level/Low/High/Overhead", "movement": "Static/Pan/Tilt/Track", "description": "Detailed shot description" }
  ],
  "bRoll": ["List of 6-10 specific B-roll clips to source or shoot"],
  "musicCues": [
    { "timeCode": "0:00-0:05", "mood": "Energetic/Dramatic/Calm", "suggestion": "Specific music style or track suggestion" }
  ],
  "voiceover": {
    "fullScript": "Complete voiceover script for the entire video",
    "timedSegments": [{ "timeCode": "0:00-0:03", "text": "Segment text" }]
  },
  "motionGraphics": ["List of 5-8 motion graphic elements needed (lower thirds, callouts, stats, logos)"],
  "productionNotes": ["5-8 professional production tips specific to this video"]
}

Include at least 6 storyboard scenes, 8 shots, and detailed timing for everything.`;

  const userMsg = `Create a premium ${duration}-second ${platform} video production package for: "${prompt.slice(0, 400)}". Industry: ${industry ?? "business"}.`;

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
    const production = JSON.parse(jsonMatch[0]) as VideoProduction;

    return NextResponse.json({ production });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
