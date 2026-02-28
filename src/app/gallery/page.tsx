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
@keyframes glFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes glGlow{0%,100%{text-shadow:0 0 20px rgba(0,212,255,.20)}50%{text-shadow:0 0 50px rgba(0,212,255,.40),0 0 80px rgba(0,102,255,.15)}}
.gl-a{animation:glFade 700ms cubic-bezier(.16,1,.3,1) both}
.gl-d1{animation-delay:80ms}.gl-d2{animation-delay:160ms}.gl-d3{animation-delay:240ms}

.gl-page{min-height:100vh;background:#030712;color:#E8F0FF;font-family:'Outfit',system-ui,sans-serif;position:relative;}

/* Grid pattern overlay */
.gl-page::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,212,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.03) 1px,transparent 1px);background-size:60px 60px;-webkit-mask:radial-gradient(ellipse 70% 50% at 50% 20%,black 20%,transparent 70%);mask:radial-gradient(ellipse 70% 50% at 50% 20%,black 20%,transparent 70%);pointer-events:none;z-index:0;}

/* Ambient — SUPERCHARGED mesh orbs */
.gl-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.gl-blob1{position:absolute;width:900px;height:700px;top:-300px;left:-250px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,.22) 0%,rgba(0,102,255,.10) 40%,transparent 70%);filter:blur(60px);animation:glFloat 14s ease-in-out infinite;}
.gl-blob2{position:absolute;width:700px;height:600px;top:50px;right:-200px;border-radius:50%;background:radial-gradient(circle,rgba(123,97,255,.18) 0%,rgba(0,212,255,.06) 40%,transparent 70%);filter:blur(60px);animation:glFloat 18s ease-in-out infinite reverse;}
.gl-blob3{position:absolute;width:500px;height:400px;bottom:-100px;left:30%;border-radius:50%;background:radial-gradient(circle,rgba(0,255,178,.10) 0%,transparent 70%);filter:blur(60px);animation:glFloat 16s ease-in-out infinite 3s;}

/* Hero */
.gl-hero{text-align:center;padding:140px 24px 56px;position:relative;z-index:1;}
.gl-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 18px;border-radius:999px;border:1px solid rgba(0,212,255,.40);background:rgba(0,212,255,.10);color:rgba(0,212,255,.95);font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;margin-bottom:22px;font-family:'JetBrains Mono','Fira Code',monospace;box-shadow:0 0 20px rgba(0,212,255,.12);}
.gl-badge-dot{width:7px;height:7px;border-radius:50%;background:#00D4FF;animation:glPulse 2s ease-in-out infinite;box-shadow:0 0 8px rgba(0,212,255,.60);}
.gl-h1{font-size:clamp(42px,7vw,82px);font-weight:900;margin:0 0 18px;letter-spacing:-.06em;line-height:1;color:#E8F0FF;animation:glGlow 4s ease-in-out infinite;}
.gl-h1 span{background:linear-gradient(95deg,#00D4FF 0%,#0066FF 45%,#7B61FF 80%,#FF6BCA 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;background-size:200% 200%;filter:brightness(1.15);}
.gl-sub{font-size:18px;color:rgba(200,220,255,.55);margin:0 auto;line-height:1.7;max-width:550px;font-family:'Inter',system-ui,sans-serif;}

/* Stats */
.gl-stats{display:flex;align-items:center;justify-content:center;gap:48px;margin-top:40px;flex-wrap:wrap;}
.gl-stat{text-align:center;position:relative;}
.gl-stat-val{font-size:36px;font-weight:900;letter-spacing:-.04em;background:linear-gradient(135deg,#00FFB2,#00D4FF,#0066FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:brightness(1.1);}
.gl-stat-label{font-size:12px;color:rgba(200,220,255,.40);margin-top:4px;letter-spacing:.04em;font-family:'Inter',system-ui,sans-serif;font-weight:500;}

/* Divider */
.gl-divider{width:120px;height:2px;margin:48px auto 0;background:linear-gradient(90deg,transparent,rgba(0,212,255,.45),rgba(0,102,255,.35),transparent);border-radius:2px;box-shadow:0 0 12px rgba(0,212,255,.20);}

/* Grid wrapper */
.gl-grid-wrap{position:relative;z-index:1;}

/* CTA */
.gl-cta{text-align:center;padding:72px 24px 80px;position:relative;z-index:1;}
.gl-cta::before{content:'';position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:500px;height:250px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,212,255,.10),transparent 70%);pointer-events:none;}
.gl-cta-badge{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#00D4FF;margin-bottom:16px;font-family:'JetBrains Mono','Fira Code',monospace;text-shadow:0 0 12px rgba(0,212,255,.30);}
.gl-cta h2{font-size:clamp(30px,5vw,46px);font-weight:900;letter-spacing:-.04em;margin:0 0 14px;background:linear-gradient(135deg,#E8F0FF,#00D4FF,#0066FF,#7B61FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;z-index:1;}
.gl-cta p{font-size:16px;color:rgba(200,220,255,.50);margin:0 0 32px;line-height:1.6;font-family:'Inter',system-ui,sans-serif;position:relative;z-index:1;}
.gl-cta-btn{display:inline-flex;align-items:center;gap:8px;padding:17px 42px;border-radius:14px;background:linear-gradient(135deg,#00D4FF,#0066FF);border:1px solid rgba(0,212,255,.60);color:#030712;text-decoration:none;font-size:17px;font-weight:800;transition:all 200ms;position:relative;overflow:hidden;z-index:1;}
.gl-cta-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);animation:glShim 3.5s ease-in-out infinite;}
.gl-cta-btn:hover{box-shadow:0 0 40px rgba(0,212,255,.35),0 8px 32px rgba(0,102,255,.20);transform:translateY(-3px);}
      `}</style>

      <main className="gl-page">
        <div className="gl-ambient">
          <div className="gl-blob1" />
          <div className="gl-blob2" />
          <div className="gl-blob3" />
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
          <div className="gl-divider" />
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
