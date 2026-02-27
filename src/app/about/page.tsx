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
.ab-a{animation:abFade 800ms cubic-bezier(.16,1,.3,1) both}
.ab-d1{animation-delay:80ms}.ab-d2{animation-delay:180ms}.ab-d3{animation-delay:280ms}.ab-d4{animation-delay:380ms}.ab-d5{animation-delay:480ms}

.ab-page{min-height:100vh;background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;padding:0 0 0;}
.ab-hero{max-width:800px;margin:0 auto;padding:120px 24px 60px;text-align:center;position:relative;}
.ab-badge{display:inline-block;padding:5px 16px;border-radius:999px;border:1px solid rgba(240,179,90,.25);background:rgba(240,179,90,.06);color:rgba(240,179,90,.85);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;font-family:'JetBrains Mono',monospace;}
.ab-h1{font-size:clamp(34px,5.5vw,56px);font-weight:900;margin:0 0 20px;letter-spacing:-.05em;line-height:1.05;color:#F5F0EB;}
.ab-sub{font-size:18px;color:rgba(245,240,235,.55);margin:0 auto;line-height:1.7;max-width:600px;font-family:'Inter',system-ui,sans-serif;}

/* Stats */
.ab-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;max-width:900px;margin:0 auto 72px;padding:0 24px;}
.ab-stat{padding:28px 20px;text-align:center;background:rgba(245,240,235,.035);border:1px solid rgba(245,240,235,.08);transition:all 200ms;}
.ab-stat:first-child{border-radius:18px 0 0 18px}.ab-stat:last-child{border-radius:0 18px 18px 0}
.ab-stat:hover{background:rgba(245,240,235,.055);}
.ab-stat-val{font-size:clamp(24px,3vw,36px);font-weight:900;letter-spacing:-.03em;background:linear-gradient(135deg,#F0B35A,#E8715A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;}
.ab-stat-label{font-size:13px;color:rgba(245,240,235,.42);font-family:'Inter',system-ui,sans-serif;}
@media(max-width:640px){.ab-stats{grid-template-columns:1fr 1fr;}.ab-stat:first-child{border-radius:18px 0 0 0}.ab-stat:nth-child(2){border-radius:0 18px 0 0}.ab-stat:nth-child(3){border-radius:0 0 0 18px}.ab-stat:last-child{border-radius:0 0 18px 0}}

/* Story */
.ab-story{max-width:720px;margin:0 auto 80px;padding:0 24px;}
.ab-story-border{padding:0 0 0 28px;border-left:2px solid rgba(240,179,90,.30);position:relative;}
.ab-story-border::before{content:'';position:absolute;left:-5px;top:0;width:8px;height:8px;border-radius:50%;background:rgba(240,179,90,.55);}
.ab-story h2{font-size:clamp(22px,3vw,32px);font-weight:800;margin:0 0 20px;letter-spacing:-.03em;color:#F5F0EB;}
.ab-story p{font-size:16px;color:rgba(245,240,235,.58);line-height:1.80;margin:0 0 18px;font-family:'Inter',system-ui,sans-serif;}
.ab-story p:last-child{margin:0;}

/* Values */
.ab-values{max-width:1040px;margin:0 auto 80px;padding:0 24px;}
.ab-values-h2{text-align:center;font-size:clamp(26px,4vw,36px);font-weight:800;letter-spacing:-.04em;margin:0 0 40px;color:#F5F0EB;}
.ab-values-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media(max-width:640px){.ab-values-grid{grid-template-columns:1fr;}}
.ab-value{padding:28px;border-radius:22px;border:1px solid rgba(245,240,235,.08);background:rgba(245,240,235,.035);transition:all 280ms;position:relative;overflow:hidden;}
.ab-value::before{content:'';position:absolute;inset:0;border-radius:22px;padding:1px;background:linear-gradient(135deg,rgba(240,179,90,.22),rgba(232,113,90,.16),rgba(74,222,128,.10));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 280ms;pointer-events:none;}
.ab-value:hover{background:rgba(245,240,235,.055);transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,.25),0 0 40px rgba(240,179,90,.06);}
.ab-value:hover::before{opacity:1;}
.ab-value-icon{font-size:28px;margin-bottom:14px;display:block;}
.ab-value h3{font-size:17px;font-weight:700;margin:0 0 10px;letter-spacing:-.02em;color:#F5F0EB;}
.ab-value p{margin:0;font-size:14px;color:rgba(245,240,235,.55);line-height:1.75;font-family:'Inter',system-ui,sans-serif;}

/* Timeline */
.ab-timeline{max-width:640px;margin:0 auto 80px;padding:0 24px;}
.ab-timeline-h2{text-align:center;font-size:clamp(26px,4vw,36px);font-weight:800;letter-spacing:-.04em;margin:0 0 40px;color:#F5F0EB;}
.ab-tl-item{display:flex;gap:24px;position:relative;padding-bottom:32px;}
.ab-tl-item:last-child{padding-bottom:0;}
.ab-tl-item:not(:last-child)::after{content:'';position:absolute;left:51px;top:32px;bottom:0;width:1px;background:linear-gradient(180deg,rgba(240,179,90,.25),rgba(232,113,90,.12));}
.ab-tl-year{width:80px;flex-shrink:0;padding-top:4px;}
.ab-tl-year span{font-size:12px;font-weight:700;color:rgba(240,179,90,.80);font-family:'JetBrains Mono',monospace;white-space:nowrap;}
.ab-tl-dot{width:10px;height:10px;border-radius:50%;background:rgba(240,179,90,.55);border:2px solid rgba(240,179,90,.22);flex-shrink:0;margin-top:6px;z-index:1;}
.ab-tl-body{flex:1;font-size:14px;color:rgba(245,240,235,.60);line-height:1.65;font-family:'Inter',system-ui,sans-serif;}

/* CTA */
.ab-cta{text-align:center;padding:0 24px 80px;}
.ab-cta h2{font-size:clamp(26px,4vw,34px);font-weight:800;letter-spacing:-.04em;margin:0 0 12px;color:#F5F0EB;}
.ab-cta p{font-size:15px;color:rgba(245,240,235,.42);margin:0 0 28px;font-family:'Inter',system-ui,sans-serif;}
.ab-cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.ab-cta-primary{display:inline-flex;align-items:center;gap:6px;padding:14px 32px;border-radius:14px;background:linear-gradient(135deg,#F0B35A,#E8A040);border:1px solid rgba(240,179,90,.50);color:#0F0D15;text-decoration:none;font-size:15px;font-weight:800;transition:all 200ms;position:relative;overflow:hidden;font-family:'Outfit',system-ui,sans-serif;}
.ab-cta-primary::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:abShim 4s ease-in-out infinite;}
@keyframes abShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
.ab-cta-primary:hover{box-shadow:0 0 32px rgba(240,179,90,.25);transform:translateY(-2px);background:linear-gradient(135deg,#F5BE6E,#EDAA50);}
.ab-cta-secondary{display:inline-flex;align-items:center;gap:6px;padding:14px 32px;border-radius:14px;border:1px solid rgba(245,240,235,.10);background:rgba(245,240,235,.035);color:rgba(245,240,235,.65);text-decoration:none;font-size:15px;font-weight:600;transition:all 180ms;font-family:'Outfit',system-ui,sans-serif;}
.ab-cta-secondary:hover{background:rgba(245,240,235,.07);border-color:rgba(245,240,235,.18);color:#F5F0EB;}
      `}</style>

      <main className="ab-page">
        <SiteNav />

        {/* Hero */}
        <div className="ab-hero">
          <div className="ab-badge ab-a">ABOUT</div>
          <h1 className="ab-h1 ab-a ab-d1">
            Every business deserves<br />a world-class website.
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
