import { OpenAI } from "openai";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { NextRequest } from "next/server";

// Node runtime: Clerk auth() has issues in Edge (Request/headers symbol). Generation is I/O-bound anyway.
export const maxDuration = 60;

const MONTHLY_LIMITS: Record<string, number> = {
  free: 3,
  starter: 20,
  pro: 100,
  agency: 500,
};

const SYSTEM_PROMPT = `You are an elite creative director and principal front-end engineer at the world's most award-winning digital studio. Your work has won Webby Awards, FWA Site of the Day, and CSS Design Awards. You build websites that make people stop scrolling and say "wow".

Generate a complete, single-page website as ONE self-contained HTML file.

═══════════════════════════════════════════
OUTPUT RULES — NON-NEGOTIABLE
═══════════════════════════════════════════
• Return ONLY the HTML. No markdown. No explanation. No code fences.
• Start immediately with <!DOCTYPE html>
• ALL CSS inside ONE <style> tag. ALL JS inline at bottom of <body>.
• Google Fonts: ONE @import line only (Outfit, Plus Jakarta Sans, or Syne).
• Zero external dependencies. Works fully offline once loaded.

═══════════════════════════════════════════
VISUAL DESIGN EXCELLENCE
═══════════════════════════════════════════

COLOUR SYSTEM
• Pick ONE hero brand colour perfectly matched to the industry personality.
• Build a full palette using CSS custom properties:
  --brand, --brand-dim, --brand-glow, --surface-0 (darkest), --surface-1, --surface-2, --text-primary, --text-secondary, --text-muted
• Hero: deep dark or rich coloured bg. Sections alternate: dark → white → subtle tint → dark.

TYPOGRAPHY (non-negotiable)
• Import Syne (for display) or Outfit from Google Fonts.
• H1: 72px–96px, weight 800–900, letter-spacing -0.04em to -0.06em, line-height 0.95–1.05.
• Subheadings: 40px–56px, weight 700–800.
• Body: 16px–18px, line-height 1.7, weight 400.
• Use fluid clamp() sizing everywhere: clamp(min, preferred, max).

HERO (must be jaw-dropping)
• Full viewport height (100dvh).
• Fixed navigation behind it with backdrop-filter: blur(20px) and semi-transparent bg.
• Giant display headline with gradient text on the key word (use background-clip: text).
• Subheadline: 18–22px, muted, one powerful line.
• Two CTAs: primary (brand colour, pill shape, shadow glow) + ghost (border only).
• Animated background: slow-drifting mesh gradient using @keyframes (30s loop).
• Optional: floating glass-morphism card or stat badge positioned absolutely in the hero.

NAVIGATION
• Fixed, z-index 1000.
• backdrop-filter: blur(20px); background: rgba(--surface-0, 0.85).
• Logo left. Nav links centre. CTA button right.
• Smooth scroll. Active section highlight via IntersectionObserver + JS.
• Hamburger menu on mobile with smooth slide-down.
• Hide-on-scroll-down, reveal-on-scroll-up behaviour via JS.

SECTIONS (build all of these, in order)
1. HERO — full-screen, animated, awe-inspiring
2. SOCIAL PROOF STRIP — scrolling marquee of trust signals (logos or stats), use CSS animation: scroll
3. FEATURES / SERVICES — BENTO GRID layout (CSS Grid with mixed cell sizes: 2 large + 4 small, or 3 wide + 2 tall). Each card: icon, bold title, description. Hover: lift + glow border.
4. ABOUT / STORY — split layout: large bold stat on left, copy on right. Or full-width quote with large quotation mark.
5. TESTIMONIALS — 3 cards in a horizontal scrollable row on mobile, 3-col on desktop. Stars, photo avatar (coloured circle), name, role, quote.
6. PROCESS / HOW IT WORKS — numbered steps with connecting line. Alternating left/right on desktop.
7. CTA SECTION — full-width dark band. Giant headline + subline + email input or booking button. Animated gradient border or glow.
8. FOOTER — 4 columns: brand/tagline, links, contact details, social icons (Unicode: 𝕏 ⓛ). Copyright line. All links work with smooth scroll.

MICRO-INTERACTIONS & ANIMATIONS
• Nav: slides up on scroll-down, slides back on scroll-up (requestAnimationFrame delta).
• Hero bg: drifting mesh gradient, 30s infinite, alternate direction.
• Cards: translateY(-6px) + box-shadow depth increase on hover, 200ms cubic-bezier(0.22,1,0.36,1).
• CTA buttons: hover → scale(1.04) + glow shadow pulse.
• Numbers (trust strip, stats): count-up using IntersectionObserver + requestAnimationFrame.
• Section entrance: fade-in-up (translateY 24px → 0, opacity 0 → 1) via IntersectionObserver, threshold 0.15, once.
• Bento cards: staggered entrance (delay each by 80ms).
• Marquee strip: continuous horizontal scroll via CSS @keyframes, pause on hover.

CONTENT QUALITY (invent real, specific, believable content)
• Real business name (creative, not generic).
• Real address, phone (+country code), email appropriate for city and industry.
• Real service names with specific pricing or ranges.
• Stats that are plausible and impressive (e.g. "2,300+ projects · $480M revenue generated · 97% client retention").
• Testimonials: diverse names, specific roles ("Head of Marketing at Acme Corp"), direct quotes that feel authentic.
• Tagline: one line, sounds like it cost $50,000 to write.

TECHNICAL EXCELLENCE
• Mobile-first responsive. CSS Grid + Flexbox. No layout breaks at 320px, 768px, 1440px.
• Semantic HTML5: <header>, <nav>, <main>, <section id="...">, <article>, <footer>.
• <title>, <meta name="description">, Open Graph tags with real content.
• CSS: custom properties for entire design system. BEM-style naming or scoped prefixes.
• Smooth scroll: scroll-behavior: smooth on html.
• No lorem ipsum anywhere.

═══════════════════════════════════════════
QUALITY BAR: If a Fortune 500 CMO saw this, they would think it cost $50,000+ to build.
Every pixel must be intentional. Every word must earn its place.
═══════════════════════════════════════════`;

