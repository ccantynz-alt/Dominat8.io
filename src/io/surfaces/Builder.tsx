"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BuildState = "idle" | "generating" | "done" | "error";

interface Site {
  id: string;
  prompt: string;
  industry: string;
  html: string;
  createdAt: Date;
  tokens?: number;
  durationMs?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { label: "Restaurant", icon: "🍽️" },
  { label: "Law Firm", icon: "⚖️" },
  { label: "SaaS", icon: "⚡" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Fitness", icon: "💪" },
  { label: "E-commerce", icon: "🛍️" },
  { label: "Portfolio", icon: "✦" },
  { label: "Medical", icon: "🏥" },
  { label: "Agency", icon: "🚀" },
  { label: "Construction", icon: "🔨" },
];

const EXAMPLE_PROMPTS = [
  "A luxury plumbing company in Auckland — premium, trustworthy, modern",
  "A boutique coffee roastery in Brooklyn with a subscription service",
  "A personal injury law firm that wins cases and takes no prisoners",
  "A cutting-edge SaaS tool that automates customer support with AI",
  "A high-end wedding photography studio in Melbourne",
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTypewriter(texts: string[], interval = 4000) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const target = texts[index];
    if (charIdx < target.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length);
        setCharIdx(0);
      }, interval);
      return () => clearTimeout(t);
    }
  }, [charIdx, index, texts, interval]);

  useEffect(() => {
    setDisplayed(texts[index].slice(0, charIdx));
  }, [charIdx, index, texts]);

  return displayed;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Dots() {
  return (
    <span className="d8b-dots">
      <span /><span /><span />
    </span>
  );
}

function SiteCard({ site, onSelect }: { site: Site; onSelect: () => void }) {
  const age = Math.round((Date.now() - site.createdAt.getTime()) / 1000);
  const ageStr = age < 60 ? `${age}s ago` : `${Math.round(age / 60)}m ago`;

  return (
    <button className="d8b-site-card" onClick={onSelect} type="button">
      <div className="d8b-site-preview">
        <iframe
          srcDoc={site.html}
          sandbox="allow-scripts"
          className="d8b-site-thumb"
          title={`Preview: ${site.prompt}`}
        />
        <div className="d8b-site-overlay" />
      </div>
      <div className="d8b-site-meta">
        <div className="d8b-site-name">{site.industry || "Site"}</div>
        <div className="d8b-site-age">{ageStr}</div>
      </div>
    </button>
  );
}

