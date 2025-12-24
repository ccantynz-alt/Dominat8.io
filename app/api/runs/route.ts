// app/api/runs/route.ts
export const runtime = "nodejs";

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

function safeEnvInfo() {
  const kvRedisUrl = (process.env.KV_REDIS_URL ?? "").trim();
  const redisUrl = (process.env.REDIS_URL ?? "").trim();

  return {
    hasKvRedisUrl: !!kvRedisUrl,
    kvRedisUrlHost: kvRedisUrl ? safeHost(kvRedisUrl) : null,
    hasRedisUrl: !!redisUrl,
    redisUrlHost: redisUrl ? safeHost(redisUrl) : null,
  };
}

function safeHost(u: string) {
  try {
    // redis://... is valid for URL()
    return new URL(u).host;
  } catch {
    return "(unparseable)";
  }
}

export async function POST() {
  try {
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

    await KV.set(`run:${runId}`, run);

    return NextResponse.json({ ok: true, runId });
  } catch (err: any) {
    const message = err?.message ?? "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        where: "/api/runs POST",
        message,
        env: safeEnvInfo(),
      },
      { status: 500 }
    );
  }
}
