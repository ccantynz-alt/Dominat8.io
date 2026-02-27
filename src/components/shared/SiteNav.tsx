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
        .sn { position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 58px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(20px, 5vw, 48px); transition: all 200ms; }
        .sn--scrolled { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); background: rgba(6,8,16,0.88); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .sn-logo { font-size: 20px; font-weight: 900; color: #fff; text-decoration: none; letter-spacing: -0.04em; font-family: 'Outfit', system-ui, sans-serif; display: flex; align-items: center; gap: 0; }
        .sn-logo:hover { text-decoration: none; }
        .sn-logo-accent { color: rgba(61,240,255,0.90); }
        .sn-right { display: flex; gap: 4px; align-items: center; }
        .sn-link { padding: 7px 14px; border-radius: 8px; color: rgba(255,255,255,0.50); font-size: 14px; font-weight: 500; text-decoration: none; transition: color 120ms, background 120ms; font-family: 'Outfit', system-ui, sans-serif; }
        .sn-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); text-decoration: none; }
        .sn-link--active { color: rgba(255,255,255,0.90); }
        .sn-cta { padding: 8px 20px; border-radius: 10px; background: rgba(61,240,255,0.12); border: 1px solid rgba(61,240,255,0.35); color: rgba(61,240,255,0.95); font-size: 14px; font-weight: 600; text-decoration: none; transition: all 130ms; font-family: 'Outfit', system-ui, sans-serif; margin-left: 4px; }
        .sn-cta:hover { background: rgba(61,240,255,0.22); border-color: rgba(61,240,255,0.55); text-decoration: none; }
        .sn-dash { padding: 7px 14px; border-radius: 8px; color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 500; text-decoration: none; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.04); transition: all 120ms; font-family: 'Outfit', system-ui, sans-serif; }
        .sn-dash:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.70); text-decoration: none; }
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