const INDUSTRY_HINTS: Record<string, string> = {
  Restaurant: "Deep burgundy or terracotta. Warm amber lighting feel. Menu section with dish names, descriptions, and pricing. Reservation/booking CTA. Food-focused trust signals.",
  "Law Firm": "Deep navy + gold. Authority and gravitas. Case results in large stat format. Practice areas as bento cards. Partner profiles with credentials. Strict typography.",
  Legal: "Deep navy + gold. Authority and gravitas. Case results in large stat format. Practice areas as bento cards. Partner profiles with credentials.",
  SaaS: "Electric blue or violet. Dashboard UI mockup in hero (build it with CSS divs). Feature comparison table. 3-tier pricing cards with most-popular highlight. Integrations logos strip.",
  "Real Estate": "Charcoal + warm gold. Property listing cards with price badges and bed/bath icons. Map pin aesthetic. Agent profiles with credentials. Search bar in hero.",
  Fitness: "High-contrast black + neon (lime green or electric orange). Before/after result stats. Class schedule grid. Membership tiers. Transformation testimonials.",
  "E-commerce": "Clean white + one bold accent. Hero product showcase. Featured products grid with price and add-to-cart. Trust badges. Reviews with stars.",
  Portfolio: "Dark, gallery-first. Full-screen project showcase with hover reveal. Skills as progress indicators. Case study cards with category tags. Contact form.",
  Medical: "White + teal/sky. Empathy and clinical precision. Services grid. Doctor profiles. Online booking widget. HIPAA/accreditation badges.",
  Healthcare: "White + teal or sky blue. Calm, reassuring. Patient services. Provider profiles. Appointment booking. Insurance logos strip.",
  Agency: "Bold, maximalist creative. Case study grid with category filter. Client logo strip. Team gallery. Manifesto section. Award badges.",
  Business: "Clean professional. Services grid. Client logos. ROI/results stats. Testimonials. Clear contact CTA.",
  Construction: "Industrial charcoal + orange/yellow. Project portfolio grid with categories. Certifications strip. Safety stats. RFQ form.",
  Education: "Bright, optimistic. Course highlights grid. Success stats. Student testimonials. Enrollment CTA with countdown or intake dates.",
  Travel: "Full-bleed destination imagery (CSS gradient overlays). Package cards with price and duration. Experience highlights. Instagram-style gallery grid. Book now CTA.",
  Hospitality: "Warm luxurious. Room/venue cards with amenities icons. Guest reviews. Dining/events highlights. Reservation form.",
  Technology: "Dark futuristic. Product/dashboard mockup built in CSS. Feature highlights with animated icons. Integration logos. Free trial CTA with no-CC badge.",
};

