"use client";

import Link from "next/link";

export function Footer() {
  return (
    <>
      <footer className="d8-shared-footer">
        <div className="d8-shared-footer-inner">
          <div className="d8-shared-footer-top">
            {/* Brand */}
            <div className="d8-shared-footer-brand">
              <Link href="/" className="d8-shared-footer-logo-link">
                <span className="d8-shared-footer-logo">D8</span>
                <span className="d8-shared-footer-dot" />
                <span className="d8-shared-footer-name">Dominat8.io</span>
              </Link>
              <p className="d8-shared-footer-tagline">
                AI website builder. Describe your business. Watch it appear.
              </p>
            </div>

            {/* Links */}
            <div className="d8-shared-footer-cols">
              <div className="d8-shared-footer-col">
                <div className="d8-shared-footer-col-title">Product</div>
                <Link href="/build" className="d8-shared-footer-link">Builder</Link>
                <Link href="/templates" className="d8-shared-footer-link">Templates</Link>
                <Link href="/gallery" className="d8-shared-footer-link">Gallery</Link>
                <Link href="/pricing" className="d8-shared-footer-link">Pricing</Link>
              </div>
              <div className="d8-shared-footer-col">
                <div className="d8-shared-footer-col-title">Company</div>
                <Link href="/about" className="d8-shared-footer-link">About</Link>
                <Link href="/privacy" className="d8-shared-footer-link">Privacy</Link>
                <Link href="/terms" className="d8-shared-footer-link">Terms</Link>
                <a href="mailto:hello@dominat8.io" className="d8-shared-footer-link">Contact</a>
              </div>
            </div>
          </div>

          <div className="d8-shared-footer-bottom">
            <span>&copy; {new Date().getFullYear()} Dominat8.io. All rights reserved.</span>
          </div>
        </div>
      </footer>

      <style>{`
        .d8-shared-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          background: #08080c;
          color: rgba(255,255,255,0.45);
          font-size: 13px;
        }
        .d8-shared-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 28px 28px;
        }
        .d8-shared-footer-top {
          display: flex;
          justify-content: space-between;
          gap: 48px;
          margin-bottom: 32px;
        }
        .d8-shared-footer-brand { max-width: 280px; }
        .d8-shared-footer-logo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: inherit;
          margin-bottom: 10px;
        }
        .d8-shared-footer-logo {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #fff;
        }
        .d8-shared-footer-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(124,90,255,0.6);
        }
        .d8-shared-footer-name {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.40);
        }
        .d8-shared-footer-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.30);
          line-height: 1.5;
          margin: 0;
        }
        .d8-shared-footer-cols {
          display: flex;
          gap: 56px;
        }
        .d8-shared-footer-col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .d8-shared-footer-col-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.55);
          margin-bottom: 4px;
        }
        .d8-shared-footer-link {
          color: rgba(255,255,255,0.40);
          text-decoration: none;
          font-size: 13px;
          transition: color 0.15s;
        }
        .d8-shared-footer-link:hover {
          color: rgba(255,255,255,0.75);
        }
        .d8-shared-footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 20px;
          font-size: 12px;
          color: rgba(255,255,255,0.25);
        }
        @media (max-width: 600px) {
          .d8-shared-footer-top { flex-direction: column; gap: 28px; }
          .d8-shared-footer-cols { gap: 36px; }
        }
      `}</style>
    </>
  );
}
