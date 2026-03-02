import { OpenAI } from "openai";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Plan limits ────────────────────────────────────────────────────────────────

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 20,
  pro: 100,
  agency: 500,
};

// Raw KV REST calls (edge-compatible — no Node.js require)
async function kvGet(key: string): Promise<string | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { result?: string | null };
    return data.result ?? null;
  } catch { return null; }
}

async function kvIncr(key: string): Promise<number> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return 0;
  try {
    const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as { result?: number };
    return data.result ?? 0;
  } catch { return 0; }
}

async function kvExpire(key: string, seconds: number): Promise<void> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${seconds}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch { /* silent */ }
}

async function checkUsage(userId: string): Promise<{
  allowed: boolean;
  plan: string;
  usage: number;
  limit: number;
}> {
  const planRaw = await kvGet(`user:${userId}:plan`);
  const plan = ["starter", "pro", "agency"].includes(planRaw ?? "") ? planRaw! : "free";
  const limit = PLAN_LIMITS[plan] ?? 3;

  const month = new Date().toISOString().slice(0, 7); // "2026-02"
  const usageKey = `usage:${userId}:${month}`;
  const usageRaw = await kvGet(usageKey);
  const usage = parseInt(usageRaw ?? "0", 10) || 0;

  if (usage >= limit) {
    return { allowed: false, plan, usage, limit };
  }

  const newUsage = await kvIncr(usageKey);
  await kvExpire(usageKey, 60 * 60 * 24 * 35); // 35-day TTL

  return { allowed: true, plan, usage: newUsage, limit };
}

