// app/api/projects/[projectId]/runs/[runId]/apply/route.ts
import { NextResponse } from "next/server";
import { storeGet, storeSet } from "../../../../lib/store";
import { isAdmin } from "../../../../lib/isAdmin";

type RunFile = { path: string; content: string };

function runKey(runId: string) {
  return `run:${runId}`;
}

function latestGlobalKey() {
  return `generated:latest`;
}

function latestProjectKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

function homeKey() {
  return `home:latest`;
}

function buildFallbackHtml(projectId: string, runId: string, files: RunFile[]) {
  const list = files
    .slice(0, 50)
    .map(
      (f) =>
        `<li style="margin:6px 0;"><code style="opacity:.85">${escapeHtml(
          f.path
        )}</code></li>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Generated Preview</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; background:#0b0b0d; color:#fff; }
    .wrap { max-width: 900px; margin: 40px auto; padding: 0 16px; }
    .card { border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px; background: rgba(255,255,255,.03); }
    h1 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 8px 0; opacity: .78; line-height: 1.6; }
    ul { margin: 10px 0 0; padding-left: 18px; opacity:.9; }
    a { color: #9bdcff; }
    code { background: rgba(255,255,255,.08); padding: 2px 6px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Generated run applied ✅</h1>
      <p><b>Project:</b> <code>${escapeHtml(projectId)}</code></p>
      <p><b>Run:</b> <code>${escapeHtml(runId)}</code></p>
      <p>
        We did not find a direct HTML preview. This is a fallback preview page to confirm the apply worked.
      </p>
      <p><b>Files in this run:</b></p>
      <ul>${list || "<li><i>No files</i></li>"}</ul>
      <p style="margin-top:14px;">
        Tip: Ensure your generator returns <code>previewHtml</code> (string) inside the run output for best previews.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  // Admin-only apply
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.projectId;
  const runId = params.runId;

  // Read run record
  const run = await storeGet(runKey(runId));
  if (!run || typeof run !== "object") {
    return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const setHome = url.searchParams.get("setHome") === "1";

  // Run schema (best-effort)
  const files: RunFile[] = Array.isArray((run as any).files) ? (run as any).files : [];
  const previewHtmlRaw = (run as any).previewHtml;
  const previewHtml =
    typeof previewHtmlRaw === "string" && previewHtmlRaw.trim().length > 0
      ? previewHtmlRaw
      : null;

  // Build applied payload (what we store as latest)
  const applied = {
    projectId,
    runId,
    appliedAt: new Date().toISOString(),
    files,
    previewHtml: previewHtml || buildFallbackHtml(projectId, runId, files),
  };

  // ✅ WRITE GLOBAL + PROJECT-SCOPED LATEST
  await storeSet(latestGlobalKey(), applied);
  await storeSet(latestProjectKey(projectId), applied);

  // ✅ OPTIONALLY SET HOME
  if (setHome) {
    await storeSet(homeKey(), applied.previewHtml);
  }

  return NextResponse.json({
    ok: true,
    projectId,
    runId,
    setHome,
    wrote: {
      global: latestGlobalKey(),
      project: latestProjectKey(projectId),
      home: setHome ? homeKey() : null,
    },
  });
}
