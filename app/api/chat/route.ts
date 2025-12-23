import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    return NextResponse.json({
      message: completion.choices[0].message.content,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
