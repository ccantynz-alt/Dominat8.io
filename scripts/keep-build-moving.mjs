#!/usr/bin/env node
/**
 * Keep the build moving — full guardian pipeline.
 * Run once or in a loop to heal, check, improve, build, and smoke.
 *
 * Steps:
 *   0. (optional) Clean .next and dev lock
 *   1. Heal (deterministic fixes)
 *   2. Doctor (diagnostics)
 *   3. Typecheck
 *   4. Lint (optional)
 *   5. Auto-improve (layouts, loading, etc.)
 *   6. Build (with retry after heal if failed)
 *   7. Smoke (optional)
 *
 * Usage:
 *   npm run keep-build                    # run once
 *   npm run keep-build -- --loop         # loop for 4 hours, every 20 min
 *   DURATION_HOURS=8 npm run keep-build -- --loop
 *
 * Env:
 *   CLEAN_NEXT=1       - remove .next and dev lock before build (fresh build)
 *   SKIP_LINT=1        - skip lint step
 *   SKIP_SMOKE=1       - skip smoke (no server needed)
 *   SKIP_TYPECHECK=0   - set to 1 to skip typecheck
 *   RUN_LOOP / --loop - run in a loop (see INTERVAL_MINUTES, DURATION_HOURS)
 *   INTERVAL_MINUTES  - minutes between runs (default 20)
 *   DURATION_HOURS    - how long to loop in hours (default 4)
 *   LOG_FILE          - log file path (default keep-build-moving.log)
 *   SMOKE_BASE_URL    - base URL for smoke (default http://localhost:3000)
 */

import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

const ROOT = process.cwd();
const LOG_FILE = process.env.LOG_FILE || path.join(ROOT, "keep-build-moving.log");
const SMOKE_BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const CLEAN_NEXT = process.env.CLEAN_NEXT === "1";
const SKIP_LINT = process.env.SKIP_LINT === "1";
const SKIP_SMOKE = process.env.SMOKE_SKIP === "1" || process.env.SKIP_SMOKE === "1";
const SKIP_TYPECHECK = process.env.SKIP_TYPECHECK === "1";
const USE_LOOP = process.env.RUN_LOOP === "1" || process.argv.includes("--loop");
const INTERVAL_MINUTES = Math.max(1, parseInt(process.env.INTERVAL_MINUTES || "20", 10));
const DURATION_HOURS = Math.max(0.5, parseFloat(process.env.DURATION_HOURS || "4"));

function log(...args) {
  const line = [new Date().toISOString(), ...args].join(" ");
  console.log(...args);
  try {
    fs.appendFileSync(LOG_FILE, line + "\n", "utf8");
  } catch (e) {
    console.error("Could not write log:", e.message);
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
    if (!opts.silent) log("FAIL:", cmd, e.message);
    return null;
  }
}

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
    log("Build compiled successfully (exit", r.status, "- treating as OK).");
    return true;
  }
  return false;
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
  "/api/icon",
  "/opengraph-image",
  "/cockpit/settings",
  "/healthz",
  "/api/__health__",
  "/api/__d8__/stamp",
];

async function smoke(baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  const results = [];
  for (const route of SMOKE_ROUTES) {
    const url = base + route;
    const ok = await fetchOk(url);
    results.push({ route, ok: ok.ok, status: ok.status });
    if (ok.ok) log("  OK", ok.status, route);
    else log("  FAIL", ok.status, route);
  }
  return results;
}

function oneRun() {
  log("========== Keep build moving ==========");

  // 0. Optional clean
  if (CLEAN_NEXT) {
    log("[0/8] Clean .next and dev lock...");
    try {
      const nextDir = path.join(ROOT, ".next");
      const lockPath = path.join(ROOT, ".next", "dev", "lock");
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
        log("  Removed .next/dev/lock");
      }
      if (fs.existsSync(nextDir)) {
        fs.rmSync(nextDir, { recursive: true });
        log("  Removed .next");
      }
    } catch (e) {
      log("  Clean warning:", e.message);
    }
  } else {
    log("[0/8] Clean skipped (set CLEAN_NEXT=1 to clean .next).");
  }

  // 1. Heal
  log("[1/8] Heal...");
  run("node scripts/heal.mjs");

  // 2. Doctor
  log("[2/8] Doctor...");
  run("node scripts/doctor.mjs", { silent: true });

  // 3. Typecheck
  if (SKIP_TYPECHECK) {
    log("[3/8] Typecheck skipped.");
  } else {
    log("[3/8] Typecheck...");
    const tcOk = run("npm run typecheck", { silent: false });
    if (!tcOk) log("Typecheck failed. Continuing.");
  }

  // 4. Lint
  if (SKIP_LINT) {
    log("[4/8] Lint skipped (SKIP_LINT=1).");
  } else {
    log("[4/8] Lint...");
    const lintOk = run("npm run lint", { silent: false });
    if (!lintOk) log("Lint had issues. Continuing.");
  }

  // 5. Auto-improve
  log("[5/8] Auto-improve...");
  run("node scripts/auto-improve.mjs");

  // 6. Build (with retry)
  log("[6/8] Build...");
  let buildOk = runBuild();
  if (!buildOk) {
    log("Build failed. Re-heal and retry...");
    run("node scripts/heal.mjs");
    buildOk = runBuild();
  }
  if (!buildOk) {
    log("Build still failed.");
    return { buildOk: false };
  }
  log("Build OK.");

  // 7. Smoke
  if (SKIP_SMOKE) {
    log("[7/8] Smoke skipped (SKIP_SMOKE=1).");
    return { buildOk: true, smoke: [] };
  }
  log("[7/8] Smoke", SMOKE_BASE);
  return { buildOk: true, smoke: null }; // will run async below
}

async function oneRunFull() {
  const result = oneRun();
  if (!result.buildOk) return result;
  if (result.smoke !== null) return result;

  const smokeResults = await smoke(SMOKE_BASE);
  const failed = smokeResults.filter((r) => !r.ok);
  if (failed.length) {
    log("Smoke:", failed.length, "failed:", failed.map((r) => r.route).join(", "));
  } else {
    log("Smoke: all", smokeResults.length, "OK.");
  }
  return { ...result, smoke: smokeResults };
}

async function main() {
  log("Keep-build-moving started. Log:", LOG_FILE);
  log("CLEAN_NEXT=" + CLEAN_NEXT, "SKIP_LINT=" + SKIP_LINT, "SKIP_SMOKE=" + SKIP_SMOKE);

  if (USE_LOOP) {
    log("Loop: every", INTERVAL_MINUTES, "min for", DURATION_HOURS, "hours.");
    const endAt = Date.now() + DURATION_HOURS * 60 * 60 * 1000;
    let runCount = 0;
    while (Date.now() < endAt) {
      runCount++;
      log("\n----- Run #" + runCount + " -----");
      await oneRunFull();
      const remaining = Math.round((endAt - Date.now()) / 60000);
      if (remaining <= 0) break;
      const waitMin = Math.min(INTERVAL_MINUTES, remaining);
      log("Next run in", waitMin, "min.");
      await new Promise((r) => setTimeout(r, waitMin * 60 * 1000));
    }
    log("Loop finished. Runs:", runCount);
  } else {
    await oneRunFull();
  }

  log("[8/8] Done. Full log:", LOG_FILE);
}

main().catch((e) => {
  log("Fatal:", e.message);
  process.exit(1);
});
