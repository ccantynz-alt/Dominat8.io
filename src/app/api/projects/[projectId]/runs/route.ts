import { NextResponse } from "next/server";
import { createRun, listRuns } from "@/app/lib/store";

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
  const contentType = req.headers.get("content-type") || "";

  let prompt = "";
  if (contentType.includes("application/json")) {
    const body = await req.json();
    prompt = String(body?.prompt || "").trim();
  } else {
    const form = await req.formData();
    prompt = String(form.get("prompt") || "").trim();
  }

  if (!prompt) return NextResponse.json({ ok: false, error: "Missing prompt" }, { status: 400 });

  const run = await createRun(params.projectId, prompt);

  // If created from a form, redirect back to project page:
  if (!contentType.includes("application/json")) {
    return NextResponse.redirect(new URL(`/dashboard/projects/${params.projectId}`, req.url));
  }

  return NextResponse.json({ ok: true, run });
}
