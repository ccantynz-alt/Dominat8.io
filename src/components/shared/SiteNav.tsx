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

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <style>{`
.sn{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 20px;height:52px;border-radius:999px;border:1px solid rgba(245,240,235,.06);background:rgba(8,7,11,.40);backdrop-filter:blur(24px) saturate(1.6);-webkit-backdrop-filter:blur(24px) saturate(1.6);transition:all 400ms cubic-bezier(.4,0,.2,1);width:auto;max-width:calc(100vw - 32px);gap:4px;}
.sn--s{background:rgba(8,7,11,.85);border-color:rgba(245,240,235,.10);box-shadow:0 8px 32px rgba(0,0,0,.40),0 0 0 1px rgba(245,240,235,.04);}

.sn-logo{font-size:17px;font-weight:800;color:#F5F0EB;text-decoration:none;letter-spacing:-.03em;font-family:'Outfit',system-ui,sans-serif;display:flex;align-items:center;transition:opacity 150ms;white-space:nowrap;margin-right:8px;}
.sn-logo:hover{text-decoration:none;opacity:.85;}
.sn-logo-dot{color:#F0B35A;font-weight:900;}

.sn-links{display:flex;gap:1px;align-items:center;}

.sn-link{padding:7px 14px;border-radius:999px;color:rgba(245,240,235,.40);font-size:13px;font-weight:500;text-decoration:none;transition:all 180ms;font-family:'Inter',system-ui,sans-serif;letter-spacing:-.01em;position:relative;}
.sn-link:hover{color:rgba(245,240,235,.85);background:rgba(245,240,235,.06);text-decoration:none;}
.sn-link--a{color:rgba(240,179,90,.90);font-weight:600;}
.sn-link--a::after{content:'';position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:16px;height:2px;border-radius:1px;background:rgba(240,179,90,.60);}

.sn-dash{padding:7px 14px;border-radius:999px;color:rgba(245,240,235,.38);font-size:13px;font-weight:500;text-decoration:none;transition:all 150ms;font-family:'Inter',system-ui,sans-serif;}
.sn-dash:hover{color:rgba(245,240,235,.70);text-decoration:none;}

.sn-cta{padding:8px 20px;border-radius:999px;background:linear-gradient(135deg,#F0B35A,#E8A040);border:none;color:#0F0D15;font-size:13px;font-weight:700;text-decoration:none;transition:all 220ms;font-family:'Inter',system-ui,sans-serif;letter-spacing:-.01em;margin-left:4px;white-space:nowrap;}
.sn-cta:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(240,179,90,.30),0 0 0 1px rgba(240,179,90,.20);text-decoration:none;}

/* Hamburger */
.sn-ham{display:none;background:none;border:none;cursor:pointer;padding:8px;color:rgba(245,240,235,.50);font-size:20px;line-height:1;}

@media(max-width:768px){
  .sn-links,.sn-dash{display:none;}
  .sn-ham{display:block;}
  .sn{padding:0 12px 0 16px;}
}

/* Mobile menu */
.sn-mob{position:fixed;inset:0;z-index:199;background:rgba(8,7,11,.95);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;opacity:0;pointer-events:none;transition:opacity 300ms;}
.sn-mob--open{opacity:1;pointer-events:auto;}
.sn-mob-link{font-size:22px;font-weight:600;color:rgba(245,240,235,.55);text-decoration:none;padding:16px 32px;border-radius:16px;transition:all 150ms;letter-spacing:-.02em;font-family:'Outfit',system-ui,sans-serif;}
.sn-mob-link:hover{color:#F5F0EB;background:rgba(245,240,235,.05);}
.sn-mob-close{position:absolute;top:20px;right:24px;background:none;border:none;color:rgba(245,240,235,.40);font-size:28px;cursor:pointer;padding:8px;}
      `}</style>

      <nav className={`sn${scrolled ? " sn--s" : ""}`}>
        <Link href="/" className="sn-logo">
          Dominat<span className="sn-logo-dot">8</span>.io
        </Link>
        <div className="sn-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`sn-link${pathname === link.href ? " sn-link--a" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link href="/dashboard" className="sn-dash">Dashboard</Link>
        <Link href="/build" className="sn-cta">Start building</Link>
        <button className="sn-ham" onClick={() => setMobileOpen(true)} aria-label="Open menu">&#9776;</button>
      </nav>

      {/* Mobile fullscreen menu */}
      <div className={`sn-mob${mobileOpen ? " sn-mob--open" : ""}`}>
        <button className="sn-mob-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">&#10005;</button>
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} className="sn-mob-link" onClick={() => setMobileOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href="/dashboard" className="sn-mob-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
        <Link href="/build" className="sn-mob-link" onClick={() => setMobileOpen(false)} style={{ color: "#F0B35A" }}>
          Start building
        </Link>
      </div>
    </>
  );
}
