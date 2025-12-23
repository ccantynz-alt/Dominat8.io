import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: Msg[] };

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "Server missing OPENAI_API_KEY env var." },
        { status: 500 }
      );
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful website-building assistant." },
        ...messages,
      ],
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ message: reply || "(empty reply)" });
  } catch (err: any) {
    // Return a readable error to the UI so you're not blind
    const msg =
      typeof err?.message === "string"
        ? err.message
        : "Unknown server error";
    return NextResponse.json({ message: `API error: ${msg}` }, { status: 500 });
  }
}
