#!/usr/bin/env node
/**
 * Run the finish pipeline in a loop for 1 hour (heal → typecheck → lint → auto-improve → build).
 * No server needed (smoke skipped). Start this and go — check overnight-run.log when you're back.
 *
 * Usage: npm run finish:1h
 */

import { spawnSync } from "child_process";

const env = {
  ...process.env,
  RUN_LOOP: "1",
  DURATION_HOURS: "1",
  INTERVAL_MINUTES: "15",
  SKIP_SMOKE: "1",
};

console.log("Starting 1-hour finish run (every 15 min, no smoke). Log: overnight-run.log\n");

const r = spawnSync("node", ["scripts/overnight-run.mjs"], {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
});

process.exit(r.status ?? 1);
