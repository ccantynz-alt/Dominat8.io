#!/usr/bin/env node
/**
 * D8 Self-Healing Build Script
 * Tier 1: Deterministic fixes for known failure patterns.
 * Runs before (or after) `npm run build` in CI.
 *
 * Exit 0  = fixes applied (or nothing needed)
 * Exit 1  = unrecoverable / needs AI tier
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const LOG_PREFIX = "[heal]";

let fixCount = 0;

function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

function fix(description, filePath, newContent) {
  fs.writeFileSync(filePath, newContent, "utf8");
  log(`FIXED [${description}]: ${filePath}`);
  fixCount++;
}

// ─── 1. Detect PowerShell scripts masquerading as .tsx/.ts files ─────────────
function isPowerShell(content) {
  return (
    content.trimStart().startsWith("#requires") ||
    content.trimStart().startsWith("Set-StrictMode") ||
    content.trimStart().startsWith("param(") ||
    /^\$\w+\s*=/.test(content.trimStart())
  );
}

function inferReExport(filePath) {
  // app/tv/page.tsx  →  ../../src/app/tv/page
  // app/layout.tsx   →  ../src/app/layout
  const rel = path.relative(ROOT, filePath);
  const parts = rel.replace(/\\/g, "/").split("/");

  // If it's under app/ (root level proxy), point at src/app/
  if (parts[0] === "app") {
    const srcPath = ["src", ...parts].join("/").replace(/\.(tsx?|jsx?)$/, "");
    const depth = parts.length - 1; // number of directories
    const prefix = "../".repeat(depth);
    return `export { default } from "${prefix}${srcPath}";\n`;
  }

  // Otherwise we can't auto-infer — return null and let AI handle it
  return null;
}

function scanForPowerShellCorruption(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      scanForPowerShellCorruption(full);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      const content = fs.readFileSync(full, "utf8");
      if (isPowerShell(content)) {
        const reexport = inferReExport(full);
        if (reexport) {
          fix("PS_CORRUPTION→RE_EXPORT", full, reexport);
        } else {
          log(`WARN: PS corruption in ${full} but can't infer re-export. Needs manual fix.`);
        }
      }
    }
  }
}

// ─── 2. Detect pages/ ↔ app/ conflicts ───────────────────────────────────────
function fixRouterConflicts() {
  const pagesDir = path.join(ROOT, "pages");
  const appDir = path.join(ROOT, "app");
  const srcAppDir = path.join(ROOT, "src", "app");

  if (!fs.existsSync(pagesDir)) return;

  function getAppRoutes(dir, base = "") {
    const routes = new Set();
    if (!fs.existsSync(dir)) return routes;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        for (const r of getAppRoutes(full, base + "/" + entry.name)) {
          routes.add(r);
        }
      } else if (entry.name === "page.tsx" || entry.name === "page.ts" || entry.name === "page.jsx") {
        routes.add(base || "/");
      }
    }
    return routes;
  }

  const appRoutes = new Set([
    ...getAppRoutes(appDir),
    ...getAppRoutes(srcAppDir),
  ]);

  function scanPages(dir, base = "") {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanPages(full, base + "/" + entry.name);
      } else if (/\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.startsWith("_") && !entry.name.startsWith(".")) {
        const route = base + "/" + entry.name.replace(/\.(tsx?|jsx?)$/, "");
        const normalized = route.replace(/\/index$/, "") || "/";
        if (appRoutes.has(normalized) || appRoutes.has("/" + entry.name.replace(/\.(tsx?|jsx?)$/, ""))) {
          const disabledPath = full + ".disabled";
          fs.renameSync(full, disabledPath);
          log(`FIXED [ROUTER_CONFLICT]: moved ${full} → ${disabledPath}`);
          fixCount++;
        }
      }
    }
  }

  scanPages(pagesDir);
}

// ─── 3. Verify re-export shims in root app/ point to valid files ──────────────
function verifyAppShims() {
  const appDir = path.join(ROOT, "app");
  if (!fs.existsSync(appDir)) return;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/page\.(tsx?|jsx?)$/.test(entry.name)) {
        const content = fs.readFileSync(full, "utf8");
        // Check it's a re-export shim and resolve target
        const m = content.match(/from\s+"([^"]+)"/);
        if (m) {
          const target = path.resolve(path.dirname(full), m[1]);
          const candidates = [target, target + ".tsx", target + ".ts", target + ".jsx"];
          const exists = candidates.some(fs.existsSync);
          if (!exists) {
            log(`WARN: Shim ${full} points to missing target: ${m[1]}`);
          }
        }
      }
    }
  }
  walk(appDir);
}

// ─── Run all fixers ───────────────────────────────────────────────────────────
log("Starting deterministic self-heal...");

scanForPowerShellCorruption(path.join(ROOT, "app"));
scanForPowerShellCorruption(path.join(ROOT, "src"));
fixRouterConflicts();
verifyAppShims();

if (fixCount > 0) {
  log(`Applied ${fixCount} fix(es). Re-run build to verify.`);
} else {
  log("No deterministic fixes needed.");
}
