import PolishShell from "@/app/_client/PolishShell";
import "./globals.css";
import type { Metadata } from "next";
import DxlAtmosphere from "@/components/dxl/DxlAtmosphere";
import DxlStatusPill from "@/components/dxl/DxlStatusPill";
import DxlWorldPulseSync from "@/components/dxl/DxlWorldPulseSync";
import DxlToasts from "@/components/dxl/DxlToasts";

export const metadata: Metadata = {
  title: "Dominat8",
  description: "AI-powered website factory.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-dxl="DXL01_20260128">
      <body className="dxl-body min-h-screen bg-black text-white antialiased">
      <DxlAtmosphere />
      <div className="dxl-content">
        {/* D8_PHASE1_LOCK_DEPLOY_STYLING_v1_20260128 */}
        <PolishShell />
        <div
          id="d8-proof"
          data-stamp="D8_PHASE1_LOCK_DEPLOY_STYLING_v1_20260128"
          data-git={process.env.VERCEL_GIT_COMMIT_SHA ?? ""}
          data-deploy={process.env.VERCEL_DEPLOYMENT_ID ?? ""}
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}
        />
        <div className="d8-app-shell"><main className="d8-app-main"><div className="d8-page d8-surface">{children}</div></main></div>
      {/* INLINE_FALLBACK_STYLES_V1
   Goal: If Tailwind/classes fail, the app still looks intentional.
   Scope: Safe baseline for cockpit + marketing + general UI elements.
*/}
<style>{`
  :root{
    color-scheme: dark;
    --bg0:#07070B;
    --bg1:#0B0B12;
    --card:rgba(255,255,255,.06);
    --card2:rgba(255,255,255,.04);
    --border:rgba(255,255,255,.12);
    --border2:rgba(255,255,255,.10);
    --text:#EDEAF7;
    --muted:rgba(237,234,247,.72);
    --muted2:rgba(237,234,247,.60);
    --accent1:rgba(168,85,247,1);
    --accent2:rgba(59,130,246,1);
    --shadow:0 30px 90px rgba(0,0,0,.45);
    --shadow2:0 18px 55px rgba(168,85,247,.18), 0 10px 24px rgba(59,130,246,.10);
    --r16:16px;
    --r20:20px;
    --r24:24px;
  }

  html,body{height:100%}
  body{
    margin:0;
    background:
      radial-gradient(1200px 800px at 65% 5%, rgba(168,85,247,.20), rgba(0,0,0,0) 60%),
      radial-gradient(900px 700px at 15% 20%, rgba(59,130,246,.12), rgba(0,0,0,0) 62%),
      linear-gradient(180deg, var(--bg0) 0%, var(--bg0) 40%, #05050A 100%);
    color:var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a{color:rgba(200,180,255,.95); text-decoration:none}
  a:hover{color:rgba(210,210,255,.98); text-decoration:underline}

  /* Generic layout helpers if Tailwind fails */
  .container, .mx-auto{
    width:100%;
    max-width:1160px;
    margin-left:auto;
    margin-right:auto;
  }

  /* Card baseline */
  .card, .panel, .surface{
    background: linear-gradient(180deg, var(--card), var(--card2));
    border:1px solid var(--border);
    border-radius: var(--r20);
    box-shadow: var(--shadow);
  }

  /* Buttons baseline */
  button, .btn, a.btn{
    font: inherit;
    border-radius: 14px;
    padding: 10px 14px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,.04);
    color: rgba(237,234,247,.90);
    cursor: pointer;
  }
  button:hover, .btn:hover, a.btn:hover{
    background: rgba(255,255,255,.07);
  }
  .btn-primary{
    background: linear-gradient(90deg, var(--accent1), var(--accent2));
    color: #07070B !important;
    box-shadow: var(--shadow2);
    border: 1px solid rgba(255,255,255,.10);
    text-decoration:none !important;
  }
  .btn-primary:hover{
    filter: brightness(1.05);
  }

  /* Inputs baseline (admin/cockpit forms) */
  input, select, textarea{
    font: inherit;
    color: rgba(237,234,247,.92);
    background: rgba(0,0,0,.32);
    border: 1px solid var(--border2);
    border-radius: 14px;
    padding: 10px 12px;
    outline: none;
  }
  input:focus, select:focus, textarea:focus{
    border-color: rgba(168,85,247,.55);
    box-shadow: 0 0 0 4px rgba(168,85,247,.15);
  }
  ::placeholder{color: rgba(237,234,247,.45)}

  /* Tables baseline */
  table{border-collapse:collapse; width:100%}
  th,td{
    border-bottom: 1px solid rgba(255,255,255,.08);
    padding: 10px 10px;
    text-align:left;
    color: rgba(237,234,247,.85);
  }
  th{color: rgba(237,234,247,.70); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; font-size: 12px}

  /* Headings baseline */
  h1{font-size:40px; line-height:1.05; letter-spacing:-.02em; margin: 0}
  h2{font-size:26px; line-height:1.15; margin: 0}
  h3{font-size:18px; line-height:1.25; margin: 0}
  p{color: var(--muted); line-height:1.6}

  /* Soft separators */
  hr{border:0; border-top:1px solid rgba(255,255,255,.08); margin:18px 0}

  /* If something renders totally naked, this keeps content readable */
  main{display:block}
`}</style>
      
      {process.env.DXL_STATUS_PILL === "0" ? null : <DxlStatusPill />}

      <DxlWorldPulseSync />

      {process.env.DXL_TOASTS === "0" ? null : <DxlToasts />}
</div>
    </body>
    </html>
  );
}