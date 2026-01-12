export type OpenAIJsonResult<T> = {
  ok: true;
  value: T;
  rawText: string;
} | {
  ok: false;
  error: string;
  rawText?: string;
};

function extractTextFromResponsesApi(json: any): string {
  // SDKs expose output_text, but raw HTTP may not.
  if (typeof json?.output_text === "string" && json.output_text.trim()) {
    return json.output_text.trim();
  }

  // Try common shapes: output[].content[].text or output[].content[].type
  const out = json?.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      const content = item?.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c?.text === "string" && c.text.trim()) return c.text.trim();
          if (typeof c?.content === "string" && c.content.trim()) return c.content.trim();
        }
      }
    }
  }

  // Last resort:
  if (typeof json?.text === "string" && json.text.trim()) return json.text.trim();
  return JSON.stringify(json);
}

function stripJsonFences(s: string) {
  const t = s.trim();
  if (t.startsWith("```")) {
    // remove ```json ... ```
    return t.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return t;
}

export async function openaiGenerateJson<T>(opts: {
  model?: string;
  instructions: string;
  input: string;
  max_output_tokens?: number;
}): Promise<OpenAIJsonResult<T>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Missing OPENAI_API_KEY" };
  }

  const model = opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: opts.instructions,
      input: opts.input,
      max_output_tokens: opts.max_output_tokens ?? 1200,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { ok: false, error: `OpenAI error ${res.status}`, rawText: txt };
  }

  const json = await res.json();
  const rawText = extractTextFromResponsesApi(json);
  const cleaned = stripJsonFences(rawText);

  try {
    const value = JSON.parse(cleaned) as T;
    return { ok: true, value, rawText };
  } catch {
    return {
      ok: false,
      error: "Model did not return valid JSON",
      rawText,
    };
  }
}
