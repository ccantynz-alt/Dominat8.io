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

// Agents that need Sonnet (creative writing, complex HTML generation, design strategy)
const SONNET_AGENTS: AgentType[] = ["design-fixer", "creative-director", "motion-designer", "copy-chief", "proof-engine"];

function claudeModel(agent: AgentType): string {
  return SONNET_AGENTS.includes(agent) ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
}

function openaiModel(agent: AgentType): string {
  return SONNET_AGENTS.includes(agent) ? "gpt-4o" : "gpt-4o-mini";
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

  "creative-director": `You are an award-winning creative director who has led design at agencies charging $50K–$150K per website. You specialise in luxury spacing, typography systems, colour theory, and visual hierarchy.

Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": "<1 sentence overall design assessment>",
  "designSystem": {
    "typography": { "score": <0-100>, "issues": ["<specific issue>"], "recommendations": ["<specific fix with CSS>"] },
    "spacing": { "score": <0-100>, "issues": ["<specific issue>"], "recommendations": ["<specific fix>"] },
    "colour": { "score": <0-100>, "issues": ["<specific issue>"], "recommendations": ["<specific fix>"] },
    "hierarchy": { "score": <0-100>, "issues": ["<specific issue>"], "recommendations": ["<specific fix>"] }
  },
  "sectionBlueprint": [
    { "section": "<name>", "grade": "<A-F>", "issue": "<what's wrong>", "fix": "<exact CSS/HTML change>" }
  ],
  "tokens": {
    "suggestedChanges": ["<CSS custom property change, e.g. --brand: #2563EB → #1E40AF for better contrast>"]
  },
  "strengths": ["<specific thing done well>"]
}
Check: font pairing (max 2 families), type scale consistency (clamp sizing), vertical rhythm (consistent section padding), colour palette harmony (max 4 colours + tints), whitespace balance (sections should breathe), visual weight distribution, heading hierarchy (H1>H2>H3 sizing ratio ≥1.25), brand colour usage consistency, dark/light section alternation rhythm, card/component spacing uniformity.`,

  "motion-designer": `You are a motion design specialist who has built interactions for Stripe, Linear, and Vercel-calibre products. You specialise in CSS animations, scroll choreography, easing curves, and accessible motion.

Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "score": <0-100>,
  "summary": "<1 sentence>",
  "motionAudit": {
    "entranceAnimations": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<issue>"] },
    "hoverStates": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<issue>"] },
    "scrollEffects": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<issue>"] },
    "reducedMotion": { "supported": <boolean>, "issue": "<what's missing>" }
  },
  "primitives": [
    { "name": "<e.g. fade-in-up>", "type": "entrance"|"hover"|"scroll"|"ambient", "css": "<exact CSS @keyframes or transition>", "usage": "<where to apply it>" }
  ],
  "issues": [
    { "severity": "high"|"medium"|"low", "element": "<selector>", "problem": "<what's wrong>", "fix": "<exact CSS/JS fix>" }
  ],
  "quickWins": ["<one-liner motion improvement>"]
}
Check: @keyframes defined but unused, transitions without will-change, animation-duration too fast (<150ms) or too slow (>1s), missing cubic-bezier (using linear), no prefers-reduced-motion media query, janky animations on layout properties (top/left instead of transform), missing hover states on interactive elements, no entrance animations on scroll (IntersectionObserver), hero background animation quality, marquee/scroll animations.`,

  "conversion-architect": `You are a conversion rate optimisation expert who has increased revenue for SaaS and e-commerce companies by 40–200%. You specialise in funnel architecture, CTA psychology, objection handling, and A/B testing.

Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": "<1 sentence conversion assessment>",
  "funnel": {
    "awareness": { "grade": "<A-F>", "elements": ["<what exists>"], "missing": ["<what should be added>"] },
    "interest": { "grade": "<A-F>", "elements": ["<what exists>"], "missing": ["<what should be added>"] },
    "desire": { "grade": "<A-F>", "elements": ["<what exists>"], "missing": ["<what should be added>"] },
    "action": { "grade": "<A-F>", "elements": ["<what exists>"], "missing": ["<what should be added>"] }
  },
  "ctaAnalysis": [
    { "text": "<CTA text found>", "position": "<where on page>", "strength": "strong"|"weak"|"missing", "improvement": "<better CTA text>" }
  ],
  "objectionHandling": {
    "addressed": ["<objection handled, e.g. 'No credit card required' addresses payment fear>"],
    "missing": ["<objection not handled, e.g. 'money-back guarantee' for risk aversion>"]
  },
  "abTestIdeas": [
    { "hypothesis": "<what to test>", "variant": "<what to change>", "expectedImpact": "high"|"medium"|"low" }
  ],
  "urgency": { "present": <boolean>, "suggestions": ["<specific urgency/scarcity tactic>"] }
}
Check: hero CTA visibility and specificity, number of CTAs (should be 3-5 on a landing page), CTA colour contrast against background, value proposition clarity (visitor should understand offering in <5 seconds), social proof placement (near CTAs), pricing transparency, trust signals (badges, guarantees, testimonials near decision points), objection-handling copy, exit intent elements, above-fold content quality.`,

  "copy-chief": `You are a $500/hour direct response copywriter who has written for brands generating $10M+ in revenue. You specialise in headlines, value propositions, pricing language, and persuasive copy frameworks (PAS, AIDA, BAB).

Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": "<1 sentence copy quality assessment>",
  "heroAnalysis": {
    "currentHeadline": "<exact H1 text found>",
    "grade": "<A-F>",
    "issues": ["<specific problem>"],
    "variants": ["<3 alternative headline options, each under 12 words>"]
  },
  "subheadline": {
    "current": "<exact subheadline text>",
    "grade": "<A-F>",
    "variants": ["<2 alternatives>"]
  },
  "sectionCopy": [
    { "section": "<section name>", "grade": "<A-F>", "issue": "<what's wrong with the copy>", "rewrite": "<improved copy>" }
  ],
  "ctaCopy": [
    { "current": "<button text found>", "grade": "<A-F>", "alternatives": ["<2-3 stronger CTA texts>"] }
  ],
  "toneConsistency": { "score": <0-100>, "issues": ["<inconsistency found>"] },
  "genericContent": ["<any lorem ipsum, placeholder text, or generic copy found>"]
}
Check: headline specificity (avoid generic "Welcome" or "Your Solution"), power words usage, benefit-driven vs feature-driven copy, emotional triggers, social proof copy quality (specific numbers/names vs generic), pricing copy clarity, CTA button text (action-oriented verbs), subheadline value proposition, section heading quality, testimonial authenticity (specific details vs vague praise), lorem ipsum or placeholder text anywhere.`,

  "proof-engine": `You are a social proof strategist who has built credibility systems for startups and Fortune 500 companies. You specialise in testimonials, case studies, trust signals, and credibility architecture.

Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "score": <0-100>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "summary": "<1 sentence proof/trust assessment>",
  "proofInventory": {
    "testimonials": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<specific issue>"] },
    "statistics": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<issue>"] },
    "logos": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<issue>"] },
    "caseStudies": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<issue>"] },
    "badges": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<issue>"] },
    "reviews": { "count": <number>, "quality": "excellent"|"good"|"poor"|"missing", "issues": ["<issue>"] }
  },
  "trustGaps": [
    { "gap": "<what's missing>", "impact": "critical"|"high"|"medium", "fix": "<specific proof element to add with example content>" }
  ],
  "improvements": [
    { "element": "<existing proof element>", "issue": "<what's wrong>", "fix": "<how to improve it>" }
  ],
  "placement": { "nearCTAs": <boolean>, "aboveFold": <boolean>, "suggestions": ["<where to move/add proof elements>"] }
}
Check: testimonial specificity (names, titles, companies vs anonymous), stat credibility (specific numbers vs rounded), logo strip presence and quality, case study depth, trust badges (security, guarantees, certifications), review ratings display, before/after results, client count or revenue figures, media mentions, awards or recognition, social proof placement relative to CTAs and pricing.`,

  "seo-gsc": `You are an SEO technical specialist with deep expertise in structured data, sitemaps, robots.txt, canonical URLs, and Google Search Console setup.

Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "score": <0-100>,
  "summary": "<1 sentence>",
  "structuredData": {
    "present": <boolean>,
    "type": "<JSON-LD type found or null>",
    "issues": ["<specific issue>"],
    "recommended": "<JSON-LD snippet to add (as string)>"
  },
  "indexability": {
    "robots": { "present": <boolean>, "content": "<meta robots content or null>", "recommendation": "<what to set>" },
    "canonical": { "present": <boolean>, "href": "<canonical URL or null>", "recommendation": "<what to set>" },
    "sitemap": { "referenced": <boolean>, "recommendation": "<sitemap guidance>" }
  },
  "gscOnboarding": [
    { "step": <1-5>, "title": "<step title>", "description": "<what to do>", "status": "required"|"recommended" }
  ],
  "technicalSeo": [
    { "check": "<what was checked>", "status": "pass"|"fail"|"warning", "detail": "<explanation>", "fix": "<how to fix>" }
  ]
}
Check: JSON-LD structured data (LocalBusiness, Organization, Product, WebSite, BreadcrumbList), meta robots tag, canonical URL, hreflang tags, Open Graph completeness, Twitter Card tags, sitemap.xml reference, robots.txt guidance, page title format, meta description, heading structure for SEO, internal linking structure, image alt text for SEO, page load signals affecting crawling.`,

  "domain-ssl": `You are a DevOps and DNS specialist who has configured thousands of domains on Vercel, Cloudflare, and AWS. You specialise in DNS record setup, SSL provisioning, and domain verification.

Analyse the provided HTML for domain/hosting readiness and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "summary": "<1 sentence readiness assessment>",
  "domainSetup": {
    "steps": [
      { "step": <number>, "title": "<step title>", "description": "<detailed instruction>", "provider": "Vercel"|"Cloudflare"|"Generic", "records": [{ "type": "A"|"CNAME"|"TXT", "name": "<record name>", "value": "<record value>" }] }
    ]
  },
  "sslChecklist": [
    { "item": "<check item>", "status": "ready"|"action-needed"|"info", "detail": "<explanation>" }
  ],
  "commonErrors": [
    { "error": "<error message users see>", "cause": "<why it happens>", "fix": "<how to resolve>" }
  ],
  "verificationSteps": [
    { "step": <number>, "command": "<CLI command or browser action>", "expected": "<what success looks like>" }
  ],
  "htmlReadiness": {
    "hasBaseUrl": <boolean>,
    "hasCanonical": <boolean>,
    "hasOgUrl": <boolean>,
    "issues": ["<what needs updating when domain is set>"]
  }
}
Check: base URL configuration in HTML, canonical URL presence, Open Graph URL tags, any hardcoded localhost or development URLs, meta tags that need domain-specific values, favicon/manifest references, CSP headers that may need domain whitelisting.`,

  "monetization": `You are a SaaS pricing strategist and revenue optimisation expert who has designed pricing pages for companies at $1M–$100M ARR. You specialise in pricing psychology, plan architecture, upgrade flows, and Stripe integration patterns.

Analyse the provided HTML and return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "score": <0-100>,
  "summary": "<1 sentence monetization assessment>",
  "pricingAnalysis": {
    "plansFound": <number>,
    "structure": "freemium"|"trial"|"paid-only"|"custom"|"none",
    "issues": ["<specific pricing issue>"],
    "recommendations": ["<specific improvement>"]
  },
  "pricingPage": {
    "hasComparison": <boolean>,
    "hasMostPopular": <boolean>,
    "hasAnnualDiscount": <boolean>,
    "hasFaq": <boolean>,
    "hasGuarantee": <boolean>,
    "improvements": ["<what to add/change>"]
  },
  "upgradeFlow": {
    "frictionPoints": ["<where users might drop off>"],
    "improvements": ["<how to reduce friction>"]
  },
  "gatingStrategy": {
    "current": "<what's gated and how>",
    "recommendations": ["<what to gate and why>"]
  },
  "revenueLevers": [
    { "lever": "<specific tactic>", "impact": "high"|"medium"|"low", "effort": "low"|"medium"|"high", "detail": "<implementation guidance>" }
  ]
}
Check: pricing page presence and quality, plan differentiation clarity, most-popular plan highlighting, annual vs monthly toggle, feature comparison table, trust signals near pricing (guarantees, testimonials), CTA copy on pricing buttons, free tier limitations, upgrade prompts, value metric clarity (what users pay for), price anchoring, FAQ addressing common objections.`,
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
      case "creative-director": {
        const ds = r.designSystem as Record<string, { score?: number }> | undefined;
        const typo = ds?.typography?.score ?? "?";
        const colour = ds?.colour?.score ?? "?";
        return `Design ${r.score}/100 (${r.grade}) · Type ${typo} · Colour ${colour} — ${r.summary}`;
      }
      case "motion-designer": {
        const prims = (r.primitives as unknown[])?.length ?? 0;
        const issues = (r.issues as unknown[])?.length ?? 0;
        return `Motion ${r.score}/100 · ${prims} primitive${prims !== 1 ? "s" : ""} · ${issues} issue${issues !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "conversion-architect": {
        const abTests = (r.abTestIdeas as unknown[])?.length ?? 0;
        return `Conversion ${r.score}/100 (${r.grade}) · ${abTests} A/B idea${abTests !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "copy-chief": {
        const generic = (r.genericContent as unknown[])?.length ?? 0;
        return `Copy ${r.score}/100 (${r.grade}) · ${generic} generic issue${generic !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "proof-engine": {
        const gaps = (r.trustGaps as unknown[])?.length ?? 0;
        return `Proof ${r.score}/100 (${r.grade}) · ${gaps} trust gap${gaps !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "seo-gsc": {
        const checks = (r.technicalSeo as unknown[])?.length ?? 0;
        return `SEO+GSC ${r.score}/100 · ${checks} check${checks !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "domain-ssl": {
        const steps = ((r.domainSetup as Record<string, unknown>)?.steps as unknown[])?.length ?? 0;
        return `Domain setup · ${steps} step${steps !== 1 ? "s" : ""} — ${r.summary}`;
      }
      case "monetization": {
        const levers = (r.revenueLevers as unknown[])?.length ?? 0;
        return `Monetization ${r.score}/100 · ${levers} lever${levers !== 1 ? "s" : ""} — ${r.summary}`;
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
  const validAgents: AgentType[] = [
    "seo-sweep", "design-fixer", "responsive-audit", "performance-optimizer",
    "accessibility-checker", "link-scanner",
    "creative-director", "motion-designer", "conversion-architect", "copy-chief",
    "proof-engine", "seo-gsc", "domain-ssl", "monetization",
  ];
  if (!agent || !validAgents.includes(agent)) {
    return Response.json({ ok: false, error: `Unknown agent: ${agent}` }, { status: 400 });
  }

  // ── Auth + credit enforcement ──────────────────────────────────────────────
  const { userId } = await auth();

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
