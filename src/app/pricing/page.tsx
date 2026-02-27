import { CheckoutButton } from "./CheckoutButton";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

export const metadata = {
  title: "Pricing — Dominat8.io",
  description: "Start free. Scale as you grow. No credit card required.",
};

const PLANS = [
  {
    name: "Free", price: "$0", period: "forever", desc: "Try it out, no card needed",
    highlight: false, badge: null, plan: "free",
    features: ["3 AI generations / month", "Vibe & style presets", "HTML download", "Mobile-responsive output", "Share link (7-day)"],
    cta: "Get started free",
  },
  {
    name: "Starter", price: "$9", period: "per month", desc: "For individuals & side projects",
    highlight: false, badge: null, plan: "starter",
    features: ["20 AI generations / month", "Refine & iterate (unlimited)", "Fix agent", "SEO scan + score", "Embed / iframe export", "Share links (90-day)", "Site history"],
    cta: "Start Starter — $9/mo",
  },
  {
    name: "Pro", price: "$29", period: "per month", desc: "For freelancers & growing businesses",
    highlight: true, badge: "MOST POPULAR", plan: "pro",
    features: ["100 AI generations / month", "Everything in Starter", "A/B variants (2 versions)", "Seasonal variants (Christmas, EOFY…)", "Scheduled auto-rebuild (monthly)", "Password-protected shares", "Deploy to Dominat8 CDN", "Custom domain + auto-SSL", "Priority queue", "Email support"],
    cta: "Start Pro — $29/mo",
  },
  {
    name: "Agency", price: "$99", period: "per month", desc: "For teams & high-volume builders",
    highlight: false, badge: null, plan: "agency",
    features: ["500 AI generations / month", "Everything in Pro", "Scheduled rebuild (weekly)", "White-label output", "API access", "Bulk generation", "5 team seats", "Multi-site dashboard", "SLA + dedicated support"],
    cta: "Start Agency — $99/mo",
  },
];

const COMPARISON = [
  { feature: "AI generations / month",     free: "3",     starter: "20",    pro: "100",  agency: "500" },
  { feature: "Overage per generation",      free: "—",     starter: "$0.49", pro: "$0.49", agency: "$0.49" },
  { feature: "Vibe / style presets",        free: "✓",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "HTML download",              free: "✓",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Refine & iterate",           free: "✓",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Fix agent",                  free: "—",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "SEO scan",                   free: "—",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Embed / iframe export",      free: "—",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Share links",               free: "7-day", starter: "90-day", pro: "✓",    agency: "✓" },
  { feature: "Password-protected shares",  free: "—",     starter: "—",     pro: "✓",    agency: "✓" },
  { feature: "A/B variants",              free: "—",     starter: "—",     pro: "✓",    agency: "✓" },
  { feature: "Seasonal variants",         free: "—",     starter: "—",     pro: "✓",    agency: "✓" },
  { feature: "Scheduled rebuild",          free: "—",     starter: "—",     pro: "Monthly", agency: "Weekly" },
  { feature: "Deploy to CDN",             free: "—",     starter: "—",     pro: "✓",    agency: "✓" },
  { feature: "Custom domain + SSL",       free: "—",     starter: "—",     pro: "✓",    agency: "✓" },
  { feature: "White-label output",        free: "—",     starter: "—",     pro: "—",    agency: "✓" },
  { feature: "API access",                free: "—",     starter: "—",     pro: "—",    agency: "✓" },
  { feature: "Team seats",                free: "1",     starter: "1",     pro: "1",    agency: "5" },
];

