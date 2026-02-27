import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/gallery", label: "Gallery" },
  { href: "/templates", label: "Templates" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "36px clamp(20px,5vw,64px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 24,
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "rgba(255,255,255,0.70)",
            marginBottom: 6,
          }}
        >
          Dominat<span style={{ color: "rgba(61,240,255,0.80)" }}>8</span>.io
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>
          © {new Date().getFullYear()} Dominat8.io · Built by{" "}
          <a
            href="https://dominat8.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.40)", textDecoration: "none" }}
          >
            Dominat8.com
          </a>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.32)",
              textDecoration: "none",
              transition: "color 120ms",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
