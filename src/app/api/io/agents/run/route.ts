import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { startRun, completeRun, failRun, type AgentType } from "../_store";
import {
  isAdminUser,
  checkAndConsumeCredits,
  AGENT_COSTS,
} from "@/lib/agent-credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Model routing ──────────────────────────────────────────────────────────────
//
// Claude is preferred for all agents when ANTHROPIC_API_KEY is set:
//   - claude-sonnet-4-6: design-fixer (complex HTML generation)
//   - claude-haiku-4-5-20251001: all analysis agents (fast, cheap, excellent at structured JSON)
//
// Falls back to OpenAI if only OPENAI_API_KEY is set.

type Provider = "anthropic" | "openai";

function chooseProvider(agent: AgentType): Provider {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "anthropic"; // will fail gracefully with a 503
}

function claudeModel(agent: AgentType): string {
  return agent === "design-fixer" ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
}

function openaiModel(agent: AgentType): string {
  return agent === "design-fixer" ? "gpt-4o" : "gpt-4o-mini";
}

// ── System prompts ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<AgentType, string> = {
  "seo-sweep": `You are an expert SEO auditor with deep knowledge of Google's ranking signals and technical SEO.
Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "score": <0-100, be precise>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": "<1 sharp sentence>",
  "issues": [
    { "severity": "high"|"medium"|"low", "category": "<Meta|Content|Structure|Performance|Links>", "message": "<specific issue found>", "fix": "<exact fix to apply>" }
  ],
  "strengths": ["<specific thing done well>"]
}
Be thorough — check: title tag (length 50-60 chars), meta description (150-160 chars), OG/Twitter cards, canonical URL, H1 (must be exactly one, keyword-rich), H2/H3 hierarchy, image alt text, structured data (JSON-LD), mobile viewport meta, internal links, CTA clarity, content length, keyword usage, page load hints.`,

  "design-fixer": `You are a world-class front-end engineer and visual designer specialising in high-conversion landing pages.
The user provides HTML for an AI-generated website. Identify and fix every visual and UX issue:

MUST FIX:
- Layout breaks: overflow, z-index conflicts, broken flex/grid, elements overlapping
- Colour contrast failures: body text ≥4.5:1, large text ≥3:1 against background
- Typography: inconsistent font sizes, line-heights, missing font-weight hierarchy
- Spacing: inconsistent padding/margin, cramped sections, excessive whitespace
- Mobile: anything that breaks at <768px — font sizes, tap targets (≥44px), overflow
- Buttons: non-obvious CTAs, missing :hover states, tiny tap targets

ALSO IMPROVE:
- Hero section: ensure headline is large (48px+), bold, high-contrast
- CTA buttons: make primary CTA visually dominant with clear colour
- Section rhythm: consistent vertical spacing between sections
- Navigation: sticky nav if missing, mobile hamburger if needed

Return ONLY the complete corrected HTML file. Raw HTML, no explanation, no markdown fences.`,

  "responsive-audit": `You are a responsive design specialist who has audited thousands of websites across all device sizes.
Analyse the HTML and return ONLY valid JSON (no markdown, no code fences):
{
  "score": <0-100>,
  "summary": "<1 sentence>",
  "breakpoints": {
    "mobile_320": { "ok": <bool>, "issues": ["<specific issue>"] },
    "mobile_375": { "ok": <bool>, "issues": ["<specific issue>"] },
    "tablet_768": { "ok": <bool>, "issues": ["<specific issue>"] },
    "desktop_1440": { "ok": <bool>, "issues": ["<specific issue>"] }
  },
  "issues": [
    { "severity": "high"|"medium"|"low", "element": "<CSS selector or description>", "problem": "<what breaks>", "fix": "<CSS/HTML fix to apply>" }
  ],
  "missing_features": ["<e.g. hamburger menu, touch gestures, etc.>"]
}
Check: viewport meta tag presence, media queries coverage, flexible units (%, vw, em, rem vs fixed px), image max-width:100%, touch targets ≥44px, font readability on small screens (≥14px), horizontal scroll (must be zero), grid/flex wrapping, sticky nav behaviour, modal behaviour on mobile.`,

  "performance-optimizer": `You are a web performance engineer expert in Core Web Vitals and front-end optimisation.
Analyse the HTML and return ONLY valid JSON (no markdown, no code fences):
{
  "score": <0-100>,
  "summary": "<1 sentence>",
  "vitals": {
    "lcp_risk": "low"|"medium"|"high",
    "cls_risk": "low"|"medium"|"high",
    "fid_risk": "low"|"medium"|"high"
  },
  "suggestions": [
    { "priority": "critical"|"high"|"medium"|"low", "category": "<Fonts|Images|Scripts|CSS|HTML>", "title": "<action>", "impact": "<expected improvement>", "code": "<optional snippet>" }
  ],
  "quick_wins": ["<one-liner action that can be applied immediately>"]
}
Check: render-blocking <script> tags (need defer/async), large inline <style> blocks, missing image width/height (causes CLS), @font-face display:swap, unused CSS variables, animation with will-change, CSS transitions on layout properties, <link rel=preload> for critical assets, inline critical CSS above fold, lazy-loading images below fold.`,

  "accessibility-checker": `You are a WCAG 2.1 AA accessibility auditor certified in inclusive design.
Analyse the HTML and return ONLY valid JSON (no markdown, no code fences):
{
  "score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": "<1 sentence>",
  "issues": [
    { "severity": "critical"|"serious"|"moderate"|"minor", "wcag": "<criterion e.g. 1.4.3>", "element": "<description or selector>", "problem": "<exact issue>", "fix": "<exact code/attribute change>" }
  ],
  "passes": ["<specific criterion that passes>"]
}
Check: lang attribute on <html>, every <img> has meaningful alt (or alt="" if decorative), all form inputs have associated <label>, buttons have accessible names, link text is descriptive (no "click here"), heading hierarchy (h1→h2→h3, no skips), landmark regions (main, nav, header, footer), skip-to-content link, colour contrast ratios, focus-visible on interactive elements, ARIA usage correctness, motion/animation respects prefers-reduced-motion.`,

  "link-scanner": `You are a QA engineer specialising in web content quality and conversion optimisation.
Analyse the HTML and return ONLY valid JSON (no markdown, no code fences):
{
  "summary": "<1 sentence>",
  "total_links": <number>,
  "total_buttons": <number>,
  "issues": [
    { "severity": "high"|"medium"|"low", "type": "<Empty href|Placeholder|Missing text|Weak CTA|Dead anchor>", "element": "<description>", "problem": "<issue>", "fix": "<fix>" }
  ],
  "cta_analysis": {
    "count": <number>,
    "primary_cta": "<text of main CTA or null>",
    "quality": "strong"|"weak"|"missing",
    "suggestions": ["<specific improvement>"]
  },
  "passes": ["<what is good about the links/CTAs>"]
}
Check: href="#" placeholders, href="" empty, javascript:void(0), anchor text that is generic ("click here", "read more", "here"), buttons with no text, CTAs that don't communicate value, duplicate link destinations, external links missing rel=noopener, missing mailto/tel format, anchor IDs that don't exist.`,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function truncateHtml(html: string, maxLen = 14000): string {
  if (html.length <= maxLen) return html;
  return html.slice(0, maxLen) + "\n<!-- [truncated for analysis] -->";
}

