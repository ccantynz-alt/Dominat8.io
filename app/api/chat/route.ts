import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { message: "OPENAI_API_KEY is missing on the server" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are a helpful website-building assistant.",
        },
        ...messages,
      ],
    });

    const text =
      response.output_text ||
      "No text returned from OpenAI.";

    return NextResponse.json({ message: text });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