const SYSTEM_PROMPT = `You are the world's most elite creative director and principal front-end engineer. Your work has won Webby Awards, FWA Site of the Day, CSS Design Awards, Awwwards Site of the Year. You build the kind of websites that get featured on design blogs, that CMOs show in boardrooms, that agencies charge $50,000–$150,000 for. Every site you create is your personal portfolio piece.

Generate a complete, single-page website as ONE self-contained HTML file.

═══════════════════════════════════════════
OUTPUT RULES — NON-NEGOTIABLE
═══════════════════════════════════════════
• Return ONLY the HTML. No markdown. No explanation. No code fences. No preamble.
• Start immediately with <!DOCTYPE html>
• ALL CSS inside ONE <style> tag in <head>. ALL JavaScript inline at bottom of <body>.
• Google Fonts: ONE @import line at the very top of your <style> tag.
• Zero external dependencies. Zero CDN links. Works fully offline once loaded.
• Single HTML file only. No external CSS, no external JS, no images (use CSS gradients/shapes).

═══════════════════════════════════════════
DESIGN SYSTEM — BUILD THIS FIRST
═══════════════════════════════════════════

COLOUR PALETTE (CSS Custom Properties — required)
:root {
  --brand:       /* ONE perfect brand colour for the industry */
  --brand-light: /* 20% lighter tint */
  --brand-glow:  /* 40% alpha for glow effects */
  --brand-dim:   /* 60% alpha for subtle use */
  --surface-0:   /* darkest — primary dark bg */
  --surface-1:   /* slightly lighter panel bg */
  --surface-2:   /* card/element bg */
  --text-1:      /* primary body text */
  --text-2:      /* secondary text */
  --text-3:      /* muted/caption text */
  --radius:      /* base border radius (e.g. 12px, 16px, or 24px) */
}

COLOUR STRATEGY
• Dark sections: --surface-0 as background. Light sections: #fff or very light tint.
• Section rhythm: dark → light → dark → light → dark
• Every brand accent must have a matching glow for hover/focus states.

TYPOGRAPHY SYSTEM (non-negotiable)
• Import 1-2 fonts max from Google Fonts (e.g. Syne+Outfit, Playfair Display+Inter, Space Grotesk alone).
• H1: clamp(56px, 8vw, 100px), weight 800–900, letter-spacing -0.04em to -0.06em, line-height 0.92–1.0.
• H2: clamp(36px, 5vw, 64px), weight 700–800, letter-spacing -0.03em, line-height 1.05–1.15.
• H3: clamp(20px, 2.5vw, 28px), weight 600–700.
• Body: 16px–18px, line-height 1.75, weight 400, max-width 68ch.
• Caption/label: 11px–13px, weight 600, letter-spacing 0.06em, uppercase.
• Use fluid clamp() sizing on EVERY font size, padding, and gap.

═══════════════════════════════════════════
SECTIONS — BUILD ALL 8, IN THIS ORDER
═══════════════════════════════════════════

1. NAVIGATION (fixed, blur backdrop)
   • position: fixed; top: 0; z-index: 1000; width: 100%.
   • backdrop-filter: blur(24px); background: rgba of --surface-0 at 0.82.
   • Left: logo (wordmark). Center: 4-5 nav links with smooth scroll. Right: CTA button (brand colour, pill shape).
   • Hide-on-scroll-down, reveal-on-scroll-up: track lastScrollY with requestAnimationFrame, apply translateY(-100%)/translateY(0).
   • Mobile: hamburger icon (pure CSS/JS), slides down overlay menu on click.
   • Active link: highlight current section via IntersectionObserver.

2. HERO (full-screen, must cause jaw-drop)
   • height: 100dvh; display: grid; place-items: center.
   • Animated background: TWO slow-drifting radial gradient blobs using @keyframes, 25s and 35s loops, alternate direction. Total motion should feel alive but subtle.
   • Eyebrow label: small uppercase pill badge with brand colour border.
   • H1: MASSIVE. Gradient text on the most powerful word (brand colour → lighter shade, background-clip: text).
   • Subheadline: 20px, muted, max 12 words. One sentence that sells the value proposition.
   • CTA row: primary button (brand colour, pill, glow box-shadow on hover) + ghost button (border, transparent).
   • Floating card/badge: one glassmorphism element positioned absolutely — a stat, a review snippet, or a feature callout. backdrop-filter: blur(16px). Give it a subtle entrance animation.
   • Decorative: optional large geometric shape (circle, arc, grid lines) as pure CSS background art.

3. SOCIAL PROOF STRIP (trust signals)
   • Background: slightly lighter than surface-0 (use surface-1).
   • Continuous horizontal marquee: CSS @keyframes scroll, 40s linear infinite. PAUSE on hover.
   • Content: 8-10 items — mix of company name logos (styled text with opacity), star ratings, or stat snippets.
   • Fade masks on left/right edges: ::before and ::after with gradient from surface-1 to transparent.

4. FEATURES / SERVICES (bento grid)
   • Background: white (#fff or very light tint).
   • CSS Grid: BENTO layout. Mix cell sizes: e.g. grid-template-columns: repeat(6, 1fr) with cells spanning 2-3 columns and 1-2 rows.
   • 6 feature cards minimum. Each: icon (large, brand colour), bold title (18-22px), 2-line description.
   • Hover: translateY(-6px) + border-color → brand + box-shadow depth (200ms cubic-bezier(0.22,1,0.36,1)).
   • Staggered entrance: each card fades in 80ms after the previous.

5. ABOUT / STORY (stat-forward layout)
   • Background: --surface-0.
   • Left half: ONE giant stat ("$480M" or "97%") at 100px+, brand colour. Below it: what the stat means.
   • Right half: brand story in 3-4 punchy sentences. A quote in a styled blockquote with large quotation mark.
   • Optional: second stat row below with 3 smaller stats side by side.

6. TESTIMONIALS (social proof cards)
   • Background: white or very light surface.
   • 3 cards in a grid (1-col mobile, 3-col desktop). Each card:
     - Star rating (5 stars, brand colour).
     - Quote in quotes, 2-4 lines, real and specific.
     - Avatar (coloured circle initials) + name (bold) + role + company.
   • Cards: white bg, subtle border, shadow. Hover: lift effect.

7. PROCESS / HOW IT WORKS (numbered steps)
   • Background: --surface-0.
   • 3-5 numbered steps. Large step number in brand colour (60px, very light opacity as bg text).
   • Alternating left/right layout on desktop: step text on one side, visual element (icon, stat, mini illustration as CSS shapes) on the other.
   • Connecting vertical line between steps (CSS ::before pseudo-element with brand colour).

8. CTA SECTION (final conversion push)
   • Background: gradient from --brand to a deeper shade of --brand, OR --surface-0 with animated gradient border.
   • Giant headline (clamp 40px, 6vw, 72px).
   • One-line subheadline.
   • Email input row OR single large CTA button.
   • Optional: "No credit card · Cancel anytime · Free trial" trust line below CTA.
   • Animated: gentle glow pulse on the CTA button, 3s infinite.

9. FOOTER (professional 4-column)
   • Background: slightly darker than --surface-0 (near black).
   • 4 columns: brand/mission, product links, company links, contact/social.
   • Social icons: pure Unicode (use: ✕ for X/Twitter, ⓕ for Facebook, ⓛ for LinkedIn, ◎ for Instagram).
   • Bottom bar: horizontal rule + copyright + "Built with Dominat8.io" attribution.

═══════════════════════════════════════════
MICRO-INTERACTIONS (all required)
═══════════════════════════════════════════
• Hero bg blobs: translateX/Y + scale, 25s/35s ease-in-out infinite alternate.
• Nav: JavaScript hide-on-scroll (track delta, threshold 5px, smooth 200ms transition).
• Count-up numbers: IntersectionObserver triggers requestAnimationFrame counter from 0 to target value over 1.5s.
• Section fade-in-up: IntersectionObserver (threshold: 0.12, rootMargin: "-40px"), once. translateY(28px) → 0, opacity 0 → 1, 700ms cubic-bezier(0.22,1,0.36,1).
• Card hover: translateY(-6px) + shadow, 180ms cubic-bezier(0.22,1,0.36,1).
• Button hover: scale(1.04) + glow shadow pulse, 160ms ease.
• Marquee: pauses on hover (animation-play-state: paused).

═══════════════════════════════════════════
CONTENT STANDARDS (zero tolerance for generic content)
═══════════════════════════════════════════
• INVENT a creative, memorable business name (NOT "ABC Company" or "Your Brand").
• INVENT a full address with real street name, city, country (appropriate for industry + locale hinted in prompt).
• INVENT real phone (+country code) and email that match the city.
• INVENT specific service names with actual pricing ranges (e.g. "Brand Identity Suite — from $8,500").
• INVENT 3 impressive, plausible statistics (e.g. "2,847 clients · $320M revenue managed · 14 countries").
• INVENT 3 testimonials: diverse first names, specific job titles ("VP Marketing at Atlassian"), quotes that reference specific outcomes.
• INVENT a tagline that sounds like it cost $50,000 to write. Short, specific, memorable.
• NO lorem ipsum. NO "placeholder text". NO "Company Name". NO generic content whatsoever.

═══════════════════════════════════════════
TECHNICAL REQUIREMENTS
═══════════════════════════════════════════
• Mobile-first. CSS Grid + Flexbox throughout. ZERO layout breaks at 320px, 768px, 1440px.
• Semantic HTML5: <header>, <nav>, <main>, <section id="section-name">, <article>, <footer>.
• Every <section> gets a meaningful id for smooth scroll nav links.
• <head>: <title> (specific, 50-60 chars), <meta name="description"> (compelling, 150-160 chars), Open Graph title/description/url tags with REAL invented content.
• CSS: ALL design tokens as :root custom properties. BEM-style or scoped class names.
• html { scroll-behavior: smooth; } on root.
• Viewport meta: <meta name="viewport" content="width=device-width, initial-scale=1">.
• Accessibility: aria-label on icon buttons, alt on images, role="banner" on header, role="main" on main.

═══════════════════════════════════════════
THE ULTIMATE QUALITY BAR
═══════════════════════════════════════════
Before you finish, ask yourself:
1. Would a $150K web agency be proud to show this?
2. Does every section look intentional and designed?
3. Would this win an Awwwards nomination?
4. Is every word specific, real, and compelling?

If the answer to any is "no" — improve it before responding.
═══════════════════════════════════════════`;