const VIBE_HINTS: Record<string, string> = {
  Minimal:   "STYLE: Ultra-minimal. Extreme whitespace. Monochrome palette with a single precise accent colour. Typography does all the work — no decorative elements. Grid is strict and mathematical. Every element earns its place or it's cut.",
  Bold:      "STYLE: Maximum visual impact. Oversized type at 100px+. Ultra-high contrast. Strong geometric shapes as design elements. The hero should feel like a billboard. Colour blocking between sections.",
  Luxury:    "STYLE: Premium editorial luxury brand. Dark backgrounds (near-black), gold or platinum accents (#C9A84C or #B8B8B8). Tight serif display headline (use 'Playfair Display' from Google Fonts). Vast whitespace. Every element feels expensive.",
  Dark:      "STYLE: Full dark mode throughout every section. Neon/glowing accents matching brand colour. Subtle grid-line or dot-grid background texture via CSS. Glassmorphism cards. Cyberpunk-adjacent but professional and readable.",
  Playful:   "STYLE: Vibrant multi-stop gradients everywhere. Rounded corners (border-radius 20px–32px). Bold saturated colours. Personality-forward copy. Fun micro-interactions. Warm and inviting energy.",
  Corporate: "STYLE: Enterprise professional. Conservative blue palette. Measured, structured layout. Clear visual hierarchy. Trust signals prominent. Could appear in a Fortune 500 annual report.",
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    let body: { prompt?: string; industry?: string; vibe?: string };
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }
    const { prompt, industry, vibe } = body;

    if (!prompt?.trim()) {
      return new Response("Prompt required", { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response("OpenAI API key not configured. Add OPENAI_API_KEY to .env.local.", { status: 500 });
    }

    let plan = "free";
    let usage = 0;
    let limit = MONTHLY_LIMITS.free;
    const now = new Date();
    const monthKey = userId
      ? `user:${userId}:usage:${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
      : null;
    if (userId) {
      try {
        plan = (await kv.get<string>(`user:${userId}:plan`)) ?? "free";
        limit = MONTHLY_LIMITS[plan] ?? MONTHLY_LIMITS.free;
        usage = (await kv.get<number>(monthKey!)) ?? 0;
        if (usage >= limit) {
          return new Response(
            `Monthly generation limit reached (${limit} for ${plan}). Upgrade or wait until next month.`,
            { status: 429 }
          );
        }
      } catch {
        /* KV unavailable: allow generation, skip usage tracking */
      }
    }

  const openai = new OpenAI({ apiKey });

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

  let stream;
  try {
    stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    stream: true,
    max_tokens: 16000,
    temperature: 0.80,
  });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isRateLimit = msg.includes("rate") || msg.includes("429");
    const isAuth = msg.includes("API key") || msg.includes("401") || msg.includes("Incorrect API key");
    const status = isAuth ? 401 : isRateLimit ? 429 : 500;
    return new Response(msg, { status });
  }

  // Increment usage counter before streaming begins so that aborting the stream
  // mid-way still counts against the user's monthly limit.
  if (monthKey) {
    try {
      await kv.incr(monthKey);
      await kv.expire(monthKey, 60 * 60 * 24 * 32);
    } catch { /* non-fatal */ }
  }

  const encoder = new TextEncoder();

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

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(`Generate failed: ${msg}`, { status: 500 });
  }
}
