// src/app/api/projects/[projectId]/debug/spec/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Tried = { key: string; hit: boolean; type?: string; bytes?: number };

function safeJsonParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function clipString(s: string, max = 8000) {
  if (s.length <= max) return s;
  return s.slice(0, max) + `â€¦(clipped, len=${s.length})`;
}

async function getKvClient(): Promise<any> {
  // Preferred: @vercel/kv
  try {
    const mod = await import("@vercel/kv");
    if ((mod as any).kv) return (mod as any).kv;
  } catch {}

  // Best-effort local helper paths (won't crash if missing)
  const candidates = [
    "../../../../../../lib/kv",
    "../../../../../../app/lib/kv",
    "../../../../../../src/lib/kv",
    "../../../../../../src/lib/kv",
  ];

  for (const p of candidates) {
    try {
      const mod = await import(p);
      if ((mod as any).kv) return (mod as any).kv;
      if ((mod as any).default) return (mod as any).default;
    } catch {}
  }

  throw new Error(
    "KV client not found. Ensure @vercel/kv is installed + env vars set, or export kv from a local helper."
  );
}

export async function GET(_req: Request, ctx: { params: { projectId: string } }) {
  const projectId = String(ctx?.params?.projectId || "").trim();
  const nowIso = new Date().toISOString();

  if (!projectId) {
    return NextResponse.json(
      { ok: false, projectId: "", nowIso, error: "Missing projectId" },
      { status: 400 }
    );
  }

  try {
    const kv: any = await getKvClient();

    const candidates = [
      `project:${projectId}:publishedSpec`,
      `project:${projectId}:spec`,
      `project:${projectId}:siteSpec`,
      `project:${projectId}:draftSpec`,
      `project:${projectId}:latestSpec`,
      `proj:${projectId}:publishedSpec`,
      `proj:${projectId}:spec`,
      `${projectId}:publishedSpec`,
      `${projectId}:spec`,
    ];

    const tried: Tried[] = [];

    const tryGet = async (key: string) => {
      try {
        const v = await kv.get(key);
        if (v == null) {
          tried.push({ key, hit: false });
          return null;
        }

        const raw = typeof v === "string" ? v : JSON.stringify(v);

        tried.push({
          key,
          hit: true,
          type: typeof v,
          bytes: raw.length,
        });

        if (typeof v === "string") {
          const parsed = safeJsonParse(v);
          return parsed ?? clipString(v, 2000);
        }

        return v;
      } catch {
        tried.push({ key, hit: false });
        return null;
      }
    };

    let foundKey: string | null = null;
    let foundVal: any = null;

    for (const k of candidates) {
      const v = await tryGet(k);
      if (v != null) {
        foundKey = k;
        foundVal = v;
        break;
      }
    }

    if (!foundKey) {
      return NextResponse.json({
        ok: true,
        projectId,
        nowIso,
        tried,
        note:
          "No spec found under candidate keys. Next step: update publish to write project:<id>:publishedSpec explicitly.",
      });
    }

    const preview =
      typeof foundVal === "string" ? clipString(foundVal, 3000) : foundVal;

    return NextResponse.json({
      ok: true,
      projectId,
      nowIso,
      found: {
        key: foundKey,
        type: typeof foundVal,
        bytes:
          typeof foundVal === "string"
            ? foundVal.length
            : JSON.stringify(foundVal).length,
        preview,
      },
      tried,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, projectId, nowIso, error: e?.message || String(e) },
      { status: 500 }
    );
  }
}