const INDUSTRY_HINTS: Record<string, string> = {
  Restaurant: "Deep burgundy or terracotta. Warm amber lighting feel. Menu section with dish names, descriptions, and pricing. Reservation/booking CTA. Food-focused trust signals. Opening hours. Chef profile.",
  "Law Firm": "Deep navy + gold. Authority and gravitas. Case results in large stat format. Practice areas as bento cards. Partner profiles with credentials. Strict, trustworthy typography.",
  Legal: "Deep navy + gold. Authority and gravitas. Case results in large stat format. Practice areas as bento cards. Partner profiles with credentials.",
  SaaS: "Electric blue or violet. Hero includes a CSS-built dashboard UI mockup (divs + mock data). Feature comparison table. 3-tier pricing cards with most-popular highlight. Integration logo strip. Free trial CTA.",
  "Real Estate": "Charcoal + warm gold. Featured property listing cards with price badges and bed/bath/sqft icons. Agent profiles with credentials. 'Find your home' search bar in hero. Market stats strip.",
  Fitness: "High-contrast black + neon (lime green or electric orange). Before/after result stats (kg lost, clients trained). Class schedule table or grid. 3 membership tiers. Transformation testimonials.",
  "E-commerce": "Clean white + bold brand accent. Hero product showcase with CSS product card. Featured products grid with price, rating, and add-to-cart button. Trust badges (free shipping, returns). Reviews.",
  Portfolio: "Dark gallery-first aesthetic. Full-screen project showcase with hover reveal overlay. Skills/expertise grid. Case study cards with category tags and year. Contact form with social links.",
  Medical: "White + teal or sky blue. Empathy + clinical precision. Specialties grid. Doctor profiles with qualifications. Online booking widget. Accreditation and certification badges.",
  Healthcare: "White + teal or sky blue. Calm, reassuring palette. Patient services grid. Provider profiles. Appointment booking CTA. Insurance logos strip. Patient testimonials.",
  Agency: "Bold, maximalist creative. Case study grid with hover reveal. Client logo marquee. Team gallery with role labels. Manifesto section with large type. Webby/Cannes award badges.",
  Business: "Clean, authoritative. Services grid with outcome-focused copy. Client logos. ROI/results statistics. Testimonials from named executives. Clear multi-step contact CTA.",
  Construction: "Industrial charcoal + safety orange or yellow. Project portfolio grid with category filter. Certifications and safety stats. Equipment/fleet showcase. RFQ contact form.",
  Education: "Bright, optimistic blue or teal. Course highlights grid with duration and level. Alumni success statistics. Student testimonials. Enrollment CTA with intake dates.",
  Travel: "Deep ocean blue or sunset gradient. Destination cards with CSS gradient overlays. Package cards with price, duration, and included features. Experience gallery grid. Book now CTA.",
  Hospitality: "Warm luxurious deep tones. Room/venue cards with amenity icons. Authentic guest reviews. Dining and events highlights. Reservation form with date picker UI.",
  Technology: "Dark futuristic. CSS-built product/dashboard mockup in hero. Feature highlights. Integration partner logos. Performance stats. Free trial CTA with 'no credit card' badge.",
  Finance: "Conservative deep navy or forest green + gold. Trust-first design. Service offerings grid. AUM/returns statistics. Advisor profiles with credentials. Compliance badges. Consultation booking.",
  Photography: "Dark, gallery-first. Full-bleed image placeholders (CSS gradient art). Package tiers with inclusions. 'Behind the lens' about section. Client review carousel. Booking inquiry form.",
  Consulting: "Authoritative navy + gold or charcoal + electric blue. Problem-solution framework sections. Client logos and case study highlights. Consulting engagement process steps. Partner bios.",
  Nonprofit: "Warm, human, emotional. Impact statistics (lives changed, meals served, funds raised). Story section with personal narrative. Volunteer/donation CTAs. Transparency report highlights.",
  Beauty: "Soft pastels or rich deep tones depending on positioning. Service menu with pricing. Before/after gallery. Stylist profiles. Online booking. Product showcase strip.",
};

