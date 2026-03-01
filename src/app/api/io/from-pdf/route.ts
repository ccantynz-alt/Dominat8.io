import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * PDF-to-Website: Upload a PDF, get a website
 *
 * Users can upload:
 *   - Business brochures → full marketing site
 *   - Pitch decks → investor/product landing page
 *   - Resumes/CVs → personal portfolio site
 *   - Restaurant menus → restaurant website with menu section
 *   - Product catalogs → product showcase site
 *   - Event programs → event landing page
 *   - Real estate listings → property showcase
 *
 * Claude's native PDF support extracts text, layout, and images
 * from the PDF and uses them to generate a tailored website.
 *
 * This is a HUGE conversion driver — people have PDFs, not website ideas.
 */

const PDF_ANALYSIS_PROMPT = `You are an expert at converting documents into website content.

Analyze this PDF and extract everything needed to build a stunning website.

Return JSON:
{
  "documentType": "brochure" | "pitch-deck" | "resume" | "menu" | "catalog" | "event" | "listing" | "report" | "other",
  "extractedContent": {
    "businessName": "<extracted or inferred>",
    "tagline": "<extracted or crafted from content>",
    "industry": "<detected industry>",
    "keyMessages": ["<main selling points / value props>"],
    "services": ["<services or products mentioned>"],
    "features": ["<features or benefits highlighted>"],
    "testimonials": ["<any quotes or endorsements>"],
    "stats": ["<any numbers, metrics, achievements>"],
    "contact": {
      "phone": "<if found>",
      "email": "<if found>",
      "address": "<if found>",
      "website": "<if found>"
    },
    "team": [{"name": "<name>", "role": "<role>", "bio": "<short bio if available>"}],
    "pricing": [{"tier": "<name>", "price": "<price>", "features": ["<included>"]}]
  },
  "designRecommendation": {
    "style": "<based on the PDF's design language>",
    "palette": {
      "brand": "<hex — from PDF colors>",
      "accent": "<hex>",
      "background": "<hex>",
      "text": "<hex>"
    },
    "tone": "professional" | "casual" | "luxury" | "playful" | "technical",
    "sections": ["<recommended website sections based on content>"]
  },
  "buildPrompt": "<A comprehensive prompt that captures ALL the extracted information and can be passed directly to the website generator. Include specific content, stats, team members, services — everything from the PDF.>"
}

RULES:
- Extract EVERY piece of content from the PDF — names, numbers, quotes, everything
- The buildPrompt should be so detailed that the website generator creates a site that perfectly represents the PDF content
- Match the design style to the PDF's visual language
- If it's a resume, recommend a portfolio-style site
- If it's a menu, recommend a restaurant site with menu section
- If it's a pitch deck, recommend a product landing page
- Return ONLY valid JSON`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const { pdf, additionalContext } = await req.json();

  if (!pdf) {
    return Response.json({ error: "pdf (base64) required" }, { status: 400 });
  }

  // Strip data URL prefix if present
  const base64Data = pdf.replace(/^data:application\/pdf;base64,/, "");

  const client = new Anthropic({ apiKey: anthropicKey });

  const userText = additionalContext
    ? `Analyze this PDF and extract content for website generation. Additional context: ${additionalContext}`
    : "Analyze this PDF and extract all content for website generation.";

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 3000,
    temperature: 0.2,
    system: [
      {
        type: "text",
        text: PDF_ANALYSIS_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Data,
            },
          },
          { type: "text", text: userText },
        ],
      },
    ],
  });

  const block = msg.content[0];
  const raw = block.type === "text" ? block.text : "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw };

  return Response.json({
    ok: true,
    analysis: result,
    buildPrompt: result.buildPrompt ?? null,
    documentType: result.documentType ?? "other",
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    },
  });
}
