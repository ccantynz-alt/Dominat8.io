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
    features: ["3 AI generations / month", "5 agent credits / month", "Vibe & style presets", "HTML download", "Mobile-responsive output", "Share link (7-day)"],
    cta: "Get started free",
  },
  {
    name: "Starter", price: "$9", period: "per month", desc: "For individuals & side projects",
    highlight: false, badge: null, plan: "starter",
    features: ["20 AI generations / month", "25 agent credits / month", "Refine & iterate (unlimited)", "Fix agent", "SEO scan + score", "Video script generator", "AI Copywriter", "Social media kit", "Embed / iframe export", "Share links (90-day)", "Site history"],
    cta: "Start Starter — $9/mo",
  },
  {
    name: "Pro", price: "$29", period: "per month", desc: "For freelancers & growing businesses",
    highlight: true, badge: "MOST POPULAR", plan: "pro",
    features: ["100 AI generations / month", "150 agent credits / month", "Everything in Starter", "Video production package", "Deep SEO audit", "A/B variants (2 versions)", "Seasonal variants (Christmas, EOFY\u2026)", "Scheduled auto-rebuild (monthly)", "Password-protected shares", "Deploy to Dominat8 CDN", "Custom domain + auto-SSL", "Priority queue", "Email support"],
    cta: "Start Pro — $29/mo",
  },
  {
    name: "Agency", price: "$99", period: "per month", desc: "For teams & high-volume builders",
    highlight: false, badge: null, plan: "agency",
    features: ["500 AI generations / month", "600 agent credits / month", "Everything in Pro", "Scheduled rebuild (weekly)", "White-label output", "API access", "Bulk generation", "5 team seats", "Multi-site dashboard", "SLA + dedicated support"],
    cta: "Start Agency — $99/mo",
  },
];

const AI_ADDONS = [
  {
    name: "Video Script", credits: 2, plan: "Starter+", icon: "\u{1F4DD}",
    desc: "Hook, voiceover, captions, hashtags — copy-paste ready for TikTok & Reels",
    color: "#FF0050",
  },
  {
    name: "AI Copywriter", credits: 3, plan: "Starter+", icon: "\u270D\uFE0F",
    desc: "Landing page copy, email sequences, ad variations, product descriptions",
    color: "#F59E0B",
  },
  {
    name: "Social Media Kit", credits: 3, plan: "Starter+", icon: "\u{1F4F1}",
    desc: "7-day content calendar, platform bios, hashtag strategy, engagement tips",
    color: "#3B82F6",
  },
  {
    name: "Deep SEO Audit", credits: 5, plan: "Pro+", icon: "\u{1F50D}",
    desc: "Technical SEO, keyword strategy, content calendar, backlink plan, schema markup",
    color: "#10B981", badge: "PREMIUM",
  },
  {
    name: "Video Production", credits: 10, plan: "Pro+", icon: "\u{1F3AC}",
    desc: "Full storyboard, shot list, B-roll, music cues, timed voiceover, motion graphics",
    color: "#A855F7", badge: "PREMIUM",
  },
];

const CREDIT_PACKS = [
  { credits: 50, price: "$4.99", perCredit: "$0.10", popular: false },
  { credits: 200, price: "$14.99", perCredit: "$0.075", popular: true },
  { credits: 500, price: "$29.99", perCredit: "$0.06", popular: false },
  { credits: 1500, price: "$74.99", perCredit: "$0.05", popular: false },
];

