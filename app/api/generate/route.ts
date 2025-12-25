import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate production-ready Next.js App Router files. Return valid JSON only.",
        },
        {
          role: "user",
          content: `
Create a modern website using Next.js App Router.

Return JSON in this format:
{
  "files": {
    "app/page.tsx": "...",
    "app/globals.css": "..."
  }
}

Prompt:
${prompt}
`,
        },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content!;
    const json = JSON.parse(raw);

    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Generation failed" },
      { status: 500 }
    );
  }
}
