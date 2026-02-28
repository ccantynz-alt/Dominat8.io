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

.gl-page{min-height:100vh;background:#030712;color:#E8F0FF;font-family:'Outfit',system-ui,sans-serif;}

/* Ambient — cool blue mesh orbs */
.gl-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.gl-blob1{position:absolute;width:900px;height:700px;top:-300px;left:-250px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,.10) 0%,rgba(0,102,255,.05) 40%,transparent 70%);filter:blur(60px);}
.gl-blob2{position:absolute;width:700px;height:600px;top:50px;right:-200px;border-radius:50%;background:radial-gradient(circle,rgba(123,97,255,.08) 0%,rgba(0,212,255,.03) 40%,transparent 70%);filter:blur(60px);}

/* Hero */
.gl-hero{text-align:center;padding:140px 24px 56px;position:relative;z-index:1;}
.gl-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:999px;border:1px solid rgba(0,212,255,.30);background:rgba(0,212,255,.06);color:rgba(0,212,255,.85);font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;margin-bottom:22px;font-family:'JetBrains Mono','Fira Code',monospace;}
.gl-badge-dot{width:6px;height:6px;border-radius:50%;background:rgba(0,212,255,.85);animation:glPulse 2s ease-in-out infinite;}
.gl-h1{font-size:clamp(38px,6.5vw,72px);font-weight:900;margin:0 0 18px;letter-spacing:-.06em;line-height:1;color:#E8F0FF;}
.gl-h1 span{background:linear-gradient(95deg,#00D4FF 0%,#0066FF 55%,#7B61FF 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.gl-sub{font-size:17px;color:rgba(200,220,255,.42);margin:0 auto;line-height:1.7;max-width:520px;font-family:'Inter',system-ui,sans-serif;}

/* Stats */
.gl-stats{display:flex;align-items:center;justify-content:center;gap:40px;margin-top:36px;flex-wrap:wrap;}
.gl-stat{text-align:center;}
.gl-stat-val{font-size:30px;font-weight:900;letter-spacing:-.04em;background:linear-gradient(135deg,#00D4FF,#0066FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.gl-stat-label{font-size:11px;color:rgba(200,220,255,.30);margin-top:3px;letter-spacing:.03em;font-family:'Inter',system-ui,sans-serif;}

/* Grid wrapper */
.gl-grid-wrap{position:relative;z-index:1;}

/* CTA */
.gl-cta{text-align:center;padding:72px 24px 80px;position:relative;z-index:1;}
.gl-cta-badge{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(0,212,255,.55);margin-bottom:14px;font-family:'JetBrains Mono','Fira Code',monospace;}
.gl-cta h2{font-size:clamp(26px,4vw,38px);font-weight:800;letter-spacing:-.04em;margin:0 0 12px;color:#E8F0FF;}
.gl-cta p{font-size:15px;color:rgba(200,220,255,.40);margin:0 0 28px;line-height:1.6;font-family:'Inter',system-ui,sans-serif;}
.gl-cta-btn{display:inline-flex;align-items:center;gap:6px;padding:15px 36px;border-radius:14px;background:linear-gradient(135deg,#00D4FF,#0066FF);border:1px solid rgba(0,212,255,.60);color:#030712;text-decoration:none;font-size:15px;font-weight:700;transition:all 200ms;position:relative;overflow:hidden;}
.gl-cta-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:glShim 4s ease-in-out infinite;}
.gl-cta-btn:hover{box-shadow:0 0 28px rgba(0,212,255,.25);transform:translateY(-2px);}
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
