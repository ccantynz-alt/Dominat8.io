"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

const TOOL_LINKS = [
  { href: "/video", label: "Video Studio", desc: "Scripts & production packages", icon: "\u{1F3AC}" },
  { href: "/copywriter", label: "AI Copywriter", desc: "Landing pages, ads, emails", icon: "\u270D\uFE0F" },
  { href: "/social-kit", label: "Social Media Kit", desc: "7-day content calendar", icon: "\u{1F4F1}" },
  { href: "/seo-audit", label: "Deep SEO Audit", desc: "Technical audit & strategy", icon: "\u{1F50D}" },
];

const TOOL_PATHS = TOOL_LINKS.map(t => t.href);

export function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setToolsOpen(false); }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!toolsOpen) return;
    const handler = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [toolsOpen]);

  const isToolPage = TOOL_PATHS.some(p => pathname === p);

  return (
    <>
      <style>{`
.sn{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 10px 0 24px;height:56px;border-radius:999px;border:1px solid rgba(100,180,255,.06);background:rgba(3,7,18,.35);backdrop-filter:blur(32px) saturate(1.8);-webkit-backdrop-filter:blur(32px) saturate(1.8);transition:all 400ms cubic-bezier(.16,1,.3,1);width:auto;max-width:calc(100vw - 32px);gap:6px;}
.sn--s{background:rgba(3,7,18,.92);border-color:rgba(100,180,255,.12);box-shadow:0 8px 40px rgba(0,0,0,.50),0 0 0 1px rgba(100,180,255,.04),inset 0 1px 0 rgba(100,180,255,.04),0 0 60px rgba(0,212,255,.04);}

.sn-logo{font-size:18px;font-weight:800;color:#E8F0FF;text-decoration:none;letter-spacing:-.03em;font-family:'Outfit',system-ui,sans-serif;display:flex;align-items:center;transition:opacity 150ms;white-space:nowrap;margin-right:12px;}
.sn-logo:hover{text-decoration:none;opacity:.85;}
.sn-logo-dot{color:#00D4FF;font-weight:900;text-shadow:0 0 12px rgba(0,212,255,.50);}

.sn-links{display:flex;gap:2px;align-items:center;}

.sn-link{padding:8px 16px;border-radius:999px;color:rgba(200,220,255,.42);font-size:13.5px;font-weight:500;text-decoration:none;transition:all 200ms cubic-bezier(.16,1,.3,1);font-family:'Inter',system-ui,sans-serif;letter-spacing:-.01em;position:relative;}
.sn-link:hover{color:rgba(200,220,255,.90);background:rgba(100,180,255,.06);text-decoration:none;}
.sn-link--a{color:rgba(0,212,255,.92);font-weight:600;}
.sn-link--a::after{content:'';position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:18px;height:2px;border-radius:1px;background:rgba(0,212,255,.65);}

/* Tools dropdown */
.sn-tools-wrap{position:relative;}
.sn-tools-btn{padding:8px 16px;border-radius:999px;color:rgba(200,220,255,.42);font-size:13.5px;font-weight:500;cursor:pointer;font-family:'Inter',system-ui,sans-serif;letter-spacing:-.01em;border:none;background:none;transition:all 200ms;display:flex;align-items:center;gap:4px;}
.sn-tools-btn:hover{color:rgba(200,220,255,.90);background:rgba(100,180,255,.06);}
.sn-tools-btn--a{color:rgba(0,212,255,.92);font-weight:600;}
.sn-tools-chevron{font-size:9px;transition:transform 200ms;opacity:.5;}
.sn-tools-btn:hover .sn-tools-chevron{opacity:.8;}
.sn-tools-open .sn-tools-chevron{transform:rotate(180deg);}

.sn-dropdown{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(8px);min-width:260px;border-radius:18px;border:1px solid rgba(100,180,255,.12);background:rgba(3,7,18,.96);backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);padding:8px;box-shadow:0 20px 60px rgba(0,0,0,.60),0 0 0 1px rgba(100,180,255,.04);opacity:0;pointer-events:none;transition:all 250ms cubic-bezier(.16,1,.3,1);}
.sn-dropdown--open{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0);}

.sn-tool-link{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;text-decoration:none;transition:all 150ms;color:#E8F0FF;}
.sn-tool-link:hover{background:rgba(100,180,255,.06);text-decoration:none;}
.sn-tool-icon{width:36px;height:36px;border-radius:10px;background:rgba(100,180,255,.04);border:1px solid rgba(100,180,255,.08);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.sn-tool-info{flex:1;}
.sn-tool-name{font-size:13px;font-weight:700;color:rgba(200,220,255,.85);letter-spacing:-.01em;}
.sn-tool-desc{font-size:11px;color:rgba(200,220,255,.35);line-height:1.3;margin-top:1px;}

.sn-dash{padding:8px 16px;border-radius:999px;color:rgba(200,220,255,.38);font-size:13.5px;font-weight:500;text-decoration:none;transition:all 180ms;font-family:'Inter',system-ui,sans-serif;}
.sn-dash:hover{color:rgba(200,220,255,.75);text-decoration:none;}

.sn-cta{padding:10px 24px;border-radius:999px;background:linear-gradient(135deg,#00D4FF,#0066FF);border:none;color:#030712;font-size:13.5px;font-weight:700;text-decoration:none;transition:all 250ms cubic-bezier(.16,1,.3,1);font-family:'Inter',system-ui,sans-serif;letter-spacing:-.01em;margin-left:6px;white-space:nowrap;}
.sn-cta:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,212,255,.35),0 0 0 1px rgba(0,212,255,.20),0 0 40px rgba(0,102,255,.15);text-decoration:none;}

/* Hamburger */
.sn-ham{display:none;background:none;border:none;cursor:pointer;padding:10px;color:rgba(200,220,255,.55);font-size:22px;line-height:1;transition:color 150ms;}
.sn-ham:hover{color:rgba(200,220,255,.80);}

@media(max-width:768px){
  .sn-links,.sn-dash,.sn-tools-wrap{display:none;}
  .sn-ham{display:block;}
  .sn{padding:0 14px 0 18px;}
}

/* Mobile menu */
.sn-mob{position:fixed;inset:0;z-index:199;background:rgba(3,7,18,.96);backdrop-filter:blur(48px);-webkit-backdrop-filter:blur(48px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0;pointer-events:none;transition:opacity 350ms cubic-bezier(.16,1,.3,1);}
.sn-mob--open{opacity:1;pointer-events:auto;}
.sn-mob-link{font-size:24px;font-weight:600;color:rgba(200,220,255,.55);text-decoration:none;padding:18px 36px;border-radius:18px;transition:all 180ms;letter-spacing:-.02em;font-family:'Outfit',system-ui,sans-serif;}
.sn-mob-link:hover{color:#E8F0FF;background:rgba(100,180,255,.05);}
.sn-mob-divider{width:60px;height:1px;background:rgba(200,220,255,.08);margin:8px 0;}
.sn-mob-label{font-size:10px;font-weight:700;color:rgba(200,220,255,.20);text-transform:uppercase;letter-spacing:.10em;margin-bottom:-4px;}
.sn-mob-close{position:absolute;top:22px;right:26px;background:none;border:none;color:rgba(200,220,255,.45);font-size:30px;cursor:pointer;padding:10px;transition:color 150ms;}
.sn-mob-close:hover{color:rgba(200,220,255,.75);}
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

        {/* Tools dropdown */}
        <div className="sn-tools-wrap" ref={toolsRef}>
          <button
            className={`sn-tools-btn${isToolPage ? " sn-tools-btn--a" : ""}${toolsOpen ? " sn-tools-open" : ""}`}
            onClick={() => setToolsOpen(o => !o)}
          >
            Tools <span className="sn-tools-chevron">{"\u25BC"}</span>
          </button>
          <div className={`sn-dropdown${toolsOpen ? " sn-dropdown--open" : ""}`}>
            {TOOL_LINKS.map(tool => (
              <Link key={tool.href} href={tool.href} className="sn-tool-link" onClick={() => setToolsOpen(false)}>
                <div className="sn-tool-icon">{tool.icon}</div>
                <div className="sn-tool-info">
                  <div className="sn-tool-name">{tool.label}</div>
                  <div className="sn-tool-desc">{tool.desc}</div>
                </div>
              </Link>
            ))}
          </div>
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
        <div className="sn-mob-divider" />
        <span className="sn-mob-label">AI Tools</span>
        {TOOL_LINKS.map(tool => (
          <Link key={tool.href} href={tool.href} className="sn-mob-link" onClick={() => setMobileOpen(false)} style={{ fontSize: 20 }}>
            {tool.icon} {tool.label}
          </Link>
        ))}
        <div className="sn-mob-divider" />
        <Link href="/dashboard" className="sn-mob-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
        <Link href="/build" className="sn-mob-link" onClick={() => setMobileOpen(false)} style={{ color: "#00D4FF" }}>
          Start building
        </Link>
      </div>
    </>
  );
}
