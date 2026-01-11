"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AnyJson = Record<string, any>;

async function readAsJsonOrText(res: Response): Promise<{ ok: boolean; status: number; json?: AnyJson; text?: string }> {
  const status = res.status;
  const ok = res.ok;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      const json = (await res.json()) as AnyJson;
      return { ok, status, json };
    } catch {
      // fall through to text
    }
  }

  try {
    const text = await res.text();
    return { ok, status, text };
  } catch {
    return { ok, status, text: "" };
  }
}

async function createProject(): Promise<string> {
  // Your app already has a working "create project" flow somewhere.
  // We try common variants safely.
  const attempts: Array<() => Promise<Response>> = [
    () => fetch("/api/projects", { method: "POST" }),
    () =>
      fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    () =>
      fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Homepage Demo" }),
      }),
  ];

  let lastErr = "Unknown error";
  for (const run of attempts) {
    const res = await run();
    const parsed = await readAsJsonOrText(res);

    if (parsed.ok && parsed.json?.projectId) return String(parsed.json.projectId);

    // Some implementations return { ok: true, id: "..."}
    if (parsed.ok && parsed.json?.id) return String(parsed.json.id);

    lastErr =
      parsed.json
        ? JSON.stringify(parsed.json, null, 2)
        : parsed.text || `HTTP ${parsed.status}`;
  }

  throw new Error(`Could not create project. Last response:\n${lastErr}`);
}

async function tryGenerateOrPreview(projectId: string, prompt: string) {
  // Try both in case your repo uses one or the other
  const endpoints = [
    `/api/projects/${projectId}/generate`,
    `/api/projects/${projectId}/preview`,
  ];

  const bodyVariants = [
    { prompt },
    { instruction: prompt },
    { content: prompt },
    { input: prompt },
  ];

  let lastDetail = "";

  for (const url of endpoints) {
    for (const body of bodyVariants) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const parsed = await readAsJsonOrText(res);

      if (parsed.ok) {
        // Typical shapes we’ve seen:
        // - { ok:true, html:"..." }
        // - { ok:true, publicUrl:"/p/..." }
        // - { ok:true, versionId:"...", hasHtml:true }
        return { url, parsed, body };
      }

      lastDetail =
        `[${url}] body=${JSON.stringify(body)}\n` +
        (parsed.json ? JSON.stringify(parsed.json, null, 2) : parsed.text || `HTTP ${parsed.status}`);
    }
  }

  throw new Error(`Generate/preview failed.\n\nLast attempt:\n${lastDetail}`);
}

