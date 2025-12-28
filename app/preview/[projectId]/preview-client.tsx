// app/preview/[projectId]/preview-client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type ProjectFilesResponse =
  | { ok: true; projectId: string; files: Array<{ path: string; content: string }> }
  | { ok: false; error: string };

export default function PreviewClient({ projectId }: { projectId: string }) {
  const [filesRes, setFilesRes] = useState<ProjectFilesResponse | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const homeFile = useMemo(() => {
    if (!filesRes || filesRes.ok !== true) return null;
    return filesRes.files.find((f) => f.path === "app/generated/page.tsx") || null;
  }, [filesRes]);

  useEffect(() => {
    async function load() {
      const r = await fetch(`/api/projects/${projectId}/files`, { method: "GET" });
      const j = (await r.json().catch(() => null)) as ProjectFilesResponse | null;
      if (j) setFilesRes(j);
    }
    load();
  }, [projectId, reloadKey]);

  const iframeSrcDoc = useMemo(() => {
    // We render app/generated/page.tsx from KV using Babel in an iframe.
    const tsx = homeFile?.content || "";

    const escaped = tsx
      .replaceAll("\\", "\\\\")
      .replaceAll("`", "\\`")
      .replaceAll("${", "\\${");

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Preview</title>
    <style>
      html, body { margin:0; padding:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }
      #root { padding: 16px; }
      .err { color: #b00020; white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    </style>
  </head>
  <body>
    <div id="root"></div>

    <!-- React UMD -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <!-- Babel Standalone (transpile TSX in-browser) -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <script>
      (function () {
        const rootEl = document.getElementById("root");

        function showError(msg) {
          rootEl.innerHTML = "";
          const pre = document.createElement("pre");
          pre.className = "err";
          pre.textContent = msg;
          rootEl.appendChild(pre);
        }

        const tsxSource = \`${escaped}\`;

        if (!tsxSource.trim()) {
          showError("No app/generated/page.tsx found in this project yet.\\n\\nGo back to Dashboard → Run Agent → Apply Run → Project.");
          return;
        }

        try {
          // Transpile TSX → JS
          const compiled = Babel.transform(tsxSource, {
            presets: ["react", "typescript"],
            filename: "page.tsx",
          }).code;

          // Evaluate compiled module in a safe-ish function scope
          const exports = {};
          const module = { exports };
          const require = (name) => {
            if (name === "react") return React;
            throw new Error("Unsupported import in preview: " + name);
          };

          const fn = new Function("React", "ReactDOM", "module", "exports", "require", compiled);
          fn(React, ReactDOM, module, exports, require);

          const Comp = module.exports?.default || exports.default;

          if (!Comp) {
            showError("Preview could not find a default export React component in app/generated/page.tsx");
            return;
          }

          // Render
          const root = ReactDOM.createRoot(rootEl);
          root.render(React.createElement(Comp));
        } catch (e) {
          showError("Preview error:\\n\\n" + (e && e.stack ? e.stack : String(e)));
        }
      })();
    </script>
  </body>
</html>`;
  }, [homeFile]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #222",
            background: "white",
            fontWeight: 800,
          }}
        >
          Refresh Preview
        </button>

        <div style={{ color: "#666", fontSize: 13 }}>
          After you <b>Apply Run → Project</b>, click Refresh Preview.
        </div>
      </div>

      {filesRes && filesRes.ok !== true ? (
        <div style={{ color: "#b00020", fontWeight: 800 }}>
          Error: {filesRes.error}
        </div>
      ) : null}

      <iframe
        title="Live Preview"
        srcDoc={iframeSrcDoc}
        style={{
          width: "100%",
          height: "75vh",
          border: "1px solid #ddd",
          borderRadius: 12,
          background: "white",
        }}
        sandbox="allow-scripts allow-same-origin"
      />

      <div style={{ fontSize: 12, color: "#666" }}>
        Rendering from KV: <span style={{ fontFamily: "ui-monospace, monospace" }}>app/generated/page.tsx</span>
      </div>
    </div>
  );
}
