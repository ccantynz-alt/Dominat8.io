// app/api/runs/route.ts
import { NextResponse } from "next/server";
import { KV } from "../../lib/kv";
import { makeId } from "../../lib/ids";
import { getCurrentUserId } from "../../lib/demoAuth";

type Run = {
  id: string;
  projectId: string;
  createdAt: number;
  createdBy: string;
  status: "running" | "completed" | "failed";
  title: string;
};

export async function POST() {
  const userId = getCurrentUserId();

  const runId = makeId("run");
  const now = Date.now();

  const run: Run = {
    id: runId,
    projectId: "demo-project",
    createdAt: now,
    createdBy: userId,
    status: "running",
    title: "Simulated Run",
  };

  // Minimal storage (enough for /runs/[runId] to load via your existing GET endpoints)
  await KV.set(`run:${runId}`, run);

  return NextResponse.json({ ok: true, runId });
}