async function publishViaPublish2(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/publish2`, { method: "POST" });
  const parsed = await readAsJsonOrText(res);
  if (!parsed.ok) {
    const detail = parsed.json ? JSON.stringify(parsed.json, null, 2) : (parsed.text || `HTTP ${parsed.status}`);
    throw new Error(`Publish2 failed:\n${detail}`);
  }
  return parsed;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function HomeDemo() {
  const [prompt, setPrompt] = useState(
    "Create a premium website for an automation-first SaaS with hero, features, pricing, FAQ, and a strong CTA. Clean modern styling."
  );

  const [projectId, setProjectId] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [busy, setBusy] = useState<"idle" | "creating" | "generating" | "publishing">("idle");
  const [log, setLog] = useState<string>("");

  const publishedUrl = useMemo(() => (projectId ? `/p/${projectId}` : ""), [projectId]);

  async function onCreate() {
    setBusy("creating");
    setLog("");
    setPreviewHtml("");

    try {
      const id = await createProject();
      setProjectId(id);
      setLog(`✅ Created project: ${id}`);
    } catch (e: any) {
      setLog(`❌ ${e?.message || String(e)}`);
    } finally {
      setBusy("idle");
    }
  }

  async function onGeneratePreview() {
    if (!projectId) {
      setLog("❌ Create a project first.");
      return;
    }

    setBusy("generating");
    setLog("");
    setPreviewHtml("");

    try {
      const result = await tryGenerateOrPreview(projectId, prompt);

      const json = result.parsed.json;
      const text = result.parsed.text;

      // If HTML is returned directly, show it:
      const html =
        (json && typeof json.html === "string" && json.html) ||
        (json && typeof json.previewHtml === "string" && json.previewHtml) ||
        "";

      if (html) {
        setPreviewHtml(html);
        setLog(`✅ Preview generated via ${result.url}`);
        return;
      }

      // Otherwise we at least show the response:
      setLog(
        `✅ Request succeeded via ${result.url}\n\n` +
          (json ? JSON.stringify(json, null, 2) : text || "")
      );
    } catch (e: any) {
      setLog(`❌ ${e?.message || String(e)}`);
    } finally {
      setBusy("idle");
    }
  }

  async function onPublish() {
    if (!projectId) {
      setLog("❌ Create a project first.");
      return;
    }

    setBusy("publishing");
    setLog("");

    try {
      const parsed = await publishViaPublish2(projectId);
      setLog(`✅ Published via publish2\n\n${parsed.json ? JSON.stringify(parsed.json, null, 2) : parsed.text || ""}`);

      // Open the published page
      window.open(publishedUrl, "_blank");
    } catch (e: any) {
      setLog(`❌ ${e?.message || String(e)}`);
    } finally {
      setBusy("idle");
    }
  }

  return (
    <section className="bg-white py-16 md:py-24" id="demo">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-zinc-900" />
              Live demo (real API)
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl">
              Try it from the homepage
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-600 md:text-base">
              This uses your real backend routes:
              <span className="font-semibold text-zinc-800"> create project → generate/preview → publish2 → /p/[projectId]</span>.
            </p>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-xs font-semibold text-zinc-500">Prompt</div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 h-28 w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Describe the website you want…"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={onCreate}
                  disabled={busy !== "idle"}
                  className={classNames(
                    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition",
                    busy !== "idle"
                      ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                      : "bg-white text-zinc-900 hover:bg-zinc-100 border border-zinc-200"
                  )}
                >
                  {busy === "creating" ? "Creating…" : projectId ? "Recreate project" : "Create project"}
                </button>

                <button
                  onClick={onGeneratePreview}
                  disabled={busy !== "idle" || !projectId}
                  className={classNames(
                    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition",
                    busy !== "idle" || !projectId
                      ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                      : "bg-zinc-900 text-white hover:bg-black"
                  )}
                >
                  {busy === "generating" ? "Generating…" : "Generate preview"}
                </button>

                <button
                  onClick={onPublish}
                  disabled={busy !== "idle" || !projectId}
                  className={classNames(
                    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition",
                    busy !== "idle" || !projectId
                      ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                      : "bg-black text-white hover:bg-zinc-900"
                  )}
                >
                  {busy === "publishing" ? "Publishing…" : "Publish"}
                </button>

                <Link
                  href="/projects"
                  className="text-sm font-semibold text-zinc-700 hover:text-zinc-900"
                >
                  Open Builder →
                </Link>
              </div>

              <div className="mt-4 text-xs text-zinc-600">
                <span className="font-semibold text-zinc-800">Project:</span>{" "}
                {projectId ? (
                  <span className="font-mono">{projectId}</span>
                ) : (
                  "not created yet"
                )}
                {projectId ? (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      className="font-semibold text-zinc-900 underline underline-offset-4"
                      href={publishedUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {publishedUrl}
                    </a>
                  </>
                ) : null}
              </div>

              {log ? (
                <pre className="mt-4 overflow-auto rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-800">
{log}
                </pre>
              ) : null}
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
                <div className="text-xs font-semibold text-zinc-500">Preview</div>
                <div className="text-xs font-semibold text-zinc-500">
                  {previewHtml ? "srcDoc" : "waiting…"}
                </div>
              </div>

              <div className="p-4">
                {previewHtml ? (
                  <div className="overflow-hidden rounded-2xl border border-zinc-200">
                    <iframe
                      title="Homepage demo preview"
                      className="h-[520px] w-full"
                      srcDoc={previewHtml}
                    />
                  </div>
                ) : (
                  <div className="grid h-[520px] place-items-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
                    <div>
                      <div className="text-sm font-extrabold text-zinc-900">
                        No preview yet
                      </div>
                      <div className="mt-2 text-sm text-zinc-600">
                        Click <span className="font-semibold">Create project</span>, then{" "}
                        <span className="font-semibold">Generate preview</span>.
                      </div>
                      <div className="mt-4 text-xs text-zinc-500">
                        (If your generate route returns JSON only, the log will show the exact response.)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              Note: publish uses <span className="font-mono">/publish2</span> (your working MVP path).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
