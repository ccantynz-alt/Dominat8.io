import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Theme = {
  accent: string;
  bg: string;
  text: string;
  font: string;
};

const DEFAULT_THEME: Theme = {
  accent: "#111827",
  bg: "#ffffff",
  text: "#111827",
  font: "Inter",
};

export default function ThemePage() {
  const router = useRouter();
  const projectId = (router.query.projectId as string) || "";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  async function load() {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    setSavedMsg(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/theme?ts=` + Date.now(), { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to load theme");
      setTheme(j.theme || DEFAULT_THEME);
    } catch (e: any) {
      setError(e?.message || "Failed to load theme");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!projectId) return;
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      const r = await fetch(`/api/projects/${projectId}/theme?ts=` + Date.now(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(theme),
        cache: "no-store",
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to save theme");
      setTheme(j.theme || theme);
      setSavedMsg("Saved ✅");
      setTimeout(() => setSavedMsg(null), 2000);
    } catch (e: any) {
      setError(e?.message || "Failed to save theme");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { load(); }, [projectId]);

  return (
    <>
      <Head><title>Theme — {projectId || "Project"}</title></Head>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Theme</h1>
          <span className="rounded-full border px-3 py-1 text-sm text-gray-700">
            {projectId || "(loading...)"}
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link href={projectId ? `/projects/${projectId}/terminal` : "/projects"} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Terminal
          </Link>
          <Link href={projectId ? `/projects/${projectId}/publish` : "/projects"} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Publish
          </Link>
          <Link href={projectId ? `/projects/${projectId}/runs` : "/projects"} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Runs
          </Link>

          <button onClick={save} disabled={saving || !projectId} className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60">
            {saving ? "Saving..." : "Save theme"}
          </button>

          {savedMsg ? <span className="text-sm text-green-700 font-semibold">{savedMsg}</span> : null}
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
        ) : null}

        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : (
          <>
            <div className="rounded-lg border p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Accent</span>
                  <input
                    value={theme.accent}
                    onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                    className="rounded-md border px-3 py-2 font-mono text-sm"
                    placeholder="#111827"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Background</span>
                  <input
                    value={theme.bg}
                    onChange={(e) => setTheme({ ...theme, bg: e.target.value })}
                    className="rounded-md border px-3 py-2 font-mono text-sm"
                    placeholder="#ffffff"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Text</span>
                  <input
                    value={theme.text}
                    onChange={(e) => setTheme({ ...theme, text: e.target.value })}
                    className="rounded-md border px-3 py-2 font-mono text-sm"
                    placeholder="#111827"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold">Font</span>
                  <input
                    value={theme.font}
                    onChange={(e) => setTheme({ ...theme, font: e.target.value })}
                    className="rounded-md border px-3 py-2 font-mono text-sm"
                    placeholder="Inter"
                  />
                </label>
              </div>

              <div className="mt-6 rounded-lg border p-5" style={{ background: theme.bg, color: theme.text }}>
                <div className="text-sm font-semibold opacity-70">Preview</div>
                <h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: theme.font }}>
                  This is your theme
                </h2>
                <p className="mt-2 text-sm opacity-80" style={{ fontFamily: theme.font }}>
                  Accent is used for buttons/links. Background and text apply globally.
                </p>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="mt-4 inline-block rounded-md px-4 py-2 text-sm font-semibold"
                  style={{ background: theme.accent, color: "#fff", fontFamily: theme.font }}
                >
                  Accent button
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