const VIBE_HINTS: Record<string, string> = {
  Minimal:    "STYLE: Ultra-minimal. Extreme whitespace — sections breathe with 120px+ vertical padding. Monochrome palette with exactly ONE precise accent colour. Typography does ALL the work: massive H1, generous line-height, strict mathematical grid. Zero decorative elements. Every pixel earns its place or it's cut ruthlessly.",
  Bold:       "STYLE: Maximum visual impact. H1 at 100px–120px+. Ultra-high contrast (black/white with one electric accent). Strong geometric CSS shapes as design elements (circles, slashes, rectangles). The hero feels like a Times Square billboard. Aggressive colour-blocking between sections. Unapologetically loud.",
  Luxury:     "STYLE: Premium editorial luxury brand. Dark near-black backgrounds. Gold or platinum accents (#C9A84C or #B0B0B0). Use 'Playfair Display' serif for headings (import from Google Fonts), clean sans-serif for body. Vast whitespace. Thin borders (1px). Every element feels like it belongs in a Rolls-Royce showroom.",
  Dark:       "STYLE: Pure dark mode throughout EVERY section (no white sections). Deep charcoal or near-black backgrounds. Brand-coloured neon/glowing accents. Subtle CSS dot-grid or line-grid texture on surface-1. Glassmorphism cards (backdrop-filter blur, semi-transparent border). Cyberpunk-adjacent but professional and readable. Glow effects on CTAs.",
  Playful:    "STYLE: Joyful and vibrant. Multi-stop gradients everywhere (hero, section backgrounds, buttons). Generous rounded corners (24px–40px). Bold saturated palette with 2-3 colours in harmony. Personality-forward copy that makes people smile. Micro-interactions that feel delightful. Warm, inviting, high-energy.",
  Corporate:  "STYLE: Fortune 500 enterprise. Conservative palette: deep navy (#0A1628) or charcoal, clean white, one measured blue accent. Structured grid-based layout. Clear visual hierarchy with strict typographic scale. Trust signals everywhere (certifications, client logos, statistics). Could appear in an annual report or IPO prospectus.",
  Editorial:  "STYLE: Premium magazine aesthetic. Large image areas (CSS gradient placeholders). Mixed typographic scale: one enormous display headline next to small structured text. Editorial column grid (12-col). Mix of serif (for headings) and sans-serif (for body). High contrast. Feels like a Monocle or NYT Mag layout.",
  Futuristic: "STYLE: Next-generation tech brand. CSS-animated gradient mesh in hero. Thin grid-line overlays (1px, 5% opacity) as background texture. Glassmorphism panels. Neon/holographic gradient accents (electric blue → purple → teal). Monospace font elements mixed with display sans-serif. Feels like a SpaceX or OpenAI product page.",
};