export default function PricingPage() {
  return (
    <>
      <style>{`
@keyframes prFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.pr-a{animation:prFade 800ms cubic-bezier(.16,1,.3,1) both}
.pr-d1{animation-delay:50ms}.pr-d2{animation-delay:150ms}.pr-d3{animation-delay:250ms}.pr-d4{animation-delay:350ms}.pr-d5{animation-delay:450ms}

.pr-page{min-height:100vh;background:#060810;color:#e9eef7;font-family:'Outfit',system-ui,sans-serif;}
.pr-hero{text-align:center;padding:120px 24px 52px;position:relative;overflow:hidden;}
.pr-hero::before{content:'';position:absolute;width:800px;height:500px;top:-200px;left:50%;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse,rgba(139,92,246,.06),transparent 70%);pointer-events:none;}
.pr-badge{display:inline-block;padding:5px 16px;border-radius:999px;border:1px solid rgba(139,92,246,.25);background:rgba(139,92,246,.06);color:rgba(139,92,246,.85);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;}
.pr-h1{font-size:clamp(36px,6vw,60px);font-weight:900;margin:0 0 16px;letter-spacing:-.05em;line-height:1.05;}
.pr-sub{font-size:17px;color:rgba(255,255,255,.42);margin:0 auto 10px;line-height:1.65;max-width:520px;}
.pr-sub2{font-size:13px;color:rgba(255,255,255,.25);margin:0;}

/* Cards */
.pr-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1180px;margin:0 auto;padding:0 24px;}
@media(max-width:960px){.pr-cards{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.pr-cards{grid-template-columns:1fr}}

.pr-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:30px 24px;position:relative;overflow:hidden;display:flex;flex-direction:column;transition:all 280ms cubic-bezier(.4,0,.2,1);}
.pr-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.25);border-color:rgba(255,255,255,.12);}

.pr-card--pro{background:linear-gradient(180deg,rgba(139,92,246,.05),rgba(61,240,255,.02));border-color:transparent;box-shadow:0 0 60px rgba(139,92,246,.06);}
.pr-card--pro::before{content:'';position:absolute;inset:0;border-radius:24px;padding:1px;background:linear-gradient(135deg,rgba(139,92,246,.40),rgba(61,240,255,.25),rgba(56,248,166,.20));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.pr-card--pro:hover{box-shadow:0 0 80px rgba(139,92,246,.10),0 20px 60px rgba(0,0,0,.25);}

.pr-pop{position:absolute;top:14px;right:14px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:8px;background:linear-gradient(135deg,rgba(139,92,246,.20),rgba(61,240,255,.12));color:rgba(255,255,255,.85);border:1px solid rgba(139,92,246,.20);}
.pr-plan-name{font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,.38);font-family:'JetBrains Mono',monospace;margin-bottom:10px;}
.pr-card--pro .pr-plan-name{color:rgba(139,92,246,.75);}
.pr-price{display:flex;align-items:baseline;gap:4px;margin-bottom:4px;}
.pr-amount{font-size:42px;font-weight:900;letter-spacing:-.04em;}
.pr-period{font-size:13px;color:rgba(255,255,255,.25);}
.pr-desc{font-size:13px;color:rgba(255,255,255,.40);margin-bottom:20px;line-height:1.4;}

.pr-cta-wrap{margin-bottom:22px;}
.pr-features{display:flex;flex-direction:column;gap:10px;flex:1;}
.pr-feat{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:rgba(255,255,255,.65);line-height:1.4;}
.pr-feat::before{content:"✓";font-size:10px;font-weight:800;color:rgba(56,248,166,.60);flex-shrink:0;margin-top:2px;}

.pr-cta-btn{display:block;text-align:center;padding:12px;border-radius:13px;font-size:13px;font-weight:700;cursor:pointer;transition:all 200ms;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.035);color:rgba(255,255,255,.65);width:100%;font-family:inherit;}
.pr-cta-btn:hover{background:rgba(255,255,255,.07);color:#fff;border-color:rgba(255,255,255,.18);}
.pr-card--pro .pr-cta-btn{background:linear-gradient(135deg,rgba(139,92,246,.16),rgba(61,240,255,.08));border-color:rgba(139,92,246,.30);color:rgba(255,255,255,.92);position:relative;overflow:hidden;}
.pr-card--pro .pr-cta-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);animation:prShimmer 4s ease-in-out infinite;}
@keyframes prShimmer{0%{left:-100%}40%{left:100%}100%{left:100%}}
.pr-card--pro .pr-cta-btn:hover{background:linear-gradient(135deg,rgba(139,92,246,.25),rgba(61,240,255,.12));box-shadow:0 0 28px rgba(139,92,246,.12);}

/* Comparison table */
.pr-table-wrap{max-width:1080px;margin:72px auto 0;padding:0 24px;}
.pr-table-h2{text-align:center;font-size:28px;font-weight:800;letter-spacing:-.04em;margin:0 0 28px;}
.pr-table{border-radius:20px;border:1px solid rgba(255,255,255,.06);overflow:hidden;background:rgba(255,255,255,.01);}
.pr-table-head{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.06);}
.pr-table-head>div{padding:14px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;text-align:center;}
.pr-table-head>div:first-child{text-align:left;color:rgba(255,255,255,.35);}
.pr-table-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;border-bottom:1px solid rgba(255,255,255,.04);}
.pr-table-row:last-child{border-bottom:none;}
.pr-table-row:nth-child(even){background:rgba(255,255,255,.015);}
.pr-table-row>div{padding:11px 16px;font-size:12px;text-align:center;color:rgba(255,255,255,.60);}
.pr-table-row>div:first-child{text-align:left;color:rgba(255,255,255,.70);}
.pr-val-check{color:rgba(56,248,166,.75)!important;font-weight:700;}
.pr-val-dash{color:rgba(255,255,255,.15)!important;}
@media(max-width:768px){.pr-table-head,.pr-table-row{grid-template-columns:2fr 1fr 1fr!important;}.pr-table-head>div:nth-child(4),.pr-table-head>div:nth-child(5),.pr-table-row>div:nth-child(4),.pr-table-row>div:nth-child(5){display:none;}}

/* Overage callout */
.pr-callout{max-width:720px;margin:36px auto 0;padding:0 24px;}
.pr-callout-box{border-radius:18px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);padding:20px 24px;display:flex;align-items:center;gap:16px;}
.pr-callout-icon{font-size:24px;flex-shrink:0;}
.pr-callout-title{font-size:14px;font-weight:700;color:rgba(255,255,255,.85);margin-bottom:4px;}
.pr-callout-body{font-size:13px;color:rgba(255,255,255,.42);line-height:1.6;}
.pr-callout-body strong{color:rgba(255,255,255,.72);}

/* FAQ */
.pr-faq{max-width:640px;margin:48px auto 0;padding:0 24px;text-align:center;}
.pr-faq p{color:rgba(255,255,255,.35);font-size:13px;line-height:1.7;}
.pr-faq strong{color:rgba(255,255,255,.55);}
.pr-faq a{color:rgba(61,240,255,.70);text-decoration:none;}
.pr-faq a:hover{color:rgba(61,240,255,.90);}
      `}</style>

      <main className="pr-page">
        <SiteNav />

        {/* Hero */}
        <div className="pr-hero">
          <div className="pr-badge pr-a">PRICING</div>
          <h1 className="pr-h1 pr-a pr-d1">Simple, honest pricing.</h1>
          <p className="pr-sub pr-a pr-d2">Start free. Scale as you grow. Every generation counts against your quota — no surprises, no gotchas.</p>
          <p className="pr-sub2 pr-a pr-d3">Need more? $0.49 / generation overage on all paid plans.</p>
        </div>

        {/* Cards */}
        <div className="pr-cards">
          {PLANS.map((p, i) => (
            <div key={p.name} className={`pr-card${p.highlight ? " pr-card--pro" : ""} pr-a pr-d${i + 1}`}>
              {p.badge && <span className="pr-pop">{p.badge}</span>}
              <div className="pr-plan-name">{p.name}</div>
              <div className="pr-price">
                <span className="pr-amount">{p.price}</span>
                <span className="pr-period">/ {p.period}</span>
              </div>
              <div className="pr-desc">{p.desc}</div>
              <div className="pr-cta-wrap">
                <CheckoutButton plan={p.plan} label={p.cta} style={{}} className={`pr-cta-btn`} />
              </div>
              <div className="pr-features">
                {p.features.map(f => (
                  <div key={f} className="pr-feat">{f}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="pr-table-wrap pr-a pr-d5">
          <h2 className="pr-table-h2">Full comparison</h2>
          <div className="pr-table">
            <div className="pr-table-head">
              <div>Feature</div>
              {["Free", "Starter", "Pro", "Agency"].map(h => (
                <div key={h} style={{ color: h === "Pro" ? "rgba(139,92,246,.85)" : h === "Starter" ? "rgba(255,209,102,.80)" : h === "Agency" ? "rgba(124,92,255,.80)" : "rgba(255,255,255,.50)" }}>{h}</div>
              ))}
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature} className="pr-table-row">
                <div>{row.feature}</div>
                {[row.free, row.starter, row.pro, row.agency].map((val, j) => (
                  <div key={j} className={val === "✓" ? "pr-val-check" : val === "—" ? "pr-val-dash" : ""}>{val}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Overage callout */}
        <div className="pr-callout">
          <div className="pr-callout-box">
            <span className="pr-callout-icon">⚡</span>
            <div>
              <div className="pr-callout-title">Need to go over your quota?</div>
              <div className="pr-callout-body">
                Any paid plan can generate beyond its monthly quota at <strong>$0.49 per extra generation</strong> — billed at end of month. No surprises, no upgrade pressure.
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="pr-faq">
          <p>
            All plans include a <strong>14-day money-back guarantee</strong>. Questions? <a href="mailto:hello@dominat8.io">hello@dominat8.io</a>
          </p>
        </div>

        <div style={{ height: 60 }} />
        <SiteFooter />
      </main>
    </>
  );
}
