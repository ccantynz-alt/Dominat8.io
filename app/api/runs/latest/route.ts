import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

type Run = {
  id: string;
  projectId: string;
  status?: string;
  prompt?: string;
  createdAt?: string;
  completedAt?: string;
};

type Project = {
  id: string;
  name: string;
  createdAt?: string;
};

async function getProjectsList(): Promise<Project[]> {
  // Support both keys (your app has used both over time)
  const a = await kv.get("projects");
  if (Array.isArray(a)) return a as Project[];

  const b = await kv.get("projects:list");
  if (Array.isArray(b)) return b as Project[];

  return [];
}

function toTime(s?: string) {
  const t = s ? Date.parse(s) : NaN;
  return Number.isFinite(t) ? t : 0;
}

export async function GET() {
  try {
    // 1) Fast path: use pointer if it exists
    const latestRunId = await kv.get("runs:latest");
    if (latestRunId && typeof latestRunId === "string") {
      const run = await kv.get(`run:${latestRunId}`);
      if (run) {
        return NextResponse.json({ ok: true, runId: latestRunId, run });
      }
      // If pointer exists but run is missing, fall through to rebuild
    }

    // 2) Slow path: rebuild latest by scanning all projects' run lists
    const projects = await getProjectsList();
    if (projects.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No latest run yet." },
        { status: 404 }
      );
    }

    let best: Run | null = null;

    for (const p of projects) {
      const runsAny = await kv.get(`project:${p.id}:runs`);
      if (!Array.isArray(runsAny)) continue;

      for (const r of runsAny as any[]) {
        if (!r || typeof r !== "object") continue;

        const run: Run = {
          id: String((r as any).id || ""),
          projectId: String((r as any).projectId || p.id || ""),
          status: (r as any).status,
          prompt: (r as any).prompt,
          createdAt: (r as any).createdAt,
          completedAt: (r as any).completedAt,
        };

        if (!run.id) continue;

        // Prefer completedAt if present, otherwise createdAt
        const score = Math.max(toTime(run.completedAt), toTime(run.createdAt));
        const bestScore = best ? Math.max(toTime(best.completedAt), toTime(best.createdAt)) : -1;

        if (!best || score > bestScore) {
          best = run;
        }
      }
    }

    if (!best) {
      return NextResponse.json(
        { ok: false, error: "No latest run yet." },
        { status: 404 }
      );
    }

    // 3) Ensure we also have the canonical run record
    const runRecord = (await kv.get(`run:${best.id}`)) || best;

    // 4) Set pointer so future calls are instant
    await kv.set("runs:latest", best.id);

    return NextResponse.json({ ok: true, runId: best.id, run: runRecord });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to load latest run" },
      { status: 500 }
    );
  }
}
