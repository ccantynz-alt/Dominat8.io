const https = require("https");
const { URL } = require("url");

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

function json(res, code, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.statusCode = code;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(body);
}

function postJson(urlStr, headers, payload) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        method: "POST",
        hostname: u.hostname,
        path: u.pathname + (u.search || ""),
        headers: Object.assign(
          {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(body),
            "user-agent": "d8-webhook-bridge/1.0"
          },
          headers || {}
        )
      },
      (res) => {
        let data = "";
        res.on("data", (d) => (data += d));
        res.on("end", () => resolve({ status: res.statusCode || 0, body: data }));
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = async (req, res) => {
  try {
    const u = new URL(req.url, "http://local");
    const qsSecret = u.searchParams.get("secret");
    const headerSecret = req.headers["x-bridge-secret"];

    const expected = process.env.BRIDGE_SHARED_SECRET || "";
    if (!expected) return json(res, 500, { ok: false, error: "BRIDGE_SHARED_SECRET not set" });

    const provided = (qsSecret || headerSecret || "").toString();
    if (!provided || provided !== expected) {
      return json(res, 401, { ok: false, error: "unauthorized (bad or missing secret)" });
    }

    const raw = await readBody(req);
    let payload = null;
    try { payload = raw ? JSON.parse(raw) : null; } catch { payload = { raw }; }

    const owner = process.env.GH_OWNER || "";
    const repo  = process.env.GH_REPO  || "";
    const token = process.env.GH_TOKEN || "";
    const ref   = process.env.GH_REF   || "main";
    const wfList = (process.env.GH_WORKFLOWS || "").split(",").map(s => s.trim()).filter(Boolean);

    if (!owner || !repo || !token || wfList.length === 0) {
      return json(res, 500, { ok: false, error: "Missing env vars. Require GH_OWNER, GH_REPO, GH_TOKEN, GH_WORKFLOWS" });
    }

    const results = [];
    for (const wf of wfList) {
      const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(wf)}/dispatches`;
      const r = await postJson(
        url,
        {
          "authorization": `Bearer ${token}`,
          "accept": "application/vnd.github+json",
          "x-github-api-version": "2022-11-28"
        },
        {
          ref,
          inputs: {
            source: "webhook-bridge",
            reason: "vercel/render webhook",
            received_at: new Date().toISOString()
          }
        }
      );
      results.push({ workflow: wf, status: r.status, body: r.body });
    }

    return json(res, 200, { ok: true, dispatched: results, note: "If status=204, dispatch succeeded." });
  } catch (e) {
    return json(res, 500, { ok: false, error: String(e && e.message ? e.message : e) });
  }
};