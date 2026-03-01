import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Compaction API — Infinite Design Conversations
 *
 * Problem: Users iterate on websites for hours. "Make the hero bigger",
 * "change the CTA color", "add a testimonials section"... Eventually the
 * conversation hits Claude's context limit and breaks.
 *
 * Solution: Claude's Compaction API automatically summarizes older messages
 * when the conversation gets too long, letting users iterate FOREVER
 * without losing design context.
 *
 * Flow:
 *   1. User sends iterative design requests
 *   2. We maintain conversation in KV
 *   3. When context exceeds threshold, compaction kicks in automatically
 *   4. Older messages are summarized into a compaction block
 *   5. User keeps iterating — never hits a wall
 *
 * This is a MASSIVE differentiator over competitors who force "start over"
 * after 5-10 messages.
 */

const DESIGN_SYSTEM_PROMPT = `You are an elite website designer and front-end developer working iteratively with a client.

You have an ongoing conversation about their website. When asked to make changes:
1. Understand what they want changed
2. Apply the change to the current HTML
3. Return the COMPLETE updated HTML (not just the changed parts)
4. Briefly explain what you changed

When returning HTML, wrap it in exactly these markers:
<!--SITE_HTML_START-->
(complete HTML here)
<!--SITE_HTML_END-->

Then follow with a brief summary of changes made.

RULES:
- Always return the FULL HTML document, not fragments
- Preserve all existing content/styling unless asked to change it
- Apply changes precisely — don't over-modify
- Keep the same design language and color palette unless asked to change it
- If the user asks something vague, ask a clarifying question`;

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { message, conversationId, currentHtml } = await req.json();

  if (!message?.trim()) {
    return Response.json({ error: "message required" }, { status: 400 });
  }

  const convId = conversationId || `conv:${userId}:${Date.now()}`;
  const convKey = `conversation:${convId}`;

  // Load existing conversation from KV
  let history: ConversationMessage[] = [];
  try {
    const stored = await kv.get<ConversationMessage[]>(convKey);
    if (stored) history = stored;
  } catch { /* start fresh */ }

  // Build user message — include current HTML context if this is a modification
  let userContent = message.trim();
  if (currentHtml && history.length === 0) {
    userContent = `Here is the current website HTML to modify:\n\n<!--SITE_HTML_START-->\n${currentHtml}\n<!--SITE_HTML_END-->\n\nRequest: ${message.trim()}`;
  }

  // Add user message to history
  history.push({ role: "user", content: userContent });

  const client = new Anthropic({ apiKey: anthropicKey });

  // Build messages with compaction support
  // The compaction API automatically summarizes older messages when context is too long
  const apiMessages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 16000,
      temperature: 0.3,
      system: [
        {
          type: "text",
          text: DESIGN_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: apiMessages,
      // Enable compaction — when conversation exceeds threshold,
      // older messages are automatically summarized
      ...(history.length > 6 ? {
        betas: ["compact-2026-01-12"],
      } : {}),
    });

    const block = msg.content[0];
    const assistantResponse = block.type === "text" ? block.text : "";

    // Add assistant response to history
    history.push({ role: "assistant", content: assistantResponse });

    // Save conversation to KV (30-day TTL)
    await kv.set(convKey, history);
    await kv.expire(convKey, 60 * 60 * 24 * 30);

    // Extract HTML if present
    const htmlMatch = assistantResponse.match(
      /<!--SITE_HTML_START-->([\s\S]*?)<!--SITE_HTML_END-->/
    );
    const updatedHtml = htmlMatch ? htmlMatch[1].trim() : null;

    // Extract the explanation (everything after the HTML block)
    const explanation = updatedHtml
      ? assistantResponse.replace(/<!--SITE_HTML_START-->[\s\S]*?<!--SITE_HTML_END-->/, "").trim()
      : assistantResponse;

    return Response.json({
      ok: true,
      conversationId: convId,
      response: explanation,
      html: updatedHtml,
      messageCount: history.length,
      usage: {
        inputTokens: msg.usage.input_tokens,
        outputTokens: msg.usage.output_tokens,
      },
    });
  } catch (err: unknown) {
    // If compaction beta isn't available, retry without it
    const isCompactionError = err instanceof Error &&
      err.message.includes("compact");

    if (isCompactionError) {
      // Trim conversation to last 10 messages to fit context
      const trimmed = history.length > 10
        ? history.slice(-10)
        : history;

      const msg = await client.messages.create({
        model: "claude-sonnet-4-6-20250514",
        max_tokens: 16000,
        temperature: 0.3,
        system: [
          {
            type: "text",
            text: DESIGN_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: trimmed.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });

      const block = msg.content[0];
      const assistantResponse = block.type === "text" ? block.text : "";
      history.push({ role: "assistant", content: assistantResponse });

      await kv.set(convKey, history);
      await kv.expire(convKey, 60 * 60 * 24 * 30);

      const htmlMatch = assistantResponse.match(
        /<!--SITE_HTML_START-->([\s\S]*?)<!--SITE_HTML_END-->/
      );

      return Response.json({
        ok: true,
        conversationId: convId,
        response: assistantResponse,
        html: htmlMatch ? htmlMatch[1].trim() : null,
        messageCount: history.length,
        compacted: true,
        usage: {
          inputTokens: msg.usage.input_tokens,
          outputTokens: msg.usage.output_tokens,
        },
      });
    }

    throw err;
  }
}

// GET — load conversation history
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const convId = req.nextUrl.searchParams.get("id");
  if (!convId) {
    return Response.json({ error: "id query param required" }, { status: 400 });
  }

  const history = await kv.get<ConversationMessage[]>(`conversation:${convId}`);

  return Response.json({
    ok: true,
    conversationId: convId,
    messages: history ?? [],
    messageCount: history?.length ?? 0,
  });
}
