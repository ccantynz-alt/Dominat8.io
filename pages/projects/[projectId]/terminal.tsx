import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

/**
 * TERMINAL V3 — QA + PUBLISH AUDIT (UI-ONLY)
 *
 * Constraints honored:
 * - terminal.tsx only
 * - Pages Router
 * - backend untouched
 *
 * Uses existing endpoints:
 * - POST /api/projects/:id/publish
 * - GET  /api/projects/:id/runs/latest
 * - GET  /api/projects/:id/debug/spec
 * - GET  /api/projects/:id/debug/spec?full=1&key=...
 *
 * Batch features:
 * - Release Gate: PASS / WARN / FAIL + 0–100 score
 * - Gate tuning toggles
 * - Copy "gate summary" to clipboard
 * - QA history (last 10 per project in localStorage)
 * - HTML diff (Generated vs Published) with context + next/prev + jump + copy block
 * - Sitemap diff (LIVE /sitemap.xml vs KV sitemapXml) with same tooling
 *
 * NEW BATCH:
 * - Sticky verdict bar (always visible)
 * - Inline reason banner
 * - Auto-scroll + highlight first failing gate
 * - Jump-to-failing-gate button
 */

// ---------- Types ----------
type RunStateKV = {
  ok: boolean;
  projectId: string;
  status: "running" | "success" | "error";
  preset: "seo" | "full" | "publish";
  startedAtIso: string;
  endedAtIso?: string;
  steps: Array<{
    name: string;
    ok: boolean;
    status: "running" | "success" | "error";
    startedAtIso: string;
    endedAtIso?: string;
    ms?: number;
    error?: string;
  }>;
};

type AllowKeys = {
  generated: string;
  published: string;
  seoPlan: string;
  sitemapXml: string;
  publishedSpec: string;
};

type DebugSpecPreview = {
  ok: boolean;
  projectId: string;
  nowIso: string;
  source?: string;
  presentKeys?: string[];
  missingKeys?: string[];
  previews?: Record<
    string,
    | { kind: "string"; first500: string; len: number }
    | { kind: "object"; keys: string[]; jsonFirst500: string }
    | any
  >;
};

type FullReadResp = { ok: boolean; projectId: string; key: string; value: any; nowIso?: string; error?: string };

type GateStatus = "pass" | "warn" | "fail";

type GateResult = {
  id: string;
  label: string;
  status: GateStatus;
  weight: number;
  detail: string;
};

type GateSummary = {
  verdict: "PASS" | "WARN" | "FAIL";
  score: number;
  gates: GateResult[];
  totals: {
    totalWeight: number;
    earnedWeight: number;
    passCount: number;
    warnCount: number;
    failCount: number;
  };
};

type QaHistoryItem = {
  id: string;
  atIso: string;
  verdict: "PASS" | "WARN" | "FAIL";
  score: number;
  summary: any;
  report: any;
};

