import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdminUser, checkAndConsumeCredits } from "@/lib/agent-credits";

export const runtime = "nodejs";
export const maxDuration = 60;

const FIX_SYSTEM_PROMPT = `You are an elite front-end engineer and UX designer reviewing and repairing an AI-generated website.

Your job: take the existing HTML/CSS/JS and produce an improved version that fixes every issue you can identify.

WHAT TO FIX (check all of these):
• Layout bugs: elements overflowing, broken at mobile sizes, missing padding, collapsed sections
• Typography: inconsistent sizes, poor line-height, missing letter-spacing on headings
• Colour: clashing colours, poor contrast ratios, inconsistent use of brand colour
• Animations: broken @keyframes, missing prefixes, janky transitions
• Navigation: hamburger not working, links not smooth-scrolling, nav not fixed on scroll
• Content: generic placeholder text, "Lorem ipsum", "Your Company Name", "[City]"
• JavaScript errors: unclosed functions, missing event listeners, broken IntersectionObserver
• Missing sections: if hero/testimonials/footer are absent, add them
• Responsiveness: fix any grid/flexbox issues at 320px, 768px, 1280px breakpoints
• Micro-interactions: add or fix hover states, button scale effects, card lift

OUTPUT RULES:
• Return ONLY the fixed HTML. No explanation. No markdown. No code fences.
• Start immediately with <!DOCTYPE html>
• Preserve the original design intent and brand identity — only fix issues, don't redesign
• The result must be a complete, self-contained HTML file`;

export async function POST(req: NextRequest) {
  // ── Auth + credit check ────────────────────────────────────────────────────
  const { userId } = await auth();
  if (userId && !isAdminUser(userId)) {
    const check = await checkAndConsumeCredits(userId, "design-fixer");
    if (!check.ok) {
      return Response.json(
        { error: check.message, code: check.code, balance: check.balance },
        { status: check.code === "NO_ACCESS" ? 403 : 402 },
      );
    }
  }

  const { html, prompt } = await req.json();

  if (!html?.trim()) {
    return new Response("HTML required", { status: 400 });
  }

  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (!hasAnthropic && !hasOpenAI) {
    return new Response("No AI provider configured", { status: 503 });
  }

  const userMessage = [
    "Fix all issues in this website HTML. Original brief:",
    prompt ? `"${prompt}"` : "(no brief provided)",
    "",
    "Here is the HTML to fix:",
    html.trim(),
  ].join("\n");

  const encoder = new TextEncoder();
  const streamHeaders = {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };

  // ── Claude path (preferred) ─────────────────────────────────────────────
  if (hasAnthropic) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const stream = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 16000,
        temperature: 0.2,
        stream: true,
        system: FIX_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, { headers: streamHeaders });
    } catch (err: unknown) {
      if (hasOpenAI) {
        console.warn("[fix] Claude failed, falling back to OpenAI:", err instanceof Error ? err.message : err);
      } else {
        return new Response("AI generation failed", { status: 500 });
      }
    }
  }

  // ── OpenAI path (fallback) ──────────────────────────────────────────────
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: FIX_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    stream: true,
    max_tokens: 16000,
    temperature: 0.30,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, { headers: streamHeaders });
}
