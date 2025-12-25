import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Return valid JSON only. Generate a single-page marketing website as plain HTML + CSS. No JS unless absolutely necessary. No external assets. No frameworks.",
        },
        {
          role: "user",
          content: `
Create a modern, clean single-page website based on this prompt.

Return JSON exactly in this format:
{
  "files": {
    "preview.html": "<main>...</main>",
    "preview.css": "body { ... }"
  }
}

Prompt:
${prompt}
`,
        },
      ],
    });

    const raw = completion.choices[0].message.content ?? "";
    const json = JSON.parse(raw);

    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Generation failed" },
      { status: 500 }
    );
  }
}
