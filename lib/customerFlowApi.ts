// lib/customerFlowApi.ts

export type CreateProjectResponse = { ok: boolean; projectId?: string; error?: string };
export type GenerateResponse = { ok: boolean; runId?: string; error?: string };
export type RunStatusResponse = {
  ok: boolean;
  run?: { id: string; status: "queued" | "running" | "complete" | "error"; error?: string };
  error?: string;
};
export type PublishResponse = { ok: boolean; url?: string; error?: string };
export type HtmlResponse = { ok: boolean; html?: string; error?: string };

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { res, text, json };
}

async function tryMany<T>(
  tries: Array<{
    url: string;
    init?: RequestInit;
    mapOk?: (json: any) => T | null;
  }>
): Promise<T> {
  let lastErr = "No endpoints tried.";

  for (const t of tries) {
    try {
      const { res, text, json } = await fetchJson(t.url, t.init);

      if (t.mapOk) {
        const mapped = t.mapOk(json);
        if (mapped) return mapped;
      }

      if (json && typeof json === "object" && json.ok === true) return json as T;

      lastErr = `Tried ${t.url} → HTTP ${res.status} → ${json?.error || text || "Unknown error"}`;
    } catch (e: any) {
      lastErr = `Tried ${t.url} → ${e?.message || "Request failed"}`;
    }
  }

  const fallback: any = { ok: false, error: lastErr };
  return fallback as T;
}

/**
 * CREATE PROJECT
 */
export async function apiCreateProject(): Promise<CreateProjectResponse> {
  const tries = [
    {
      url: "/api/projects",
      init: { method: "POST" },
      mapOk: (json: any) => {
        const projectId = json?.projectId || json?.id || json?.project?.id;
        return json?.ok === true && projectId ? { ok: true, projectId } : null;
      },
    },
    {
      url: "/api/project",
      init: { method: "POST" },
      mapOk: (json: any) => {
        const projectId = json?.projectId || json?.id || json?.project?.id;
        return json?.ok === true && projectId ? { ok: true, projectId } : null;
      },
    },
    {
      url: "/api/createProject",
      init: { method: "POST" },
      mapOk: (json: any) => {
        const projectId = json?.projectId || json?.id || json?.project?.id;
        return json?.ok === true && projectId ? { ok: true, projectId } : null;
      },
    },
  ];

  return tryMany<CreateProjectResponse>(tries);
}

/**
 * GENERATE
 */
export async function apiGenerate(projectId: string, prompt: string): Promise<GenerateResponse> {
  const body = JSON.stringify({ prompt });

  const tries = [
    {
      url: `/api/projects/${projectId}/generate`,
      init: { method: "POST", headers: { "content-type": "application/json" }, body },
      mapOk: (json: any) => {
        const runId = json?.runId || json?.id || json?.run?.id;
        return json?.ok === true && runId ? { ok: true, runId } : null;
      },
    },
    {
      url: `/api/projects/${projectId}/runs`,
      init: { method: "POST", headers: { "content-type": "application/json" }, body },
      mapOk: (json: any) => {
        const runId = json?.runId || json?.id || json?.run?.id;
        return json?.ok === true && runId ? { ok: true, runId } : null;
      },
    },
    {
      url: `/api/generate`,
      init: {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId, prompt }),
      },
      mapOk: (json: any) => {
        const runId = json?.runId || json?.id || json?.run?.id;
        return json?.ok === true && runId ? { ok: true, runId } : null;
      },
    },
  ];

  return tryMany<GenerateResponse>(tries);
}

/**
 * RUN STATUS
 */
export async function apiRunStatus(projectId: string, runId: string): Promise<RunStatusResponse> {
  const tries = [
    {
      url: `/api/projects/${projectId}/runs/${runId}`,
      init: { method: "GET" },
      mapOk: (json: any) => (json?.ok === true && json?.run ? (json as RunStatusResponse) : null),
    },
    {
      url: `/api/runs/${runId}`,
      init: { method: "GET" },
      mapOk: (json: any) => {
        if (json?.ok !== true) return null;
        const run = json?.run || json;
        if (!run?.id || !run?.status) return null;
        return { ok: true, run: { id: run.id, status: run.status, error: run.error } };
      },
    },
  ];

  return tryMany<RunStatusResponse>(tries);
}

/**
 * GET LATEST HTML
 */
export async function apiGetLatestHtml(projectId: string): Promise<HtmlResponse> {
  const tries = [
    {
      url: `/api/projects/${projectId}/html`,
      init: { method: "GET" },
      mapOk: (json: any) =>
        json?.ok === true && typeof json?.html === "string" ? (json as HtmlResponse) : null,
    },
    {
      url: `/api/projects/${projectId}`,
      init: { method: "GET" },
      mapOk: (json: any) => {
        const html = json?.html || json?.generatedHtml || json?.project?.html;
        return typeof html === "string" && html.length > 0 ? { ok: true, html } : null;
      },
    },
    {
      url: `/api/html?projectId=${encodeURIComponent(projectId)}`,
      init: { method: "GET" },
      mapOk: (json: any) =>
        json?.ok === true && typeof json?.html === "string" ? (json as HtmlResponse) : null,
    },
  ];

  return tryMany<HtmlResponse>(tries);
}

/**
 * PUBLISH
 */
export async function apiPublish(projectId: string): Promise<PublishResponse> {
  const tries = [
    {
      url: `/api/projects/${projectId}/publish`,
      init: { method: "POST" },
      mapOk: (json: any) => {
        if (json?.ok !== true) return null;
        const url = json?.url || json?.publicUrl || json?.liveUrl;
        return { ok: true, url };
      },
    },
    {
      url: `/api/publish`,
      init: {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId }),
      },
      mapOk: (json: any) => {
        if (json?.ok !== true) return null;
        const url = json?.url || json?.publicUrl || json?.liveUrl;
        return { ok: true, url };
      },
    },
  ];

  return tryMany<PublishResponse>(tries);
}
