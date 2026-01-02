import { NextResponse } from "next/server";
import { storeGet, storeSet } from "../../../../../../../lib/store";

export const runtime = "nodejs";

type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: "queued" | "running" | "complete" | "failed";
  createdAt: string;
  updatedAt?: string;
  output?: {
    summary?: string;
    files?: { path: string; content: string }[];
  };
};

const RUN_KEY = (id: string) => `run:${id}`;

// Where we store "applied" output for /generated
const GENERATED_LATEST_KEY = "generated:latest";
const GENERATED_BY_PROJECT_KEY = (projectId: string) => `generated:project:${projectId}:latest`;

function nowISO() {
  return new Date().toISOString();
}

function buildFallbackPreviewHtml(run: Run) {
  const files = run.output?.files || [];
  const code = files.map((f) => `--- ${f.path} ---\n${f.content}`).join("\n\n");
  const escaped = code
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Generated Preview</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; padding: 24px; background:#0b0b0f; color:#eaeaf2; }
    .card { border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); border-radius: 16px; padding: 16px; }
    pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; line-height: 1.4; color:#d7d7ff; }
    h1 { margin: 0 0 8px; font-size: 18px; }
    p { margin: 0 0 12px; color: rgba(255,255,255,.7); }
  </style>
</head>
<body>
  <div class="card">
    <h1>No HTML preview was generated</h1>
    <p>This run did not include <code>app/generated/preview.html</code>. Showing code instead.</p>
    <pre>${escaped}</pre>
  </div>
</body>
</html>`;
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { projectId, runId } = params;

  const run = await storeGet<Run>(RUN_KEY(runId));
  if (!run) {
    return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
  }
  if (run.projectId !== projectId) {
    return NextResponse.json({ ok: false, error: "Run/project mismatch" }, { status: 400 });
  }
  if (run.status !== "complete") {
    return NextResponse.json(
      { ok: false, error: "Run is not complete yet" },
      { status: 400 }
    );
  }

  const files = run.output?.files || [];
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ ok: false, error: "Run has no files to apply" }, { status: 400 });
  }

  const previewFile =
    files.find((f) => f.path === "app/generated/preview.html") ||
    files.find((f) => f.path.endsWith("/preview.html"));

  const previewHtml = previewFile?.content || buildFallbackPreviewHtml(run);

  const applied = {
    ok: true,
    appliedAt: nowISO(),
    projectId,
    runId,
    prompt: run.prompt,
    summary: run.output?.summary || "",
    files,
    previewHtml,
  };

  // Save globally + per project
  await storeSet(GENERATED_LATEST_KEY, applied);
  await storeSet(GENERATED_BY_PROJECT_KEY(projectId), applied);

  return NextResponse.json({ ok: true, applied });
}
