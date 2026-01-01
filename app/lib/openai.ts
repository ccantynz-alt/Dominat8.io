// app/lib/openai.ts
type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function callOpenAIChat(opts: {
  apiKey: string;
  messages: ChatMsg[];
  model?: string;
}): Promise<string> {
  const model = opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      temperature: 0.4,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      `OpenAI request failed (${res.status})`;
    throw new Error(msg);
  }

  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.delta?.content ??
    "";

  if (!content || typeof content !== "string") {
    throw new Error("OpenAI returned no content");
  }

  return content.trim();
}
