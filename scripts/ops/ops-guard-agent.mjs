const OPS_BASE_URL = (process.env.OPS_BASE_URL || "https://www.dominat8.com").replace(/\/+$/, "");
const OPS_DOMAINS = (process.env.OPS_DOMAINS || "dominat8.com,www.dominat8.com")
  .split(",").map(s => s.trim()).filter(Boolean);

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const VERCEL_TEAM_ID = (process.env.VERCEL_TEAM_ID || "").trim();

if (!VERCEL_TOKEN) throw new Error("Missing: VERCEL_TOKEN");
if (!VERCEL_PROJECT_ID) throw new Error("Missing: VERCEL_PROJECT_ID");
if (!OPS_DOMAINS.length) throw new Error("Missing: OPS_DOMAINS");

const URLS = [
  `${OPS_BASE_URL}/`, // only gate on homepage for now
];

const FAIL_PATTERNS = [
  "This page could not be found",
  "Application error",
  "Internal Server Error",
  "__NEXT_ERROR__",
];

// Optional: require a positive marker to reduce false-OK
const OK_MARKERS = [
  "LIVE_",
  "HOME_OK",
  "ROUTE OK",
];

function qs(obj) {
  const p = new URLSearchParams();
  for (const [k,v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && String(v).length) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function httpText(url, init) {
  const r = await fetch(url, init);
  const text = await r.text();
  return { r, text };
}

async function vercel(path, init) {
  const u = `https://api.vercel.com${path}`;
  const { r, text } = await httpText(u, {
    ...init,
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, ...(init?.headers || {}) },
  });
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!r.ok) {
    const msg = (json && (json.error?.message || json.message)) || text || `Vercel API error ${r.status}`;
    throw new Error(msg);
  }
  return json;
}

async function healthCheck() {
  const out = [];
  for (const base of URLS) {
    const url = base.includes("?") ? `${base}&ts=${Date.now()}` : `${base}?ts=${Date.now()}`;
    const { r, text } = await httpText(url, { redirect: "follow" });

    const hit = FAIL_PATTERNS.find(p => text.includes(p)) || "";
    const hasOkMarker = OK_MARKERS.some(m => text.includes(m));

    const ok = r.ok && !hit && hasOkMarker;
    out.push({ url, status: r.status, ok, hit, hasOkMarker });
  }
  return out;
}

async function listProdDeployments() {
  const data = await vercel(`/v6/deployments${qs({
    projectId: VERCEL_PROJECT_ID,
    target: "production",
    state: "READY",
    teamId: VERCEL_TEAM_ID || undefined,
    limit: "6",
  })}`, { method: "GET" });

  return (data?.deployments || []).filter(d => d?.uid && d?.url);
}

async function assignAlias(deploymentId, alias) {
  return await vercel(`/v2/deployments/${encodeURIComponent(deploymentId)}/aliases${qs({
    teamId: VERCEL_TEAM_ID || undefined,
  })}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ alias }),
  });
}

(async () => {
  const results = await healthCheck();
  results.forEach(x => console.log(`[CHECK] ${x.ok ? "OK" : "FAIL"} ${x.status} ${x.url} ${x.hit ? `hit="${x.hit}"` : ""} marker=${x.hasOkMarker}`));

  if (results.every(x => x.ok)) {
    console.log("[OPS] ✅ Health OK. No action.");
    return;
  }

  console.log("[OPS] ❌ Health failed. Rolling back via alias reassignment…");

  const prods = await listProdDeployments();
  if (prods.length < 2) throw new Error("Need at least 2 production deployments to roll back.");

  const previous = prods[1];

  for (const d of OPS_DOMAINS) {
    console.log(`[OPS] alias ${d} -> ${previous.uid}`);
    await assignAlias(previous.uid, d);
  }

  console.log("[OPS] ✅ Rollback complete.");
})();