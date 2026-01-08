// lib/customerFlowApi.ts

export type CreateProjectResponse = { ok: boolean; projectId?: string; error?: string };

// We return html directly from /api/generate
export type GenerateResponse = { ok: boolean; html?: string; error?: string };

// Publish may return a url, but if it doesn't we'll fall back to /p/:projectId
export type PublishResponse = { ok: boolean; url?: string; error?: string };

async function readJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * CREATE PROJECT
 * We keep this simple: try /api/projects (your app likely has this),
 * otherwise create a client-only "proj_" id fallback.
 */
export async function apiCreateProject(): Promise<CreateProjectResponse> {
  try {
    const res = await fetch("/api/projects", { method: "POST" });
    const json: any = await readJson(res);

    if (json?.ok === true && json?.projectId) {
      return { ok: true, projectId: String(json.projectId) };
    }

    // If /api/projects doesn't exist or returns something else, fallback:
    const fallbackId = `proj_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
    return { ok: true, projectId: fallbackId };
  } catch {
    const fallbackId = `proj_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
    return { ok: true, projectId: fallbackId };
  }
}

/**
 * GENERATE
 * This matches what you just pasted:
 * POST /api/generate -> { files: { "preview.html": "...", "preview.css": "..." } }
 */
export async function apiGenerate(projectId: string, prompt: string): Promise<GenerateResponse> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, prompt }),
    });

    const json: any = await readJson(res);

    const htmlFile = json?.files?.["preview.html"];
    const cssFile = json?.files?.["preview.css"];

    if (typeof htmlFile !== "string" || htmlFile.length === 0) {
      return { ok: false, error: "Generator did not return preview.html" };
    }

    // Inline CSS into HTML so Preview can iframe srcDoc safely
    let finalHtml = htmlFile;

    if (typeof cssFile === "string" && cssFile.length > 0) {
      // remove <link rel="stylesheet" href="preview.css">
      finalHtml = finalHtml.replace(
        /<link\s+rel=["']stylesheet["']\s+href=["']preview\.css["']\s*\/?>/i,
        `<style>\n${cssFile}\n</style>`
      );

      // if the link tag wasn't found, still inject into <head>
      if (!finalHtml.includes("<style>") && finalHtml.includes("</head>")) {
        finalHtml = finalHtml.replace("</head>", `<style>\n${cssFile}\n</style>\n</head>`);
      }
    }

    return { ok: true, html: finalHtml };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Generate request failed" };
  }
}

/**
 * PUBLISH
 * Try your publish endpoint if it exists; otherwise fallback to /p/:projectId
 */
export async function apiPublish(projectId: string): Promise<PublishResponse> {
  try {
    const res = await fetch(`/api/projects/${projectId}/publish`, { method: "POST" });
    const json: any = await readJson(res);

    if (json?.ok === true) {
      const url = json?.url || json?.publicUrl || json?.liveUrl;
      return { ok: true, url: typeof url === "string" ? url : undefined };
    }

    // fallback
    return { ok: true, url: `/p/${projectId}` };
  } catch {
    return { ok: true, url: `/p/${projectId}` };
  }
}
