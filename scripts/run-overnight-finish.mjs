#!/usr/bin/env node
/**
 * Run the full “finish the site” pipeline in a loop overnight (default 8 hours, every 20 min).
 * Skips smoke (no server) and lint (known next lint quirk). Logs to keep-build-moving.log.
 *
 * Usage: npm run finish:overnight
 * Env:   DURATION_HOURS=8 INTERVAL_MINUTES=20 (defaults)
 */

import { spawnSync } from "child_process";

const env = {
  ...process.env,
  RUN_LOOP: "1",
  DURATION_HOURS: process.env.DURATION_HOURS || "8",
  INTERVAL_MINUTES: process.env.INTERVAL_MINUTES || "20",
  SKIP_SMOKE: "1",
  SKIP_LINT: "1",
};

console.log(
  "Starting overnight finish run (every " +
    env.INTERVAL_MINUTES +
    " min for " +
    env.DURATION_HOURS +
    " h, no smoke/lint). Log: keep-build-moving.log\n"
);

const r = spawnSync("node", ["scripts/keep-build-moving.mjs", "--loop"], {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
});

process.exit(r.status ?? 1);
