// app/site/[projectId]/page.tsx
import Link from "next/link";
import { storeGet } from "../../lib/store";
import { isAdmin } from "../../lib/isAdmin";

type Visibility = "public" | "private";

function visibilityKey(projectId: string) {
  return `project:visibility:${projectId}`;
}

function latestKey(projectId: string) {
  return `generated:project:${projectId}:latest`;
}

export default async function PublicProjectSitePage({
  params,
}: {
  params: { projectId: string };
}) {
  const admin = await isAdmin();

  const v = await storeGet(visibilityKey(params.projectId));
  const visibility: Visibility = v === "public" ? "public" : "private";

  if (visibility === "private" && !admin) {
    return (
      <div style={{ padding: 16, maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
          This site is private
        </h1>
        <p style={{ marginTop: 10, opacity: 0.75, lineHeight: 1.6 }}>
          The owner has not published this project publicly.
        </p>
        <div style={{ marginTop: 14 }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const latest = await storeGet(latestKey(params.projectId));
  const html =
    (latest && typeof latest === "object" && (latest as any).html) ||
    (latest && typeof latest === "object" && (latest as any).previewHtml) ||
    null;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Project Site</div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>
              {params.projectId}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/"
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.10)",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Home
            </Link>
            {admin && (
              <Link
                href={`/projects/${params.projectId}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.10)",
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Edit Project
              </Link>
            )}
          </div>
        </div>

        {!html ? (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 16,
              padding: 16,
              maxWidth: 900,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              No published HTML found yet
            </div>
            <p style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.6 }}>
              This project is visible, but we couldn’t find an HTML preview in KV
              under <code>{latestKey(params.projectId)}</code>.
            </p>
            <p style={{ marginTop: 8, opacity: 0.75, lineHeight: 1.6 }}>
              Fix: open the project run and click <b>Apply</b> (or <b>Apply &amp; Set Home</b>)
              to store the latest preview output.
            </p>
          </div>
        ) : (
          <iframe
            title="Project Site"
            sandbox="allow-scripts allow-forms allow-same-origin"
            srcDoc={String(html)}
            style={{
              width: "100%",
              height: "80vh",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 16,
              background: "transparent",
            }}
          />
        )}
      </div>
    </div>
  );
}
