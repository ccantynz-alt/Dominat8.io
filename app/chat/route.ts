import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "Missing OPENAI_API_KEY env var in Vercel." },
        { status: 500 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
    });

    const message =
      completion.choices?.[0]?.message?.content?.trim() || "(empty response)";

    return NextResponse.json({ message });
  } catch (err: any) {
    return NextResponse.json(
      { message: `Server error: ${err?.message ?? "unknown"}` },
      { status: 500 }
    );
  }
}
