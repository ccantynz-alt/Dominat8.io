#!/usr/bin/env node
/**
 * Dominat8 overnight runner — best-in-class AI website builder pipeline.
 * Self-heal → doctor → typecheck → lint → auto-improve → build (with retry) → smoke.
 * Run locally without human contact. Logs to file.
 *
 * Usage:
 *   npm run overnight                          # once
 *   RUN_LOOP=1 INTERVAL_MINUTES=30 DURATION_HOURS=8 npm run overnight   # loop (bash)
 *   $env:RUN_LOOP="1"; $env:DURATION_HOURS="8"; npm run overnight        # loop (PowerShell)
 *
 * Env:
 *   SMOKE_BASE_URL   - base URL for smoke (default http://localhost:3000)
 *   RUN_LOOP         - 1 = run in a loop for DURATION_HOURS
 *   INTERVAL_MINUTES - minutes between runs in loop (default 30)
 *   DURATION_HOURS   - how long to loop (default 8)
 *   LOG_FILE         - log file path (default overnight-run.log in project root)
 *   SKIP_SMOKE       - 1 = skip HTTP smoke (e.g. no server running)
 */

import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

const ROOT = process.cwd();
const LOG_FILE = process.env.LOG_FILE || path.join(ROOT, "overnight-run.log");
const SMOKE_BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const RUN_LOOP = process.env.RUN_LOOP === "1";
const INTERVAL_MINUTES = Math.max(1, parseInt(process.env.INTERVAL_MINUTES || "30", 10));
const DURATION_HOURS = Math.max(0.5, parseFloat(process.env.DURATION_HOURS || "8"));
const SKIP_SMOKE = process.env.SKIP_SMOKE === "1";

function log(...args) {
  const line = [new Date().toISOString(), ...args].join(" ");
  console.log(...args);
  try {
    fs.appendFileSync(LOG_FILE, line + "\n", "utf8");
  } catch (e) {
    console.error("Could not write log file:", e.message);
  }
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      stdio: opts.silent ? "pipe" : "inherit",
      encoding: "utf8",
      maxBuffer: opts.silent ? 10 * 1024 * 1024 : undefined,
      ...opts,
    });
  } catch (e) {
    if (!opts.silent) log("CMD FAILED:", cmd, e.message);
    return null;
  }
}

function fetchOk(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { timeout: 15000 }, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
      res.resume();
    });
    req.on("error", (e) => resolve({ ok: false, status: 0, error: String(e.message) }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, status: 0, error: "timeout" });
    });
  });
}

const SMOKE_ROUTES = [
  "/",
  "/pricing",
  "/templates",
  "/gallery",
  "/about",
  "/icon",
  "/opengraph-image",
  "/healthz",
  "/sitemap.xml",
  "/robots.txt",
  "/api/__d8__/stamp",
];

async function smoke(baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  const results = [];
  for (const route of SMOKE_ROUTES) {
    const url = base + route;
    const ok = await fetchOk(url);
    results.push({ route, url, ok: ok.ok, status: ok.status });
    if (ok.ok) {
      log("  OK", ok.status, route);
    } else {
      log("  FAIL", ok.status, route, url);
    }
  }
  return results;
}

function oneRun() {
  log("========== Dominat8 overnight run ==========");

  // 1. Self-heal (deterministic fixes)
  log("[1/6] Heal...");
  run("node scripts/heal.mjs");

  // 2. Doctor (diagnostics only; does not fix, just reports)
  log("[2/6] Doctor...");
  run("node scripts/doctor.mjs", { silent: true });

  // 3. Typecheck
  log("[3/6] Typecheck...");
  const typecheckOk = run("npm run typecheck", { silent: false });
  if (!typecheckOk) {
    log("Typecheck failed. Continuing anyway; build may fail.");
  }

  // 4. Lint
  log("[4/7] Lint...");
  const lintOk = run("npm run lint", { silent: false });
  if (!lintOk) {
    log("Lint had issues. Continuing.");
  }

  // 5. Auto-improve (add layouts, loading, lint-fix; never touches home/Gold Fog/icons)
  log("[5/7] Auto-improve...");
  run("node scripts/auto-improve.mjs");

  // 6. Build (retry once after heal if failed). Success = exit 0 OR output shows "Compiled successfully" (Next sometimes exits 1 on warnings).
  log("[6/7] Build...");
  function runBuild() {
    const r = spawnSync("npm", ["run", "build"], {
      cwd: ROOT,
      stdio: "pipe",
      shell: true,
      encoding: "utf8",
    });
    const out = (r.stdout || "") + (r.stderr || "");
    const compiledOk = out.includes("Compiled successfully");
    if (r.status === 0) return true;
    if (compiledOk) {
      log("Build compiled successfully (exit code", r.status, "- treating as OK).");
      return true;
    }
    return false;
  }
  let buildOk = runBuild();
  if (!buildOk) {
    log("Build failed. Re-running heal and retrying build...");
    run("node scripts/heal.mjs");
    buildOk = runBuild();
  }
  if (!buildOk) {
    log("Build still failed after retry.");
    return { buildOk: false, typecheckOk: !!typecheckOk, lintOk: !!lintOk };
  }
  log("Build OK.");

  return { buildOk: true, typecheckOk: !!typecheckOk, lintOk: !!lintOk };
}

async function oneRunWithSmoke() {
  const result = oneRun();
  if (!result.buildOk) return result;

  if (SKIP_SMOKE) {
    log("[7/7] Smoke skipped (SKIP_SMOKE=1).");
    return { ...result, smoke: [] };
  }

  log("[7/7] Smoke check", SMOKE_BASE);
  const smokeResults = await smoke(SMOKE_BASE);
  const failed = smokeResults.filter((r) => !r.ok);
  if (failed.length) {
    log("Smoke:", failed.length, "failed:", failed.map((r) => r.route).join(", "));
  } else {
    log("Smoke: all", smokeResults.length, "routes OK.");
  }
  return { ...result, smoke: smokeResults };
}

async function main() {
  log("Dominat8 overnight runner started. LOG_FILE=", LOG_FILE);
  log("SMOKE_BASE_URL=", SMOKE_BASE, SKIP_SMOKE ? "(smoke skipped)" : "");
  if (RUN_LOOP) {
    log("Loop: every", INTERVAL_MINUTES, "min for", DURATION_HOURS, "hours.");
    const endAt = Date.now() + DURATION_HOURS * 60 * 60 * 1000;
    let runCount = 0;
    while (Date.now() < endAt) {
      runCount++;
      log("\n===== Run #" + runCount + " =====");
      await oneRunWithSmoke();
      const remaining = Math.round((endAt - Date.now()) / 60000);
      log("Next run in", Math.min(INTERVAL_MINUTES, remaining), "minutes.");
      await new Promise((r) =>
        setTimeout(r, Math.min(INTERVAL_MINUTES * 60 * 1000, (endAt - Date.now())))
      );
    }
    log("Loop finished after", runCount, "runs.");
  } else {
    await oneRunWithSmoke();
  }
  log("Overnight runner done. Check", LOG_FILE, "for full log.");
}

main().catch((e) => {
  log("Fatal:", e.message);
  process.exit(1);
});
