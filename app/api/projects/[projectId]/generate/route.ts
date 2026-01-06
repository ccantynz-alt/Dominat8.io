import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

async function readProjectAny(projectId: string) {
  const key = `project:${projectId}`;

  // Prefer hash
  try {
    const hash = await kv.hgetall<any>(key);
    if (hash && Object.keys(hash).length > 0) return hash;
  } catch {
    // ignore WRONGTYPE etc
  }

  // Fallback json/string
  try {
    const obj = await kv.get<any>(key);
    if (obj) return obj;
  } catch {
    // ignore
  }

  return null;
}

// Minimal OpenAI call using fetch
async function generateHtmlWithOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in environment variables.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const system = [
    "You generate a single complete HTML document.",
    "Return ONLY raw HTML (no markdown fences).",
    "Include inline CSS in a <style> tag.",
    "Make it clean, modern, responsive.",
    "No external assets required.",
  ].join(" ");

  const user = [
    "Create a high-quality marketing website.",
    "Must include: hero, services, testimonials, about, contact.",
    "Add a simple nav linking to section anchors.",
    "Prompt:",
    prompt,
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      text: { format: { type: "text" } },
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      `OpenAI error (${res.status})`;
    throw new Error(msg);
  }

  const text =
    data?.output_text ||
    data?.output?.[0]?.content?.[0]?.text ||
    data?.response?.output_text ||
    null;

  if (!text || typeof text !== "string") {
    throw new Error("OpenAI returned no text.");
  }

  const html = text.trim();

  if (!html.toLowerCase().includes("<html")) {
    throw new Error("OpenAI output did not look like a full HTML document.");
  }

  return html;
}

export async function POST(
  req: Request,
  ctx: { params: { projectId: string } }
) {
  try {
    const projectId = ctx.params.projectId;

    const project = await readProjectAny(projectId);
    if (!project) {
      return json({ ok: false, error: "Project not found" }, 404);
    }

    const body = await req.json().catch(() => ({} as any));
    const prompt =
      typeof body?.prompt === "string" && body.prompt.trim()
        ? body.prompt.trim()
        : "Create a professional business website with hero, services, testimonials, about, and contact. Clean modern styling.";

    // 1) Generate HTML
    const html = await generateHtmlWithOpenAI(prompt);

    // 2) Save latest HTML (public page reads this)
    const latestKey = `generated:project:${projectId}:latest`;
    await kv.set(latestKey, html);

    // 3) Save version HTML
    const versionId = `v_${crypto.randomUUID().replace(/-/g, "")}`;
    const versionKey = `generated:project:${projectId}:v:${versionId}`;
    await kv.set(versionKey, html);

    // 4) Save metadata (ALWAYS) as JSON array
    const versionsKey = `generated:project:${projectId}:versions`;

    const meta = {
      versionId,
      createdAt: new Date().toISOString(),
      key: versionKey,
      prompt,
    };

    // Read existing array (if any)
    let arr: any[] = [];
    try {
      const existing = await kv.get<any>(versionsKey);
      if (Array.isArray(existing)) arr = existing;
    } catch {
      // ignore
    }

    // Add newest first
    arr = [meta, ...arr].slice(0, 100);
    await kv.set(versionsKey, arr);

    // 5) Optional: also try LIST format (nice-to-have)
    // If list ops fail, it won’t break versions.
    try {
      await kv.lpush(versionsKey, JSON.stringify(meta));
    } catch {
      // ignore
    }

    return json({
      ok: true,
      projectId,
      versionId,
      htmlKey: latestKey,
      hasHtml: true,
      versionsKey,
    });
  } catch (err: any) {
    console.error("POST /generate error:", err);
    return json(
      { ok: false, error: err?.message || "Generate failed" },
      500
    );
  }
}
