import https from "node:https";

const TIMEOUT_MS = 20000;

function head(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "GET" }, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
      res.resume();
    });
    req.on("error", (e) => resolve({ ok: false, status: 0, error: String(e) }));
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(new Error("timeout")); });
    req.end();
  });
}

async function main() {
  const base = process.env.SMOKE_BASE_URL;
  if (!base) {
    console.error("Missing SMOKE_BASE_URL env var");
    process.exit(2);
  }

  const endpoints = [
    "/healthz",
    "/stamp",
    "/api/__d8__/stamp"
  ];

  console.log("SMOKE_BASE_URL=", base);

  let fails = 0;
  for (const ep of endpoints) {
    const url = base.replace(/\/$/, "") + ep;
    const r = await head(url);
    if (r.ok) {
      console.log("OK  ", r.status, url);
    } else {
      console.log("FAIL", r.status, url, r.error ? ("| " + r.error) : "");
      fails++;
    }
  }

  if (fails > 0) process.exit(1);
  console.log("SMOKE PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
