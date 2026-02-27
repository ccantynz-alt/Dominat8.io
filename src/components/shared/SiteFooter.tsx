"use client";

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
.sf{position:relative;border-top:1px solid rgba(245,240,235,.06);padding:72px clamp(20px,5vw,64px) 44px;font-family:'Inter',system-ui,sans-serif;background:linear-gradient(180deg,transparent,rgba(15,13,21,.50));}
.sf::before{content:'';position:absolute;top:-1px;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(240,179,90,.15),rgba(232,113,90,.10),transparent);}
.sf-inner{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:1.8fr 1fr 1fr;gap:48px;}
@media(max-width:640px){.sf-inner{grid-template-columns:1fr;gap:32px;}}
.sf-brand{font-size:22px;font-weight:800;letter-spacing:-.03em;color:rgba(245,240,235,.50);margin-bottom:14px;font-family:'Outfit',system-ui,sans-serif;}
.sf-brand span{color:#F0B35A;}
.sf-tagline{font-size:13px;color:rgba(245,240,235,.22);line-height:1.7;max-width:300px;}
.sf-col-title{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(240,179,90,.40);margin-bottom:18px;font-family:'JetBrains Mono',monospace;}
.sf-links{display:flex;flex-direction:column;gap:12px;}
.sf-link{font-size:13.5px;color:rgba(245,240,235,.30);text-decoration:none;transition:color 150ms;}
.sf-link:hover{color:rgba(245,240,235,.70);}
.sf-bottom{max-width:1120px;margin:52px auto 0;padding-top:24px;border-top:1px solid rgba(245,240,235,.05);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}
.sf-copy{font-size:12px;color:rgba(245,240,235,.16);}
.sf-copy a{color:rgba(245,240,235,.22);text-decoration:none;transition:color 120ms;}
.sf-copy a:hover{color:rgba(245,240,235,.45);}
.sf-badge{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(240,179,90,.28);font-family:'JetBrains Mono',monospace;}
      `}</style>

      <footer className="sf">
        <div className="sf-inner">
          <div>
            <div className="sf-brand">Dominat<span>8</span>.io</div>
            <div className="sf-tagline">
              The world&apos;s first agentic AI website builder. Describe your business, get production-ready React + TypeScript in seconds.
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
            &copy; {new Date().getFullYear()} Dominat8.io &middot; Built by{" "}
            <a href="https://dominat8.com" target="_blank" rel="noopener noreferrer">Dominat8.com</a>
          </div>
          <div className="sf-badge">Powered by Claude + GPT-4</div>
        </div>
      </footer>
    </>
  );
}
