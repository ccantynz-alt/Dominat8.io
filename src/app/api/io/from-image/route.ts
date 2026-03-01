import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Multi-Modal: Build website from uploaded image
 *
 * Users can upload:
 *   - A logo → we extract brand colors, style, and build a matching site
 *   - A screenshot of a competitor → we build a better version
 *   - A hand-drawn wireframe → we turn it into a real site
 *   - A design mockup (Figma export, etc.) → we implement it in HTML
 *   - A business card → we extract info and build a site
 *   - Product photos → we build an e-commerce-style landing page
 *
 * This is a MASSIVE differentiator — "upload anything, get a website"
 */

const IMAGE_ANALYSIS_PROMPT = `You are an elite web designer. Analyze this image and extract everything useful for building a website.

Return JSON:
{
  "imageType": "logo" | "screenshot" | "wireframe" | "mockup" | "business-card" | "product-photo" | "other",
  "extractedInfo": {
    "businessName": "<if visible>",
    "tagline": "<if visible>",
    "colors": ["<hex colors extracted from the image>"],
    "style": "<modern | classic | playful | corporate | minimal | luxury | tech | organic>",
    "industry": "<detected industry>",
    "contact": {
      "phone": "<if visible>",
      "email": "<if visible>",
      "address": "<if visible>",
      "website": "<if visible>"
    },
    "content": ["<any text content extracted>"],
    "features": ["<products/services/features visible>"]
  },
  "designRecommendation": {
    "palette": {
      "brand": "<hex — primary from image>",
      "accent": "<hex — complementary>",
      "background": "<hex>",
      "text": "<hex>"
    },
    "fonts": {
      "heading": "<Google Font that matches the style>",
      "body": "<Google Font that matches>"
    },
    "vibe": "<describe the overall design direction>",
    "sections": ["<recommended sections based on what we extracted>"]
  },
  "buildPrompt": "<A complete, detailed prompt that could be passed to the website generator to build the perfect site based on this image>"
}

RULES:
- Extract EVERY piece of useful information from the image
- If it's a logo, focus on colors, style, and brand personality
- If it's a screenshot, describe the layout, design patterns, and what makes it work
- If it's a wireframe, describe each section and its purpose
- If it's a business card, extract all contact info and services
- The buildPrompt should be comprehensive enough to generate a full website
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

  const { image, additionalContext } = await req.json();

  if (!image) {
    return Response.json({ error: "image (base64) required" }, { status: 400 });
  }

  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const mediaType = image.startsWith("data:image/png")
    ? "image/png"
    : image.startsWith("data:image/webp")
      ? "image/webp"
      : image.startsWith("data:image/gif")
        ? "image/gif"
        : "image/jpeg";

  const client = new Anthropic({ apiKey: anthropicKey });

  const userText = additionalContext
    ? `Analyze this image for website generation. Additional context: ${additionalContext}`
    : "Analyze this image for website generation.";

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 2000,
    temperature: 0.2,
    system: [
      {
        type: "text",
        text: IMAGE_ANALYSIS_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
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
    // The buildPrompt can be passed directly to /api/io/generate
    buildPrompt: result.buildPrompt ?? null,
    usage: {
      inputTokens: msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
    },
  });
}
