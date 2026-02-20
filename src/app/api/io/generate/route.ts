import { OpenAI } from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an elite web designer. Generate a stunning, complete, single-page website as ONE self-contained HTML file.

RULES:
- Return ONLY the HTML file. No markdown. No explanation. Start with <!DOCTYPE html>
- Embed ALL CSS inside a <style> tag. No external CSS except Google Fonts
- Embed minimal JS inline only if needed
- Mobile-responsive (use CSS Grid/Flexbox)
- Use Google Fonts — Outfit or Inter preferred
- Design must feel premium, modern, and on-brand for the industry
- Include real, specific placeholder content (not Lorem ipsum)
- Sections required: Navigation, Hero (big bold headline + CTA), Features/Services (3-6 items), Social proof or Stats, CTA section, Footer
- Include proper <title>, <meta name="description">, and Open Graph tags
- Color scheme: pick ONE strong brand color that fits the industry. Dark or light depending on the brand
- Typography: large headings, good contrast, excellent readability
- The site must look hand-crafted, not templated. Make it EXCITING to look at.

IMPORTANT: Output ONLY the complete HTML. Nothing else.`;

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

  const userMessage = [
    `Build a complete website for: ${prompt.trim()}`,
    industry ? `Industry context: ${industry}` : "",
    "Make it genuinely beautiful and exciting. The design should feel premium and unique.",
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
    max_tokens: 8000,
    temperature: 0.7,
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
    },
  });
}
