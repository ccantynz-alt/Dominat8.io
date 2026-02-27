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

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{`
        .sn { position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(20px, 5vw, 48px); transition: all 280ms cubic-bezier(0.4,0,0.2,1); }
        .sn--scrolled { backdrop-filter: blur(20px) saturate(1.6); -webkit-backdrop-filter: blur(20px) saturate(1.6); background: rgba(6,8,16,0.72); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sn-logo { font-size: 19px; font-weight: 900; color: #fff; text-decoration: none; letter-spacing: -0.04em; font-family: 'Outfit', system-ui, sans-serif; display: flex; align-items: center; gap: 0; transition: opacity 150ms; }
        .sn-logo:hover { text-decoration: none; opacity: 0.85; }
        .sn-logo-accent { color: #3DF0FF; }
        .sn-right { display: flex; gap: 2px; align-items: center; }
        .sn-link { padding: 7px 14px; border-radius: 8px; color: rgba(255,255,255,0.45); font-size: 13.5px; font-weight: 500; text-decoration: none; transition: color 150ms, background 150ms; font-family: 'Outfit', system-ui, sans-serif; letter-spacing: -0.01em; }
        .sn-link:hover { color: rgba(255,255,255,0.90); background: rgba(255,255,255,0.06); text-decoration: none; }
        .sn-link--active { color: rgba(255,255,255,0.95); }
        .sn-cta { position: relative; padding: 8px 22px; border-radius: 10px; background: linear-gradient(135deg, rgba(61,240,255,0.14), rgba(139,92,246,0.10)); border: 1px solid rgba(61,240,255,0.30); color: rgba(61,240,255,0.95); font-size: 13.5px; font-weight: 600; text-decoration: none; transition: all 180ms; font-family: 'Outfit', system-ui, sans-serif; margin-left: 6px; letter-spacing: -0.01em; overflow: hidden; }
        .sn-cta::before { content: ''; position: absolute; inset: -1px; border-radius: 11px; background: linear-gradient(135deg, rgba(61,240,255,0.20), rgba(139,92,246,0.15)); opacity: 0; transition: opacity 180ms; z-index: -1; }
        .sn-cta:hover { border-color: rgba(61,240,255,0.55); box-shadow: 0 0 20px rgba(61,240,255,0.12); text-decoration: none; }
        .sn-cta:hover::before { opacity: 1; }
        .sn-dash { padding: 7px 13px; border-radius: 8px; color: rgba(255,255,255,0.40); font-size: 13px; font-weight: 500; text-decoration: none; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); transition: all 150ms; font-family: 'Outfit', system-ui, sans-serif; }
        .sn-dash:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.70); border-color: rgba(255,255,255,0.14); text-decoration: none; }
        @media (max-width: 720px) { .sn-link { display: none; } }
        @media (max-width: 480px) { .sn-dash { display: none; } }
      `}</style>

      <nav className={`sn${scrolled ? " sn--scrolled" : ""}`}>
        <Link href="/" className="sn-logo">
          Dominat<span className="sn-logo-accent">8</span>.io
        </Link>
        <div className="sn-right">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sn-link${pathname === link.href ? " sn-link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/dashboard" className="sn-dash">Dashboard</Link>
          <Link href="/build" className="sn-cta">Start building →</Link>
        </div>
      </nav>
    </>
  );
}