function GeneratingAnimation({ progress }: { progress: number }) {
  return (
    <div className="d8b-gen-anim">
      <div className="d8b-gen-ring">
        <svg viewBox="0 0 80 80" className="d8b-gen-svg">
          <circle cx="40" cy="40" r="34" className="d8b-gen-track" />
          <circle
            cx="40" cy="40" r="34"
            className="d8b-gen-arc"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
          />
        </svg>
        <span className="d8b-gen-pct">{Math.round(progress)}%</span>
      </div>
      <div className="d8b-gen-label">
        Building your site<Dots />
      </div>
      <div className="d8b-gen-sub">AI is crafting your design in real time</div>
    </div>
  );
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function Builder() {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("");
  const [state, setState] = useState<BuildState>("idle");
  const [html, setHtml] = useState("");
  const [progress, setProgress] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [sidebarTab, setSidebarTab] = useState<"new" | "history">("new");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  const placeholder = useTypewriter(EXAMPLE_PROMPTS);

  // Update iframe srcDoc in real time (throttled)
  const htmlRef = useRef("");
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  const generate = useCallback(async () => {
    if (!prompt.trim() || state === "generating") return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState("generating");
    setHtml("");
    setProgress(0);
    setActiveSite(null);
    startRef.current = Date.now();
    progressRef.current = 0;

    // Animate progress (fake progress up to 95%, real completion sets 100)
    const progressTimer = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + Math.random() * 3, 94);
      setProgress(progressRef.current);
    }, 300);

    try {
      const res = await fetch("/api/io/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, industry }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setHtml(accumulated);
      }

      clearInterval(progressTimer);
      setProgress(100);
      const dur = Date.now() - startRef.current;
      setDurationMs(dur);

      const site: Site = {
        id: crypto.randomUUID(),
        prompt,
        industry,
        html: accumulated,
        createdAt: new Date(),
        durationMs: dur,
      };

      setSites((prev) => [site, ...prev]);
      setActiveSite(site);
      setState("done");
    } catch (err: unknown) {
      clearInterval(progressTimer);
      if (err instanceof Error && err.name === "AbortError") {
        setState("idle");
      } else {
        setState("error");
      }
    }
  }, [prompt, industry, state]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      generate();
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setState("idle");
    setHtml("");
    setProgress(0);
    setActiveSite(null);
  };

  const isBuilding = state === "generating";
  const isDone = state === "done";
  const isIdle = state === "idle";
  const isError = state === "error";

  return (
    <div className="d8b-root">
      <BuilderStyles />

      {/* ── Sidebar ── */}
      <aside className="d8b-sidebar">
        <div className="d8b-logo">
          <span className="d8b-logo-mark">D8</span>
          <span className="d8b-logo-sub">IO Builder</span>
        </div>

        <div className="d8b-sidebar-tabs">
          <button
            className={`d8b-tab ${sidebarTab === "new" ? "d8b-tab--active" : ""}`}
            onClick={() => setSidebarTab("new")}
            type="button"
          >
            New Site
          </button>
          <button
            className={`d8b-tab ${sidebarTab === "history" ? "d8b-tab--active" : ""}`}
            onClick={() => setSidebarTab("history")}
            type="button"
          >
            History {sites.length > 0 && <span className="d8b-count">{sites.length}</span>}
          </button>
        </div>

        {sidebarTab === "new" ? (
          <div className="d8b-sidebar-content">
            {/* Prompt */}
            <div className="d8b-field">
              <label className="d8b-label">Describe your website</label>
              <textarea
                ref={textareaRef}
                className="d8b-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder + "|"}
                rows={5}
                disabled={isBuilding}
                autoFocus
              />
              <div className="d8b-hint">⌘ + Enter to generate</div>
            </div>

            {/* Industry */}
            <div className="d8b-field">
              <label className="d8b-label">Industry (optional)</label>
              <div className="d8b-chips">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.label}
                    type="button"
                    className={`d8b-chip ${industry === ind.label ? "d8b-chip--active" : ""}`}
                    onClick={() => setIndustry((prev) => prev === ind.label ? "" : ind.label)}
                    disabled={isBuilding}
                  >
                    <span>{ind.icon}</span> {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              className={`d8b-generate-btn ${isBuilding ? "d8b-generate-btn--building" : ""}`}
              onClick={isBuilding ? reset : generate}
              disabled={!prompt.trim() && !isBuilding}
              type="button"
            >
              {isBuilding ? (
                <><span className="d8b-stop-icon">■</span> Stop</>
              ) : (
                <><span className="d8b-spark">⚡</span> Generate Site</>
              )}
            </button>

            {isDone && (
              <button className="d8b-regen-btn" onClick={reset} type="button">
                ↩ Build another
              </button>
            )}

            {/* Stats when done */}
            {isDone && activeSite && (
              <div className="d8b-stats">
                <div className="d8b-stat">
                  <span className="d8b-stat-val">{(durationMs / 1000).toFixed(1)}s</span>
                  <span className="d8b-stat-label">Generated in</span>
                </div>
                <div className="d8b-stat">
                  <span className="d8b-stat-val">{html.length.toLocaleString()}</span>
                  <span className="d8b-stat-label">Characters</span>
                </div>
                <div className="d8b-stat">
                  <span className="d8b-stat-val green">✓</span>
                  <span className="d8b-stat-label">SEO Ready</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="d8b-sidebar-content">
            {sites.length === 0 ? (
              <div className="d8b-empty">
                <div className="d8b-empty-icon">✦</div>
                <div className="d8b-empty-text">No sites yet.<br />Generate your first.</div>
              </div>
            ) : (
              <div className="d8b-history">
                {sites.map((s) => (
                  <SiteCard
                    key={s.id}
                    site={s}
                    onSelect={() => {
                      setActiveSite(s);
                      setHtml(s.html);
                      setState("done");
                      setSidebarTab("new");
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="d8b-sidebar-foot">
          <div className="d8b-foot-badge">AI-powered · Dominat8.io</div>
        </div>
      </aside>

      {/* ── Main canvas ── */}
      <main className="d8b-canvas">
        {isIdle && !html ? (
          /* ── Empty state ── */
          <div className="d8b-empty-canvas">
            <div className="d8b-splash">
              <div className="d8b-splash-mark">✦</div>
              <h1 className="d8b-splash-title">Build anything.</h1>
              <p className="d8b-splash-sub">
                Describe your website and watch it appear in seconds.<br />
                No templates. No drag and drop. Just results.
              </p>
              <div className="d8b-splash-examples">
                <div className="d8b-examples-label">Try one of these:</div>
                {EXAMPLE_PROMPTS.slice(0, 3).map((ex) => (
                  <button
                    key={ex}
                    className="d8b-example-btn"
                    onClick={() => {
                      setPrompt(ex);
                      textareaRef.current?.focus();
                    }}
                    type="button"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isBuilding && !html ? (
          /* ── Generating start state ── */
          <div className="d8b-generating-screen">
            <GeneratingAnimation progress={progress} />
          </div>
        ) : isError ? (
          /* ── Error state ── */
          <div className="d8b-error-screen">
            <div className="d8b-error-content">
              <div className="d8b-error-icon">⚠️</div>
              <h2 className="d8b-error-title">Generation failed</h2>
              <p className="d8b-error-message">
                Something went wrong while building your site. Please try again.
              </p>
              <button
                className="d8b-error-retry-btn"
                onClick={() => {
                  reset();
                  generate();
                }}
                type="button"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        ) : (
          /* ── Preview / Code ── */
          <div className="d8b-preview-wrap">
            {/* Toolbar */}
            <div className="d8b-toolbar">
              <div className="d8b-toolbar-left">
                {isBuilding && (
                  <div className="d8b-live-badge">
                    <span className="d8b-live-dot" /> LIVE
                  </div>
                )}
                {isDone && <div className="d8b-done-badge">✓ Complete</div>}
                <span className="d8b-toolbar-prompt">{prompt.slice(0, 50)}{prompt.length > 50 ? "…" : ""}</span>
              </div>
              <div className="d8b-toolbar-right">
                <div className="d8b-view-toggle">
                  <button
                    className={`d8b-view-btn ${viewMode === "preview" ? "d8b-view-btn--active" : ""}`}
                    onClick={() => setViewMode("preview")}
                    type="button"
                  >
                    Preview
                  </button>
                  <button
                    className={`d8b-view-btn ${viewMode === "code" ? "d8b-view-btn--active" : ""}`}
                    onClick={() => setViewMode("code")}
                    type="button"
                  >
                    Code
                  </button>
                </div>
                {isDone && (
                  <>
                    <button
                      className="d8b-action-btn"
                      onClick={() => {
                        const blob = new Blob([html], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "website.html";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      type="button"
                    >
                      ↓ Download
                    </button>
                    <button 
                      className="d8b-deploy-btn" 
                      type="button"
                      disabled
                      title="Deploy feature coming soon"
                    >
                      ⚡ Deploy
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Canvas */}
            {viewMode === "preview" ? (
              <div className="d8b-iframe-wrap">
                {isBuilding && progress < 15 && (
                  <div className="d8b-iframe-loader">
                    <GeneratingAnimation progress={progress} />
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  srcDoc={html || "<html><body style='background:#07090f'></body></html>"}
                  sandbox="allow-scripts"
                  className="d8b-iframe"
                  title="Generated website preview"
                />
              </div>
            ) : (
              <div className="d8b-code-wrap">
                <pre className="d8b-code">{html}</pre>
              </div>
            )}

            {/* Progress bar */}
            {isBuilding && (
              <div className="d8b-progress-bar">
                <div className="d8b-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Styles (co-located for portability) ─────────────────────────────────────

function BuilderStyles() {
  return (
    <style>{`
      /* ── Reset / root ── */
      .d8b-root {
        display: flex;
        height: 100vh;
        width: 100vw;
        background: #07090f;
        color: #d7dbea;
        font-family: 'Outfit', 'Inter', system-ui, sans-serif;
        overflow: hidden;
      }

      /* ── Sidebar ── */
      .d8b-sidebar {
        width: 300px;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        background: linear-gradient(180deg, #0a0d18 0%, #080b15 100%);
        border-right: 1px solid rgba(255,255,255,0.07);
        overflow: hidden;
      }

      .d8b-logo {
        display: flex;
        align-items: baseline;
        gap: 8px;
        padding: 20px 20px 0;
      }
      .d8b-logo-mark {
        font-size: 20px;
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.04em;
      }
      .d8b-logo-sub {
        font-size: 12px;
        color: rgba(255,255,255,0.4);
        font-weight: 500;
        letter-spacing: 0.02em;
      }

      .d8b-sidebar-tabs {
        display: flex;
        gap: 2px;
        padding: 16px 14px 0;
      }
      .d8b-tab {
        flex: 1;
        padding: 8px 0;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.45);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 140ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .d8b-tab--active {
        background: rgba(255,255,255,0.07);
        color: #fff;
      }
      .d8b-tab:hover:not(.d8b-tab--active) {
        color: rgba(255,255,255,0.7);
      }
      .d8b-count {
        background: rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.7);
        border-radius: 999px;
        padding: 1px 6px;
        font-size: 11px;
      }

      .d8b-sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px 14px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .d8b-sidebar-content::-webkit-scrollbar { width: 4px; }
      .d8b-sidebar-content::-webkit-scrollbar-track { background: transparent; }
      .d8b-sidebar-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

      /* ── Fields ── */
      .d8b-field { display: flex; flex-direction: column; gap: 8px; }
      .d8b-label {
        font-size: 11px;
        font-weight: 600;
        color: rgba(255,255,255,0.4);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .d8b-textarea {
        width: 100%;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 10px;
        color: #e8eaf6;
        font-size: 13px;
        line-height: 1.6;
        padding: 10px 12px;
        resize: none;
        font-family: inherit;
        outline: none;
        transition: border-color 140ms ease;
      }
      .d8b-textarea:focus {
        border-color: rgba(255,255,255,0.22);
      }
      .d8b-textarea:disabled { opacity: 0.5; cursor: not-allowed; }
      .d8b-hint {
        font-size: 11px;
        color: rgba(255,255,255,0.25);
        text-align: right;
      }

      /* ── Chips ── */
      .d8b-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .d8b-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        color: rgba(255,255,255,0.55);
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-chip:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.85); }
      .d8b-chip--active {
        border-color: rgba(61,240,255,0.5);
        background: rgba(61,240,255,0.08);
        color: rgba(61,240,255,0.9);
      }
      .d8b-chip:disabled { opacity: 0.4; cursor: not-allowed; }

      /* ── Generate button ── */
      .d8b-generate-btn {
        width: 100%;
        padding: 13px;
        border-radius: 12px;
        border: 1px solid rgba(61,240,255,0.4);
        background: linear-gradient(180deg, rgba(61,240,255,0.15), rgba(61,240,255,0.06));
        color: rgba(61,240,255,0.95);
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 140ms ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        letter-spacing: -0.01em;
      }
      .d8b-generate-btn:hover:not(:disabled) {
        background: linear-gradient(180deg, rgba(61,240,255,0.22), rgba(61,240,255,0.10));
        border-color: rgba(61,240,255,0.6);
        transform: translateY(-1px);
      }
      .d8b-generate-btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .d8b-generate-btn--building {
        border-color: rgba(255,80,80,0.4);
        background: linear-gradient(180deg, rgba(255,80,80,0.12), rgba(255,80,80,0.05));
        color: rgba(255,100,100,0.9);
      }
      .d8b-generate-btn--building:hover {
        border-color: rgba(255,80,80,0.6) !important;
        background: linear-gradient(180deg, rgba(255,80,80,0.18), rgba(255,80,80,0.08)) !important;
      }
      .d8b-spark { font-size: 16px; }
      .d8b-stop-icon { font-size: 10px; }

      .d8b-regen-btn {
        width: 100%;
        padding: 10px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.10);
        background: transparent;
        color: rgba(255,255,255,0.5);
        font-size: 13px;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-regen-btn:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.18); }

      /* ── Stats ── */
      .d8b-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .d8b-stat {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px;
        padding: 10px 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .d8b-stat-val { font-size: 15px; font-weight: 700; color: #fff; }
      .d8b-stat-val.green { color: rgba(61,240,180,0.9); }
      .d8b-stat-label { font-size: 10px; color: rgba(255,255,255,0.35); text-align: center; }

      /* ── History ── */
      .d8b-history { display: flex; flex-direction: column; gap: 10px; }
      .d8b-site-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        text-align: left;
        padding: 0;
        transition: all 140ms ease;
        width: 100%;
      }
      .d8b-site-card:hover { border-color: rgba(255,255,255,0.16); transform: translateY(-1px); }
      .d8b-site-preview { position: relative; height: 100px; overflow: hidden; }
      .d8b-site-thumb { width: 100%; height: 400px; transform: scale(0.25) translateY(-75%); transform-origin: top left; pointer-events: none; border: none; }
      .d8b-site-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5)); }
      .d8b-site-meta { padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; }
      .d8b-site-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); }
      .d8b-site-age { font-size: 11px; color: rgba(255,255,255,0.3); }

      /* ── Empty state ── */
      .d8b-empty { display: flex; flex-direction: column; align-items: center; padding: 32px 16px; gap: 12px; }
      .d8b-empty-icon { font-size: 28px; opacity: 0.3; }
      .d8b-empty-text { font-size: 13px; color: rgba(255,255,255,0.35); text-align: center; line-height: 1.6; }

      /* ── Sidebar footer ── */
      .d8b-sidebar-foot {
        padding: 12px 16px;
        border-top: 1px solid rgba(255,255,255,0.05);
      }
      .d8b-foot-badge {
        font-size: 10px;
        color: rgba(255,255,255,0.2);
        letter-spacing: 0.04em;
        text-align: center;
      }

      /* ── Main canvas ── */
      .d8b-canvas {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      /* ── Empty canvas ── */
      .d8b-empty-canvas {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(800px 600px at 50% 30%, rgba(61,240,255,0.03), transparent 60%),
          #07090f;
      }
      .d8b-splash { text-align: center; max-width: 520px; padding: 0 24px; }
      .d8b-splash-mark {
        font-size: 48px;
        color: rgba(61,240,255,0.3);
        display: block;
        margin-bottom: 16px;
        animation: d8b-pulse 3s ease-in-out infinite;
      }
      @keyframes d8b-pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
      }
      .d8b-splash-title {
        font-size: 48px;
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.04em;
        line-height: 1;
        margin: 0 0 16px;
      }
      .d8b-splash-sub {
        font-size: 16px;
        color: rgba(255,255,255,0.45);
        line-height: 1.7;
        margin: 0 0 32px;
      }
      .d8b-splash-examples { display: flex; flex-direction: column; gap: 8px; }
      .d8b-examples-label { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
      .d8b-example-btn {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        color: rgba(255,255,255,0.55);
        font-size: 13px;
        font-family: inherit;
        padding: 12px 16px;
        text-align: left;
        cursor: pointer;
        transition: all 140ms ease;
        line-height: 1.4;
      }
      .d8b-example-btn:hover {
        border-color: rgba(255,255,255,0.16);
        color: rgba(255,255,255,0.85);
        background: rgba(255,255,255,0.05);
        transform: translateX(4px);
      }

      /* ── Generating screen ── */
      .d8b-generating-screen {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #07090f;
      }
      .d8b-gen-anim { display: flex; flex-direction: column; align-items: center; gap: 16px; }
      .d8b-gen-ring { position: relative; width: 80px; height: 80px; }
      .d8b-gen-svg { width: 80px; height: 80px; transform: rotate(-90deg); }
      .d8b-gen-track { fill: none; stroke: rgba(255,255,255,0.07); stroke-width: 4; }
      .d8b-gen-arc {
        fill: none;
        stroke: rgba(61,240,255,0.8);
        stroke-width: 4;
        stroke-linecap: round;
        transition: stroke-dashoffset 300ms ease;
      }
      .d8b-gen-pct {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        color: rgba(61,240,255,0.9);
      }
      .d8b-gen-label { font-size: 18px; font-weight: 600; color: #fff; }
      .d8b-gen-sub { font-size: 13px; color: rgba(255,255,255,0.4); }

      /* ── Error screen ── */
      .d8b-error-screen {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(800px 600px at 50% 30%, rgba(255,100,100,0.02), transparent 60%),
          #07090f;
      }
      .d8b-error-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        max-width: 400px;
        padding: 0 24px;
        text-align: center;
      }
      .d8b-error-icon {
        font-size: 48px;
        display: block;
      }
      .d8b-error-title {
        font-size: 32px;
        font-weight: 700;
        color: #fff;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .d8b-error-message {
        font-size: 15px;
        color: rgba(255,255,255,0.5);
        line-height: 1.6;
        margin: 0 0 8px;
      }
      .d8b-error-retry-btn {
        margin-top: 12px;
        padding: 12px 24px;
        border-radius: 10px;
        border: 1px solid rgba(255,100,100,0.4);
        background: linear-gradient(180deg, rgba(255,100,100,0.12), rgba(255,100,100,0.05));
        color: rgba(255,120,120,0.95);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 140ms ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .d8b-error-retry-btn:hover {
        background: linear-gradient(180deg, rgba(255,100,100,0.18), rgba(255,100,100,0.08));
        border-color: rgba(255,100,100,0.6);
        transform: translateY(-1px);
      }

      /* ── Dots animation ── */
      .d8b-dots { display: inline-flex; gap: 2px; margin-left: 4px; }
      .d8b-dots span {
        width: 4px; height: 4px;
        border-radius: 50%;
        background: rgba(255,255,255,0.6);
        animation: d8b-dot 1.2s ease-in-out infinite;
      }
      .d8b-dots span:nth-child(2) { animation-delay: 0.2s; }
      .d8b-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes d8b-dot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

      /* ── Preview wrap ── */
      .d8b-preview-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      /* ── Toolbar ── */
      .d8b-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        height: 48px;
        border-bottom: 1px solid rgba(255,255,255,0.07);
        background: rgba(0,0,0,0.2);
        flex-shrink: 0;
        gap: 12px;
      }
      .d8b-toolbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .d8b-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

      .d8b-live-badge {
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(255,80,80,0.12);
        border: 1px solid rgba(255,80,80,0.3);
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(255,100,100,0.9);
        letter-spacing: 0.06em;
      }
      .d8b-live-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: rgba(255,100,100,0.9);
        animation: d8b-blink 1s ease-in-out infinite;
      }
      @keyframes d8b-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

      .d8b-done-badge {
        background: rgba(61,240,180,0.1);
        border: 1px solid rgba(61,240,180,0.3);
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 10px;
        font-weight: 700;
        color: rgba(61,240,180,0.9);
        letter-spacing: 0.04em;
      }

      .d8b-toolbar-prompt {
        font-size: 13px;
        color: rgba(255,255,255,0.4);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .d8b-view-toggle {
        display: flex;
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        padding: 2px;
        gap: 2px;
      }
      .d8b-view-btn {
        padding: 5px 12px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.45);
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-view-btn--active { background: rgba(255,255,255,0.1); color: #fff; }

      .d8b-action-btn {
        padding: 7px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.12);
        background: transparent;
        color: rgba(255,255,255,0.6);
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-action-btn:hover { border-color: rgba(255,255,255,0.22); color: #fff; }

      .d8b-deploy-btn {
        padding: 7px 14px;
        border-radius: 8px;
        border: 1px solid rgba(61,240,255,0.4);
        background: linear-gradient(180deg, rgba(61,240,255,0.15), rgba(61,240,255,0.06));
        color: rgba(61,240,255,0.9);
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 120ms ease;
      }
      .d8b-deploy-btn:hover:not(:disabled) {
        border-color: rgba(61,240,255,0.6);
        background: linear-gradient(180deg, rgba(61,240,255,0.22), rgba(61,240,255,0.10));
      }
      .d8b-deploy-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ── iframe ── */
      .d8b-iframe-wrap {
        flex: 1;
        position: relative;
        overflow: hidden;
        background: #fff;
      }
      .d8b-iframe-loader {
        position: absolute;
        inset: 0;
        z-index: 10;
        background: #07090f;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .d8b-iframe {
        width: 100%;
        height: 100%;
        border: none;
        display: block;
      }

      /* ── Code view ── */
      .d8b-code-wrap {
        flex: 1;
        overflow: auto;
        background: #0a0d18;
      }
      .d8b-code {
        padding: 20px 24px;
        font-size: 12px;
        line-height: 1.7;
        color: #9aa3c7;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        white-space: pre-wrap;
        word-break: break-all;
        margin: 0;
      }

      /* ── Progress bar ── */
      .d8b-progress-bar {
        height: 2px;
        background: rgba(255,255,255,0.05);
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
      }
      .d8b-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, rgba(61,240,255,0.6), rgba(61,240,255,1));
        transition: width 300ms ease;
        border-radius: 0 2px 2px 0;
      }

      /* ── Mobile ── */
      @media (max-width: 768px) {
        .d8b-sidebar { width: 260px; min-width: 260px; }
        .d8b-splash-title { font-size: 32px; }
      }
    `}</style>
  );
}