const COMPARISON = [
  { feature: "AI generations / month",     free: "3",     starter: "20",    pro: "100",  agency: "500" },
  { feature: "Agent credits / month",      free: "5",     starter: "25",    pro: "150",  agency: "600" },
  { feature: "Overage per generation",      free: "—",     starter: "$0.49", pro: "$0.49", agency: "$0.49" },
  { feature: "Vibe / style presets",        free: "✓",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "HTML download",              free: "✓",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Refine & iterate",           free: "✓",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Fix agent",                  free: "—",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "SEO scan",                   free: "—",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Video script generator",     free: "—",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "AI Copywriter",             free: "—",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Social media kit",          free: "—",     starter: "✓",     pro: "✓",    agency: "✓" },
  { feature: "Video production package",  free: "—",     starter: "—",     pro: "✓",    agency: "✓" },
  { feature: "Deep SEO audit",            free: "—",     starter: "—",     pro: "✓",    agency: "✓" },
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
@keyframes prShimmer{0%{left:-100%}40%{left:100%}100%{left:100%}}
@keyframes prFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes prGlow{0%,100%{box-shadow:0 0 60px rgba(0,212,255,.10),0 30px 60px rgba(0,0,0,.25)}50%{box-shadow:0 0 100px rgba(0,212,255,.20),0 30px 60px rgba(0,0,0,.25)}}
.pr-a{animation:prFade 800ms cubic-bezier(.16,1,.3,1) both}
.pr-d1{animation-delay:50ms}.pr-d2{animation-delay:150ms}.pr-d3{animation-delay:250ms}.pr-d4{animation-delay:350ms}.pr-d5{animation-delay:450ms}

.pr-page{min-height:100vh;background:#030712;color:#E8F0FF;font-family:'Outfit',system-ui,sans-serif;position:relative;overflow:hidden;}

/* Grid pattern */
.pr-page::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(0,212,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.03) 1px,transparent 1px);background-size:60px 60px;-webkit-mask:radial-gradient(ellipse 70% 40% at 50% 20%,black 20%,transparent 70%);mask:radial-gradient(ellipse 70% 40% at 50% 20%,black 20%,transparent 70%);pointer-events:none;z-index:0;}

/* Mesh orbs */
.pr-mesh{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.pr-orb1{position:absolute;width:800px;height:600px;top:-250px;left:-200px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,212,255,.18),transparent 65%);filter:blur(80px);animation:prFloat 14s ease-in-out infinite;}
.pr-orb2{position:absolute;width:600px;height:500px;bottom:-200px;right:-150px;border-radius:50%;background:radial-gradient(ellipse,rgba(123,97,255,.14),transparent 65%);filter:blur(80px);animation:prFloat 18s ease-in-out infinite reverse;}
.pr-orb3{position:absolute;width:400px;height:400px;top:35%;left:55%;border-radius:50%;background:radial-gradient(ellipse,rgba(0,255,178,.07),transparent 65%);filter:blur(80px);animation:prFloat 20s ease-in-out infinite 2s;}

