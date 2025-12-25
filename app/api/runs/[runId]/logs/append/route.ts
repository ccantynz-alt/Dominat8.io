// app/api/runs/[runId]/logs/append/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { KV } from "../../../../../lib/kv";
import { keys } from "../../../../../lib/keys";

type LogEntry = {
  t: number;
  level: "info" | "warn" | "error";
  msg: string;
};

export async function POST(
  req: Request,
  { params }: { params: { runId: string } }
) {
  try {
    // 1) Read body safely (never crash on empty body)
    const text = await req.text();
    let body: any = null;

    if (text && text.trim().length > 0) {
      try {
        body = JSON.parse(text);
      } catch {
        // If it's not JSON, treat the raw text as the message
        body = { msg: text };
      }
    }

    const msg =
      typeof body?.msg === "string"
        ? body.msg
        : typeof body?.message === "string"
        ? body.message
        : "";

    if (!msg) {
      return NextResponse.json(
        { ok: false, message: "Missing msg in request body" },
        { status: 400 }
      );
    }

    const level: LogEntry["level"] =
      body?.level === "warn" || body?.level === "error" ? body.level : "info";

    const entry: LogEntry = {
      t: Date.now(),
      level,
      msg,
    };

    // 2) Append log entry
    await KV.rpush(keys.runLogs(params.runId), entry);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Always return JSON even on crashes
    return NextResponse.json(
      {
        ok: false,
        where: "/api/runs/[runId]/logs/append POST",
        message: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
