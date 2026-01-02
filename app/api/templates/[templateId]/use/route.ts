import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/app/lib/demoAuth";
import { kv } from "@/app/lib/kv";

const BodySchema = z.object({
  projectName: z.string().min(1).max(80),
  // optional: let UI disable auto-run later if needed
  createRun: z.boolean().optional().default(true),
});

type Bucket = { count: number; resetAt: number };

async function rateLimitOrThrow(key: string, limit: number, windowSec: number) {
  const now = Date.now();
  const b = (await kv.get(key)) as Bucket | null;

  if (!b || now > b.resetAt) {
    await kv.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return;
  }

  if (b.count >= limit) {
    const seconds = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    throw new Error(`Rate limit exceeded. Try again in ${seconds}s.`);
  }

  await kv.set(key, { ...b, count: b.count + 1 });
}

function originFromRequest(req: Request) {
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (process.env.VERCEL ? "https" : "http");
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  return `${proto}://${host}`;
}

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // IMPORTANT: never cache mutations
    cache: "no-store",
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    const msg = data?.error
      ? typeof data.error === "string"
        ? data.error
        : JSON.stringify(data.error)
      : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function getJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false) {
    const msg = data?.error
      ? typeof data.error === "string"
        ? data.error
        : JSON.stringify(data.error)
      : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function POST(
  req: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const userId = getCurrentUserId();
    await rateLimitOrThrow(`rl:templateUse:${userId}`, 10, 60); // 10/min

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { projectName, createRun } = parsed.data;
    const templateId = params.templateId;

    const origin = originFromRequest(req);

    // 1) Load template
    const tplData = await getJson(`${origin}/api/templates/${templateId}`);
    const template = tplData.template;

    if (!template) {
      return NextResponse.json(
        { ok: false, error: "Template not found" },
        { status: 404 }
      );
    }

    if (!template.published) {
      // You can allow drafts for admin later, but keep MVP safe.
      return NextResponse.json(
        { ok: false, error: "Template is not published" },
        { status: 400 }
      );
    }

    const seedPrompt = String(template.seedPrompt || "").trim();
    if (!seedPrompt) {
      return NextResponse.json(
        { ok: false, error: "Template has no seedPrompt" },
        { status: 400 }
      );
    }

    // 2) Create project (uses your existing endpoint)
    const projectRes = await postJson(`${origin}/api/projects`, {
      name: projectName,
    });

    const project = projectRes.project;
    const projectId = project?.id;

    if (!projectId) {
      return NextResponse.json(
        { ok: false, error: "Project creation failed (missing projectId)" },
        { status: 500 }
      );
    }

    // 3) Attach template selection to project
    await postJson(`${origin}/api/projects/${projectId}/template`, {
      templateId,
    });

    // 4) Create run from the template prompt (optional)
    let run: any = null;
    if (createRun) {
      const runPrompt = [
        `TEMPLATE: ${template.name}`,
        `DESCRIPTION: ${template.description || ""}`,
        "",
        seedPrompt,
      ]
        .filter(Boolean)
        .join("\n");

      const runRes = await postJson(`${origin}/api/projects/${projectId}/runs`, {
        prompt: runPrompt,
      });

      run = runRes.run || null;
    }

    return NextResponse.json({
      ok: true,
      projectId,
      runId: run?.id || null,
      templateId,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Use template failed" },
      { status: 500 }
    );
  }
}
