import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getRun, saveRun } from "@/lib/runStore";

export const dynamic = "force-dynamic";

function noStore(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { projectId, runId } = params;

  const run = await getRun(projectId, runId);
  if (!run) return noStore({ ok: false, error: "Run not found" }, 404);

  // mark running
  run.status = "running";
  await saveRun(run);

  // generate nice HTML based on prompt
  const html = buildHtml(run.prompt, projectId, runId);

  // ✅ Save LATEST
  await kv.set("generated:latest", {
    projectId,
    runId,
    html,
    createdAt: new Date().toISOString(),
  });

  // ✅ Save PER-RUN
  await kv.set(`generated:run:${runId}`, {
    projectId,
    runId,
    html,
    createdAt: new Date().toISOString(),
  });

  // mark complete
  run.status = "complete";
  run.output =
    `Saved generated website HTML to KV\n` +
    `latest: generated:latest\n` +
    `per-run: generated:run:${runId}\n` +
    `Project: ${projectId}\n` +
    `Run: ${runId}`;
  run.completedAt = new Date().toISOString();

  await saveRun(run);

  return noStore({ ok: true, run });
}

function buildHtml(prompt: string, projectId: string, runId: string) {
  const p = prompt.toLowerCase();
  if (p.includes("business")) return businessHtml(prompt, projectId, runId);
  if (p.includes("landing")) return landingHtml(prompt, projectId, runId);
  return defaultHtml(prompt, projectId, runId);
}