.pr-hero{text-align:center;padding:140px 24px 64px;position:relative;overflow:visible;z-index:1;}
.pr-hero::after{content:'';position:absolute;width:800px;height:400px;top:-200px;left:50%;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse,rgba(0,212,255,.15),rgba(0,102,255,.06) 45%,transparent 70%);pointer-events:none;}
.pr-badge{display:inline-block;padding:6px 20px;border-radius:999px;border:1px solid rgba(0,212,255,.40);background:rgba(0,212,255,.10);color:rgba(0,212,255,.95);font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;margin-bottom:26px;font-family:'JetBrains Mono',monospace;backdrop-filter:blur(12px);box-shadow:0 0 20px rgba(0,212,255,.12);position:relative;z-index:2;}
.pr-h1{font-size:clamp(44px,7.5vw,82px);font-weight:900;margin:0 0 18px;letter-spacing:-.06em;line-height:1;background:linear-gradient(135deg,#E8F0FF 30%,#00D4FF 70%,#0066FF 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;position:relative;z-index:2;}
.pr-sub{font-size:18px;color:rgba(200,220,255,.60);margin:0 auto 10px;line-height:1.65;max-width:540px;font-family:'Inter',system-ui,sans-serif;position:relative;z-index:2;}
.pr-sub2{font-size:14px;color:rgba(200,220,255,.40);margin:0;font-family:'Inter',system-ui,sans-serif;position:relative;z-index:2;}

/* Cards */
.pr-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1180px;margin:0 auto;padding:0 24px;position:relative;z-index:1;}
@media(max-width:960px){.pr-cards{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.pr-cards{grid-template-columns:1fr}}

.pr-card{background:rgba(100,180,255,.035);border:1px solid rgba(100,180,255,.10);border-radius:24px;padding:32px 26px;position:relative;overflow:hidden;display:flex;flex-direction:column;transition:all 280ms cubic-bezier(.4,0,.2,1);}
.pr-card::after{content:'';position:absolute;inset:0;border-radius:24px;padding:1px;background:linear-gradient(135deg,rgba(100,180,255,.12),rgba(100,180,255,.04));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 280ms;pointer-events:none;}
.pr-card:hover{transform:translateY(-6px);box-shadow:0 24px 70px rgba(0,0,0,.40);border-color:rgba(100,180,255,.18);}
.pr-card:hover::after{opacity:1;}

.pr-card--pro{background:linear-gradient(180deg,rgba(0,212,255,.08),rgba(0,102,255,.03));border-color:transparent;animation:prGlow 4s ease-in-out infinite;}
.pr-card--pro::before{content:'';position:absolute;inset:0;border-radius:24px;padding:1.5px;background:linear-gradient(135deg,rgba(0,212,255,.55),rgba(0,102,255,.40),rgba(0,255,178,.25));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}
.pr-card--pro:hover{box-shadow:0 0 120px rgba(0,212,255,.20),0 24px 70px rgba(0,0,0,.45);transform:translateY(-8px);}

.pr-pop{position:absolute;top:14px;right:14px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 12px;border-radius:8px;background:linear-gradient(135deg,rgba(0,212,255,.28),rgba(0,102,255,.18));color:#00D4FF;border:1px solid rgba(0,212,255,.35);font-family:'JetBrains Mono',monospace;box-shadow:0 0 12px rgba(0,212,255,.15);}
.pr-plan-name{font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:rgba(200,220,255,.42);font-family:'JetBrains Mono',monospace;margin-bottom:10px;}
.pr-card--pro .pr-plan-name{color:#00D4FF;text-shadow:0 0 8px rgba(0,212,255,.25);}
.pr-price{display:flex;align-items:baseline;gap:4px;margin-bottom:4px;}
.pr-amount{font-size:52px;font-weight:900;letter-spacing:-.05em;background:linear-gradient(135deg,#E8F0FF,#E8F0FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.pr-card--pro .pr-amount{background:linear-gradient(135deg,#00FFB2,#00D4FF,#0066FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:brightness(1.1);}
.pr-period{font-size:13px;color:rgba(200,220,255,.35);font-family:'Inter',system-ui,sans-serif;}
.pr-desc{font-size:14px;color:rgba(200,220,255,.58);margin-bottom:22px;line-height:1.5;font-family:'Inter',system-ui,sans-serif;}

.pr-cta-wrap{margin-bottom:24px;}
.pr-features{display:flex;flex-direction:column;gap:10px;flex:1;}
.pr-feat{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:rgba(200,220,255,.68);line-height:1.4;font-family:'Inter',system-ui,sans-serif;}
.pr-feat::before{content:"\\2713";font-size:10px;font-weight:800;color:#00FFB2;flex-shrink:0;margin-top:2px;text-shadow:0 0 6px rgba(0,255,178,.30);}

.pr-cta-btn{display:block;text-align:center;padding:13px;border-radius:13px;font-size:14px;font-weight:700;cursor:pointer;transition:all 200ms;border:1px solid rgba(100,180,255,.12);background:rgba(100,180,255,.04);color:rgba(200,220,255,.70);width:100%;font-family:'Outfit',system-ui,sans-serif;}
.pr-cta-btn:hover{background:rgba(100,180,255,.09);color:#E8F0FF;border-color:rgba(100,180,255,.22);transform:translateY(-1px);}
.pr-card--pro .pr-cta-btn{background:linear-gradient(135deg,#00D4FF,#0066FF);border-color:transparent;color:#030712;position:relative;overflow:hidden;font-weight:800;font-size:15px;}
.pr-card--pro .pr-cta-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);animation:prShimmer 3.5s ease-in-out infinite;}
.pr-card--pro .pr-cta-btn:hover{background:linear-gradient(135deg,#1ADCFF,#1A7AFF);box-shadow:0 0 36px rgba(0,212,255,.30);}

/* Comparison table */
.pr-table-wrap{max-width:1080px;margin:72px auto 0;padding:0 24px;position:relative;z-index:1;}
.pr-table-h2{text-align:center;font-size:32px;font-weight:800;letter-spacing:-.04em;margin:0 0 28px;background:linear-gradient(135deg,#E8F0FF 30%,#00D4FF 70%,#7B61FF 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.pr-table{border-radius:20px;border:1px solid rgba(100,180,255,.10);overflow:hidden;background:rgba(100,180,255,.02);}
.pr-table-head{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;background:rgba(100,180,255,.045);border-bottom:1px solid rgba(100,180,255,.10);}
.pr-table-head>div{padding:16px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;text-align:center;font-family:'JetBrains Mono',monospace;}
.pr-table-head>div:first-child{text-align:left;color:rgba(200,220,255,.42);}
.pr-table-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;border-bottom:1px solid rgba(100,180,255,.06);transition:background 150ms;}
.pr-table-row:last-child{border-bottom:none;}
.pr-table-row:nth-child(even){background:rgba(100,180,255,.022);}
.pr-table-row:hover{background:rgba(100,180,255,.04);}
.pr-table-row>div{padding:12px 16px;font-size:13px;text-align:center;color:rgba(200,220,255,.65);font-family:'Inter',system-ui,sans-serif;}
.pr-table-row>div:first-child{text-align:left;color:rgba(200,220,255,.75);}
.pr-val-check{color:#00FFB2!important;font-weight:700;text-shadow:0 0 6px rgba(0,255,178,.25);}
.pr-val-dash{color:rgba(200,220,255,.15)!important;}
@media(max-width:768px){.pr-table-head,.pr-table-row{grid-template-columns:2fr 1fr 1fr!important;}.pr-table-head>div:nth-child(4),.pr-table-head>div:nth-child(5),.pr-table-row>div:nth-child(4),.pr-table-row>div:nth-child(5){display:none;}}

/* Overage callout */
.pr-callout{max-width:720px;margin:36px auto 0;padding:0 24px;position:relative;z-index:1;}
.pr-callout-box{border-radius:18px;border:1px solid rgba(0,212,255,.15);background:rgba(0,212,255,.04);padding:22px 26px;display:flex;align-items:center;gap:16px;transition:all 200ms;}
.pr-callout-box:hover{border-color:rgba(0,212,255,.25);background:rgba(0,212,255,.06);}
.pr-callout-icon{font-size:28px;flex-shrink:0;filter:drop-shadow(0 0 8px rgba(0,212,255,.25));}
.pr-callout-title{font-size:15px;font-weight:700;color:#E8F0FF;margin-bottom:4px;}
.pr-callout-body{font-size:14px;color:rgba(200,220,255,.60);line-height:1.6;font-family:'Inter',system-ui,sans-serif;}
.pr-callout-body strong{color:#00D4FF;}

/* FAQ */
.pr-faq{max-width:640px;margin:48px auto 0;padding:0 24px;text-align:center;position:relative;z-index:1;}
.pr-faq p{color:rgba(200,220,255,.45);font-size:14px;line-height:1.7;font-family:'Inter',system-ui,sans-serif;}
.pr-faq strong{color:rgba(200,220,255,.70);}
.pr-faq a{color:#00D4FF;text-decoration:none;text-shadow:0 0 8px rgba(0,212,255,.20);}
.pr-faq a:hover{color:rgba(0,212,255,.95);}

/* AI Add-ons section */
.pr-addons-wrap{max-width:1080px;margin:72px auto 0;padding:0 24px;position:relative;z-index:1;}
.pr-addons-h2{text-align:center;font-size:32px;font-weight:800;letter-spacing:-.04em;margin:0 0 8px;background:linear-gradient(135deg,#E8F0FF 30%,#A855F7 70%,#F59E0B 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.pr-addons-sub{text-align:center;font-size:15px;color:rgba(200,220,255,.45);margin:0 0 32px;font-family:'Inter',system-ui,sans-serif;}
.pr-addons-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}
.pr-addon{padding:22px 24px;border-radius:20px;border:1px solid rgba(100,180,255,.08);background:rgba(100,180,255,.025);display:flex;gap:16px;align-items:flex-start;transition:all 250ms;position:relative;overflow:hidden;}
.pr-addon:hover{border-color:rgba(100,180,255,.18);transform:translateY(-3px);box-shadow:0 16px 48px rgba(0,0,0,.30);}
.pr-addon-icon{font-size:28px;flex-shrink:0;width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(100,180,255,.04);border:1px solid rgba(100,180,255,.08);}
.pr-addon-info{flex:1;min-width:0;}
.pr-addon-head{display:flex;align-items:center;gap:8px;margin-bottom:4px;}
.pr-addon-name{font-size:15px;font-weight:800;color:#E8F0FF;letter-spacing:-.01em;}
.pr-addon-badge{font-size:8px;font-weight:800;padding:2px 7px;border-radius:5px;letter-spacing:.06em;text-transform:uppercase;font-family:'JetBrains Mono',monospace;}
.pr-addon-desc{font-size:12px;color:rgba(200,220,255,.50);line-height:1.5;margin-bottom:8px;font-family:'Inter',system-ui,sans-serif;}
.pr-addon-meta{display:flex;align-items:center;gap:8px;}
.pr-addon-cost{font-size:11px;font-weight:700;padding:3px 10px;border-radius:7px;font-family:'JetBrains Mono',monospace;}
.pr-addon-plan{font-size:10px;color:rgba(200,220,255,.35);font-weight:600;text-transform:uppercase;letter-spacing:.06em;}

/* Credit packs section */
.pr-packs-wrap{max-width:900px;margin:56px auto 0;padding:0 24px;position:relative;z-index:1;}
.pr-packs-h2{text-align:center;font-size:28px;font-weight:800;letter-spacing:-.03em;margin:0 0 8px;background:linear-gradient(135deg,#E8F0FF 30%,#00FFB2 80%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.pr-packs-sub{text-align:center;font-size:14px;color:rgba(200,220,255,.40);margin:0 0 24px;font-family:'Inter',system-ui,sans-serif;}
.pr-packs-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
@media(max-width:768px){.pr-packs-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:440px){.pr-packs-grid{grid-template-columns:1fr;}}
.pr-pack{padding:20px 18px;border-radius:18px;border:1px solid rgba(100,180,255,.08);background:rgba(100,180,255,.025);text-align:center;transition:all 250ms;position:relative;}
.pr-pack:hover{border-color:rgba(0,255,178,.20);transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.30);}
.pr-pack--popular{border-color:rgba(0,255,178,.25);background:rgba(0,255,178,.04);}
.pr-pack--popular::before{content:'BEST VALUE';position:absolute;top:8px;right:8px;font-size:8px;font-weight:800;padding:2px 8px;border-radius:5px;background:rgba(0,255,178,.15);color:#00FFB2;border:1px solid rgba(0,255,178,.30);letter-spacing:.06em;font-family:'JetBrains Mono',monospace;}
.pr-pack-credits{font-size:32px;font-weight:900;letter-spacing:-.04em;color:#E8F0FF;margin-bottom:2px;}
.pr-pack-label{font-size:10px;color:rgba(200,220,255,.35);text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:10px;}
.pr-pack-price{font-size:20px;font-weight:800;color:#00FFB2;margin-bottom:2px;}
.pr-pack-per{font-size:11px;color:rgba(200,220,255,.35);font-family:'JetBrains Mono',monospace;}
      `}</style>

      <main className="pr-page">
        <div className="pr-mesh"><div className="pr-orb1" /><div className="pr-orb2" /><div className="pr-orb3" /></div>
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
                <div key={h} style={{ color: h === "Pro" ? "rgba(0,212,255,.90)" : h === "Starter" ? "rgba(0,102,255,.80)" : h === "Agency" ? "rgba(123,97,255,.80)" : "rgba(200,220,255,.50)" }}>{h}</div>
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

        {/* AI Add-ons */}
        <div className="pr-addons-wrap pr-a pr-d5">
          <h2 className="pr-addons-h2">AI-Powered Add-ons</h2>
          <p className="pr-addons-sub">Supercharge your site with premium AI agents. Pay per use with credits.</p>
          <div className="pr-addons-grid">
            {AI_ADDONS.map(a => (
              <div key={a.name} className="pr-addon">
                <div className="pr-addon-icon" style={{ borderColor: `${a.color}22`, background: `${a.color}0A` }}>
                  {a.icon}
                </div>
                <div className="pr-addon-info">
                  <div className="pr-addon-head">
                    <span className="pr-addon-name">{a.name}</span>
                    {a.badge && (
                      <span className="pr-addon-badge" style={{ background: `${a.color}18`, color: a.color, border: `1px solid ${a.color}30` }}>
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <div className="pr-addon-desc">{a.desc}</div>
                  <div className="pr-addon-meta">
                    <span className="pr-addon-cost" style={{ background: `${a.color}12`, color: a.color, border: `1px solid ${a.color}25` }}>
                      {a.credits} credits
                    </span>
                    <span className="pr-addon-plan">{a.plan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit packs */}
        <div className="pr-packs-wrap pr-a pr-d5">
          <h2 className="pr-packs-h2">Credit Packs</h2>
          <p className="pr-packs-sub">Buy credits in bulk. Use them on any AI agent, anytime.</p>
          <div className="pr-packs-grid">
            {CREDIT_PACKS.map(pack => (
              <div key={pack.credits} className={`pr-pack${pack.popular ? " pr-pack--popular" : ""}`}>
                <div className="pr-pack-credits">{pack.credits.toLocaleString()}</div>
                <div className="pr-pack-label">credits</div>
                <div className="pr-pack-price">{pack.price}</div>
                <div className="pr-pack-per">{pack.perCredit} / credit</div>
              </div>
            ))}
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
