"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/gallery",   label: "Gallery" },
  { href: "/pricing",   label: "Pricing" },
];

export function Nav() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  return (
    <>
      <nav className="d8-shared-nav">
        <Link href="/" className="d8-shared-nav-brand">
          <span className="d8-shared-nav-logo">D8</span>
          <span className="d8-shared-nav-dot" />
          <span className="d8-shared-nav-name">Dominat8.io</span>
        </Link>

        <div className="d8-shared-nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`d8-shared-nav-link${pathname === href ? " d8-shared-nav-link--active" : ""}`}
            >
              {label}
            </Link>
          ))}

          {isLoaded && isSignedIn && (
            <Link
              href="/dashboard"
              className={`d8-shared-nav-link${pathname === "/dashboard" ? " d8-shared-nav-link--active" : ""}`}
            >
              Dashboard
            </Link>
          )}

          <Link href="/build" className="d8-shared-nav-cta">
            Start building
          </Link>

          {isLoaded && (
            isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button type="button" className="d8-shared-nav-signin">Sign in</button>
              </SignInButton>
            )
          )}
        </div>
      </nav>

      <style>{`
        .d8-shared-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(8,8,12,0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .d8-shared-nav-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: inherit;
        }
        .d8-shared-nav-logo {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #fff;
        }
        .d8-shared-nav-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(124,90,255,0.7);
        }
        .d8-shared-nav-name {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
        }
        .d8-shared-nav-links {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .d8-shared-nav-link {
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255,255,255,0.55);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s;
        }
        .d8-shared-nav-link:hover {
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.04);
        }
        .d8-shared-nav-link--active {
          color: rgba(255,255,255,0.90);
          border-color: rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.06);
        }
        .d8-shared-nav-cta {
          padding: 8px 18px;
          border-radius: 999px;
          background: linear-gradient(135deg,#7C5AFF,#6347FF);
          color: #fff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(124,90,255,0.30);
          transition: all 0.15s;
        }
        .d8-shared-nav-cta:hover {
          box-shadow: 0 4px 18px rgba(124,90,255,0.45);
          transform: translateY(-1px);
        }
        .d8-shared-nav-signin {
          padding: 7px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.70);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        }
        .d8-shared-nav-signin:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }
        @media (max-width: 680px) {
          .d8-shared-nav { padding: 12px 16px; }
          .d8-shared-nav-link { display: none; }
          .d8-shared-nav-name { display: none; }
        }
      `}</style>
    </>
  );
}
