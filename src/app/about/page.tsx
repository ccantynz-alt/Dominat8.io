import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";
import Link from "next/link";

export const metadata = {
  title: "About — Dominat8.io",
  description: "We're building the future of websites. Every business deserves a world-class online presence, built in seconds.",
};

const STATS = [
  { value: "50,000+", label: "Websites generated" },
  { value: "180+", label: "Countries reached" },
  { value: "< 30s", label: "Average build time" },
  { value: "4.9 ★", label: "User satisfaction" },
];

const VALUES = [
  { icon: "⚡", title: "Speed without compromise", body: "Building a website shouldn't take weeks. Every architectural decision we make is in service of one goal: getting your vision live faster than anyone thought possible." },
  { icon: "✦", title: "Quality as the default", body: "Fast doesn't mean cheap. Our AI is trained on the world's best-designed sites. The output isn't a rough draft — it's something you'd actually show a client." },
  { icon: "🌐", title: "Democratising design", body: "Before AI, a premium website cost $10,000–$50,000. A solo founder in Lagos should have the same competitive edge online as a Silicon Valley startup." },
  { icon: "🔒", title: "Radical transparency", body: "We don't lock you in. Every site you build is yours — download the HTML, host it anywhere, no strings attached. We earn loyalty by being genuinely useful." },
];

const TIMELINE = [
  { year: "2024", event: "Founded with a conviction that AI could replace the entire web design workflow." },
  { year: "Q1 2025", event: "First public beta. 1,000 sites generated in the first week." },
  { year: "Q2 2025", event: "Crossed 10,000 active users. Launched Pro tier with CDN deployment." },
  { year: "Q3 2025", event: "38-template library. Agency tier with API access and team features." },
  { year: "2026", event: "Share links, white-label output, and agent automation suite in production." },
];