export async function POST(req: NextRequest) {
  const { prompt, industry, vibe, model: requestedModel } = await req.json();

  if (!prompt?.trim()) {
    return new Response(
      JSON.stringify({ error: "Prompt required", code: "MISSING_PROMPT" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI service not configured. Please contact support.", code: "NO_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Auth + quota check (with timeout to avoid hangs) ─────────────────────
  let userId: string | null = null;
  try {
    const session = await Promise.race([
      auth(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("auth timeout")), 5000)),
    ]);
    userId = session.userId;
  } catch {
    // Auth unavailable (missing keys, timeout, edge runtime issue) — continue as anonymous
  }

  if (userId) {
    // Authenticated: enforce monthly quota (with timeout — be lenient if KV is slow)
    try {
      const { allowed, plan, usage, limit } = await Promise.race([
        checkUsage(userId),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("KV timeout")), 5000)),
      ]);
      if (!allowed) {
        return new Response(
          JSON.stringify({
            error: `Monthly limit reached. You've used ${usage}/${limit} generations on the ${plan} plan.`,
            code: "QUOTA_EXCEEDED",
            plan,
            usage,
            limit,
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch {
      // KV unavailable or timeout — allow generation rather than blocking
    }
  }
  // Unauthenticated users get 3 free generations tracked client-side (localStorage).
  // ─────────────────────────────────────────────────────────────────────────

  // ── Determine which provider to use ──────────────────────────────────────
  // Claude is always preferred. "auto" defaults to Sonnet when Anthropic key is available.
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const claudeModel: string = requestedModel === "claude-haiku-4-5-20251001"
    ? "claude-haiku-4-5-20251001"
    : "claude-sonnet-4-6";
  const useClaude = hasAnthropic;

  const industryHint = industry && INDUSTRY_HINTS[industry]
    ? `\nINDUSTRY GUIDANCE: ${INDUSTRY_HINTS[industry]}`
    : "";

  const vibeHint = vibe && VIBE_HINTS[vibe]
    ? `\n${VIBE_HINTS[vibe]}`
    : "";

  const userMessage = [
    `Build a world-class website for: ${prompt.trim()}`,
    industryHint,
    vibeHint,
    industry ? `Industry category: ${industry}` : "",
    "",
    "This website must be so visually stunning it wins a Webby Award.",
    "Invent real, specific, compelling content — zero lorem ipsum, zero generic placeholders.",
    "Apply every animation, micro-interaction, and design technique in the brief.",
  ]
    .filter(Boolean)
    .join("\n");

  const messages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: userMessage },
  ];

  const streamHeaders = {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };

  // ── Claude path (preferred) ─────────────────────────────────────────────
  if (useClaude) {
    try {
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        timeout: 55_000, // 55s — stay under Vercel's 60s maxDuration
      });
      const isHaiku = claudeModel.includes("haiku");
      console.log("[generate] Starting Claude stream", { model: claudeModel, isHaiku });
      const stream = await client.messages.create({
        model: claudeModel as "claude-sonnet-4-6",
        max_tokens: isHaiku ? 8000 : 16000,
        temperature: 0.80,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const encoder = new TextEncoder();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (
                event.type === "content_block_delta" &&
                event.delta.type === "text_delta"
              ) {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Stream interrupted";
            controller.enqueue(encoder.encode(`\n<!-- GENERATION_ERROR: ${message} -->`));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, { headers: streamHeaders });
    } catch (err: unknown) {
      // Claude failed — fall back to OpenAI if available
      if (hasOpenAI) {
        console.warn("[generate] Claude failed, falling back to OpenAI:", err instanceof Error ? err.message : err);
      } else {
        const message = err instanceof Error ? err.message : "Unknown error";
        return new Response(
          JSON.stringify({ error: `Generation failed: ${message}`, code: "AI_ERROR" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // ── OpenAI path (fallback) ──────────────────────────────────────────────
  if (!hasOpenAI) {
    return new Response(
      JSON.stringify({ error: "AI service not available. Please try again later.", code: "NO_API_KEY" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      stream: true,
      max_tokens: 16000,
      temperature: 0.80,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isAuth = message.includes("401") || message.includes("Incorrect API key") || message.includes("invalid_api_key");
    const isQuota = message.includes("429") || message.includes("quota") || message.includes("rate_limit");
    return new Response(
      JSON.stringify({
        error: isAuth
          ? "AI service authentication failed. Please check the API key configuration."
          : isQuota
          ? "AI service rate limit reached. Please try again in a moment."
          : `AI generation failed: ${message}`,
        code: isAuth ? "AI_AUTH" : isQuota ? "AI_RATE_LIMIT" : "AI_ERROR",
      }),
      { status: isAuth ? 502 : isQuota ? 503 : 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Stream interrupted";
        controller.enqueue(encoder.encode(`\n<!-- GENERATION_ERROR: ${message} -->`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, { headers: streamHeaders });
}
