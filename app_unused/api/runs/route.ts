import { NextResponse } from "next/server";
import { nowISO } from "../../../lib/runs";
import { getCurrentUserId } from "../../lib/demoAuth";
import { storeGet, storeSet } from "../../lib/store";

export const runtime = "nodejs";

type Run = {
  id: string;
  projectId: string;
  status: "queued" | "running" | "completed" | "failed";
  prompt?: string;
  createdAt: string;
};

function uid(prefix = ""): string {
  const id = Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  return prefix ? `${prefix}_${id}` : id;
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  const body = await req.json().catch(() => ({}));

  const projectId = typeof body?.projectId === "string" ? body.projectId : "";
  const prompt = typeof body?.prompt === "string" ? body.prompt : "";

  if (!projectId || !prompt) {
    return NextResponse.json(
      { ok: false, error: "Missing projectId or prompt" },
      { status: 400 }
    );
  }

  const run: Run = {
    id: uid("run"),
    projectId,
    status: "queued",
    prompt,
    createdAt: nowISO()
  };

  const indexKey = `runs:index:${userId}:${projectId}`;
  const ids = (await storeGet<string[]>(indexKey)) ?? [];
  ids.unshift(run.id);

  await storeSet(indexKey, ids);
  await storeSet(`runs:${userId}:${run.id}`, run);

  return NextResponse.json({ ok: true, run });
}
