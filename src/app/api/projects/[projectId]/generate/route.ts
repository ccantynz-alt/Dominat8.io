import { NextResponse } from "next/server";
import { requireUserId } from "../../../_lib/auth";
import { getProject, saveProject } from "../../../../lib/projectsStore";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildHtml(siteName: string, prompt: string) {
  const safeName = escapeHtml(siteName);
  const safePrompt = escapeHtml(prompt);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeName}</title>
  <style>
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:#0f172a; background:#fff; }
    .wrap { max-width: 980px; margin: 0 auto; padding: 56px 20px; }
    .nav { display:flex; justify-content:space-between; align-items:center; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.08); position: sticky; top:0; background: rgba(255,255,255,.9); backdrop-filter: blur(8px); }
    .brand { font-weight: 800; letter-spacing: -0.02em; }
    .btn { display:inline-block; padding: 12px 16px; border-radius: 12px; text-decoration:none; font-weight: 700; }
    .btn-primary { background:#0f172a; color:#fff; }
    .btn-ghost { border:1px solid rgba(0,0,0,.18); color:#0f172a; margin-left: 10px; }
    h1 { font-size: 44px; line-height: 1.05; margin: 18px 0 10px; letter-spacing: -0.03em; }
    p { color: rgba(15,23,42,.78); font-size: 16px; line-height: 1.6; }
    .grid { display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; margin-top: 26px; }
    .card { border: 1px solid rgba(0,0,0,.08); border-radius: 16px; padding: 16px; background:#fff; }
    .kpi { font-weight: 900; font-size: 22px; }
    .muted { font-size: 12px; color: rgba(15,23,42,.6); font-weight: 700; margin-top: 4px; }
    footer { padding: 26px 20px; border-top: 1px solid rgba(0,0,0,.08); color: rgba(15,23,42,.6); font-size: 12px; text-align:center; }
    @media (max-width: 820px){ .grid{grid-template-columns:1fr;} h1{font-size: 36px;} }
  </style>
</head>
<body>
  <div class="nav">
    <div class="brand">${safeName}</div>
    <div>
      <a class="btn btn-primary" href="#cta">Get started</a>
      <a class="btn btn-ghost" href="#features">See features</a>
    </div>
  </div>

  <div class="wrap">
    <h1>${safeName} — built to convert</h1>
    <p>${safePrompt}</p>

    <div class="grid" id="features">
      <div class="card"><div class="kpi">Fast</div><div class="muted">Clear value prop above the fold</div></div>
      <div class="card"><div class="kpi">Focused</div><div class="muted">Sections + CTA built-in</div></div>
      <div class="card"><div class="kpi">Shareable</div><div class="muted">Publishable to a public URL</div></div>
    </div>

    <div id="cta" style="margin-top:40px;border-top:1px solid rgba(0,0,0,.08);padding-top:30px;">
      <h2 style="margin:0 0 8px;letter-spacing:-.02em;">Ready to move?</h2>
      <p style="margin:0 0 14px;">This is a generated preview. Next step is publish.</p>
      <a class="btn btn-primary" href="#">Start now</a>
    </div>
  </div>

  <footer>Generated in BOOTSTRAP mode • src/app only</footer>
</body>
</html>`;
}

export async function POST(req: Request, ctx: { params: { projectId: string } }) {
  const { userId } = await requireUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }

  const project = await getProject(ctx.params.projectId);
  if (!project || project.userId !== userId) {
    return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const prompt = String(body?.prompt || "").trim() || `Create a premium SaaS site for "${project.name}"`;

  const html = buildHtml(project.name, prompt);
  const now = Date.now();

  const updated = {
    ...project,
    prompt,
    generatedHtml: html,
    lastGeneratedAt: now,
    updatedAt: now,
  };

  const saved = await saveProject(updated);

  return NextResponse.json({ ok: true, project: updated, store: saved.mode });
}
