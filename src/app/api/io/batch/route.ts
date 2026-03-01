import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { kv } from "@vercel/kv";
import { isAdminUser } from "@/lib/agent-credits";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Batch Generation API — Agency plan feature
 *
 * Uses Claude's Message Batches API for bulk site generation.
 * Key advantages:
 *   - 50% cheaper than individual API calls
 *   - Process up to 100 sites in one batch
 *   - Results available within 24h (usually much faster)
 *   - Perfect for agency clients generating sites for multiple businesses
 *
 * Flow:
 *   1. POST /api/io/batch — submit batch of prompts
 *   2. Returns batchId — poll for completion
 *   3. GET /api/io/batch?id=<batchId> — check status / get results
 */

const BATCH_SYSTEM_PROMPT = `You are a world-class web designer and front-end developer.
Build a complete, single-page website as a single HTML file.
Include all CSS inline via <style> tags. Include all JS inline via <script> tags.
The site must be responsive, accessible, and visually stunning.
Invent specific, compelling content — zero placeholders.`;

// POST — submit a batch of generation requests
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  // Agency plan or admin only
  const planRaw = await kv.get<string>(`user:${userId}:plan`);
  const plan = planRaw ?? "free";
  if (plan !== "agency" && !isAdminUser(userId)) {
    return Response.json(
      { error: "Batch generation requires the Agency plan." },
      { status: 403 },
    );
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { prompts } = await req.json();

  if (!Array.isArray(prompts) || prompts.length === 0) {
    return Response.json({ error: "prompts array required (1-50 items)" }, { status: 400 });
  }
  if (prompts.length > 50) {
    return Response.json({ error: "Maximum 50 prompts per batch" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  // Build batch requests
  const requests = prompts.map((prompt: string, i: number) => ({
    custom_id: `site-${i}-${Date.now()}`,
    params: {
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 16000,
      temperature: 0.8,
      system: BATCH_SYSTEM_PROMPT,
      messages: [
        {
          role: "user" as const,
          content: `Build a world-class website for: ${prompt.trim()}`,
        },
      ],
    },
  }));

  const batch = await client.messages.batches.create({ requests });

  // Store batch metadata in KV for status checking
  const batchMeta = {
    batchId: batch.id,
    userId,
    promptCount: prompts.length,
    prompts: prompts.map((p: string) => p.slice(0, 100)), // truncated for storage
    status: batch.processing_status,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`batch:${batch.id}`, batchMeta);
  await kv.expire(`batch:${batch.id}`, 60 * 60 * 24 * 7); // 7-day TTL

  return Response.json({
    ok: true,
    batchId: batch.id,
    status: batch.processing_status,
    promptCount: prompts.length,
    estimatedSavings: "50% vs individual generation",
    message: `Batch submitted. ${prompts.length} sites queued. Poll GET /api/io/batch?id=${batch.id} for results.`,
  });
}

// GET — check batch status / retrieve results
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const batchId = req.nextUrl.searchParams.get("id");
  if (!batchId) {
    return Response.json({ error: "id query param required" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  // Verify ownership
  const meta = await kv.get<Record<string, unknown>>(`batch:${batchId}`);
  if (!meta || (meta.userId !== userId && !isAdminUser(userId))) {
    return Response.json({ error: "Batch not found" }, { status: 404 });
  }

  const client = new Anthropic({ apiKey: anthropicKey });
  const batch = await client.messages.batches.retrieve(batchId);

  const response: Record<string, unknown> = {
    ok: true,
    batchId: batch.id,
    status: batch.processing_status,
    counts: batch.request_counts,
    createdAt: batch.created_at,
    endedAt: batch.ended_at,
  };

  // If completed, fetch results
  if (batch.processing_status === "ended") {
    const results: Record<string, unknown>[] = [];
    for await (const result of await client.messages.batches.results(batchId)) {
      if (result.result.type === "succeeded") {
        const msg = result.result.message;
        const block = msg.content[0];
        const html = block.type === "text" ? block.text : "";
        results.push({
          customId: result.custom_id,
          html,
          tokens: msg.usage.input_tokens + msg.usage.output_tokens,
        });
      } else {
        results.push({
          customId: result.custom_id,
          error: result.result.type,
        });
      }
    }
    response.results = results;
    response.totalSites = results.filter((r) => r.html).length;
  }

  return Response.json(response);
}
