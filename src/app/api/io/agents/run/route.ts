import { NextRequest } from "next/server";
import OpenAI from "openai";
import { startRun, completeRun, failRun, type AgentType } from "../_store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPTS: Record<AgentType, string> = {
  "seo-sweep": `You are an expert SEO auditor. Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": "<1-sentence summary>",
  "issues": [{ "severity": "high"|"medium"|"low", "category": "<category>", "message": "<issue>", "fix": "<how to fix>" }],
  "strengths": ["<what is good>"]
}
Check: title tag, meta description, OG tags, H1 hierarchy, image alt attributes, canonical, structured data, mobile viewport, internal links, content length, CTAs.`,

  "design-fixer": `You are an expert web designer and front-end engineer. The user will provide you with HTML for a generated website. Your job is to fix all visual issues:
- Layout bugs (broken flexbox/grid, overflow, clipping)
- Colour contrast issues (text must meet WCAG AA: 4.5:1 for normal, 3:1 for large)
- Typography inconsistencies (font sizes, weights, line heights)
- Spacing problems (padding, margin, alignment)
- Button and link styling issues
- Mobile responsiveness issues
Return ONLY the complete fixed HTML file. No explanation, no markdown, no code fences. Just the raw HTML.`,

  "responsive-audit": `You are a responsive design expert. Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "score": <0-100>,
  "summary": "<1-sentence summary>",
  "breakpoints": {
    "mobile": { "ok": <bool>, "issues": ["<issue>"] },
    "tablet": { "ok": <bool>, "issues": ["<issue>"] },
    "desktop": { "ok": <bool>, "issues": ["<issue>"] }
  },
  "issues": [{ "severity": "high"|"medium"|"low", "element": "<selector or description>", "problem": "<what's wrong>", "fix": "<how to fix>" }]
}
Check: viewport meta tag, media queries, flexible layouts, image scaling, touch target sizes (min 44x44px), font size on mobile (min 14px readable), horizontal scroll issues.`,

  "performance-optimizer": `You are a web performance expert. Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "score": <0-100>,
  "summary": "<1-sentence summary>",
  "lcp_risk": "<low|medium|high>",
  "cls_risk": "<low|medium|high>",
  "suggestions": [{ "priority": "high"|"medium"|"low", "category": "<category>", "title": "<suggestion>", "impact": "<expected improvement>", "code": "<optional short code snippet>" }],
  "quick_wins": ["<actionable 1-liner>"]
}
Check: render-blocking scripts, large inline styles, missing image dimensions (CLS), web fonts loading strategy, CSS animation performance, script defer/async, critical CSS inlining opportunity, unused JS/CSS.`,

  "accessibility-checker": `You are a web accessibility expert (WCAG 2.1 AA). Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": "<1-sentence summary>",
  "issues": [{ "severity": "critical"|"serious"|"moderate"|"minor", "wcag": "<WCAG criterion e.g. 1.1.1>", "element": "<description>", "problem": "<what's wrong>", "fix": "<how to fix>" }],
  "passes": ["<what passes accessibility checks>"]
}
Check: images without alt text, form labels, button text, colour contrast, heading hierarchy, landmark regions, keyboard navigation, skip links, focus indicators, ARIA roles, language attribute.`,

  "link-scanner": `You are a web quality assurance specialist. Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "summary": "<1-sentence summary>",
  "total_links": <number>,
  "issues": [{ "severity": "high"|"medium"|"low", "type": "<type>", "element": "<description>", "problem": "<what's wrong>", "fix": "<how to fix>" }],
  "cta_analysis": { "count": <number>, "quality": "<assessment>", "suggestions": ["<suggestion>"] },
  "passes": ["<what looks good>"]
}
Check: empty href attributes, href="#" placeholders, missing anchor text, buttons without labels, CTA quality and clarity, internal link consistency, mailto/tel link format, broken anchor references.`,
};

function truncateHtml(html: string, maxLen = 12000): string {
  if (html.length <= maxLen) return html;
  return html.slice(0, maxLen) + "\n<!-- [truncated for analysis] -->";
}

function buildSummary(agent: AgentType, result: unknown): string {
  try {
    const r = result as Record<string, unknown>;
    switch (agent) {
      case "seo-sweep":
        return `Score ${r.score}/100 (${r.grade}) — ${r.summary}`;
      case "design-fixer":
        return "Design issues fixed and HTML updated.";
      case "responsive-audit":
        return `Responsive score ${r.score}/100 — ${r.summary}`;
      case "performance-optimizer":
        return `Perf score ${r.score}/100 — ${r.summary}`;
      case "accessibility-checker":
        return `A11y score ${r.score}/100 (${r.grade}) — ${r.summary}`;
      case "link-scanner":
        return `${r.total_links} links checked — ${r.summary}`;
      default:
        return "Agent completed.";
    }
  } catch {
    return "Agent completed.";
  }
}

export async function POST(req: NextRequest) {
  let body: { agent?: string; html?: string; prompt?: string };
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }

  const agent = body.agent as AgentType;
  const validAgents: AgentType[] = ["seo-sweep", "design-fixer", "responsive-audit", "performance-optimizer", "accessibility-checker", "link-scanner"];
  if (!agent || !validAgents.includes(agent)) {
    return Response.json({ ok: false, error: `Unknown agent: ${agent}` }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ ok: false, error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const html = body.html?.trim() || "";
  const runId = startRun(agent);

  try {
    const isHtmlAgent = agent === "design-fixer";
    const model = isHtmlAgent ? "gpt-4o" : "gpt-4o-mini";
    const userContent = html
      ? `Analyse this HTML:\n\n${truncateHtml(html)}`
      : `No HTML provided. Perform a general audit checklist and return realistic placeholder results with score: 75.`;

    const completion = await openai.chat.completions.create({
      model,
      temperature: isHtmlAgent ? 0.25 : 0.1,
      max_tokens: isHtmlAgent ? 12000 : 2000,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[agent] },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let result: unknown;
    if (isHtmlAgent) {
      // Design fixer returns HTML — strip any accidental markdown fences
      result = raw.replace(/^```(?:html)?\n?/i, "").replace(/\n?```$/i, "").trim();
    } else {
      // All other agents return JSON
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };
    }

    const summary = buildSummary(agent, result);
    completeRun(runId, summary);

    return Response.json({ ok: true, runId, agent, summary, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    failRun(runId, msg);
    return Response.json({ ok: false, runId, error: msg }, { status: 500 });
  }
}