// ---------- Helpers ----------
function nowIso() {
  return new Date().toISOString();
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadJson(filename: string, obj: any) {
  downloadText(filename, JSON.stringify(obj, null, 2));
}

function normalizeTextForDiff(s: string) {
  return s.replace(/\r\n/g, "\n").trim().replace(/\n{3,}/g, "\n\n");
}

function allDiffIndexes(aLines: string[], bLines: string[]) {
  const max = Math.max(aLines.length, bLines.length);
  const diffs: number[] = [];
  for (let i = 0; i < max; i++) {
    if ((aLines[i] ?? "") !== (bLines[i] ?? "")) diffs.push(i);
  }
  return diffs;
}

function buildContext(
  lines: string[],
  centerIndex: number,
  radius: number
): { start: number; end: number; context: Array<{ n: number; text: string; isCenter: boolean }> } {
  if (!lines || lines.length === 0) {
    return { start: 0, end: 0, context: [{ n: 1, text: "", isCenter: true }] };
  }
  const safeCenter = centerIndex >= 0 ? Math.min(centerIndex, lines.length - 1) : 0;
  const start = Math.max(0, safeCenter - radius);
  const end = Math.min(lines.length - 1, safeCenter + radius);

  const context = [];
  for (let i = start; i <= end; i++) {
    context.push({
      n: i + 1,
      text: lines[i] ?? "",
      isCenter: i === safeCenter,
    });
  }
  return { start, end, context };
}

function formatContextBlock(
  title: string,
  ctx: { start: number; end: number; context: Array<{ n: number; text: string; isCenter: boolean }> }
) {
  const lines = ctx.context.map((row) => {
    const prefix = String(row.n).padStart(6, " ");
    const mark = row.isCenter ? "▶" : " ";
    return `${prefix} ${mark} ${row.text}`;
  });
  return `## ${title}\n${lines.join("\n")}\n`;
}

function safeJsonParse(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

function extractCanonical(html: string) {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  if (!m) return null;
  const tag = m[0];
  const href = tag.match(/href=["']([^"']+)["']/i);
  return href ? href[1] : null;
}

function extractTitle(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return null;
  return m[1].trim();
}

function hasMetaRobots(html: string) {
  return /<meta[^>]*name=["']robots["'][^>]*>/i.test(html);
}

function shorten(s: string, n: number) {
  if (!s) return "";
  return s.length <= n ? s : s.slice(0, n) + "…";
}

function stableId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function clipboardWrite(text: string) {
  try {
    if (!navigator?.clipboard?.writeText) return { ok: false, error: "Clipboard not available" };
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

function gateStatusToEarned(weight: number, status: GateStatus) {
  if (status === "pass") return weight;
  if (status === "warn") return weight * 0.5;
  return 0;
}

function summarizeGateVerdict(gates: GateResult[]): "PASS" | "WARN" | "FAIL" {
  const hasFail = gates.some((g) => g.status === "fail");
  if (hasFail) return "FAIL";
  const hasWarn = gates.some((g) => g.status === "warn");
  if (hasWarn) return "WARN";
  return "PASS";
}

function computeGateSummary(gates: GateResult[]): GateSummary {
  const totalWeight = gates.reduce((s, g) => s + g.weight, 0);
  const earnedWeight = gates.reduce((s, g) => s + gateStatusToEarned(g.weight, g.status), 0);
  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  const passCount = gates.filter((g) => g.status === "pass").length;
  const warnCount = gates.filter((g) => g.status === "warn").length;
  const failCount = gates.filter((g) => g.status === "fail").length;

  return {
    verdict: summarizeGateVerdict(gates),
    score,
    gates,
    totals: { totalWeight, earnedWeight, passCount, warnCount, failCount },
  };
}

function gatePrimaryReason(gs: GateSummary | null): { title: string; detail: string } | null {
  if (!gs) return null;
  const firstFail = gs.gates.find((g) => g.status === "fail");
  if (firstFail) return { title: `FAIL: ${firstFail.label}`, detail: firstFail.detail };
  const firstWarn = gs.gates.find((g) => g.status === "warn");
  if (firstWarn) return { title: `WARN: ${firstWarn.label}`, detail: firstWarn.detail };
  return { title: "PASS: All gates satisfied", detail: "No blocking issues detected by the current gate rules." };
}

// ---------- Main ----------
export default function TerminalV3_QA_PublishAudit() {
  const router = useRouter();
  const projectId = (router.query.projectId as string) || "";

  // Run controls
  const [preset, setPreset] = useState<"seo" | "full" | "publish">("full");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [runState, setRunState] = useState<RunStateKV | null>(null);
  const pollTimerRef = useRef<any>(null);

  // Tabs
  const [tab, setTab] = useState<"qa" | "diffHtml" | "diffSitemap" | "raw">("qa");

  // Refresh diagnostics
  const [lastArtifactsRefresh, setLastArtifactsRefresh] = useState<any>(null);
  const [lastRunRefresh, setLastRunRefresh] = useState<any>(null);

  // Debug spec preview cache (for QA)
  const [debugSpec, setDebugSpec] = useState<DebugSpecPreview | null>(null);

  // Diff engine state
  type DiffState = {
    status: "idle" | "loading" | "ready" | "error";
    error: string;
    aLabel: string;
    bLabel: string;
    aText: string;
    bText: string;
    diffs: number[];
    pos: number;
    radius: number;
    jumpValue: string;
    copyStatus: string;
  };

  const [htmlDiff, setHtmlDiff] = useState<DiffState>({
    status: "idle",
    error: "",
    aLabel: "Generated",
    bLabel: "Published",
    aText: "",
    bText: "",
    diffs: [],
    pos: 0,
    radius: 20,
    jumpValue: "1",
    copyStatus: "",
  });

  const [sitemapDiff, setSitemapDiff] = useState<DiffState>({
    status: "idle",
    error: "",
    aLabel: "LIVE /sitemap.xml",
    bLabel: "KV sitemapXml",
    aText: "",
    bText: "",
    diffs: [],
    pos: 0,
    radius: 20,
    jumpValue: "1",
    copyStatus: "",
  });

  // QA Audit + Gates
  const [qaStatus, setQaStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [qaError, setQaError] = useState<string>("");
  const [qaReport, setQaReport] = useState<any>(null);

  const [gateSummary, setGateSummary] = useState<GateSummary | null>(null);
  const [gateCopyStatus, setGateCopyStatus] = useState<string>("");

  // NEW: auto-scroll/highlight
  const [highlightGateId, setHighlightGateId] = useState<string>("");
  const [lastAutoScrollKey, setLastAutoScrollKey] = useState<string>("");
  const gateRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // QA history
  const [qaHistory, setQaHistory] = useState<QaHistoryItem[]>([]);
  const [qaHistorySelectedId, setQaHistorySelectedId] = useState<string>("");

  const [qaConfig, setQaConfig] = useState({
    maxPagesToCheck: 12,
    require200: true,
    requireTitle: true,
    requireCanonical: false,
    requireRobotsMeta: false,

    htmlMismatchFail: true,
    sitemapMismatchFail: true,

    minPagesOkPct: 100,
  });

  // Keys (always strings)
  const allowKeys: AllowKeys = useMemo(() => {
    const pid = projectId || "___";
    return {
      generated: `generated:project:${pid}:latest`,
      published: `published:project:${pid}:latest`,
      seoPlan: `project:${pid}:seoPlan`,
      sitemapXml: `project:${pid}:sitemapXml`,
      publishedSpec: `project:${pid}:publishedSpec`,
    };
  }, [projectId]);

  // ---------- Forced readable colors ----------
  const pageText = "#111827";
  const panelBg = "#ffffff";
  const panelBorder = "#e5e7eb";
  const inputBorder = "#d1d5db";
  const darkBg = "#111827";
  const subtle = "#6b7280";

  const green = "#065f46";
  const red = "#991b1b";
  const amber = "#92400e";

  const inputStyle: React.CSSProperties = {
    padding: 8,
    borderRadius: 10,
    border: `1px solid ${inputBorder}`,
    background: panelBg,
    color: pageText,
  };

  const preStyle: React.CSSProperties = {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: pageText,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
    lineHeight: 1.35,
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 220,
    borderRadius: 12,
    border: `1px solid ${panelBorder}`,
    padding: 12,
    background: panelBg,
    color: pageText,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 12,
  };

  function pillStyle(active: boolean): React.CSSProperties {
    return {
      padding: "6px 10px",
      borderRadius: 999,
      border: `1px solid ${inputBorder}`,
      background: active ? darkBg : panelBg,
      color: active ? "#fff" : pageText,
      cursor: "pointer",
    };
  }

  function buttonStyle(primary = false, disabled = false): React.CSSProperties {
    return {
      padding: "8px 12px",
      borderRadius: 10,
      border: primary ? `1px solid ${darkBg}` : `1px solid ${inputBorder}`,
      background: disabled ? "#e5e7eb" : primary ? darkBg : panelBg,
      color: disabled ? pageText : primary ? "#fff" : pageText,
      cursor: disabled ? "not-allowed" : "pointer",
    };
  }

  function badgeStyle(verdict: "PASS" | "WARN" | "FAIL"): React.CSSProperties {
    const bg = verdict === "PASS" ? "#ecfdf5" : verdict === "WARN" ? "#fffbeb" : "#fef2f2";
    const border = verdict === "PASS" ? "#a7f3d0" : verdict === "WARN" ? "#fde68a" : "#fecaca";
    const fg = verdict === "PASS" ? green : verdict === "WARN" ? amber : red;

    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      border: `1px solid ${border}`,
      background: bg,
      color: fg,
      fontWeight: 900,
      letterSpacing: 0.3,
    };
  }

  function reasonBannerStyle(verdict: "PASS" | "WARN" | "FAIL"): React.CSSProperties {
    const bg = verdict === "PASS" ? "#ecfdf5" : verdict === "WARN" ? "#fffbeb" : "#fef2f2";
    const border = verdict === "PASS" ? "#a7f3d0" : verdict === "WARN" ? "#fde68a" : "#fecaca";
    const fg = verdict === "PASS" ? green : verdict === "WARN" ? amber : red;
    return {
      border: `1px solid ${border}`,
      background: bg,
      color: fg,
      borderRadius: 14,
      padding: 12,
    };
  }

  // ---------- localStorage (QA History) ----------
  function historyKey(pid: string) {
    return `qaAudits:${pid}`;
  }

  function loadHistory(pid: string) {
    try {
      const raw = localStorage.getItem(historyKey(pid));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as QaHistoryItem[];
    } catch {
      return [];
    }
  }

  function saveHistory(pid: string, items: QaHistoryItem[]) {
    try {
      localStorage.setItem(historyKey(pid), JSON.stringify(items.slice(0, 10)));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!projectId) return;
    const items = loadHistory(projectId);
    setQaHistory(items);
  }, [projectId]);

  // ---------- Backend calls ----------
  async function refreshDebugSpec() {
    if (!projectId) return;

    const t0 = Date.now();
    const r = await fetch(`/api/projects/${projectId}/debug/spec?ts=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
    });

    const j = (await r.json().catch(() => null)) as DebugSpecPreview | null;

    setLastArtifactsRefresh({
      atIso: nowIso(),
      ms: Date.now() - t0,
      httpStatus: r.status,
      ok: !!j?.ok,
      presentKeysLen: Array.isArray(j?.presentKeys) ? j!.presentKeys!.length : null,
      missingKeysLen: Array.isArray(j?.missingKeys) ? j!.missingKeys!.length : null,
      source: (j as any)?.source || null,
    });

    if (j && (j as any).ok) setDebugSpec(j);
  }

  async function pollLatestRunOnce(markAsManual = false) {
    if (!projectId) return;

    const t0 = Date.now();
    const r = await fetch(`/api/projects/${projectId}/runs/latest?ts=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
    });
    const j = await r.json().catch(() => null);

    const nextState: RunStateKV | null = (j?.state || j?.value) ?? null;
    setRunState(nextState);

    if (markAsManual) {
      setLastRunRefresh({
        atIso: nowIso(),
        ms: Date.now() - t0,
        httpStatus: r.status,
        hasValue: !!nextState,
        status: nextState?.status || null,
        stepsLen: Array.isArray(nextState?.steps) ? nextState!.steps.length : null,
      });
    }

    const status = nextState?.status;
    if (status === "running") {
      setIsRunning(true);
      return;
    }
    if (status === "success" || status === "error") {
      setIsRunning(false);
      stopPolling();
    }
  }

  function startPolling() {
    stopPolling();
    pollTimerRef.current = setInterval(() => {
      pollLatestRunOnce(false).catch(() => {});
    }, 1500);
  }

  function stopPolling() {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runPreset() {
    if (!projectId) return;

    setIsRunning(true);
    setOutput(null);

    startPolling();
    pollLatestRunOnce(false).catch(() => {});

    const r = await fetch(`/api/projects/${projectId}/publish?ts=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset }),
      cache: "no-store",
    });

    const j = await r.json().catch(() => null);
    setOutput(j);

    await refreshDebugSpec().catch(() => {});
    await pollLatestRunOnce(true).catch(() => {});
  }

  async function fullRead(key: string): Promise<FullReadResp> {
    if (!projectId) return { ok: false, projectId: "", key, value: null, error: "Missing projectId" };
    const url = `/api/projects/${projectId}/debug/spec?full=1&key=${encodeURIComponent(key)}&ts=${Date.now()}`;
    const r = await fetch(url, { method: "GET", cache: "no-store" });
    const j = (await r.json().catch(() => null)) as any;
    if (!r.ok || !j?.ok) {
      return { ok: false, projectId, key, value: null, error: j?.error || `HTTP ${r.status}` };
    }
    return j as FullReadResp;
  }

  // ---------- Diff engine ----------
  function computeDiff(aText: string, bText: string) {
    const a = normalizeTextForDiff(aText);
    const b = normalizeTextForDiff(bText);
    const aLines = a.split("\n");
    const bLines = b.split("\n");
    const diffs = allDiffIndexes(aLines, bLines);
    return { a, b, diffs };
  }

  function diffLabel(ds: DiffState) {
    if (ds.diffs.length === 0) return "No diffs";
    const pos1 = Math.max(0, Math.min(ds.diffs.length - 1, ds.pos)) + 1;
    const line1 = (ds.diffs[ds.pos] ?? -1) >= 0 ? ds.diffs[ds.pos] + 1 : null;
    return `Diff ${pos1} / ${ds.diffs.length}${line1 ? ` (line ${line1})` : ""}`;
  }

  function clampPos(ds: DiffState, pos: number) {
    if (ds.diffs.length === 0) return 0;
    return Math.max(0, Math.min(ds.diffs.length - 1, pos));
  }

  function goToDiffNumber(ds: DiffState, nRaw: string) {
    const n = Number(nRaw);
    if (!Number.isFinite(n) || ds.diffs.length === 0) return ds;
    const idx = Math.max(1, Math.min(ds.diffs.length, Math.floor(n)));
    return { ...ds, pos: idx - 1, jumpValue: String(idx), copyStatus: "" };
  }

  async function copyDiffBlock(ds: DiffState, aCtx: any, bCtx: any, meta: any) {
    const header =
      `# DIFF BLOCK\n` +
      `projectId: ${projectId}\n` +
      `kind: ${meta.kind}\n` +
      `diff: ${meta.diffPos1} / ${meta.diffTotal}\n` +
      `line: ${meta.line1}\n` +
      `contextLines: ${meta.radius}\n` +
      `A: ${ds.aLabel}\n` +
      `B: ${ds.bLabel}\n\n`;

    const body = formatContextBlock(ds.aLabel, aCtx) + "\n" + formatContextBlock(ds.bLabel, bCtx);
    const text = header + body;

    const res = await clipboardWrite(text);
    return res.ok ? "Copied ✅" : `Copy failed: ${res.error}`;
  }

  // ---------- HTML Diff ----------
  async function runHtmlDiff() {
    if (!projectId) return;

    setHtmlDiff((p) => ({
      ...p,
      status: "loading",
      error: "",
      aText: "",
      bText: "",
      diffs: [],
      pos: 0,
      jumpValue: "1",
      copyStatus: "",
    }));

    const gen = await fullRead(allowKeys.generated);
    if (!gen.ok) {
      setHtmlDiff((p) => ({ ...p, status: "error", error: gen.error || "Generated FULL read failed" }));
      return;
    }
    const pub = await fullRead(allowKeys.published);
    if (!pub.ok) {
      setHtmlDiff((p) => ({ ...p, status: "error", error: pub.error || "Published FULL read failed" }));
      return;
    }
    if (typeof gen.value !== "string") {
      setHtmlDiff((p) => ({ ...p, status: "error", error: "Generated FULL value is not a string" }));
      return;
    }
    if (typeof pub.value !== "string") {
      setHtmlDiff((p) => ({ ...p, status: "error", error: "Published FULL value is not a string" }));
      return;
    }

    const { a, b, diffs } = computeDiff(gen.value, pub.value);

    setHtmlDiff((p) => ({
      ...p,
      status: "ready",
      error: "",
      aText: a,
      bText: b,
      diffs,
      pos: 0,
      jumpValue: diffs.length > 0 ? "1" : "0",
      copyStatus: "",
    }));
  }

  // ---------- Sitemap Diff ----------
  async function runSitemapDiff() {
    if (!projectId) return;

    setSitemapDiff((p) => ({
      ...p,
      status: "loading",
      error: "",
      aText: "",
      bText: "",
      diffs: [],
      pos: 0,
      jumpValue: "1",
      copyStatus: "",
    }));

    const liveRes = await fetch(`/sitemap.xml?ts=${Date.now()}`, { method: "GET", cache: "no-store" });
    const liveText = await liveRes.text().catch(() => "");
    if (!liveRes.ok) {
      setSitemapDiff((p) => ({
        ...p,
        status: "error",
        error: `LIVE /sitemap.xml failed (HTTP ${liveRes.status}). First200: ${shorten(liveText, 200)}`,
      }));
      return;
    }

    const kvXml = await fullRead(allowKeys.sitemapXml);
    if (!kvXml.ok) {
      setSitemapDiff((p) => ({ ...p, status: "error", error: kvXml.error || "KV sitemapXml FULL read failed" }));
      return;
    }
    if (typeof kvXml.value !== "string") {
      setSitemapDiff((p) => ({ ...p, status: "error", error: "KV sitemapXml FULL value is not a string" }));
      return;
    }

    const { a, b, diffs } = computeDiff(liveText, kvXml.value);

    setSitemapDiff((p) => ({
      ...p,
      status: "ready",
      error: "",
      aText: a,
      bText: b,
      diffs,
      pos: 0,
      jumpValue: diffs.length > 0 ? "1" : "0",
      copyStatus: "",
    }));
  }

  // ---------- Gate builder ----------
  function buildGatesFromReport(report: any): GateResult[] {
    const gates: GateResult[] = [];

    // Gate 1: Must-have artifacts present
    const missing = report?.artifacts?.mustHave?.missing || [];
    gates.push({
      id: "artifacts_must_have",
      label: "Must-have artifacts present in KV",
      status: Array.isArray(missing) && missing.length === 0 ? "pass" : "fail",
      weight: 35,
      detail:
        Array.isArray(missing) && missing.length === 0
          ? "All required KV keys present."
          : `Missing ${missing.length}: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}`,
    });

    // Gate 2: Pages smoke test threshold
    const checked = Number(report?.summary?.pagesChecked ?? 0);
    const okCount = Number(report?.summary?.pagesOk ?? 0);
    const failed = Number(report?.summary?.pagesFailed ?? 0);

    const pctOk = checked > 0 ? Math.round((okCount / checked) * 100) : 0;
    const minPct = Number(qaConfig.minPagesOkPct ?? 100);

    let pageStatus: GateStatus = "warn";
    let pageDetail = "No pages checked.";

    if (checked > 0) {
      if (pctOk >= minPct) {
        pageStatus = "pass";
        pageDetail = `${okCount}/${checked} ok (${pctOk}%).`;
      } else {
        pageStatus = "fail";
        pageDetail = `${okCount}/${checked} ok (${pctOk}%). Failed: ${failed}. Required ≥ ${minPct}%.`;
      }
    }

    gates.push({
      id: "pages_smoke",
      label: `Live pages smoke test (≥ ${minPct}% pass)`,
      status: pageStatus,
      weight: 30,
      detail: pageDetail,
    });

    // Gate 3: HTML match
    const htmlOk = !!report?.diffs?.html?.ok;
    const htmlMatch = report?.diffs?.html?.match;

    let htmlStatus: GateStatus = "warn";
    let htmlDetail = "HTML diff not available.";

    if (htmlOk === true && typeof htmlMatch === "boolean") {
      if (htmlMatch) {
        htmlStatus = "pass";
        htmlDetail = "Generated and Published HTML match.";
      } else {
        htmlStatus = qaConfig.htmlMismatchFail ? "fail" : "warn";
        htmlDetail = qaConfig.htmlMismatchFail ? "Mismatch (FAIL mode)." : "Mismatch (WARN mode).";
      }
    }

    gates.push({
      id: "html_match",
      label: `Generated vs Published HTML match (${qaConfig.htmlMismatchFail ? "FAIL" : "WARN"} on mismatch)`,
      status: htmlStatus,
      weight: 20,
      detail: htmlDetail,
    });

    // Gate 4: Sitemap match
    const smOk = !!report?.diffs?.sitemap?.ok;
    const smMatch = report?.diffs?.sitemap?.match;

    let smStatus: GateStatus = "warn";
    let smDetail = "Sitemap diff not available.";

    if (smOk === true && typeof smMatch === "boolean") {
      if (smMatch) {
        smStatus = "pass";
        smDetail = "LIVE /sitemap.xml matches KV sitemapXml.";
      } else {
        smStatus = qaConfig.sitemapMismatchFail ? "fail" : "warn";
        smDetail = qaConfig.sitemapMismatchFail ? "Mismatch (FAIL mode)." : "Mismatch (WARN mode).";
      }
    }

    gates.push({
      id: "sitemap_match",
      label: `LIVE sitemap.xml vs KV sitemapXml (${qaConfig.sitemapMismatchFail ? "FAIL" : "WARN"} on mismatch)`,
      status: smStatus,
      weight: 15,
      detail: smDetail,
    });

    return gates;
  }

  async function copyGateSummary(report: any, summary: GateSummary) {
    const primary = gatePrimaryReason(summary);
    const lines: string[] = [];
    lines.push(`# RELEASE GATE SUMMARY`);
    lines.push(`projectId: ${projectId}`);
    lines.push(`time: ${nowIso()}`);
    lines.push(`verdict: ${summary.verdict}`);
    lines.push(`score: ${summary.score}/100`);
    if (primary) {
      lines.push(`primary: ${primary.title}`);
      lines.push(`primaryDetail: ${primary.detail}`);
    }
    lines.push(
      `counts: pass=${summary.totals.passCount} warn=${summary.totals.warnCount} fail=${summary.totals.failCount}`
    );
    lines.push("");

    lines.push(`## Gates`);
    for (const g of summary.gates) {
      lines.push(`- [${g.status.toUpperCase()}] ${g.label} — ${g.detail}`);
    }

    lines.push("");
    lines.push(`## Quick stats`);
    lines.push(`artifactsOk: ${String(report?.summary?.artifactsOk)}`);
    lines.push(`htmlMatch: ${String(report?.summary?.htmlMatch)}`);
    lines.push(`sitemapMatch: ${String(report?.summary?.sitemapMatch)}`);
    lines.push(`pages: ${report?.summary?.pagesOk}/${report?.summary?.pagesChecked} ok`);

    const res = await clipboardWrite(lines.join("\n"));
    setGateCopyStatus(res.ok ? "Copied ✅" : `Copy failed: ${res.error}`);
  }

  // ---------- QA Audit Runner ----------
  async function runQaAudit() {
    if (!projectId) return;

    setQaStatus("running");
    setQaError("");
    setQaReport(null);
    setGateSummary(null);
    setGateCopyStatus("");
    setQaHistorySelectedId("");
    setHighlightGateId("");

    const report: any = {
      ok: true,
      projectId,
      startedAtIso: nowIso(),
      config: { ...qaConfig },
      summary: {
        artifactsOk: false,
        htmlMatch: null as null | boolean,
        sitemapMatch: null as null | boolean,
        pagesChecked: 0,
        pagesOk: 0,
        pagesFailed: 0,
      },
      artifacts: {},
      live: {},
      diffs: {},
      pages: [] as any[],
      notes: [] as string[],
    };

    try {
      // 1) Preview list
      await refreshDebugSpec();

      const specRes = await fetch(`/api/projects/${projectId}/debug/spec?ts=${Date.now()}`, { cache: "no-store" });
      const specJson = (await specRes.json().catch(() => null)) as DebugSpecPreview | null;

      report.artifacts.preview = {
        httpStatus: specRes.status,
        ok: !!specJson?.ok,
        presentKeys: specJson?.presentKeys || [],
        missingKeys: specJson?.missingKeys || [],
        source: (specJson as any)?.source || null,
      };

      const mustHave = [
        allowKeys.generated,
        allowKeys.published,
        allowKeys.sitemapXml,
        allowKeys.publishedSpec,
        allowKeys.seoPlan,
      ];
      const present = new Set((specJson?.presentKeys || []) as string[]);
      const missingMustHave = mustHave.filter((k) => !present.has(k));

      report.artifacts.mustHave = {
        expected: mustHave,
        missing: missingMustHave,
        ok: missingMustHave.length === 0,
      };
      report.summary.artifactsOk = missingMustHave.length === 0;

      // 2) HTML match
      const gen = await fullRead(allowKeys.generated);
      const pub = await fullRead(allowKeys.published);

      if (gen.ok && pub.ok && typeof gen.value === "string" && typeof pub.value === "string") {
        const a = normalizeTextForDiff(gen.value);
        const b = normalizeTextForDiff(pub.value);
        report.diffs.html = { ok: true, match: a === b, genLen: a.length, pubLen: b.length };
        report.summary.htmlMatch = a === b;
      } else {
        report.diffs.html = { ok: false, genOk: gen.ok, pubOk: pub.ok, genErr: gen.error, pubErr: pub.error };
        report.summary.htmlMatch = null;
      }

      // 3) Sitemap match
      const liveRes = await fetch(`/sitemap.xml?ts=${Date.now()}`, { cache: "no-store" });
      const liveText = await liveRes.text().catch(() => "");
      const kvXml = await fullRead(allowKeys.sitemapXml);

      if (liveRes.ok && kvXml.ok && typeof kvXml.value === "string") {
        const a = normalizeTextForDiff(liveText);
        const b = normalizeTextForDiff(kvXml.value);
        report.diffs.sitemap = {
          ok: true,
          match: a === b,
          liveLen: a.length,
          kvLen: b.length,
          liveHttpStatus: liveRes.status,
          liveContentType: liveRes.headers.get("content-type"),
        };
        report.summary.sitemapMatch = a === b;
      } else {
        report.diffs.sitemap = {
          ok: false,
          liveOk: liveRes.ok,
          liveStatus: liveRes.status,
          liveFirst200: shorten(liveText, 200),
          kvOk: kvXml.ok,
          kvErr: kvXml.error,
        };
        report.summary.sitemapMatch = null;
      }

      // 4) Live page QA (best effort)
      const publishedSpec = await fullRead(allowKeys.publishedSpec);
      let paths: string[] = ["/", "/pricing", "/faq"];

      if (publishedSpec.ok) {
        let specObj: any = publishedSpec.value;

        if (typeof specObj === "string") {
          const parsed = safeJsonParse(specObj);
          if (parsed.ok) specObj = parsed.value;
        }

        const found: string[] = [];

        if (specObj && Array.isArray(specObj.pages)) {
          for (const p of specObj.pages) {
            const path = typeof p === "string" ? p : typeof p?.path === "string" ? p.path : null;
            if (path) found.push(path);
          }
        }
        if (specObj && Array.isArray(specObj.routes)) {
          for (const r of specObj.routes) {
            const path = typeof r === "string" ? r : typeof r?.path === "string" ? r.path : null;
            if (path) found.push(path);
          }
        }
        if (specObj && Array.isArray(specObj.navigation)) {
          for (const n of specObj.navigation) {
            const path = typeof n?.href === "string" ? n.href : typeof n?.path === "string" ? n.path : null;
            if (path) found.push(path);
          }
        }

        found.push("/");

        const uniq = Array.from(new Set(found))
          .map((p) => (p.startsWith("/") ? p : `/${p}`))
          .filter((p) => p.startsWith("/"))
          .slice(0, Math.max(1, qaConfig.maxPagesToCheck));

        if (uniq.length > 0) paths = uniq;

        report.live.publishedSpec = {
          ok: true,
          type: typeof publishedSpec.value,
          extractedPaths: paths,
          extractedCount: paths.length,
        };
      } else {
        report.live.publishedSpec = { ok: false, error: publishedSpec.error };
        report.notes.push("publishedSpec FULL read failed; using fallback paths");
      }

      const pageResults: any[] = [];
      for (const path of paths) {
        const url = `${path}${path.includes("?") ? "&" : "?"}ts=${Date.now()}`;

        const r = await fetch(url, { method: "GET", cache: "no-store" });
        const ct = r.headers.get("content-type") || "";
        const text = await r.text().catch(() => "");
        const html = text || "";

        const title = ct.includes("text/html") ? extractTitle(html) : null;
        const canonical = ct.includes("text/html") ? extractCanonical(html) : null;

        const ok200 = r.status === 200;
        const okStatus = qaConfig.require200 ? ok200 : r.status >= 200 && r.status < 400;

        const hasTitleOk = qaConfig.requireTitle ? !!title : true;
        const hasCanonicalOk = qaConfig.requireCanonical ? !!canonical : true;
        const hasRobotsOk = qaConfig.requireRobotsMeta ? hasMetaRobots(html) : true;

        const ok = okStatus && hasTitleOk && hasCanonicalOk && hasRobotsOk;

        pageResults.push({
          path,
          status: r.status,
          contentType: ct,
          ok,
          checks: {
            statusOk: okStatus,
            titleOk: hasTitleOk,
            canonicalOk: hasCanonicalOk,
            robotsMetaOk: hasRobotsOk,
          },
          signals: {
            title: title ? shorten(title, 140) : null,
            canonical: canonical ? shorten(canonical, 220) : null,
            htmlFirst200: ct.includes("text/html") ? shorten(html, 200) : null,
          },
        });
      }

      report.pages = pageResults;
      report.summary.pagesChecked = pageResults.length;
      report.summary.pagesOk = pageResults.filter((p) => p.ok).length;
      report.summary.pagesFailed = pageResults.filter((p) => !p.ok).length;

      report.endedAtIso = nowIso();
      report.ok = true;

      const gates = buildGatesFromReport(report);
      const gs = computeGateSummary(gates);

      report.releaseGate = {
        verdict: gs.verdict,
        score: gs.score,
        gates: gs.gates,
        totals: gs.totals,
      };

      setQaReport(report);
      setGateSummary(gs);
      setQaStatus("done");

      // Save to history
      const item: QaHistoryItem = {
        id: stableId("qa"),
        atIso: report.endedAtIso || nowIso(),
        verdict: gs.verdict,
        score: gs.score,
        summary: report.summary,
        report,
      };

      const next = [item, ...qaHistory].slice(0, 10);
      setQaHistory(next);
      saveHistory(projectId, next);
    } catch (e: any) {
      report.ok = false;
      report.error = String(e?.message || e);
      report.endedAtIso = nowIso();

      setQaReport(report);
      setGateSummary(null);
      setQaError(report.error);
      setQaStatus("error");
    }
  }

  function loadHistoryItem(item: QaHistoryItem) {
    setQaReport(item.report);
    setQaStatus("done");
    const gates = (item.report?.releaseGate?.gates as GateResult[]) || buildGatesFromReport(item.report);
    const gs = computeGateSummary(gates);
    setGateSummary(gs);
    setQaHistorySelectedId(item.id);
    setGateCopyStatus("");
    setHighlightGateId("");
    setTab("qa");
  }

  function clearHistory() {
    if (!projectId) return;
    setQaHistory([]);
    setQaHistorySelectedId("");
    try {
      localStorage.removeItem(historyKey(projectId));
    } catch {
      // ignore
    }
  }

  // ---------- NEW: auto-scroll to first failing gate ----------
  useEffect(() => {
    if (!gateSummary) return;
    if (!qaReport) return;

    // Avoid repeatedly auto-scrolling for same report
    const key = String(qaReport?.endedAtIso || qaReport?.startedAtIso || "") + "|" + gateSummary.verdict + "|" + gateSummary.score;
    if (key && key === lastAutoScrollKey) return;

    setLastAutoScrollKey(key);

    const firstFail = gateSummary.gates.find((g) => g.status === "fail");
    const firstWarn = gateSummary.gates.find((g) => g.status === "warn");
    const target = firstFail || (gateSummary.verdict === "WARN" ? firstWarn : null);

    if (!target) return;

    // Highlight + scroll gate row into view
    setHighlightGateId(target.id);
    setTab("qa");

    const el = gateRowRefs.current[target.id];
    if (el) {
      // slight delay to ensure UI renders
      setTimeout(() => {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
          // ignore
        }
      }, 80);
    }
  }, [gateSummary, qaReport, lastAutoScrollKey]);

  function jumpToFirstProblemGate() {
    if (!gateSummary) return;
    const firstFail = gateSummary.gates.find((g) => g.status === "fail");
    const firstWarn = gateSummary.gates.find((g) => g.status === "warn");
    const target = firstFail || firstWarn;
    if (!target) return;

    setHighlightGateId(target.id);
    setTab("qa");

    const el = gateRowRefs.current[target.id];
    if (el) {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        // ignore
      }
    }
  }

  // ---------- Rendering helpers ----------
  function renderRunSteps() {
    const steps = runState?.steps || [];
    if (steps.length === 0) return <div style={{ fontSize: 13, color: subtle }}>No steps yet.</div>;

    return (
      <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
        {steps.map((s, idx) => (
          <div
            key={`${s.name}-${idx}`}
            style={{
              border: `1px solid ${panelBorder}`,
              borderRadius: 12,
              padding: 10,
              background: panelBg,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, color: pageText }}>
                {s.name}{" "}
                <span
                  style={{
                    fontWeight: 700,
                    color: s.status === "success" ? green : s.status === "error" ? red : subtle,
                  }}
                >
                  {s.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: subtle }}>{s.ms != null ? `${s.ms}ms` : ""}</div>
            </div>
            {s.error ? <div style={{ marginTop: 6, fontSize: 12, color: red }}>{s.error}</div> : null}
          </div>
        ))}
      </div>
    );
  }

  function renderDiffPanel(ds: DiffState, setDs: (next: (p: DiffState) => DiffState) => void) {
    const aLines = ds.aText ? ds.aText.split("\n") : [];
    const bLines = ds.bText ? ds.bText.split("\n") : [];
    const isEqual = ds.status === "ready" && ds.aText && ds.bText ? ds.aText === ds.bText : false;

    const currentIndex0 = ds.diffs.length === 0 ? -1 : ds.diffs[clampPos(ds, ds.pos)] ?? -1;

    const aCtx = buildContext(aLines, currentIndex0, ds.radius);
    const bCtx = buildContext(bLines, currentIndex0, ds.radius);

    const label = diffLabel(ds);

    const canPrev = ds.diffs.length > 0 && ds.pos > 0;
    const canNext = ds.diffs.length > 0 && ds.pos < ds.diffs.length - 1;

    const meta = {
      kind: `${ds.aLabel} vs ${ds.bLabel}`,
      diffPos1: ds.diffs.length === 0 ? 0 : clampPos(ds, ds.pos) + 1,
      diffTotal: ds.diffs.length,
      line1: currentIndex0 >= 0 ? currentIndex0 + 1 : null,
      radius: ds.radius,
    };

    return (
      <div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <button
            onClick={() => setDs((p) => ({ ...p, pos: clampPos(p, p.pos - 1), copyStatus: "" }))}
            disabled={!canPrev}
            style={buttonStyle(false, !canPrev)}
          >
            Prev diff
          </button>

          <button
            onClick={() => setDs((p) => ({ ...p, pos: clampPos(p, p.pos + 1), copyStatus: "" }))}
            disabled={!canNext}
            style={buttonStyle(false, !canNext)}
          >
            Next diff
          </button>

          <div style={{ fontSize: 12, color: pageText }}>
            <b>{label}</b>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: subtle }}>Jump to #</span>
            <input
              value={ds.jumpValue}
              onChange={(e) => setDs((p) => ({ ...p, jumpValue: e.target.value }))}
              style={{ ...inputStyle, width: 90 }}
              inputMode="numeric"
            />
            <button
              onClick={() => setDs((p) => goToDiffNumber(p, p.jumpValue))}
              disabled={ds.diffs.length === 0}
              style={buttonStyle(false, ds.diffs.length === 0)}
            >
              Go
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: subtle }}>Context</span>
            <input
              type="number"
              min={1}
              max={200}
              value={ds.radius}
              onChange={(e) =>
                setDs((p) => ({
                  ...p,
                  radius: Math.max(1, Math.min(200, Number(e.target.value || 20))),
                }))
              }
              style={{ ...inputStyle, width: 90 }}
            />
          </div>

          <button
            onClick={async () => {
              const status = await copyDiffBlock(ds, aCtx, bCtx, meta);
              setDs((p) => ({ ...p, copyStatus: status }));
            }}
            disabled={ds.status !== "ready"}
            style={buttonStyle(false, ds.status !== "ready")}
          >
            Copy diff block
          </button>

          {ds.copyStatus ? <span style={{ fontSize: 12, color: subtle }}>{ds.copyStatus}</span> : null}
        </div>

        {ds.status === "idle" ? (
          <div style={{ fontSize: 13, color: subtle }}>Run the diff to load content.</div>
        ) : ds.status === "loading" ? (
          <div style={{ fontSize: 13, color: subtle }}>Loading…</div>
        ) : ds.status === "error" ? (
          <div style={{ padding: 10, borderRadius: 12, border: "1px solid #fecaca", background: panelBg, color: red }}>
            <b>Error:</b> {ds.error}
          </div>
        ) : isEqual ? (
          <div style={{ padding: 10, borderRadius: 12, border: `1px solid ${panelBorder}`, background: panelBg }}>
            <b>MATCH ✅</b> — {ds.aLabel} and {ds.bLabel} are identical.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 520px", minWidth: 360 }}>
              <div style={{ fontWeight: 900, marginBottom: 6, color: pageText }}>{ds.aLabel} context</div>
              <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 12, padding: 10, background: panelBg }}>
                <pre style={preStyle}>
                  {aCtx.context.map((row) => {
                    const prefix = String(row.n).padStart(6, " ");
                    const mark = row.isCenter ? "▶" : " ";
                    return `${prefix} ${mark} ${row.text}\n`;
                  })}
                </pre>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: subtle }}>
                Showing lines {aCtx.start + 1}–{aCtx.end + 1}
              </div>
            </div>

            <div style={{ flex: "1 1 520px", minWidth: 360 }}>
              <div style={{ fontWeight: 900, marginBottom: 6, color: pageText }}>{ds.bLabel} context</div>
              <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 12, padding: 10, background: panelBg }}>
                <pre style={preStyle}>
                  {bCtx.context.map((row) => {
                    const prefix = String(row.n).padStart(6, " ");
                    const mark = row.isCenter ? "▶" : " ";
                    return `${prefix} ${mark} ${row.text}\n`;
                  })}
                </pre>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: subtle }}>
                Showing lines {bCtx.start + 1}–{bCtx.end + 1}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderGateTable(gs: GateSummary) {
    const statusColor = (s: GateStatus) => (s === "pass" ? green : s === "warn" ? amber : red);

    return (
      <div style={{ display: "grid", gap: 8 }}>
        {gs.gates.map((g) => {
          const isHighlighted = g.id === highlightGateId;
          const border =
            isHighlighted
              ? `2px solid ${g.status === "fail" ? red : amber}`
              : `1px solid ${panelBorder}`;
          const shadow = isHighlighted ? "0 0 0 3px rgba(17,24,39,0.08)" : "none";

          return (
            <div
              key={g.id}
              ref={(el) => {
                gateRowRefs.current[g.id] = el;
              }}
              style={{
                border,
                boxShadow: shadow,
                borderRadius: 12,
                padding: 10,
                background: panelBg,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900, color: pageText }}>
                  {g.label}{" "}
                  <span style={{ color: statusColor(g.status), fontWeight: 900 }}>
                    {g.status.toUpperCase()}
                  </span>
                  {isHighlighted ? (
                    <span style={{ marginLeft: 8, fontSize: 12, color: subtle }}>(focused)</span>
                  ) : null}
                </div>
                <div style={{ fontSize: 12, color: subtle }}>weight: {g.weight}</div>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: pageText }}>{g.detail}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------- Sticky Verdict Bar ----------
  const primary = gatePrimaryReason(gateSummary);
  const stickyVerdict = gateSummary?.verdict || null;

  function stickyBg(verdict: "PASS" | "WARN" | "FAIL" | null) {
    if (!verdict) return "#ffffff";
    return verdict === "PASS" ? "#ecfdf5" : verdict === "WARN" ? "#fffbeb" : "#fef2f2";
  }

  function stickyBorder(verdict: "PASS" | "WARN" | "FAIL" | null) {
    if (!verdict) return panelBorder;
    return verdict === "PASS" ? "#a7f3d0" : verdict === "WARN" ? "#fde68a" : "#fecaca";
  }

  // ---------- UI ----------
  return (
    <div style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui, -apple-system", color: pageText }}>
      {/* STICKY VERDICT BAR (always visible) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          marginBottom: 12,
          borderRadius: 16,
          border: `1px solid ${stickyBorder(stickyVerdict)}`,
          background: stickyBg(stickyVerdict),
          padding: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontWeight: 900, fontSize: 14, color: pageText }}>
              Release Gate
              {projectId ? <span style={{ fontWeight: 800, opacity: 0.65 }}> — {projectId}</span> : null}
            </div>

            {gateSummary ? (
              <span style={badgeStyle(gateSummary.verdict)}>
                {gateSummary.verdict} • {gateSummary.score}/100
              </span>
            ) : (
              <span style={{ fontSize: 12, color: subtle }}>No audit yet — run QA to compute PASS/WARN/FAIL.</span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => {
                setTab("qa");
                runQaAudit().catch(() => {});
              }}
              disabled={!projectId || qaStatus === "running"}
              style={buttonStyle(true, !projectId || qaStatus === "running")}
            >
              {qaStatus === "running" ? "Auditing…" : "Run QA audit"}
            </button>

            <button
              onClick={() => jumpToFirstProblemGate()}
              disabled={!gateSummary || gateSummary.verdict === "PASS"}
              style={buttonStyle(false, !gateSummary || gateSummary.verdict === "PASS")}
            >
              Jump to failing gate
            </button>

            <button
              onClick={() => {
                if (!qaReport || !gateSummary) return;
                copyGateSummary(qaReport, gateSummary).catch(() => {});
              }}
              disabled={!qaReport || !gateSummary}
              style={buttonStyle(false, !qaReport || !gateSummary)}
            >
              Copy gate summary
            </button>

            {gateCopyStatus ? <span style={{ fontSize: 12, color: subtle }}>{gateCopyStatus}</span> : null}
          </div>
        </div>

        {/* Inline primary reason (always shown when we have a gate) */}
        {gateSummary && primary ? (
          <div style={{ marginTop: 10, fontSize: 12, color: pageText }}>
            <b style={{ color: gateSummary.verdict === "PASS" ? green : gateSummary.verdict === "WARN" ? amber : red }}>
              {primary.title}
            </b>
            <span style={{ marginLeft: 8, color: subtle }}>{primary.detail}</span>
          </div>
        ) : null}
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, color: pageText }}>
        Terminal V3 — QA + Publish Audit{" "}
        {projectId ? <span style={{ opacity: 0.7, fontWeight: 800 }}>— {projectId}</span> : null}
      </h1>

      {/* Refresh status */}
      <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 14, padding: 12, marginBottom: 12, background: panelBg }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Refresh status</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 360px" }}>
            <div style={{ fontWeight: 800 }}>Artifacts</div>
            <pre style={preStyle}>{JSON.stringify(lastArtifactsRefresh, null, 2)}</pre>
          </div>
          <div style={{ flex: "1 1 360px" }}>
            <div style={{ fontWeight: 800 }}>Run state</div>
            <pre style={preStyle}>{JSON.stringify(lastRunRefresh, null, 2)}</pre>
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        {/* Pipeline */}
        <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 14, padding: 12, minWidth: 340, flex: "1 1 340px", background: panelBg }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Run preset</div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select value={preset} onChange={(e) => setPreset(e.target.value as any)} style={inputStyle} disabled={isRunning}>
              <option value="seo">seo (seed + seo-v2 + sitemap)</option>
              <option value="full">full (seed + seo-v2 + finish + sitemap)</option>
              <option value="publish">publish (full + auto-publish)</option>
            </select>

            <button onClick={runPreset} disabled={!projectId || isRunning} style={buttonStyle(true, !projectId || isRunning)}>
              {isRunning ? "Running…" : "Run preset"}
            </button>

            <button onClick={() => pollLatestRunOnce(true).catch(() => {})} disabled={!projectId} style={buttonStyle(false, !projectId)}>
              Refresh run state
            </button>

            <button onClick={() => refreshDebugSpec().catch(() => {})} disabled={!projectId} style={buttonStyle(false, !projectId)}>
              Refresh artifacts
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, color: subtle }}>
            Live status: <b style={{ color: pageText }}>{runState?.status ? runState.status : isRunning ? "running" : "unknown"}</b>
          </div>

          {renderRunSteps()}
        </div>

        {/* QA / Gates */}
        <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 14, padding: 12, minWidth: 340, flex: "1 1 340px", background: panelBg }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Release Gate (Publish-grade)</div>

          {/* Inline banner inside the QA panel */}
          {gateSummary && primary ? (
            <div style={{ marginBottom: 10, ...reasonBannerStyle(gateSummary.verdict) }}>
              <div style={{ fontWeight: 900 }}>{gateSummary.verdict} • {gateSummary.score}/100</div>
              <div style={{ marginTop: 4, fontSize: 12 }}>
                <b>{primary.title}</b>
                <span style={{ marginLeft: 8, opacity: 0.8 }}>{primary.detail}</span>
              </div>
              {gateSummary.verdict !== "PASS" ? (
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={jumpToFirstProblemGate} style={buttonStyle(false, false)}>
                    Jump to failing gate
                  </button>
                  <button
                    onClick={() => {
                      if (!qaReport || !gateSummary) return;
                      copyGateSummary(qaReport, gateSummary).catch(() => {});
                    }}
                    style={buttonStyle(false, false)}
                  >
                    Copy gate summary
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ marginBottom: 10, fontSize: 12, color: subtle }}>
              Run QA audit to compute PASS/WARN/FAIL. (This QA uses same-origin fetches; no custom-domain switching.)
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => {
                setTab("qa");
                runQaAudit().catch(() => {});
              }}
              disabled={!projectId || qaStatus === "running"}
              style={buttonStyle(true, !projectId || qaStatus === "running")}
            >
              {qaStatus === "running" ? "Auditing…" : "Run QA audit"}
            </button>

            <button
              onClick={() => {
                setTab("diffHtml");
                runHtmlDiff().catch(() => {});
              }}
              disabled={!projectId || htmlDiff.status === "loading"}
              style={buttonStyle(false, !projectId || htmlDiff.status === "loading")}
            >
              Diff HTML (Gen vs Pub)
            </button>

            <button
              onClick={() => {
                setTab("diffSitemap");
                runSitemapDiff().catch(() => {});
              }}
              disabled={!projectId || sitemapDiff.status === "loading"}
              style={buttonStyle(false, !projectId || sitemapDiff.status === "loading")}
            >
              Diff sitemap (LIVE vs KV)
            </button>

            <button onClick={() => (qaReport ? downloadJson(`${projectId}-qa-audit.json`, qaReport) : null)} disabled={!qaReport} style={buttonStyle(false, !qaReport)}>
              Download audit JSON
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, color: subtle }}>
            QA status: <b style={{ color: pageText }}>{qaStatus}</b>
          </div>

          {/* Gate badge */}
          <div style={{ marginTop: 10 }}>
            {gateSummary ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={badgeStyle(gateSummary.verdict)}>
                  {gateSummary.verdict} • {gateSummary.score}/100
                </span>
                <span style={{ fontSize: 12, color: subtle }}>
                  pass {gateSummary.totals.passCount} • warn {gateSummary.totals.warnCount} • fail {gateSummary.totals.failCount}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: subtle }}>No gate computed yet.</span>
            )}
          </div>

          {/* Gate config */}
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>Gate tuning</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: pageText }}>
                <input type="checkbox" checked={qaConfig.htmlMismatchFail} onChange={(e) => setQaConfig((p) => ({ ...p, htmlMismatchFail: e.target.checked }))} />
                HTML mismatch = FAIL
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: pageText }}>
                <input type="checkbox" checked={qaConfig.sitemapMismatchFail} onChange={(e) => setQaConfig((p) => ({ ...p, sitemapMismatchFail: e.target.checked }))} />
                Sitemap mismatch = FAIL
              </label>

              <span style={{ fontSize: 12, color: subtle }}>Min pages OK %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={qaConfig.minPagesOkPct}
                onChange={(e) => setQaConfig((p) => ({ ...p, minPagesOkPct: Math.max(0, Math.min(100, Number(e.target.value || 100))) }))}
                style={{ ...inputStyle, width: 90 }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: subtle }}>Max pages</span>
              <input
                type="number"
                min={1}
                max={50}
                value={qaConfig.maxPagesToCheck}
                onChange={(e) => setQaConfig((p) => ({ ...p, maxPagesToCheck: Math.max(1, Math.min(50, Number(e.target.value || 12))) }))}
                style={{ ...inputStyle, width: 90 }}
              />

              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: pageText }}>
                <input type="checkbox" checked={qaConfig.require200} onChange={(e) => setQaConfig((p) => ({ ...p, require200: e.target.checked }))} />
                Require 200
              </label>

              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: pageText }}>
                <input type="checkbox" checked={qaConfig.requireTitle} onChange={(e) => setQaConfig((p) => ({ ...p, requireTitle: e.target.checked }))} />
                Require &lt;title&gt;
              </label>

              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: pageText }}>
                <input type="checkbox" checked={qaConfig.requireCanonical} onChange={(e) => setQaConfig((p) => ({ ...p, requireCanonical: e.target.checked }))} />
                Require canonical
              </label>

              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: pageText }}>
                <input type="checkbox" checked={qaConfig.requireRobotsMeta} onChange={(e) => setQaConfig((p) => ({ ...p, requireRobotsMeta: e.target.checked }))} />
                Require robots meta
              </label>
            </div>
          </div>

          {/* QA history */}
          <div style={{ marginTop: 14, borderTop: `1px solid ${panelBorder}`, paddingTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900 }}>QA history (last 10)</div>
              <button onClick={clearHistory} disabled={!projectId || qaHistory.length === 0} style={buttonStyle(false, !projectId || qaHistory.length === 0)}>
                Clear history
              </button>
            </div>

            {qaHistory.length === 0 ? (
              <div style={{ marginTop: 8, fontSize: 12, color: subtle }}>No saved audits yet. Run QA to create history.</div>
            ) : (
              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {qaHistory.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => loadHistoryItem(h)}
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderRadius: 12,
                      border: `1px solid ${h.id === qaHistorySelectedId ? darkBg : panelBorder}`,
                      background: panelBg,
                      cursor: "pointer",
                      color: pageText,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900 }}>
                        {h.verdict} • {h.score}/100
                      </div>
                      <div style={{ fontSize: 12, color: subtle }}>{h.atIso}</div>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: subtle }}>
                      pages {h.summary?.pagesOk}/{h.summary?.pagesChecked} ok • htmlMatch {String(h.summary?.htmlMatch)} • sitemapMatch {String(h.summary?.sitemapMatch)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 14, padding: 12, background: panelBg }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <button onClick={() => setTab("qa")} style={pillStyle(tab === "qa")}>
            QA report
          </button>
          <button onClick={() => setTab("diffHtml")} style={pillStyle(tab === "diffHtml")}>
            HTML diff
          </button>
          <button onClick={() => setTab("diffSitemap")} style={pillStyle(tab === "diffSitemap")}>
            Sitemap diff
          </button>
          <button onClick={() => setTab("raw")} style={pillStyle(tab === "raw")}>
            Raw output
          </button>
        </div>

        {tab === "raw" ? (
          <textarea readOnly value={JSON.stringify(output, null, 2)} style={textareaStyle} />
        ) : tab === "diffHtml" ? (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button onClick={() => runHtmlDiff().catch(() => {})} disabled={!projectId || htmlDiff.status === "loading"} style={buttonStyle(true, !projectId || htmlDiff.status === "loading")}>
                {htmlDiff.status === "loading" ? "Loading…" : "Run HTML diff"}
              </button>
              <button onClick={() => (htmlDiff.aText ? downloadText(`${projectId}-generated.html`, htmlDiff.aText) : null)} disabled={!htmlDiff.aText} style={buttonStyle(false, !htmlDiff.aText)}>
                Download Generated
              </button>
              <button onClick={() => (htmlDiff.bText ? downloadText(`${projectId}-published.html`, htmlDiff.bText) : null)} disabled={!htmlDiff.bText} style={buttonStyle(false, !htmlDiff.bText)}>
                Download Published
              </button>
            </div>

            {renderDiffPanel(htmlDiff, (updater) => setHtmlDiff(updater))}
          </div>
        ) : tab === "diffSitemap" ? (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button onClick={() => runSitemapDiff().catch(() => {})} disabled={!projectId || sitemapDiff.status === "loading"} style={buttonStyle(true, !projectId || sitemapDiff.status === "loading")}>
                {sitemapDiff.status === "loading" ? "Loading…" : "Run sitemap diff"}
              </button>
              <button onClick={() => (sitemapDiff.aText ? downloadText(`${projectId}-sitemap-live.xml`, sitemapDiff.aText) : null)} disabled={!sitemapDiff.aText} style={buttonStyle(false, !sitemapDiff.aText)}>
                Download LIVE
              </button>
              <button onClick={() => (sitemapDiff.bText ? downloadText(`${projectId}-sitemap-kv.xml`, sitemapDiff.bText) : null)} disabled={!sitemapDiff.bText} style={buttonStyle(false, !sitemapDiff.bText)}>
                Download KV
              </button>
            </div>

            {renderDiffPanel(sitemapDiff, (updater) => setSitemapDiff(updater))}
          </div>
        ) : (
          <div>
            {/* Inline banner at top of QA report too */}
            {gateSummary && primary ? (
              <div style={{ marginBottom: 12, ...reasonBannerStyle(gateSummary.verdict) }}>
                <div style={{ fontWeight: 900 }}>Release Gate — {gateSummary.verdict} • {gateSummary.score}/100</div>
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  <b>{primary.title}</b>
                  <span style={{ marginLeft: 8, opacity: 0.8 }}>{primary.detail}</span>
                </div>
                {gateSummary.verdict !== "PASS" ? (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={jumpToFirstProblemGate} style={buttonStyle(false, false)}>
                      Jump to failing gate
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {qaStatus === "idle" ? (
              <div style={{ fontSize: 13, color: subtle }}>Click <b>Run QA audit</b> to generate a release gate verdict.</div>
            ) : qaStatus === "running" ? (
              <div style={{ fontSize: 13, color: subtle }}>Running QA…</div>
            ) : qaStatus === "error" ? (
              <div style={{ padding: 10, borderRadius: 12, border: "1px solid #fecaca", background: panelBg, color: red }}>
                <b>QA error:</b> {qaError}
              </div>
            ) : !qaReport ? (
              <div style={{ fontSize: 13, color: subtle }}>No report.</div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {/* Release gate details */}
                {gateSummary ? (
                  <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 12, padding: 10, background: panelBg }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 900 }}>Release Gate</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={badgeStyle(gateSummary.verdict)}>
                          {gateSummary.verdict} • {gateSummary.score}/100
                        </span>
                        <span style={{ fontSize: 12, color: subtle }}>
                          pass {gateSummary.totals.passCount} • warn {gateSummary.totals.warnCount} • fail {gateSummary.totals.failCount}
                        </span>
                      </div>
                    </div>

                    {/* Gate rows (scroll targets) */}
                    <div style={{ marginTop: 10 }}>{renderGateTable(gateSummary)}</div>
                  </div>
                ) : null}

                <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 12, padding: 10, background: panelBg }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Summary</div>
                  <pre style={preStyle}>{JSON.stringify(qaReport.summary, null, 2)}</pre>
                </div>

                <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 12, padding: 10, background: panelBg }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Artifacts</div>
                  <pre style={preStyle}>{JSON.stringify(qaReport.artifacts, null, 2)}</pre>
                </div>

                <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 12, padding: 10, background: panelBg }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Diff checks</div>
                  <pre style={preStyle}>{JSON.stringify(qaReport.diffs, null, 2)}</pre>
                </div>

                <div style={{ border: `1px solid ${panelBorder}`, borderRadius: 12, padding: 10, background: panelBg }}>
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>Pages</div>
                  <pre style={preStyle}>{JSON.stringify(qaReport.pages, null, 2)}</pre>
                </div>

                <div style={{ fontSize: 12, color: subtle }}>
                  Tip: If gate FAIL is caused by HTML/Sitemap mismatch, open the diff tabs to inspect exact deltas.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: subtle }}>
        Batch shipped: sticky verdict + inline reason banner + auto-scroll + highlight + jump-to-failing-gate (terminal.tsx only).
      </div>
    </div>
  );
}
