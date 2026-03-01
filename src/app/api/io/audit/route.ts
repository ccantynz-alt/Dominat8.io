import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

/**
 * Parallel audit endpoint — runs ALL analysis agents simultaneously.
 *
 * Instead of 6 sequential agent calls (~30s total), this fires all 5
 * analysis agents in parallel (~6s total) using Promise.allSettled.
 * Returns a combined audit report in one response.
 */

const AUDIT_PROMPTS: Record<string, string> = {
  seo: `Score this HTML for SEO (0-100). Return JSON: { "score": <n>, "grade": "<A-F>", "issues": [{"severity":"high"|"medium"|"low","message":"<issue>","fix":"<fix>"}], "topFix": "<most impactful single fix>" }`,
  responsive: `Score responsive design (0-100). Return JSON: { "score": <n>, "issues": [{"breakpoint":"<px>","problem":"<what breaks>","fix":"<css fix>"}], "worstBreak": "<most critical breakpoint issue>" }`,
  accessibility: `Score accessibility (0-100). Return JSON: { "score": <n>, "grade": "<A-F>", "issues": [{"wcag":"<criterion>","problem":"<issue>","fix":"<fix>"}], "topFix": "<most impactful single fix>" }`,
  performance: `Score performance (0-100). Return JSON: { "score": <n>, "vitals": {"lcp":"<risk>","cls":"<risk>","fid":"<risk>"}, "suggestions": [{"title":"<action>","impact":"<improvement>"}], "quickWin": "<fastest fix for biggest impact>" }`,
  links: `Audit all links and CTAs. Return JSON: { "totalLinks": <n>, "issues": [{"type":"<issue type>","element":"<desc>","fix":"<fix>"}], "ctaQuality": "strong"|"weak"|"missing", "topFix": "<most impactful fix>" }`,
};

export async function POST(req: NextRequest) {
  const { html } = await req.json();

  if (!html?.trim()) {
    return Response.json({ error: "HTML required" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  try { await auth(); } catch { /* continue */ }

  const client = new Anthropic({ apiKey: anthropicKey });
  const truncated = html.length > 8000 ? html.slice(0, 8000) + "\n<!-- truncated -->" : html;

  // Fire ALL audits in parallel
  const auditEntries = Object.entries(AUDIT_PROMPTS);
  const startMs = Date.now();

  const results = await Promise.allSettled(
    auditEntries.map(async ([key, systemPrompt]) => {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        temperature: 0.1,
        system: `You are a web quality auditor. ${systemPrompt} Return ONLY valid JSON.`,
        messages: [{ role: "user", content: `Audit this HTML:\n\n${truncated}` }],
      });
      const block = msg.content[0];
      const raw = block.type === "text" ? block.text : "{}";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      return {
        key,
        data: jsonMatch ? JSON.parse(jsonMatch[0]) : { raw },
        tokens: msg.usage.input_tokens + msg.usage.output_tokens,
      };
    })
  );

  const durationMs = Date.now() - startMs;

  // Compile results
  const audits: Record<string, unknown> = {};
  let totalTokens = 0;
  let passed = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      audits[result.value.key] = result.value.data;
      totalTokens += result.value.tokens;
      passed++;
    } else {
      const key = auditEntries[results.indexOf(result)][0];
      audits[key] = { error: result.reason?.message ?? "Failed" };
      failed++;
    }
  }

  // Calculate overall score
  const scores = Object.values(audits)
    .map((a) => (a as Record<string, unknown>).score)
    .filter((s): s is number => typeof s === "number");
  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return Response.json({
    ok: true,
    overallScore,
    audits,
    meta: {
      agentsRun: passed,
      agentsFailed: failed,
      durationMs,
      totalTokens,
      model: "claude-haiku-4-5-20251001",
      parallel: true,
    },
  });
}
