"use client";

import * as React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <style>{`
.err{min-height:100vh;background:#060810;color:#e9eef7;font-family:'Outfit',system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;}
.err-icon{font-size:48px;margin-bottom:24px;opacity:.6;}
.err h1{font-size:clamp(24px,4vw,36px);font-weight:800;margin:0 0 12px;letter-spacing:-.04em;}
.err-sub{font-size:15px;color:rgba(255,255,255,.40);margin:0 0 28px;max-width:420px;line-height:1.65;}
.err-detail{padding:16px 20px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);font-family:'JetBrains Mono',monospace;font-size:12px;color:rgba(255,255,255,.40);max-width:480px;width:100%;text-align:left;margin-bottom:28px;white-space:pre-wrap;word-break:break-word;line-height:1.6;}
.err-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
.err-btn{padding:12px 24px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;transition:all 200ms;font-family:inherit;border:1px solid rgba(61,240,255,.35);background:linear-gradient(135deg,rgba(61,240,255,.14),rgba(139,92,246,.08));color:rgba(61,240,255,.92);}
.err-btn:hover{transform:translateY(-2px);box-shadow:0 0 24px rgba(61,240,255,.10);border-color:rgba(61,240,255,.55);}
.err-btn-sec{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.10);color:rgba(255,255,255,.60);text-decoration:none;display:inline-flex;align-items:center;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;transition:all 180ms;}
.err-btn-sec:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.18);color:#fff;}
      `}</style>

      <main className="err">
        <div className="err-icon">⚠️</div>
        <h1>Something went wrong.</h1>
        <p className="err-sub">
          The self-heal loop is on it. Try again, or head back to the homepage.
        </p>
        <div className="err-detail">
          {error?.message || "Unknown error"}
          {error?.digest ? `\nDigest: ${error.digest}` : ""}
        </div>
        <div className="err-btns">
          <button className="err-btn" onClick={() => reset()}>Try again</button>
          <a href="/" className="err-btn-sec">Back to home</a>
        </div>
      </main>
    </>
  );
}
