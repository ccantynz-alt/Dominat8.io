import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "/build", label: "Builder" },
  { href: "/gallery", label: "Gallery" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <>
      <style>{`
        .sf { position: relative; border-top: 1px solid rgba(255,255,255,0.05); padding: 56px clamp(20px,5vw,64px) 36px; font-family: 'Outfit', system-ui, sans-serif; }
        .sf::before { content: ''; position: absolute; top: -1px; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, rgba(61,240,255,0.15), rgba(139,92,246,0.12), transparent); }
        .sf-inner { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 48px; }
        @media (max-width: 640px) { .sf-inner { grid-template-columns: 1fr; gap: 32px; } }
        .sf-brand { font-size: 18px; font-weight: 900; letter-spacing: -0.03em; color: rgba(255,255,255,0.60); margin-bottom: 10px; }
        .sf-brand span { color: rgba(61,240,255,0.70); }
        .sf-tagline { font-size: 13px; color: rgba(255,255,255,0.25); line-height: 1.6; max-width: 280px; }
        .sf-col-title { font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 14px; }
        .sf-links { display: flex; flex-direction: column; gap: 10px; }
        .sf-link { font-size: 13px; color: rgba(255,255,255,0.35); text-decoration: none; transition: color 120ms; }
        .sf-link:hover { color: rgba(255,255,255,0.70); }
        .sf-bottom { max-width: 1120px; margin: 40px auto 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .sf-copy { font-size: 12px; color: rgba(255,255,255,0.18); }
        .sf-copy a { color: rgba(255,255,255,0.28); text-decoration: none; }
        .sf-copy a:hover { color: rgba(255,255,255,0.50); }
      `}</style>

      <footer className="sf">
        <div className="sf-inner">
          <div>
            <div className="sf-brand">Dominat<span>8</span>.io</div>
            <div className="sf-tagline">
              AI-powered website generation. Describe your business, get production-ready code in seconds.
            </div>
          </div>
          <div>
            <div className="sf-col-title">Product</div>
            <div className="sf-links">
              {PRODUCT_LINKS.map(l => (
                <Link key={l.href} href={l.href} className="sf-link">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <div className="sf-col-title">Company</div>
            <div className="sf-links">
              {COMPANY_LINKS.map(l => (
                <Link key={l.href} href={l.href} className="sf-link">{l.label}</Link>
              ))}
              <a href="mailto:hello@dominat8.io" className="sf-link">Contact</a>
            </div>
          </div>
        </div>
        <div className="sf-bottom">
          <div className="sf-copy">
            © {new Date().getFullYear()} Dominat8.io · Built by{" "}
            <a href="https://dominat8.com" target="_blank" rel="noopener noreferrer">Dominat8.com</a>
          </div>
        </div>
      </footer>
    </>
  );
}