function buildSummary(agent: AgentType, result: unknown): string {
  try {
    const r = result as Record<string, unknown>;
    switch (agent) {
      case "seo-sweep": {
        const issues = (r.issues as unknown[])?.length ?? 0;
        return `Score ${r.score}/100 (${r.grade}) · ${issues} issue${issues !== 1 ? "s" : ""} found — ${r.summary}`;
      }
      case "design-fixer":
        return "Design issues fixed — HTML updated. Click Apply to preview changes.";
      case "responsive-audit": {
        const issues = (r.issues as unknown[])?.length ?? 0;
        return `Responsive score ${r.score}/100 · ${issues} issue${issues !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "performance-optimizer": {
        const suggestions = (r.suggestions as unknown[])?.length ?? 0;
        return `Perf score ${r.score}/100 · ${suggestions} suggestion${suggestions !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "accessibility-checker": {
        const issues = (r.issues as unknown[])?.length ?? 0;
        return `A11y score ${r.score}/100 (${r.grade}) · ${issues} issue${issues !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "link-scanner": {
        const issues = (r.issues as unknown[])?.length ?? 0;
        return `${r.total_links} links · ${issues} issue${issues !== 1 ? "s" : ""} — ${r.summary}`;
      }
      default:
        return "Agent completed.";
    }
  } catch {
    return "Agent completed.";
  }
}

// ── Provider execution ─────────────────────────────────────────────────────────

async function runWithClaude(agent: AgentType, userContent: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: claudeModel(agent),
    max_tokens: agent === "design-fixer" ? 16000 : 2048,
    temperature: agent === "design-fixer" ? 0.2 : 0.1,
    system: SYSTEM_PROMPTS[agent],
    messages: [{ role: "user", content: userContent }],
  });
  const block = msg.content[0];
  return block.type === "text" ? block.text : "";
}

async function runWithOpenAI(agent: AgentType, userContent: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: openaiModel(agent),
    temperature: agent === "design-fixer" ? 0.25 : 0.1,
    max_tokens: agent === "design-fixer" ? 12000 : 2000,
    messages: [
      { role: "system", content: SYSTEM_PROMPTS[agent] },
      { role: "user", content: userContent },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { agent?: string; html?: string; prompt?: string };
  try { body = await req.json(); } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const agent = body.agent as AgentType;
  const validAgents: AgentType[] = ["seo-sweep", "design-fixer", "responsive-audit", "performance-optimizer", "accessibility-checker", "link-scanner"];
  if (!agent || !validAgents.includes(agent)) {
    return Response.json({ ok: false, error: `Unknown agent: ${agent}` }, { status: 400 });
  }

  // ── Auth + credit enforcement ──────────────────────────────────────────────
  const { userId } = auth();

  let creditBalance = null;
  if (userId && !isAdminUser(userId)) {
    const check = await checkAndConsumeCredits(userId, agent);
    if (!check.ok) {
      return Response.json(
        { ok: false, error: check.message, code: check.code, balance: check.balance },
        { status: check.code === "NO_ACCESS" ? 403 : 402 }
      );
    }
    creditBalance = check.balance;
  }
  // Anonymous users and admins proceed without credit deduction.
  // Production hardening: restrict anonymous users if needed via env flag.

  const provider = chooseProvider(agent);
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    return Response.json({ ok: false, error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }
  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    return Response.json({ ok: false, error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  const html = body.html?.trim() || "";
  const prompt = body.prompt?.trim() || "";

  const userContent = html
    ? [
        prompt ? `Business context: ${prompt}\n\n` : "",
        `Analyse this HTML:\n\n${truncateHtml(html)}`,
      ].join("")
    : "No HTML provided. Return a general best-practice audit checklist as if for a typical business landing page. Score 70, note the most common issues.";

  const runId = startRun(agent);

  try {
    const raw = provider === "anthropic"
      ? await runWithClaude(agent, userContent)
      : await runWithOpenAI(agent, userContent);

    const isHtmlAgent = agent === "design-fixer";
    let result: unknown;
    if (isHtmlAgent) {
      result = raw.replace(/^```(?:html)?\n?/i, "").replace(/\n?```$/i, "").trim();
    } else {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
    }

    const summary = buildSummary(agent, result);
    completeRun(runId, summary);

    return Response.json({
      ok: true,
      runId,
      agent,
      provider,
      model: provider === "anthropic" ? claudeModel(agent) : openaiModel(agent),
      summary,
      result,
      creditCost: AGENT_COSTS[agent],
      balance: creditBalance,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    failRun(runId, msg);
    return Response.json({ ok: false, runId, error: msg }, { status: 500 });
  }
}
