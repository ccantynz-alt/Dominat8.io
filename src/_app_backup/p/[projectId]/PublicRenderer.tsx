import * as React from "react";
import { ensurePublishedContent } from "@/app/lib/publishedContentStore";

type Props = {
  projectId: string;
  pathSlug?: string; // "", "about", "pricing", "faq", "contact"
};

function normalizeSlug(slug?: string) {
  const s = String(slug || "").trim().toLowerCase();
  if (!s) return "";
  return s.replace(/[^a-z0-9-]/g, "") || "";
}

function mapSlugToPageKey(slug: string) {
  // Home is stored under "" key
  if (!slug || slug === "home" || slug === "index") return "";
  if (slug === "about") return "about";
  if (slug === "pricing") return "pricing";
  if (slug === "faq") return "faq";
  if (slug === "contact") return "contact";
  return null;
}

function Nav() {
  const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    display: "inline-block",
    fontSize: 14,
  };

  return (
    <nav style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
      <a href="./" style={linkStyle}>
        Home
      </a>
      <a href="./about" style={linkStyle}>
        About
      </a>
      <a href="./pricing" style={linkStyle}>
        Pricing
      </a>
      <a href="./faq" style={linkStyle}>
        FAQ
      </a>
      <a href="./contact" style={linkStyle}>
        Contact
      </a>
    </nav>
  );
}

export default async function PublicRenderer({ projectId, pathSlug }: Props) {
  const slug = normalizeSlug(pathSlug);
  const pageKey = mapSlugToPageKey(slug);

  // Always ensure content exists (creates defaults on first view)
  const site = await ensurePublishedContent(projectId);

  // If route is home or one of our known pages, render that content
  const keyToRender = pageKey === null ? "" : pageKey;
  const page = site.pages[keyToRender] || site.pages[""];

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
          {page?.title || "Published Site"}
        </h1>
        <p style={{ marginTop: 8, opacity: 0.8 }}>
          Project: <code>{projectId}</code>
        </p>
        <Nav />
      </header>

      {(page?.sections || []).map((s) => (
        <section
          key={s.id}
          id={s.id}
          style={{
            padding: 16,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 650 }}>
            {s.heading}
          </h2>
          <p style={{ marginTop: 8, opacity: 0.85, whiteSpace: "pre-wrap" }}>
            {s.body}
          </p>
        </section>
      ))}

      <footer style={{ marginTop: 24, opacity: 0.65, fontSize: 13 }}>
        Updated: <code>{site.updatedAt}</code>
      </footer>
    </main>
  );
}
