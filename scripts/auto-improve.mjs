#!/usr/bin/env node
/**
 * Auto-improve: deterministic improvements to win best-in-class.
 * Does NOT touch: home page (Gold Fog), icon/opengraph, Builder UI.
 * Run as part of overnight or standalone: node scripts/auto-improve.mjs
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const SRC_APP = path.join(ROOT, "src", "app");
const LOG_PREFIX = "[auto-improve]";

// Paths we never modify (home, Gold Fog, icons, Builder)
const DO_NOT_TOUCH = new Set([
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/app/loading.tsx",
  "src/app/error.tsx",
  "src/app/not-found.tsx",
  "src/app/icon.tsx",
  "src/app/apple-icon.tsx",
  "src/app/opengraph-image.tsx",
  "src/app/twitter-image.tsx",
  "src/components/GoldFogPageLayout.tsx",
]);
const DO_NOT_TOUCH_PREFIXES = ["src/io/", "src/app/page.tsx"];

function rel(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function shouldNotTouch(filePath) {
  const r = rel(filePath);
  if (DO_NOT_TOUCH.has(r)) return true;
  if (DO_NOT_TOUCH_PREFIXES.some((pre) => r.startsWith(pre))) return true;
  try {
    const content = fs.readFileSync(filePath, "utf8").slice(0, 600);
    if (content.includes("GoldFog") || content.includes("gold-fog") || content.includes("RocketCockpit")) return true;
  } catch {}
  return false;
}

function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

function writeFileSafe(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  log("Wrote", rel(filePath));
}

let changeCount = 0;

// ─── 1. Cockpit layout (metadata for all cockpit pages) ─────────────────────
function ensureCockpitLayout() {
  const layoutPath = path.join(SRC_APP, "cockpit", "layout.tsx");
  if (fs.existsSync(layoutPath)) return;
  writeFileSafe(
    layoutPath,
    `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cockpit — Dominat8.io",
  description: "Deploy, domains, SSL, and settings for your AI-built sites.",
  robots: { index: false, follow: false },
};

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`
  );
  changeCount++;
}

// ─── 2. Templates layout (metadata for SEO; page is client) ──────────────────
function ensureTemplatesLayout() {
  const layoutPath = path.join(SRC_APP, "templates", "layout.tsx");
  if (fs.existsSync(layoutPath)) return;
  writeFileSafe(
    layoutPath,
    `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates — Dominat8.io",
  description: "Start from a template. Describe your business, we generate a world-class website.",
  openGraph: { title: "Templates — Dominat8.io", description: "Start from a template. We generate a world-class website." },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`
  );
  changeCount++;
}

// ─── 3. Cockpit loading (minimal, on-brand) ─────────────────────────────────
function ensureCockpitLoading() {
  const loadingPath = path.join(SRC_APP, "cockpit", "loading.tsx");
  if (fs.existsSync(loadingPath)) return;
  writeFileSafe(
    loadingPath,
    `export default function CockpitLoading() {
  return (
    <div style={{ minHeight: "60vh", background: "#06080e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid rgba(61,240,255,0.25)", borderTopColor: "rgba(61,240,255,0.9)", animation: "d8-spin 0.8s linear infinite" }} />
      <style dangerouslySetInnerHTML={{ __html: "@keyframes d8-spin { to { transform: rotate(360deg); } }" }} />
    </div>
  );
}
`
  );
  changeCount++;
}

// ─── 4. Templates loading ───────────────────────────────────────────────────
function ensureTemplatesLoading() {
  const loadingPath = path.join(SRC_APP, "templates", "loading.tsx");
  if (fs.existsSync(loadingPath)) return;
  writeFileSafe(
    loadingPath,
    `export default function TemplatesLoading() {
  return (
    <div style={{ minHeight: "60vh", background: "#06080e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid rgba(61,240,255,0.25)", borderTopColor: "rgba(61,240,255,0.9)", animation: "d8-spin 0.8s linear infinite" }} />
      <style dangerouslySetInnerHTML={{ __html: "@keyframes d8-spin { to { transform: rotate(360deg); } }" }} />
    </div>
  );
}
`
  );
  changeCount++;
}

// ─── 5. Lint (fix where supported) ──────────────────────────────────────────
function runLintFix() {
  try {
    execSync("npm run lint", { cwd: ROOT, stdio: "pipe" });
    log("Lint completed.");
  } catch (e) {
    log("Lint had issues (non-fatal).");
  }
}

// ─── 6. Report ──────────────────────────────────────────────────────────────
function writeReport() {
  const reportPath = path.join(ROOT, "overnight-improvements.log");
  const line = [new Date().toISOString(), "auto-improve completed.", "Changes:", changeCount].join(" ");
  fs.appendFileSync(reportPath, line + "\n", "utf8");
  log("Report appended to", reportPath);
}

// ─── Main ───────────────────────────────────────────────────────────────────
log("Starting (do not touch: home, Gold Fog, icons, Builder).");
ensureCockpitLayout();
ensureTemplatesLayout();
ensureCockpitLoading();
ensureTemplatesLoading();
runLintFix();
writeReport();
log("Done. Changes applied:", changeCount);
