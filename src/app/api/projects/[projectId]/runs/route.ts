import { NextResponse } from "next/server";

// Use a RELATIVE import so it definitely points at src/app/lib/store.ts
import { createRun, listRuns } from "../../../../lib/store";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const runs = await listRuns(params.projectId);
  return NextResponse.json({ ok: true, runs });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const body = await req.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt : "";

  if (!prompt) {
    return NextResponse.json({ ok: false, error: "Missing prompt" }, { status: 400 });
  }

  const run = await createRun(params.projectId, prompt);
  return NextResponse.json({ ok: true, run });
}
