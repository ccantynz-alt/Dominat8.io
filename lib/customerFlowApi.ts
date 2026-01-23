// lib/customerFlowApi.ts

export type CreateProjectResponse = { ok: boolean; projectId?: string; error?: string };

// Generate returns the final HTML (with CSS inlined)
export type GenerateResponse = { ok: boolean; html?: string; error?: string };

// Publish stores HTML server-side and returns a public URL
export type PublishResponse = { ok: boolean; url?: string; error?: string };

async function readJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function apiCreateProject(): Promise<CreateProjectResponse> {
  try {
    const res = await fetch("/api/projects", { method: "POST" });
    const json: any = await readJson(res);

    if (json?.ok === true && json?.projectId) {
      return { ok: true, projectId: String(json.projectId) };
    }

    // fallback client id
    const fallbackId = `proj_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
    return { ok: true, projectId: fallbackId };
  } catch {
    const fallbackId = `proj_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
    return { ok: true, projectId: fallbackId };
  }
}

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

    let finalHtml = htmlFile;

    if (typeof cssFile === "string" && cssFile.length > 0) {
      finalHtml = finalHtml.replace(
        /<link\s+rel=["']stylesheet["']\s+href=["']preview\.css["']\s*\/?>/i,
        `<style>\n${cssFile}\n</style>`
      );

      if (!finalHtml.includes("<style>") && finalHtml.includes("</head>")) {
        finalHtml = finalHtml.replace("</head>", `<style>\n${cssFile}\n</style>\n</head>`);
      }
    }

    return { ok: true, html: finalHtml };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Generate request failed" };
  }
}

export async function apiPublish(projectId: string, html: string): Promise<PublishResponse> {
  try {
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, html }),
    });

    const json: any = await readJson(res);

    if (json?.ok === true) {
      return { ok: true, url: json?.url ? String(json.url) : `/p/${projectId}` };
    }

    return { ok: false, error: json?.error || `HTTP ${res.status}` };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Publish request failed" };
  }
}