export default function AboutPage() {
  return (
    <>
      <style>{`
@keyframes abFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes abShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
@keyframes abPulse{0%,100%{box-shadow:0 0 20px rgba(0,212,255,.25)}50%{box-shadow:0 0 40px rgba(0,212,255,.45)}}
@keyframes abGlow{0%,100%{text-shadow:0 0 20px rgba(0,212,255,.25)}50%{text-shadow:0 0 40px rgba(0,212,255,.45),0 0 80px rgba(0,102,255,.15)}}
@keyframes abFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.ab-a{animation:abFade 800ms cubic-bezier(.16,1,.3,1) both}
.ab-d1{animation-delay:80ms}.ab-d2{animation-delay:180ms}.ab-d3{animation-delay:280ms}.ab-d4{animation-delay:380ms}.ab-d5{animation-delay:480ms}

.ab-page{min-height:100vh;background:#030712;color:#E8F0FF;font-family:'Outfit',system-ui,sans-serif;padding:0 0 0;position:relative;overflow:hidden;}

/* Grid pattern */
.ab-page::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,212,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.03) 1px,transparent 1px);background-size:60px 60px;-webkit-mask:radial-gradient(ellipse 70% 50% at 50% 30%,black 20%,transparent 70%);mask:radial-gradient(ellipse 70% 50% at 50% 30%,black 20%,transparent 70%);pointer-events:none;z-index:0;}

.ab-mesh{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.ab-mesh-1{position:absolute;width:900px;height:700px;top:-300px;left:-250px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,212,255,.20),transparent 65%);filter:blur(80px);animation:abFloat 14s ease-in-out infinite;}
.ab-mesh-2{position:absolute;width:700px;height:600px;bottom:-200px;right:-200px;border-radius:50%;background:radial-gradient(ellipse,rgba(123,97,255,.16),transparent 65%);filter:blur(80px);animation:abFloat 18s ease-in-out infinite reverse;}
.ab-mesh-3{position:absolute;width:500px;height:500px;top:40%;left:50%;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse,rgba(0,255,178,.08),transparent 65%);filter:blur(80px);animation:abFloat 20s ease-in-out infinite 2s;}

.ab-hero{max-width:860px;margin:0 auto;padding:140px 24px 72px;text-align:center;position:relative;z-index:1;}
.ab-badge{display:inline-block;padding:6px 20px;border-radius:999px;border:1px solid rgba(0,212,255,.40);background:rgba(0,212,255,.10);color:rgba(0,212,255,.95);font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;margin-bottom:26px;font-family:'JetBrains Mono',monospace;backdrop-filter:blur(12px);box-shadow:0 0 20px rgba(0,212,255,.12);}
.ab-h1{font-size:clamp(42px,7vw,80px);font-weight:900;margin:0 0 24px;letter-spacing:-.06em;line-height:1;animation:abGlow 4s ease-in-out infinite;}
.ab-h1-grad{background:linear-gradient(135deg,#E8F0FF 0%,#00D4FF 50%,#7B61FF 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;background-size:200% 200%;filter:brightness(1.1);}
.ab-sub{font-size:20px;color:rgba(200,220,255,.60);margin:0 auto;line-height:1.75;max-width:620px;font-family:'Inter',system-ui,sans-serif;}

/* Stats */
.ab-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;max-width:900px;margin:0 auto 72px;padding:0 24px;}
.ab-stat{padding:32px 20px;text-align:center;background:rgba(100,180,255,.035);border:1px solid rgba(100,180,255,.10);transition:all 280ms;position:relative;overflow:hidden;}
.ab-stat::before{content:'';position:absolute;inset:0;padding:1px;background:linear-gradient(135deg,rgba(0,212,255,.25),rgba(0,102,255,.15));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 280ms;pointer-events:none;}
.ab-stat:first-child{border-radius:18px 0 0 18px}.ab-stat:last-child{border-radius:0 18px 18px 0}
.ab-stat:first-child::before{border-radius:18px 0 0 18px}.ab-stat:last-child::before{border-radius:0 18px 18px 0}
.ab-stat:hover{background:rgba(100,180,255,.07);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 30px rgba(0,212,255,.06);}
.ab-stat:hover::before{opacity:1;}
.ab-stat-val{font-size:clamp(32px,4vw,52px);font-weight:900;letter-spacing:-.04em;background:linear-gradient(135deg,#00FFB2,#00D4FF,#0066FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;filter:brightness(1.1);}
.ab-stat-label{font-size:13px;color:rgba(200,220,255,.50);font-family:'Inter',system-ui,sans-serif;font-weight:500;}
@media(max-width:640px){.ab-stats{grid-template-columns:1fr 1fr;}.ab-stat:first-child{border-radius:18px 0 0 0}.ab-stat:nth-child(2){border-radius:0 18px 0 0}.ab-stat:nth-child(3){border-radius:0 0 0 18px}.ab-stat:last-child{border-radius:0 0 18px 0}.ab-stat:first-child::before{border-radius:18px 0 0 0}.ab-stat:nth-child(2)::before{border-radius:0 18px 0 0}.ab-stat:nth-child(3)::before{border-radius:0 0 0 18px}.ab-stat:last-child::before{border-radius:0 0 18px 0}}

/* Story */
.ab-story{max-width:720px;margin:0 auto 80px;padding:0 24px;}
.ab-story-border{padding:0 0 0 28px;border-left:3px solid rgba(0,212,255,.45);position:relative;}
.ab-story-border::before{content:'';position:absolute;left:-7px;top:0;width:12px;height:12px;border-radius:50%;background:#00D4FF;box-shadow:0 0 24px rgba(0,212,255,.60),0 0 48px rgba(0,212,255,.20);animation:abPulse 3s ease-in-out infinite;}
.ab-story h2{font-size:clamp(24px,3.5vw,36px);font-weight:800;margin:0 0 20px;letter-spacing:-.03em;background:linear-gradient(135deg,#E8F0FF,#00D4FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.ab-story p{font-size:16px;color:rgba(200,220,255,.65);line-height:1.80;margin:0 0 18px;font-family:'Inter',system-ui,sans-serif;}
.ab-story p:last-child{margin:0;}
.ab-story em{color:#00D4FF;font-style:italic;}

/* Values */
.ab-values{max-width:1040px;margin:0 auto 80px;padding:0 24px;}
.ab-values-h2{text-align:center;font-size:clamp(28px,4.5vw,42px);font-weight:800;letter-spacing:-.04em;margin:0 0 40px;background:linear-gradient(135deg,#E8F0FF 30%,#00D4FF 70%,#7B61FF 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.ab-values-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:640px){.ab-values-grid{grid-template-columns:1fr;}}
.ab-value{padding:32px;border-radius:22px;border:1px solid rgba(100,180,255,.10);background:rgba(100,180,255,.035);transition:all 280ms;position:relative;overflow:hidden;}
.ab-value::before{content:'';position:absolute;inset:0;border-radius:22px;padding:1.5px;background:linear-gradient(135deg,rgba(0,212,255,.35),rgba(0,102,255,.25),rgba(0,255,178,.18));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 280ms;pointer-events:none;}
.ab-value:hover{background:rgba(100,180,255,.07);transform:translateY(-5px);box-shadow:0 20px 60px rgba(0,0,0,.30),0 0 50px rgba(0,212,255,.10);}
.ab-value:hover::before{opacity:1;}
.ab-value-icon{font-size:36px;margin-bottom:16px;display:block;filter:drop-shadow(0 0 12px rgba(0,212,255,.25));}
.ab-value h3{font-size:19px;font-weight:800;margin:0 0 10px;letter-spacing:-.02em;color:#E8F0FF;}
.ab-value p{margin:0;font-size:15px;color:rgba(200,220,255,.60);line-height:1.75;font-family:'Inter',system-ui,sans-serif;}

/* Timeline */
.ab-timeline{max-width:640px;margin:0 auto 80px;padding:0 24px;}
.ab-timeline-h2{text-align:center;font-size:clamp(28px,4.5vw,42px);font-weight:800;letter-spacing:-.04em;margin:0 0 40px;background:linear-gradient(135deg,#E8F0FF 30%,#00D4FF 70%,#7B61FF 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.ab-tl-item{display:flex;gap:24px;position:relative;padding-bottom:36px;}
.ab-tl-item:last-child{padding-bottom:0;}
.ab-tl-item:not(:last-child)::after{content:'';position:absolute;left:51px;top:32px;bottom:0;width:2px;background:linear-gradient(180deg,rgba(0,212,255,.40),rgba(0,102,255,.18));}
.ab-tl-year{width:80px;flex-shrink:0;padding-top:4px;}
.ab-tl-year span{font-size:13px;font-weight:700;color:#00D4FF;font-family:'JetBrains Mono',monospace;white-space:nowrap;text-shadow:0 0 12px rgba(0,212,255,.30);}
.ab-tl-dot{width:12px;height:12px;border-radius:50%;background:#00D4FF;border:2px solid rgba(0,212,255,.35);flex-shrink:0;margin-top:6px;z-index:1;box-shadow:0 0 16px rgba(0,212,255,.40),0 0 32px rgba(0,212,255,.15);}
.ab-tl-body{flex:1;font-size:15px;color:rgba(200,220,255,.70);line-height:1.65;font-family:'Inter',system-ui,sans-serif;}

/* CTA */
.ab-cta{text-align:center;padding:0 24px 80px;position:relative;}
.ab-cta::before{content:'';position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:600px;height:300px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,212,255,.10),transparent 70%);pointer-events:none;}
.ab-cta h2{font-size:clamp(30px,5vw,44px);font-weight:900;letter-spacing:-.04em;margin:0 0 14px;background:linear-gradient(135deg,#E8F0FF,#00D4FF,#0066FF,#7B61FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;z-index:1;}
.ab-cta p{font-size:16px;color:rgba(200,220,255,.50);margin:0 0 32px;font-family:'Inter',system-ui,sans-serif;position:relative;z-index:1;}
.ab-cta-row{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;}
.ab-cta-primary{display:inline-flex;align-items:center;gap:8px;padding:16px 38px;border-radius:14px;background:linear-gradient(135deg,#00D4FF,#0066FF);border:1px solid rgba(0,212,255,.60);color:#030712;text-decoration:none;font-size:17px;font-weight:800;transition:all 200ms;position:relative;overflow:hidden;font-family:'Outfit',system-ui,sans-serif;}
.ab-cta-primary::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);animation:abShim 3.5s ease-in-out infinite;}
.ab-cta-primary:hover{box-shadow:0 0 40px rgba(0,212,255,.35),0 8px 32px rgba(0,102,255,.20);transform:translateY(-3px);background:linear-gradient(135deg,#1ADCFF,#1A7AFF);}
.ab-cta-secondary{display:inline-flex;align-items:center;gap:8px;padding:16px 38px;border-radius:14px;border:1px solid rgba(100,180,255,.14);background:rgba(100,180,255,.045);color:rgba(200,220,255,.70);text-decoration:none;font-size:17px;font-weight:600;transition:all 200ms;font-family:'Outfit',system-ui,sans-serif;}
.ab-cta-secondary:hover{background:rgba(100,180,255,.09);border-color:rgba(100,180,255,.25);color:#E8F0FF;transform:translateY(-2px);}
      `}</style>

      <main className="ab-page">
        <div className="ab-mesh"><div className="ab-mesh-1" /><div className="ab-mesh-2" /><div className="ab-mesh-3" /></div>
        <SiteNav />

        {/* Hero */}
        <div className="ab-hero">
          <div className="ab-badge ab-a">ABOUT</div>
          <h1 className="ab-h1 ab-a ab-d1">
            Every business deserves<br /><span className="ab-h1-grad">a world-class website.</span>
          </h1>
          <p className="ab-sub ab-a ab-d2">
            We started Dominat8 because great design was locked behind agencies, budgets, and timelines.
            AI has changed that forever — and we&apos;re leading the charge.
          </p>
        </div>

        {/* Stats */}
        <div className="ab-stats ab-a ab-d3">
          {STATS.map((s, i) => (
            <div key={i} className="ab-stat">
              <div className="ab-stat-val">{s.value}</div>
              <div className="ab-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="ab-story ab-a ab-d4">
          <div className="ab-story-border">
            <h2>Why we built this</h2>
            <p>
              In 2024, most small businesses still didn&apos;t have a real website. Not because they didn&apos;t want one — but because the
              process was too slow, too expensive, or too complicated. Agencies quoted $5,000 minimum. Website builders
              required hours of dragging and dropping. Templates looked like templates.
            </p>
            <p>
              We asked a different question: what if you could just <em>describe</em> your business,
              and the website appeared? Not a wireframe. Not a generic template. A complete, production-ready site
              with your brand identity, your services, your story — built in the time it takes to brew a coffee.
            </p>
            <p>
              That&apos;s Dominat8. We&apos;ve now generated over 50,000 websites across 180 countries.
              From solo freelancers to agencies. From coffee shops in Wellington to law firms in Chicago.
              And we&apos;re just getting started.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="ab-values">
          <h2 className="ab-values-h2 ab-a ab-d4">What we believe</h2>
          <div className="ab-values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className={`ab-value ab-a ab-d${Math.min(i + 2, 5)}`}>
                <span className="ab-value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="ab-timeline">
          <h2 className="ab-timeline-h2 ab-a ab-d4">How we got here</h2>
          {TIMELINE.map((t, i) => (
            <div key={i} className={`ab-tl-item ab-a ab-d${Math.min(i + 1, 5)}`}>
              <div className="ab-tl-year"><span>{t.year}</span></div>
              <div className="ab-tl-dot" />
              <div className="ab-tl-body">{t.event}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="ab-cta">
          <h2 className="ab-a">Be part of what comes next.</h2>
          <p className="ab-a ab-d1">Questions? Ideas? We&apos;d love to hear from you.</p>
          <div className="ab-cta-row ab-a ab-d2">
            <Link href="/build" className="ab-cta-primary">Start building →</Link>
            <a href="mailto:hello@dominat8.io" className="ab-cta-secondary">Say hello</a>
          </div>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
