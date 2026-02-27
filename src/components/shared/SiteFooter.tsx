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
.sf{position:relative;border-top:1px solid rgba(255,255,255,.04);padding:64px clamp(20px,5vw,64px) 40px;font-family:'Outfit',system-ui,sans-serif;}
.sf::before{content:'';position:absolute;top:-1px;left:8%;right:8%;height:1px;background:linear-gradient(90deg,transparent,rgba(61,240,255,.12),rgba(139,92,246,.10),rgba(56,248,166,.06),transparent);}
.sf-inner{max-width:1120px;margin:0 auto;display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:48px;}
@media(max-width:640px){.sf-inner{grid-template-columns:1fr;gap:32px;}}
.sf-brand{font-size:20px;font-weight:900;letter-spacing:-.03em;color:rgba(255,255,255,.55);margin-bottom:12px;}
.sf-brand span{background:linear-gradient(135deg,rgba(61,240,255,.80),rgba(139,92,246,.70));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.sf-tagline{font-size:13px;color:rgba(255,255,255,.22);line-height:1.65;max-width:280px;}
.sf-col-title{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.22);margin-bottom:16px;font-family:'JetBrains Mono',monospace;}
.sf-links{display:flex;flex-direction:column;gap:11px;}
.sf-link{font-size:13px;color:rgba(255,255,255,.32);text-decoration:none;transition:color 120ms;}
.sf-link:hover{color:rgba(255,255,255,.68);}
.sf-bottom{max-width:1120px;margin:48px auto 0;padding-top:22px;border-top:1px solid rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}
.sf-copy{font-size:12px;color:rgba(255,255,255,.16);}
.sf-copy a{color:rgba(255,255,255,.24);text-decoration:none;transition:color 120ms;}
.sf-copy a:hover{color:rgba(255,255,255,.48);}
.sf-badge{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(61,240,255,.30);font-family:'JetBrains Mono',monospace;}
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
