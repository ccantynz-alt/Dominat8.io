"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <style>{`
.sn{position:fixed;top:0;left:0;right:0;z-index:200;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,48px);transition:all 320ms cubic-bezier(.4,0,.2,1);}
.sn--s{backdrop-filter:blur(24px) saturate(1.8);-webkit-backdrop-filter:blur(24px) saturate(1.8);background:rgba(6,8,16,.75);}
.sn--s::after{content:'';position:absolute;bottom:0;left:5%;right:5%;height:1px;background:linear-gradient(90deg,transparent,rgba(61,240,255,.10),rgba(139,92,246,.08),transparent);}

.sn-logo{font-size:20px;font-weight:900;color:#fff;text-decoration:none;letter-spacing:-.04em;font-family:'Outfit',system-ui,sans-serif;display:flex;align-items:center;transition:opacity 150ms;}
.sn-logo:hover{text-decoration:none;opacity:.85;}
.sn-logo-dot{color:#3DF0FF;}

.sn-right{display:flex;gap:2px;align-items:center;}

.sn-link{padding:8px 14px;border-radius:9px;color:rgba(255,255,255,.42);font-size:13.5px;font-weight:500;text-decoration:none;transition:color 150ms,background 150ms;font-family:'Outfit',system-ui,sans-serif;letter-spacing:-.01em;position:relative;}
.sn-link:hover{color:rgba(255,255,255,.88);background:rgba(255,255,255,.05);text-decoration:none;}
.sn-link--a{color:rgba(255,255,255,.92);}
.sn-link--a::after{content:'';position:absolute;bottom:4px;left:14px;right:14px;height:2px;border-radius:1px;background:linear-gradient(90deg,rgba(61,240,255,.50),rgba(139,92,246,.40));}

.sn-dash{padding:8px 14px;border-radius:9px;color:rgba(255,255,255,.38);font-size:13px;font-weight:500;text-decoration:none;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);transition:all 150ms;font-family:'Outfit',system-ui,sans-serif;}
.sn-dash:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.68);border-color:rgba(255,255,255,.12);text-decoration:none;}

.sn-cta{position:relative;padding:9px 24px;border-radius:11px;background:linear-gradient(135deg,rgba(61,240,255,.12),rgba(139,92,246,.08));border:1px solid rgba(61,240,255,.28);color:rgba(61,240,255,.92);font-size:13.5px;font-weight:650;text-decoration:none;transition:all 200ms;font-family:'Outfit',system-ui,sans-serif;margin-left:8px;letter-spacing:-.01em;overflow:hidden;}
.sn-cta::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:snShimmer 4s ease-in-out infinite;}
@keyframes snShimmer{0%{left:-100%}40%{left:100%}100%{left:100%}}
.sn-cta:hover{border-color:rgba(61,240,255,.50);box-shadow:0 0 24px rgba(61,240,255,.10);text-decoration:none;transform:translateY(-1px);}

/* Hamburger */
.sn-ham{display:none;background:none;border:none;cursor:pointer;padding:8px;color:rgba(255,255,255,.50);font-size:22px;line-height:1;}

@media(max-width:720px){
  .sn-link,.sn-dash{display:none;}
  .sn-ham{display:block;}
}
@media(max-width:480px){.sn-dash{display:none;}}

/* Mobile menu */
.sn-mob{position:fixed;inset:0;z-index:199;background:rgba(6,8,16,.92);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0;pointer-events:none;transition:opacity 250ms;}
.sn-mob--open{opacity:1;pointer-events:auto;}
.sn-mob-link{font-size:20px;font-weight:600;color:rgba(255,255,255,.60);text-decoration:none;padding:14px 28px;border-radius:12px;transition:all 150ms;letter-spacing:-.02em;}
.sn-mob-link:hover{color:#fff;background:rgba(255,255,255,.05);}
.sn-mob-close{position:absolute;top:20px;right:24px;background:none;border:none;color:rgba(255,255,255,.50);font-size:28px;cursor:pointer;padding:8px;}
      `}</style>

      <nav className={`sn${scrolled ? " sn--s" : ""}`}>
        <Link href="/" className="sn-logo">
          Dominat<span className="sn-logo-dot">8</span>.io
        </Link>
        <div className="sn-right">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`sn-link${pathname === link.href ? " sn-link--a" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/dashboard" className="sn-dash">Dashboard</Link>
          <Link href="/build" className="sn-cta">Start building →</Link>
          <button className="sn-ham" onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      <div className={`sn-mob${mobileOpen ? " sn-mob--open" : ""}`}>
        <button className="sn-mob-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} className="sn-mob-link" onClick={() => setMobileOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href="/dashboard" className="sn-mob-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
        <Link href="/build" className="sn-mob-link" onClick={() => setMobileOpen(false)} style={{ color: "rgba(61,240,255,.85)" }}>
          Start building →
        </Link>
      </div>
    </>
  );
}