function shell(title: string, body: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { --bg:#0b0c10; --card:#111218; --text:#f4f4f5; --muted:#a1a1aa; --line:#23242c; }
      body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background: radial-gradient(1200px 800px at 20% 10%, #1f2937 0%, var(--bg) 50%); color: var(--text); }
      .wrap { max-width: 1000px; margin: 0 auto; padding: 48px 20px; }
      .top { display:flex; justify-content:space-between; align-items:center; gap:16px; }
      .brand { font-weight:800; letter-spacing:-0.02em; }
      .nav a { color: var(--muted); text-decoration:none; margin-left:14px; font-size:14px; }
      .nav a:hover { color: var(--text); }
      .card { background: rgba(17,18,24,0.9); border:1px solid var(--line); border-radius: 18px; padding: 22px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
      .grid { display:grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
      .h1 { font-size: 44px; line-height: 1.05; margin: 0; letter-spacing:-0.04em; }
      .lead { color: var(--muted); font-size: 16px; line-height: 1.6; margin-top: 12px; }
      .btn { display:inline-block; padding: 10px 14px; border-radius: 12px; background: #fff; color:#111; text-decoration:none; font-weight:700; font-size: 14px; }
      .btn.secondary { background: transparent; color: var(--text); border:1px solid var(--line); font-weight:600; }
      .kpi { font-size: 28px; font-weight:800; }
      .pill { display:inline-block; padding:6px 10px; border-radius: 999px; border:1px solid var(--line); color: var(--muted); font-size: 12px; }
      .muted { color: var(--muted); font-size: 13px; }
      .sectionTitle { font-size: 18px; font-weight:800; margin: 0 0 10px; }
      .itemTitle { font-weight:800; margin: 0 0 6px; }
      .itemText { margin:0; color: var(--muted); font-size: 14px; line-height:1.6; }
      .footer { margin-top: 30px; color: var(--muted); font-size: 12px; }
      @media (max-width: 820px) {
        .h1 { font-size: 34px; }
        .top { flex-direction: column; align-items:flex-start; }
      }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}

function businessHtml(prompt: string, projectId: string, runId: string) {
  const body = `
  <div class="wrap">
    <div class="top">
      <div class="brand">McCracken Consulting</div>
      <div class="nav">
        <a href="#services">Services</a>
        <a href="#testimonials">Testimonials</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
    </div>

    <div style="margin-top:18px" class="grid">
      <div class="card" style="grid-column: span 8;">
        <div class="pill">Professional Business Website</div>
        <h1 class="h1" style="margin-top:10px;">Grow revenue with a modern, trusted brand.</h1>
        <p class="lead">Strategy, design, and execution for businesses that want clean UX, fast pages, and real results.</p>
        <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;">
          <a class="btn" href="#contact">Get a quote</a>
          <a class="btn secondary" href="#services">View services</a>
        </div>
        <div class="footer">Generated from prompt: ${escapeHtml(prompt)}</div>
      </div>

      <div class="card" style="grid-column: span 4;">
        <div class="sectionTitle">Quick wins</div>
        <div style="display:grid; gap:12px;">
          <div>
            <div class="kpi">+23%</div>
            <div class="muted">More conversions with clearer messaging</div>
          </div>
          <div>
            <div class="kpi">1.2s</div>
            <div class="muted">Fast loading, modern layout</div>
          </div>
          <div>
            <div class="kpi">24/7</div>
            <div class="muted">Always-on lead capture</div>
          </div>
        </div>
        <div class="footer">Project: ${escapeHtml(projectId)} • Run: ${escapeHtml(runId)}</div>
      </div>

      <div id="services" class="card" style="grid-column: span 12;">
        <div class="sectionTitle">Services</div>
        <div class="grid">
          ${serviceCard("Website Build", "Modern responsive site with clear sections and strong CTA.", 4)}
          ${serviceCard("Brand & Messaging", "Copy and structure that converts visitors into leads.", 4)}
          ${serviceCard("SEO Foundations", "Fast, indexable pages with basic on-page SEO.", 4)}
        </div>
      </div>

      <div id="testimonials" class="card" style="grid-column: span 6;">
        <div class="sectionTitle">Testimonials</div>
        ${quote("“Clean, professional, and our leads doubled in a month.”", "Operations Manager")}
        ${quote("“Exactly what we needed — simple, fast, and credible.”", "Founder")}
      </div>

      <div id="about" class="card" style="grid-column: span 6;">
        <div class="sectionTitle">About</div>
        <p class="itemText">
          We help small and medium businesses present a premium brand online. Clean design, clear structure, and
          fast performance — so customers trust you instantly.
        </p>
        <div style="margin-top:12px" class="muted">Based in NZ • Serving globally</div>
      </div>

      <div id="contact" class="card" style="grid-column: span 12;">
        <div class="sectionTitle">Contact</div>
        <p class="itemText">Tell us what you want to build and we’ll reply with next steps.</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px;">
          ${input("Name")}
          ${input("Email")}
        </div>
        <div style="margin-top:12px;">
          ${textarea("What are you building?")}
        </div>
        <div style="margin-top:12px;">
          <a class="btn" href="#">Send message</a>
        </div>
      </div>
    </div>
  </div>`;
  return shell("Generated Business Website", body);
}

function landingHtml(prompt: string, projectId: string, runId: string) {
  const body = `
  <div class="wrap">
    <div class="top">
      <div class="brand">LaunchKit</div>
      <div class="nav">
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
        <a href="#contact">Contact</a>
      </div>
    </div>

    <div style="margin-top:18px" class="card">
      <div class="pill">Landing Page</div>
      <h1 class="h1" style="margin-top:10px;">Ship your next idea faster.</h1>
      <p class="lead">A clean landing page with pricing, FAQ, and contact — built to convert.</p>
      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;">
        <a class="btn" href="#pricing">See pricing</a>
        <a class="btn secondary" href="#contact">Contact sales</a>
      </div>
      <div class="footer">Project: ${escapeHtml(projectId)} • Run: ${escapeHtml(runId)}</div>
    </div>

    <div id="pricing" style="margin-top:14px" class="grid">
      ${priceCard("Starter", "$19/mo", ["1 site", "Basic templates", "Email support"], 4)}
      ${priceCard("Pro", "$49/mo", ["5 sites", "More templates", "Priority support"], 4)}
      ${priceCard("Business", "$99/mo", ["Unlimited sites", "Team access", "SLA support"], 4)}
    </div>

    <div id="faq" style="margin-top:14px" class="card">
      <div class="sectionTitle">FAQ</div>
      ${faq("Can I change the template?", "Yes — you can rerun generation with a different template anytime.")}
      ${faq("Do you host the sites?", "That’s next — we’ll add hosting + domains after the MVP generation loop.")}
      ${faq("Is this AI?", "This is a deterministic generator now; we’ll swap to real AI next.")}
      <div class="footer">Generated from prompt: ${escapeHtml(prompt)}</div>
    </div>

    <div id="contact" style="margin-top:14px" class="card">
      <div class="sectionTitle">Contact</div>
      <p class="itemText">Leave your email and we’ll get back to you.</p>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px;">
        ${input("Name")}
        ${input("Email")}
      </div>
      <div style="margin-top:12px;">
        <a class="btn" href="#">Send</a>
      </div>
    </div>
  </div>`;
  return shell("Generated Landing Page", body);
}

function defaultHtml(prompt: string, projectId: string, runId: string) {
  const body = `
  <div class="wrap">
    <div class="card">
      <div class="pill">Generated (Default)</div>
      <h1 class="h1" style="margin-top:10px;">Your site is ready.</h1>
      <p class="lead">This is a default generated layout. Next we’ll generate real pages from AI.</p>
      <div style="margin-top:12px" class="muted">Project: ${escapeHtml(projectId)} • Run: ${escapeHtml(runId)}</div>
      <div style="margin-top:16px">
        <div class="sectionTitle">Prompt</div>
        <pre style="background:#0f1016;border:1px solid var(--line);padding:12px;border-radius:12px;white-space:pre-wrap;">${escapeHtml(prompt)}</pre>
      </div>
    </div>
  </div>`;
  return shell("Generated Website", body);
}

function serviceCard(title: string, text: string, span: number) {
  return `<div class="card" style="grid-column: span ${span};">
    <div class="itemTitle">${escapeHtml(title)}</div>
    <p class="itemText">${escapeHtml(text)}</p>
  </div>`;
}

function quote(text: string, who: string) {
  return `<div style="margin-top:12px; padding:12px; border:1px solid var(--line); border-radius: 14px;">
    <div style="font-weight:700">${escapeHtml(text)}</div>
    <div class="muted" style="margin-top:6px;">— ${escapeHtml(who)}</div>
  </div>`;
}

function priceCard(name: string, price: string, bullets: string[], span: number) {
  return `<div class="card" style="grid-column: span ${span};">
    <div class="itemTitle">${escapeHtml(name)}</div>
    <div class="kpi" style="margin-top:6px;">${escapeHtml(price)}</div>
    <div style="margin-top:10px; display:grid; gap:6px;">
      ${bullets.map((b) => `<div class="muted">• ${escapeHtml(b)}</div>`).join("")}
    </div>
    <a class="btn" style="margin-top:14px;" href="#contact">Choose</a>
  </div>`;
}

function faq(q: string, a: string) {
  return `<div style="margin-top:10px;">
    <div class="itemTitle">${escapeHtml(q)}</div>
    <div class="itemText">${escapeHtml(a)}</div>
  </div>`;
}

function input(label: string) {
  return `<label class="muted" style="display:block;">
    ${escapeHtml(label)}
    <input style="width:100%;margin-top:6px;padding:10px;border-radius:12px;border:1px solid var(--line);background:#0f1016;color:var(--text);" />
  </label>`;
}

function textarea(label: string) {
  return `<label class="muted" style="display:block;">
    ${escapeHtml(label)}
    <textarea rows="5" style="width:100%;margin-top:6px;padding:10px;border-radius:12px;border:1px solid var(--line);background:#0f1016;color:var(--text);"></textarea>
  </label>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
