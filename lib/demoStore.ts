// lib/demoStore.ts
// Simple demo in-memory store to unblock the customer flow.
// Works per server instance (good enough for MVP/testing on Vercel).

export type RunStatus = "queued" | "running" | "complete" | "error";

export type RunRecord = {
  id: string;
  projectId: string;
  status: RunStatus;
  createdAt: number;
  completedAt?: number;
  error?: string;
};

export type ProjectRecord = {
  id: string;
  createdAt: number;
  latestHtml?: string;
  publishedUrl?: string;
  lastRunId?: string;
};

type Store = {
  projects: Map<string, ProjectRecord>;
  runs: Map<string, RunRecord>;
};

function getGlobalStore(): Store {
  const g = globalThis as any;
  if (!g.__DEMO_STORE__) {
    g.__DEMO_STORE__ = {
      projects: new Map<string, ProjectRecord>(),
      runs: new Map<string, RunRecord>(),
    } as Store;
  }
  return g.__DEMO_STORE__ as Store;
}

export function createId(prefix: string) {
  // reasonably unique without deps
  const rand = Math.random().toString(16).slice(2);
  const time = Date.now().toString(16);
  return `${prefix}_${time}_${rand}`;
}

export function createProject(): ProjectRecord {
  const store = getGlobalStore();
  const id = createId("proj");
  const project: ProjectRecord = { id, createdAt: Date.now() };
  store.projects.set(id, project);
  return project;
}

export function getProject(projectId: string): ProjectRecord | null {
  const store = getGlobalStore();
  return store.projects.get(projectId) || null;
}

export function setProjectHtml(projectId: string, html: string) {
  const store = getGlobalStore();
  const p = store.projects.get(projectId);
  if (!p) return false;
  p.latestHtml = html;
  store.projects.set(projectId, p);
  return true;
}

export function createRun(projectId: string): RunRecord {
  const store = getGlobalStore();
  const id = createId("run");
  const run: RunRecord = { id, projectId, status: "queued", createdAt: Date.now() };
  store.runs.set(id, run);

  const p = store.projects.get(projectId);
  if (p) {
    p.lastRunId = id;
    store.projects.set(projectId, p);
  }

  return run;
}

export function getRun(runId: string): RunRecord | null {
  const store = getGlobalStore();
  return store.runs.get(runId) || null;
}

export function setRunStatus(runId: string, status: RunStatus, error?: string) {
  const store = getGlobalStore();
  const r = store.runs.get(runId);
  if (!r) return false;
  r.status = status;
  if (status === "complete" || status === "error") r.completedAt = Date.now();
  if (error) r.error = error;
  store.runs.set(runId, r);
  return true;
}

export function setPublishedUrl(projectId: string, url: string) {
  const store = getGlobalStore();
  const p = store.projects.get(projectId);
  if (!p) return false;
  p.publishedUrl = url;
  store.projects.set(projectId, p);
  return true;
}

export function buildDemoHtml(prompt: string) {
  const safe = (prompt || "").slice(0, 300);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Generated Website</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; color: #111; background: #fff; }
    .wrap { max-width: 980px; margin: 0 auto; padding: 40px 20px; }
    .hero { padding: 36px 24px; border: 1px solid rgba(0,0,0,.12); border-radius: 18px; }
    h1 { margin: 0 0 12px 0; font-size: 44px; letter-spacing: -0.02em; }
    p { margin: 0 0 12px 0; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 18px; }
    .card { padding: 16px; border: 1px solid rgba(0,0,0,.12); border-radius: 14px; }
    .muted { opacity: .72; }
    @media (max-width: 860px){ .grid { grid-template-columns: 1fr; } h1{font-size: 34px;} }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <h1>Your AI Website</h1>
      <p class="muted">Generated from your prompt:</p>
      <p><strong>${escapeHtml(safe)}</strong></p>
    </div>

    <div class="grid">
      <div class="card"><strong>Services</strong><p class="muted">3–5 clear services with simple descriptions.</p></div>
      <div class="card"><strong>Testimonials</strong><p class="muted">Trust-building quotes and social proof.</p></div>
      <div class="card"><strong>Contact</strong><p class="muted">Phone, email, and a clean contact section.</p></div>
    </div>

    <div style="margin-top:18px" class="card">
      <strong>About</strong>
      <p class="muted">A short, friendly story about your business and what makes you different.</p>
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
