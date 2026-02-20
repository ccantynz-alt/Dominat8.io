import { OpenAI } from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an elite creative director and front-end engineer at the world's top digital design studio. Your specialty is crafting websites so visually stunning they win international awards.

Generate a complete, single-page website as ONE self-contained HTML file that will genuinely impress any visitor.

═══════════════════════════════════════════
OUTPUT RULES — NON-NEGOTIABLE
═══════════════════════════════════════════
• Return ONLY the HTML. No markdown. No explanation. No code fences.
• Start immediately with <!DOCTYPE html>
• ALL CSS in a <style> tag. ALL JS inline.
• No external resources except Google Fonts (one @import line max).
• Must work fully offline once loaded.

═══════════════════════════════════════════
DESIGN EXCELLENCE STANDARDS
═══════════════════════════════════════════

VISUAL IDENTITY
• Pick one hero brand color that perfectly fits the industry. Build the entire palette from it.
• Use ONE bold gradient as the hero background — mesh gradients or radial fades, not flat colour.
• Typography: import Outfit or Plus Jakarta Sans from Google Fonts. H1 must be 64px+, bold, tight letter-spacing (-0.03em to -0.05em).
• Section backgrounds alternate: dark hero → white content → subtle tinted → dark CTA → footer.

HERO SECTION (must be breathtaking)
• Full viewport height (100vh or 100dvh).
• Giant headline (3-5 words max on first line) with a vivid gradient text effect on the key word.
• One-line subheadline that explains the value proposition.
• Two CTAs: primary (filled, brand colour) + secondary (ghost button).
• Floating decorative shape/glow behind the headline.
• Animated gradient orb or mesh background using CSS @keyframes.

NAVIGATION
• Fixed top bar, blur backdrop-filter.
• Logo (brand name, bold) left. 4-5 nav links centre/right. One CTA button.
• Smooth scroll on nav links.

SECTIONS — REQUIRED (in order)
1. Hero (full-screen, jaw-dropping)
2. Trust strip — logos or stats (e.g. "500+ clients · $2.1B revenue generated · 4.9★ rated")
3. Services / Features — 3-6 cards with icons (use Unicode/SVG emoji-style icons, no external icon libs)
4. About / Story — full-width image placeholder + compelling copy
5. Social Proof — 2-3 testimonial cards with name, role, real quote
6. How It Works — 3-step numbered process
7. CTA section — strong headline + form or booking button, contrasting background
8. Footer — columns with links, address, social icons, copyright

MICRO-INTERACTIONS & ANIMATIONS
• Cards lift on hover (translateY(-4px) + deeper box-shadow, 200ms ease).
• CTA buttons: scale(1.03) on hover + glow pulse.
• Hero background: slow-drifting gradient animation (20s loop, infinite).
• Numbers in trust strip: count-up animation using IntersectionObserver + requestAnimationFrame.
• Fade-in-up entrance for sections using IntersectionObserver (once).

CONTENT QUALITY
• Real business name derived from the prompt (not "Your Company").
• Real address, phone, email (make up plausible ones for the city/industry).
• Real service names and prices/ranges specific to the industry.
• Real testimonial names (diverse, realistic), roles, and quotes that sound genuine.
• Tagline that could win an advertising award.

TECHNICAL EXCELLENCE
• Fully mobile-responsive. Use CSS Grid + Flexbox. Hamburger menu on mobile (JS toggle).
• CSS custom properties for all colours and fonts.
• Semantic HTML5: header, nav, main, section, article, footer.
• Proper <title>, <meta name="description">, Open Graph tags.
• Smooth scroll behavior on html element.
• No layout breaks at 320px, 768px, or 1440px.

═══════════════════════════════════════════
THIS IS THE STANDARD: If someone opened this website, they would assume it cost $15,000+ to build.
═══════════════════════════════════════════`;

const INDUSTRY_HINTS: Record<string, string> = {
  Restaurant: "Use deep burgundy or rich terracotta as brand colour. Food photography placeholder with warm overlay. Menu section with pricing.",
  "Law Firm": "Navy + gold colour scheme. Authority and trust. Case results stats. Practice areas. Partner profiles.",
  SaaS: "Electric blue or violet. Dashboard screenshot mockup in hero. Feature comparison table. Pricing tiers.",
  "Real Estate": "Charcoal + warm gold. Property listings grid. Search bar in hero. Agent profiles.",
  Fitness: "High-contrast black + neon (lime or orange). Bold before/after. Class schedule. Membership pricing.",
  "E-commerce": "Clean white + strong brand accent. Product hero. Featured products grid. Trust badges.",
  Portfolio: "Dark minimal. Full-screen project showcase. About section with skills. Contact form.",
  Medical: "Clean white + teal. Trust and empathy. Services. Doctor profiles. Book appointment CTA.",
  Agency: "Bold, creative, memorable. Case studies. Client logos. Team grid. Process steps.",
  Construction: "Industrial charcoal + orange. Project portfolio. Services. Safety certifications. Quote form.",
};

export async function POST(req: NextRequest) {
  const { prompt, industry } = await req.json();

  if (!prompt?.trim()) {
    return new Response("Prompt required", { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  const industryHint = industry && INDUSTRY_HINTS[industry]
    ? `\nINDUSTRY GUIDANCE: ${INDUSTRY_HINTS[industry]}`
    : "";

  const userMessage = [
    `Build a world-class website for: ${prompt.trim()}`,
    industryHint,
    industry ? `Industry: ${industry}` : "",
    "",
    "This website must be so visually stunning it could win a Webby Award.",
    "Make every design decision deliberate and beautiful.",
    "Use real, specific content — not placeholders or lorem ipsum.",
  ]
    .filter(Boolean)
    .join("\n");

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    stream: true,
    max_tokens: 12000,
    temperature: 0.75,
  });

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
}
