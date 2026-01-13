// scripts/doctor.mjs
// Repo doctor: scans for common Next.js routing traps that cause /api/* to return HTML.

import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function read(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function walk(dir) {
  const out = [];
  if (!exists(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

function printSection(title) {
  console.log("\n" + "=".repeat(78));
  console.log(title);
  console.log("=".repeat(78));
}

function findFiles(patternFn) {
  const all = walk(ROOT);
  return all.filter((p) => patternFn(rel(p)));
}

function showList(label, files, limit = 250) {
  console.log(`\n${label}: ${files.length}`);
  for (const f of files.slice(0, limit)) console.log(" -", f);
  if (files.length > limit) console.log(` ... +${files.length - limit} more`);
}

function containsText(filePath, needle) {
  const txt = read(filePath);
  return txt.includes(needle);
}

function isIgnored(p) {
  return (
    p.includes("/node_modules/") ||
    p.includes("/.next/") ||
    p.includes("/dist/") ||
    p.includes("/.git/") ||
    p.includes("/.vercel/") ||
    p.includes("/out/")
  );
}

function apiTreeReport(base) {
  const basePrefix = base.endsWith("/") ? base : base + "/";
  const pageExts = [".tsx", ".jsx", ".ts", ".js"];

  const pages = findFiles((p) =>
    p.startsWith(basePrefix) &&
    p.includes("/api/") &&
    pageExts.some((ext) => p.endsWith(`/page${ext}`))
  );

  const layouts = findFiles((p) =>
    p.startsWith(basePrefix) &&
    p.includes("/api/") &&
    pageExts.some((ext) => p.endsWith(`/layout${ext}`))
  );

  const catchAll = findFiles((p) =>
    p.startsWith(basePrefix) &&
    p.includes("/api/") &&
    (p.includes("[...") || p.includes("[[..."))
  );

  const routes = findFiles((p) =>
    p.startsWith(basePrefix) && p.includes("/api/") && p.endsWith("/route.ts")
  );

  return { pages, layouts, catchAll, routes };
}

(async function main() {
  printSection("1) Middleware files (conflicts)");
  const mwRoot = exists(path.join(ROOT, "middleware.ts")) ? "middleware.ts" : null;
  const mwSrc = exists(path.join(ROOT, "src/middleware.ts")) ? "src/middleware.ts" : null;
  console.log("Found:", { mwRoot, mwSrc });
  if (mwRoot && mwSrc) {
    console.log(
      "\n⚠️ BOTH exist. Keep only ONE long-term.\n" +
        "Having both commonly causes '/api/* is acting weird' surprises."
    );
  }

  printSection("2) App Router trees detected");
  const hasApp = exists(path.join(ROOT, "app")) ? "app/" : null;
  const hasSrcApp = exists(path.join(ROOT, "src/app")) ? "src/app/" : null;
  console.log("Found:", { hasApp, hasSrcApp });
  if (hasApp && hasSrcApp) {
    console.log(
      "\n⚠️ BOTH app/ and src/app/ exist.\n" +
        "Mixed usage is a common cause of route confusion.\n" +
        "We must scan BOTH."
    );
  }

  printSection("3) Page catchers / layouts / catch-alls under /api (these can cause HTML at /api/*)");
  const srcTree = apiTreeReport("src/app");
  const rootTree = apiTreeReport("app");

  console.log("\n--- src/app/api ---");
  showList("page.* under src/app/**/api/**", srcTree.pages);
  showList("layout.* under src/app/**/api/**", srcTree.layouts);
  showList("catch-all segments under src/app/**/api/**", srcTree.catchAll);

  console.log("\n--- app/api ---");
  showList("page.* under app/**/api/**", rootTree.pages);
  showList("layout.* under app/**/api/**", rootTree.layouts);
  showList("catch-all segments under app/**/api/**", rootTree.catchAll);

  printSection("4) route.ts handlers under /api (these SHOULD return JSON)");
  console.log("\n--- src/app/api ---");
  showList("route.ts under src/app/**/api/**", srcTree.routes);

  console.log("\n--- app/api ---");
  showList("route.ts under app/**/api/**", rootTree.routes);

  printSection("5) next.config.* and vercel.json checks (rewrites/output/export)");
  const nextConfigs = ["next.config.js", "next.config.mjs", "next.config.ts"];
  for (const f of nextConfigs) {
    const p = path.join(ROOT, f);
    if (!exists(p)) continue;
    const txt = read(p);
    console.log(`\n${f} exists`);
    if (txt.includes("output: 'export'") || txt.includes('output: "export"')) {
      console.log("⚠️ Found output: 'export' — this often breaks API routes.");
    }
    if (txt.includes("rewrites") || txt.includes("redirects")) {
      console.log("⚠️ Found rewrites/redirects — check if /api is being rewritten.");
    }
  }

  const vercelJson = path.join(ROOT, "vercel.json");
  if (exists(vercelJson)) {
    const txt = read(vercelJson);
    console.log("\nvercel.json exists");
    if (txt.includes('"routes"') || txt.includes('"rewrites"') || txt.includes('"redirects"')) {
      console.log("⚠️ vercel.json contains routes/rewrites/redirects — check if /api is being rewritten.");
    }
  }

  printSection("6) Legacy pages/api presence");
  const legacyPagesApi = exists(path.join(ROOT, "pages/api"));
  console.log("pages/api exists:", legacyPagesApi);

  printSection("7) Find 'Domain route' / KV text in repo (likely your HTML page)");
  const needles = ["Domain route", "KV is configured", "domain -> project", "domain → project"];
  const allFiles = walk(ROOT).filter((p) => !isIgnored(rel(p)));
  const hits = [];
  for (const f of allFiles) {
    const r = rel(f);
    if (!(r.endsWith(".ts") || r.endsWith(".tsx") || r.endsWith(".js") || r.endsWith(".jsx") || r.endsWith(".md"))) continue;
    for (const n of needles) {
      if (containsText(f, n)) hits.push({ file: r, needle: n });
    }
  }
  console.log("Hits:", hits.length);
  for (const h of hits.slice(0, 200)) console.log(` - ${h.file}   (matched: ${h.needle})`);

  printSection("DONE");
})();
