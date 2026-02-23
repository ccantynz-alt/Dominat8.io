"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FOG from "vanta/dist/vanta.fog.min";
import * as THREE from "three";

const COCKPIT_LINKS = [
  { href: "/", label: "Home" },
  { href: "/deploy", label: "Deploy" },
  { href: "/domain", label: "Domain" },
  { href: "/ssl", label: "SSL" },
  { href: "/monitor", label: "Monitor" },
  { href: "/logs", label: "Logs" },
  { href: "/fix", label: "Fix" },
  { href: "/animate", label: "Animate" },
  { href: "/integrate", label: "Integrate" },
  { href: "/settings", label: "Settings" },
] as const;

export default function GoldFogPageLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<ReturnType<typeof FOG> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          highlightColor: 0xffe066,
          midtoneColor: 0xe6a23c,
          lowlightColor: 0x8b6914,
          baseColor: 0x1a0f00,
          blurFactor: 0.5,
          speed: 1.5,
          zoom: 0.5,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <>
      <div ref={vantaRef} className="gold-fog-layer" />
      <div className="gold-fog-shell">
        <header className="gold-fog-header">
          <Link href="/" className="gold-fog-logo">
            <span className="gold-fog-logo-mark">D8</span>
            <span className="gold-fog-logo-dot" />
            <span className="gold-fog-logo-text">Dominat8.io</span>
          </Link>
          <nav className="gold-fog-nav">
            <Link href="/pricing" className="gold-fog-nav-link">Pricing</Link>
          </nav>
        </header>

        <div className="gold-fog-body">
          <aside className="gold-fog-sidebar">
            <div className="gold-fog-sidebar-title">Cockpit</div>
            <ul className="gold-fog-sidebar-list">
              {COCKPIT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`gold-fog-sidebar-link ${pathname === href ? "gold-fog-sidebar-link--active" : ""}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <main className="gold-fog-main">
            <h1 className="gold-fog-page-title">{title}</h1>
            {children}
          </main>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .gold-fog-layer { position: fixed; inset: 0; z-index: 0; }
        .gold-fog-shell { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; color: #d7dbea; font-family: 'Outfit', 'Inter', system-ui, sans-serif; }
        .gold-fog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .gold-fog-logo { display: flex; align-items: baseline; gap: 8px; text-decoration: none; color: #fff; font-weight: 800; font-size: 20px; letter-spacing: -0.04em; }
        .gold-fog-logo-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(212,175,55,0.9); }
        .gold-fog-logo-text { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.5); letter-spacing: 0.02em; }
        .gold-fog-nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; font-weight: 500; }
        .gold-fog-nav-link:hover { color: rgba(212,175,55,0.9); }
        .gold-fog-body { display: flex; flex: 1; }
        .gold-fog-sidebar { width: 220px; flex-shrink: 0; padding: 24px 0 24px 24px; border-right: 1px solid rgba(255,255,255,0.07); }
        .gold-fog-sidebar-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
        .gold-fog-sidebar-list { list-style: none; margin: 0; padding: 0; }
        .gold-fog-sidebar-link { display: block; padding: 10px 14px; color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; border-radius: 8px; margin-bottom: 2px; }
        .gold-fog-sidebar-link:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.05); }
        .gold-fog-sidebar-link--active { color: rgba(212,175,55,0.95); background: rgba(212,175,55,0.08); }
        .gold-fog-main { flex: 1; padding: 32px 40px 48px; overflow: auto; }
        .gold-fog-page-title { font-size: clamp(28px, 4vw, 36px); font-weight: 800; letter-spacing: -0.04em; color: #fff; margin: 0 0 24px; }
        .gold-fog-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 16px; }
      `}} />
    </>
  );
}
