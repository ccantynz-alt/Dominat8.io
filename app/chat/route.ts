import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = (body.messages ?? []) as Msg[];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful website-building assistant." },
        ...messages,
      ],
    });

    const message =
      completion.choices?.[0]?.message?.content?.trim() || "No reply";

    return Response.json({ message });
  } catch (err: any) {
    return new Response(JSON.stringify({ message: "Server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
