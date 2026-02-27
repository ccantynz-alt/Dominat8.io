import GalleryGrid from "./GalleryGrid";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

export const metadata = {
  title: "Gallery — AI-Generated Websites | Dominat8.io",
  description: "Real websites built by AI in under 30 seconds. 18+ industries. Click any example to generate yours instantly.",
};

export default function GalleryPage() {
  return (
    <>
      <style>{`
@keyframes glFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes glShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
@keyframes glPulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.15);opacity:1}}
.gl-a{animation:glFade 700ms cubic-bezier(.16,1,.3,1) both}
.gl-d1{animation-delay:80ms}.gl-d2{animation-delay:160ms}.gl-d3{animation-delay:240ms}

.gl-page{min-height:100vh;background:#060810;color:#e9eef7;font-family:'Outfit',system-ui,sans-serif;}

/* Ambient */
.gl-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.gl-blob1{position:absolute;width:800px;height:600px;top:-250px;left:-200px;border-radius:50%;background:radial-gradient(circle,rgba(61,240,255,.05) 0%,transparent 70%);}
.gl-blob2{position:absolute;width:600px;height:500px;top:100px;right:-200px;border-radius:50%;background:radial-gradient(circle,rgba(56,248,166,.04) 0%,transparent 70%);}

/* Hero */
.gl-hero{text-align:center;padding:120px 24px 48px;position:relative;z-index:1;}
.gl-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:999px;border:1px solid rgba(61,240,255,.25);background:rgba(61,240,255,.05);color:rgba(61,240,255,.80);font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;margin-bottom:22px;}
.gl-badge-dot{width:6px;height:6px;border-radius:50%;background:rgba(61,240,255,.80);animation:glPulse 2s ease-in-out infinite;}
.gl-h1{font-size:clamp(34px,5.5vw,58px);font-weight:900;margin:0 0 16px;letter-spacing:-.05em;line-height:1.05;}
.gl-h1 span{background:linear-gradient(95deg,#3DF0FF 0%,#38F8A6 55%,#00D47A 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.gl-sub{font-size:17px;color:rgba(255,255,255,.42);margin:0 auto;line-height:1.7;max-width:520px;}

/* Stats */
.gl-stats{display:flex;align-items:center;justify-content:center;gap:40px;margin-top:36px;flex-wrap:wrap;}
.gl-stat{text-align:center;}
.gl-stat-val{font-size:24px;font-weight:900;letter-spacing:-.03em;background:linear-gradient(135deg,#3DF0FF,#8B5CF6);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.gl-stat-label{font-size:11px;color:rgba(255,255,255,.32);margin-top:3px;letter-spacing:.03em;}

/* Grid wrapper */
.gl-grid-wrap{position:relative;z-index:1;}

/* CTA */
.gl-cta{text-align:center;padding:72px 24px 80px;position:relative;z-index:1;}
.gl-cta-badge{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(61,240,255,.50);margin-bottom:14px;}
.gl-cta h2{font-size:clamp(26px,4vw,38px);font-weight:800;letter-spacing:-.04em;margin:0 0 12px;}
.gl-cta p{font-size:15px;color:rgba(255,255,255,.40);margin:0 0 28px;line-height:1.6;}
.gl-cta-btn{display:inline-flex;align-items:center;gap:6px;padding:15px 36px;border-radius:14px;background:linear-gradient(135deg,rgba(61,240,255,.14),rgba(139,92,246,.08));border:1px solid rgba(61,240,255,.35);color:rgba(61,240,255,.92);text-decoration:none;font-size:15px;font-weight:700;transition:all 200ms;position:relative;overflow:hidden;}
.gl-cta-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);animation:glShim 4s ease-in-out infinite;}
.gl-cta-btn:hover{border-color:rgba(61,240,255,.55);box-shadow:0 0 28px rgba(61,240,255,.10);transform:translateY(-2px);}
      `}</style>

      <main className="gl-page">
        <div className="gl-ambient">
          <div className="gl-blob1" />
          <div className="gl-blob2" />
        </div>

        <SiteNav />

        {/* Hero */}
        <div className="gl-hero">
          <div className="gl-badge gl-a">
            <span className="gl-badge-dot" />
            GALLERY — 18 EXAMPLES
          </div>
          <h1 className="gl-h1 gl-a gl-d1">
            Real sites. Real prompts.<br />
            <span>Generated in seconds.</span>
          </h1>
          <p className="gl-sub gl-a gl-d2">
            Every site below was created from a single text description. No editing, no templates. Click any card to generate one like it.
          </p>

          {/* Stats */}
          <div className="gl-stats gl-a gl-d3">
            {[
              { v: "18+", l: "examples shown" },
              { v: "~24s", l: "avg generation" },
              { v: "100%", l: "AI-authored" },
            ].map((s, i) => (
              <div key={i} className="gl-stat">
                <div className="gl-stat-val">{s.v}</div>
                <div className="gl-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="gl-grid-wrap">
          <GalleryGrid />
        </div>

        {/* CTA */}
        <div className="gl-cta">
          <div className="gl-cta-badge gl-a">Your turn</div>
          <h2 className="gl-a gl-d1">Describe your business.<br />Watch it appear.</h2>
          <p className="gl-a gl-d2">No account required. First 3 sites are free.</p>
          <a href="/build" className="gl-cta-btn gl-a gl-d3">
            Start building for free &rarr;
          </a>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
