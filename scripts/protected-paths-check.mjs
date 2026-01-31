/**
 * Protected Paths Guardrail
 * Fails CI if protected areas change unless ALLOW_PROTECTED_PATHS=1.
 */
import { execSync } from "node:child_process";

const allow = process.env.ALLOW_PROTECTED_PATHS === "1";

const protectedPrefixes = [
  "src/app/api/",
  "src/lib/engine/",
  "src/middleware.ts",
  "middleware.ts",
  "src/app/_client/FallbackStyles.tsx",
];

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] }).toString("utf8");
}

function getChangedFiles(base, head) {
  const out = run(`git diff --name-only ${base} ${head}`);
  return out.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

function isProtected(path) {
  for (const p of protectedPrefixes) {
    if (p.endsWith("/")) { if (path.startsWith(p)) return true; }
    else { if (path === p) return true; }
  }
  return false;
}

function main() {
  const base = process.env.GITHUB_BASE_SHA || process.env.BASE_SHA;
  const head = process.env.GITHUB_HEAD_SHA || process.env.HEAD_SHA;

  if (!base || !head) {
    console.log("[protected-paths] No base/head SHA detected; skipping (non-PR context).");
    return;
  }

  const changed = getChangedFiles(base, head);
  const hit = changed.filter(isProtected);

  if (hit.length === 0) {
    console.log("[protected-paths] OK: no protected paths modified.");
    return;
  }

  if (allow) {
    console.log("[protected-paths] ALLOW_PROTECTED_PATHS=1 set; allowing protected changes:");
    for (const f of hit) console.log("  - " + f);
    return;
  }

  console.error("[protected-paths] BLOCKED: protected paths modified.");
  console.error("To allow for a deliberate change, include [ALLOW_PROTECTED] in PR title.");
  for (const f of hit) console.error("  - " + f);
  process.exit(2);
}
main();