import { NextResponse } from "next/server";
import { kvNowISO } from "../../lib/kv";
import { getCurrentUserId } from "../../lib/demoAuth";

export const runtime = "nodejs";

type Thread = {
  id: string;
  title: string;
  createdAt: string;
};

function uid(prefix = ""): string {
  const id = Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
  return prefix ? `${prefix}_${id}` : id;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    userId: await getCurrentUserId(),
    threads: [],
    ts: kvNowISO()
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const title = typeof body?.title === "string" ? body.title : "New Thread";

  const thread: Thread = {
    id: uid("thread"),
    title,
    createdAt: kvNowISO()
  };

  return NextResponse.json({
    ok: true,
    userId: await getCurrentUserId(),
    thread,
    ts: kvNowISO()
  });
}
