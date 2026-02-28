"use client";

import * as React from "react";
import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

type Template = {
  name: string;
  category: string;
  prompt: string;
  accent: string;
  grad: string;
  desc: string;
};

const TEMPLATES: Template[] = [
  // Business & Professional
  { name: "Elite Consulting Firm", category: "Business", prompt: "A premium management consulting firm based in New York that transforms Fortune 500 companies through strategy, operations, and digital transformation", accent: "#7C5CFF", grad: "linear-gradient(135deg,#0d0a1e,#1a1040,#0a0820)", desc: "Authoritative, trust-building design for high-ticket B2B services" },
  { name: "Boutique PR Agency", category: "Business", prompt: "A boutique public relations agency specialising in brand storytelling for luxury and lifestyle brands — global reach, personal touch", accent: "#FF7AC6", grad: "linear-gradient(135deg,#1a0814,#2d1020,#150810)", desc: "Sleek, modern agency look that commands premium positioning" },
  { name: "Executive Recruiter", category: "Business", prompt: "An executive headhunting firm that places C-suite leaders at Fortune 1000 companies — confidential, results-driven, elite network", accent: "#C09A5C", grad: "linear-gradient(135deg,#0f0d08,#1e1808,#140e04)", desc: "Understated luxury for the most selective talent market" },
  { name: "Accounting & Tax Firm", category: "Business", prompt: "A modern accounting firm for high-growth startups and SMBs — cloud-first, proactive tax strategy, and real-time financial insights", accent: "#38F8A6", grad: "linear-gradient(135deg,#061410,#0c2018,#081a12)", desc: "Professional trustworthiness meets modern SaaS aesthetics" },

  // Restaurant & Food
  { name: "Fine Dining Restaurant", category: "Food & Drink", prompt: "A Michelin-starred fine dining restaurant in Paris serving modern French cuisine with Japanese influences — intimate, exclusive, unforgettable", accent: "#C09A5C", grad: "linear-gradient(135deg,#0e0b04,#1c1408,#100c04)", desc: "Editorial luxury for the world's most discerning diners" },
  { name: "Coffee Roastery", category: "Food & Drink", prompt: "A specialty single-origin coffee roastery in Melbourne with a subscription service and cupping events — obsessed with the perfect cup", accent: "#C8834A", grad: "linear-gradient(135deg,#120800,#241200,#180a00)", desc: "Warm, artisanal feel that converts coffee lovers instantly" },
  { name: "Food Delivery Service", category: "Food & Drink", prompt: "A premium meal-kit delivery service offering restaurant-quality ingredients and chef-designed recipes for busy professionals in London", accent: "#FF6B35", grad: "linear-gradient(135deg,#140800,#281200,#1c0a00)", desc: "Vibrant, appetite-stimulating design that drives subscriptions" },
  { name: "Craft Brewery", category: "Food & Drink", prompt: "An award-winning craft brewery in Portland creating small-batch IPAs, sours, and seasonal specials — taproom open daily, tours on weekends", accent: "#FFD166", grad: "linear-gradient(135deg,#0f0c00,#1e1800,#160e00)", desc: "Bold, character-rich design for the craft beer community" },

  // Healthcare & Medical
  { name: "Telehealth Platform", category: "Healthcare", prompt: "A HIPAA-compliant telemedicine platform connecting patients with board-certified specialists in under 5 minutes — available 24/7 across all 50 states", accent: "#38C9A4", grad: "linear-gradient(135deg,#030e10,#061c1c,#041210)", desc: "Calm, clinical trustworthiness with a modern digital feel" },
  { name: "Dental Practice", category: "Healthcare", prompt: "A premium cosmetic dental practice in Beverly Hills offering porcelain veneers, Invisalign, and full-mouth reconstruction — smile transformations guaranteed", accent: "#4A90E2", grad: "linear-gradient(135deg,#04080f,#08101e,#060c16)", desc: "Clean, confidence-inspiring design for high-value dental care" },
  { name: "Mental Health App", category: "Healthcare", prompt: "A CBT-based mental health platform offering AI-guided therapy, licensed therapist sessions, and mood tracking — clinically validated, stigma-free", accent: "#B39DDB", grad: "linear-gradient(135deg,#080510,#100a1e,#0c0814)", desc: "Gentle, welcoming design that builds emotional trust" },
  { name: "Fertility Clinic", category: "Healthcare", prompt: "A world-class fertility clinic with 78% IVF success rates — compassionate care, cutting-edge technology, and personalised treatment plans in Sydney", accent: "#F48FB1", grad: "linear-gradient(135deg,#140408,#201010,#180808)", desc: "Warm, hopeful design for one of life's most important journeys" },

  // Real Estate
  { name: "Luxury Real Estate", category: "Real Estate", prompt: "A luxury real estate brokerage specialising in $5M+ properties in Miami Beach and Palm Beach — private listings, white-glove service, concierge team", accent: "#C9A84C", grad: "linear-gradient(135deg,#0a0a08,#141800,#0c1000)", desc: "Ultra-premium positioning for the ultra-high-net-worth market" },
  { name: "Property Management", category: "Real Estate", prompt: "A full-service property management company for landlords across the Pacific Northwest — tenant screening, maintenance, and monthly reporting", accent: "#38C9A4", grad: "linear-gradient(135deg,#040e10,#08181a,#061012)", desc: "Reliable, professional design that wins landlord confidence" },
  { name: "Commercial Real Estate", category: "Real Estate", prompt: "A commercial real estate firm specialising in retail and office leasing in Chicago's Loop district — market analysis, deal structuring, asset management", accent: "#4A90E2", grad: "linear-gradient(135deg,#040812,#081018,#060c14)", desc: "Analytical, data-driven design for serious commercial investors" },

  // Legal
  { name: "Personal Injury Law", category: "Legal", prompt: "An aggressive personal injury law firm in Houston that fights insurance companies and wins — no fee unless you win, billions recovered for clients", accent: "#E53E3E", grad: "linear-gradient(135deg,#0e0404,#1c0808,#160606)", desc: "Powerful, assertive design that converts injury victims to clients" },
  { name: "Immigration Law Firm", category: "Legal", prompt: "An immigration law firm helping families, professionals, and investors navigate US visa and green card processes — 20 years experience, 98% approval rate", accent: "#48BB78", grad: "linear-gradient(135deg,#040e06,#081a0a,#061208)", desc: "Hopeful, trustworthy design for life-changing legal services" },
  { name: "Corporate Law Firm", category: "Legal", prompt: "A BigLaw-caliber corporate law firm serving technology and financial services companies — M&A, securities, IP, and regulatory compliance", accent: "#718096", grad: "linear-gradient(135deg,#06080c,#0c1018,#080c14)", desc: "Authoritative gravitas for premier corporate legal services" },

  // E-commerce & Retail
  { name: "Luxury Skincare Brand", category: "E-commerce", prompt: "A science-backed luxury skincare brand using biofermentation and rare botanical extracts — dermatologist-developed, sustainably sourced, clinically proven", accent: "#D4B896", grad: "linear-gradient(135deg,#120e08,#1e1810,#160c08)", desc: "Aspirational beauty editorial that drives premium conversions" },
  { name: "Sustainable Fashion", category: "E-commerce", prompt: "A sustainable fashion brand making luxury basics from recycled ocean plastic and organic cotton — carbon-neutral, B-Corp certified, timeless design", accent: "#68A393", grad: "linear-gradient(135deg,#040c0a,#081816,#060e0c)", desc: "Conscious luxury that speaks to the modern ethical consumer" },
  { name: "Home Goods Store", category: "E-commerce", prompt: "A premium home goods brand offering minimal Scandinavian-inspired furniture, lighting, and decor — designed in Copenhagen, made to last a lifetime", accent: "#C09A5C", grad: "linear-gradient(135deg,#0e0a04,#1a1208,#100c06)", desc: "Warm editorial design that makes every product feel essential" },
  { name: "Tech Accessories Brand", category: "E-commerce", prompt: "A premium tech accessories brand making MagSafe cases, laptop sleeves, and cable management for the Apple ecosystem — obsessive attention to detail", accent: "#3DF0FF", grad: "linear-gradient(135deg,#040c10,#081820,#060e14)", desc: "Clean, product-forward design that converts tech enthusiasts" },

  // Portfolio & Creative
  { name: "Architecture Studio", category: "Portfolio", prompt: "A Pritzker-prize shortlisted architecture studio based in Tokyo creating buildings that blur the boundary between nature and structure", accent: "#A0AEC0", grad: "linear-gradient(135deg,#060608,#0c0c10,#08080e)", desc: "Minimal, gallery-quality presentation for visionary architects" },
  { name: "Wedding Photography", category: "Portfolio", prompt: "A destination wedding photographer who shoots film and digital across 30 countries — editorial, timeless, emotional storytelling", accent: "#F687B3", grad: "linear-gradient(135deg,#140808,#20100e,#180a08)", desc: "Romantic, editorial design that books luxury weddings" },
  { name: "Creative Agency", category: "Portfolio", prompt: "A full-service creative agency helping DTC brands break through with scroll-stopping campaigns, brand identity, and content strategy", accent: "#F6AD55", grad: "linear-gradient(135deg,#120800,#200e00,#180a00)", desc: "Bold, culturally-aware design that attracts ambitious brands" },
  { name: "Freelance Developer", category: "Portfolio", prompt: "A senior full-stack developer specialising in building AI-powered SaaS products — 10 years experience, 50+ shipped products, available for contracts", accent: "#3DF0FF", grad: "linear-gradient(135deg,#040a10,#081420,#060c14)", desc: "Technical credibility meets creative execution — hire-me energy" },

  // Fitness & Wellness
  { name: "Pilates Studio", category: "Fitness", prompt: "A boutique reformer Pilates studio in Manhattan with celebrity clientele — personalized attention, clinical expertise, transformational results in 12 sessions", accent: "#38F8A6", grad: "linear-gradient(135deg,#040c08,#081610,#060e0c)", desc: "Aspirational wellness design for the premium fitness market" },
  { name: "Personal Training", category: "Fitness", prompt: "An elite personal training service for executives and high-performers in London — bespoke programming, nutrition coaching, results in 90 days guaranteed", accent: "#F6AD55", grad: "linear-gradient(135deg,#100a00,#1e1400,#150c00)", desc: "High-performance design that speaks to driven achievers" },
  { name: "Yoga & Meditation", category: "Fitness", prompt: "A premium yoga and meditation retreat centre in Bali offering immersive 7-day programs for burnout recovery, spiritual growth, and deep healing", accent: "#9F7AEA", grad: "linear-gradient(135deg,#080610,#10091a,#0c0816)", desc: "Serene, transcendent design that sells transformation" },

  // Technology & SaaS
  { name: "AI Analytics Platform", category: "SaaS", prompt: "An AI-powered business intelligence platform that turns raw data into actionable insights in seconds — 10x faster than Tableau, no SQL required", accent: "#3DF0FF", grad: "linear-gradient(135deg,#030810,#061018,#040c14)", desc: "Data-forward design that converts technical decision-makers" },
  { name: "HR Tech Platform", category: "SaaS", prompt: "An AI-powered HR platform that automates hiring, onboarding, and performance management for companies scaling from 50 to 5000 employees", accent: "#7C5CFF", grad: "linear-gradient(135deg,#080618,#100a28,#0c0820)", desc: "Enterprise-credible design with a modern startup energy" },
  { name: "Cybersecurity Firm", category: "SaaS", prompt: "A next-gen cybersecurity company offering real-time threat detection, zero-trust architecture, and 24/7 SOC services for mid-market enterprises", accent: "#68D391", grad: "linear-gradient(135deg,#030c08,#061610,#040e0a)", desc: "Authoritative protection narrative for security-conscious buyers" },
  { name: "No-Code App Builder", category: "SaaS", prompt: "A no-code platform that lets anyone build custom web apps, internal tools, and workflows — 10x faster than development, 1/10th the cost", accent: "#F687B3", grad: "linear-gradient(135deg,#100410,#1c081c,#140c14)", desc: "Playful empowerment design for the citizen-developer revolution" },

  // Education
  { name: "Online Coding Bootcamp", category: "Education", prompt: "A 12-week coding bootcamp with a 94% job placement rate — full-stack JavaScript, AI integration, and guaranteed interview prep with top tech companies", accent: "#3DF0FF", grad: "linear-gradient(135deg,#030a10,#061018,#04080e)", desc: "Results-obsessed design that converts career-changers to students" },
  { name: "Language Learning App", category: "Education", prompt: "An AI-powered language learning app that makes you conversationally fluent in 90 days using spaced repetition and real conversation simulation", accent: "#68D391", grad: "linear-gradient(135deg,#040c06,#081a0c,#060e08)", desc: "Gamified learning design that drives daily habit formation" },
  { name: "Private Tutoring", category: "Education", prompt: "A premium private tutoring service for IB, A-Levels, and SAT/ACT preparation — Harvard-educated tutors, guaranteed grade improvement, London and online", accent: "#F6AD55", grad: "linear-gradient(135deg,#100c00,#1e1400,#160a00)", desc: "Academic prestige design for ambitious students and parents" },

  // Hospitality & Travel
  { name: "Boutique Hotel", category: "Travel", prompt: "A 12-room boutique hotel in the Amalfi Coast with private pools, a Michelin-starred chef, and personalised itineraries — adults-only, reservation-only", accent: "#F6AD55", grad: "linear-gradient(135deg,#0e0800,#1a1200,#120e00)", desc: "Aspirational hospitality that sells exclusivity at a premium" },
  { name: "Luxury Travel Agency", category: "Travel", prompt: "A bespoke luxury travel agency crafting once-in-a-lifetime experiences — private jets, exclusive access, and expert local guides across 60 countries", accent: "#C09A5C", grad: "linear-gradient(135deg,#0c0a04,#181400,#120e00)", desc: "Editorial travel design for the ultra-premium experience economy" },
  { name: "Adventure Tours", category: "Travel", prompt: "An extreme adventure tour operator offering guided expeditions to Everest base camp, K2, and the most remote corners of the world — small groups, expert guides", accent: "#68D391", grad: "linear-gradient(135deg,#030c04,#061808,#040e06)", desc: "Rugged, adrenaline-charged design for adventure-seekers" },
];

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map(t => t.category)))];

export default function TemplatesPage() {
  const [active, setActive] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const filtered = TEMPLATES.filter(t => {
    const matchCat = active === "All" || t.category === active;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <style>{`
@keyframes tpFade{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes tpShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
@keyframes tpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.tp-a{animation:tpFade 700ms cubic-bezier(.16,1,.3,1) both}
.tp-d1{animation-delay:80ms}.tp-d2{animation-delay:160ms}.tp-d3{animation-delay:240ms}

.tp-page{min-height:100vh;background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;}

/* Ambient — warm mesh orbs */
.tp-ambient{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
.tp-blob1{position:absolute;width:900px;height:700px;top:-300px;left:-250px;border-radius:50%;background:radial-gradient(circle,rgba(240,179,90,.10) 0%,rgba(232,113,90,.05) 40%,transparent 70%);filter:blur(60px);}
.tp-blob2{position:absolute;width:700px;height:600px;bottom:-250px;right:-200px;border-radius:50%;background:radial-gradient(circle,rgba(232,113,90,.08) 0%,rgba(240,179,90,.03) 40%,transparent 70%);filter:blur(60px);}

/* Hero */
.tp-hero{text-align:center;padding:140px 24px 24px;position:relative;z-index:1;}
.tp-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:999px;border:1px solid rgba(240,179,90,.30);background:rgba(240,179,90,.06);color:rgba(240,179,90,.85);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;font-family:'JetBrains Mono','Fira Code',monospace;}
.tp-dot{width:6px;height:6px;border-radius:50%;background:rgba(240,179,90,.85);}
.tp-h1{font-size:clamp(38px,6.5vw,68px);font-weight:900;margin:0 0 18px;letter-spacing:-.06em;line-height:1;color:#F5F0EB;}
.tp-h1 span{background:linear-gradient(135deg,#F0B35A,#E8715A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.tp-sub{font-size:17px;color:rgba(245,240,235,.45);margin:0 auto;line-height:1.7;max-width:520px;font-family:'Inter',system-ui,sans-serif;}
.tp-count{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:12px;border:1px solid rgba(245,240,235,.08);background:rgba(245,240,235,.035);margin-top:20px;font-size:13px;color:rgba(245,240,235,.50);font-family:'Inter',system-ui,sans-serif;}
.tp-count strong{color:rgba(240,179,90,.85);font-weight:800;}

/* Search */
.tp-search-wrap{max-width:480px;margin:28px auto 0;position:relative;}
.tp-search{width:100%;padding:13px 18px 13px 44px;border-radius:14px;border:1px solid rgba(245,240,235,.10);background:rgba(245,240,235,.035);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#F5F0EB;font-size:15px;font-family:'Inter',system-ui,sans-serif;outline:none;transition:border-color 200ms;}
.tp-search:focus{border-color:rgba(240,179,90,.45);}
.tp-search::placeholder{color:rgba(245,240,235,.25);}
.tp-search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:rgba(245,240,235,.25);font-size:16px;pointer-events:none;}

/* Filters */
.tp-filters{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;padding:24px 24px 36px;position:relative;z-index:1;}
.tp-filter{padding:8px 18px;border-radius:999px;border:1px solid rgba(245,240,235,.08);background:rgba(245,240,235,.035);color:rgba(245,240,235,.50);font-size:13px;font-weight:500;cursor:pointer;transition:all 180ms;font-family:'Inter',system-ui,sans-serif;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
.tp-filter:hover{border-color:rgba(245,240,235,.18);color:rgba(245,240,235,.75);background:rgba(245,240,235,.06);}
.tp-filter.active{border-color:rgba(240,179,90,.50);background:rgba(240,179,90,.12);color:rgba(240,179,90,.95);font-weight:600;}

/* Grid */
.tp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:1;}
@media(max-width:960px){.tp-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:560px){.tp-grid{grid-template-columns:1fr;}}

/* Card */
.tp-card{border-radius:20px;border:1px solid rgba(245,240,235,.08);overflow:hidden;text-decoration:none;color:inherit;display:flex;flex-direction:column;transition:all 280ms cubic-bezier(.16,1,.3,1);position:relative;}
.tp-card::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(135deg,rgba(240,179,90,.20),rgba(245,240,235,.04));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity 280ms;pointer-events:none;}
.tp-card:hover{transform:translateY(-6px);box-shadow:0 24px 60px rgba(0,0,0,.30),0 0 40px rgba(240,179,90,.06);border-color:rgba(240,179,90,.18);}
.tp-card:hover::before{opacity:1;}

/* Mini preview */
.tp-preview{height:110px;padding:14px;display:flex;flex-direction:column;gap:7px;position:relative;}
.tp-prev-nav{display:flex;justify-content:space-between;padding:5px 10px;border-radius:6px;background:rgba(245,240,235,.05);border:1px solid rgba(245,240,235,.08);}
.tp-prev-logo{height:5px;border-radius:3px;opacity:.8;}
.tp-prev-links{display:flex;gap:5px;}
.tp-prev-link{width:18px;height:3px;border-radius:1px;background:rgba(245,240,235,.18);}
.tp-prev-body{flex:1;border-radius:6px;background:rgba(245,240,235,.035);border:1px solid rgba(245,240,235,.06);padding:10px 12px;display:flex;flex-direction:column;justify-content:flex-end;gap:5px;}
.tp-prev-title{width:70%;height:7px;border-radius:4px;background:rgba(245,240,235,.45);}
.tp-prev-text{width:45%;height:4px;border-radius:2px;background:rgba(245,240,235,.20);}
.tp-prev-cta{width:44px;height:14px;border-radius:4px;margin-top:4px;}

/* Meta */
.tp-meta{padding:14px 16px 18px;border-top:1px solid rgba(245,240,235,.06);flex:1;display:flex;flex-direction:column;gap:8px;background:rgba(0,0,0,.20);}
.tp-cat{font-size:10px;padding:3px 9px;border-radius:999px;background:rgba(245,240,235,.05);border:1px solid rgba(245,240,235,.08);color:rgba(245,240,235,.50);font-weight:600;letter-spacing:.04em;text-transform:uppercase;display:inline-flex;align-self:flex-start;font-family:'JetBrains Mono','Fira Code',monospace;}
.tp-name{font-size:14px;font-weight:700;color:rgba(245,240,235,.92);line-height:1.3;letter-spacing:-.02em;}
.tp-desc{font-size:12px;color:rgba(245,240,235,.42);line-height:1.55;margin-top:auto;font-family:'Inter',system-ui,sans-serif;}
.tp-use{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;margin-top:8px;transition:gap 200ms;}
.tp-card:hover .tp-use{gap:8px;}

/* Empty */
.tp-empty{text-align:center;padding:60px 24px;color:rgba(245,240,235,.30);font-size:15px;position:relative;z-index:1;font-family:'Inter',system-ui,sans-serif;}
.tp-empty button{background:none;border:none;color:rgba(240,179,90,.75);cursor:pointer;font-size:15px;font-family:inherit;}
.tp-empty button:hover{color:rgba(240,179,90,.95);}

/* CTA */
.tp-cta{text-align:center;padding:64px 24px 80px;position:relative;z-index:1;}
.tp-cta h2{font-size:clamp(24px,3.5vw,34px);font-weight:800;letter-spacing:-.04em;margin:0 0 10px;color:#F5F0EB;}
.tp-cta p{font-size:15px;color:rgba(245,240,235,.40);margin:0 0 24px;font-family:'Inter',system-ui,sans-serif;}
.tp-cta-btn{display:inline-flex;align-items:center;gap:6px;padding:14px 36px;border-radius:14px;background:linear-gradient(135deg,#F0B35A,#E8A040);border:1px solid rgba(240,179,90,.60);color:#0F0D15;text-decoration:none;font-size:15px;font-weight:700;transition:all 200ms;position:relative;overflow:hidden;}
.tp-cta-btn::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:tpShim 4s ease-in-out infinite;}
.tp-cta-btn:hover{box-shadow:0 0 28px rgba(240,179,90,.25);transform:translateY(-2px);}
      `}</style>

      <main className="tp-page">
        <div className="tp-ambient">
          <div className="tp-blob1" />
          <div className="tp-blob2" />
        </div>

        <SiteNav />

        {/* Hero */}
        <div className="tp-hero">
          <div className={`tp-badge${mounted ? " tp-a" : ""}`}>
            <span className="tp-dot" />
            {TEMPLATES.length} TEMPLATES
          </div>
          <h1 className={`tp-h1${mounted ? " tp-a tp-d1" : ""}`}>
            Start with a template.<br /><span>Own the result.</span>
          </h1>
          <p className={`tp-sub${mounted ? " tp-a tp-d2" : ""}`}>
            Expertly crafted prompts across every industry. Click one to generate your site instantly &mdash; then make it yours.
          </p>
          <div className={`tp-count${mounted ? " tp-a tp-d3" : ""}`}>
            <strong>{TEMPLATES.length}+</strong> templates across <strong>{CATEGORIES.length - 1}</strong> industries
          </div>

          {/* Search */}
          <div className={`tp-search-wrap${mounted ? " tp-a tp-d3" : ""}`}>
            <span className="tp-search-icon">&#x1F50D;</span>
            <input
              type="text"
              className="tp-search"
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="tp-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`tp-filter${active === cat ? " active" : ""}`}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="tp-grid">
          {filtered.map((t, i) => (
            <a
              key={i}
              href={`/build?prompt=${encodeURIComponent(t.prompt)}`}
              className="tp-card"
              style={{ background: t.grad, animationDelay: mounted ? `${Math.min(i * 40, 400)}ms` : undefined }}
            >
              {/* Mini preview */}
              <div className="tp-preview">
                <div className="tp-prev-nav">
                  <div className="tp-prev-logo" style={{ width: 32, background: t.accent }} />
                  <div className="tp-prev-links">
                    {[0, 1, 2].map(j => <div key={j} className="tp-prev-link" />)}
                  </div>
                </div>
                <div className="tp-prev-body">
                  <div className="tp-prev-title" />
                  <div className="tp-prev-text" />
                  <div className="tp-prev-cta" style={{ background: t.accent }} />
                </div>
              </div>

              {/* Meta */}
              <div className="tp-meta">
                <span className="tp-cat">{t.category}</span>
                <div className="tp-name">{t.name}</div>
                <div className="tp-desc">{t.desc}</div>
                <div className="tp-use" style={{ color: t.accent }}>
                  Use template <span>&rarr;</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="tp-empty">
            No templates match your search.{" "}
            <button onClick={() => { setSearch(""); setActive("All"); }}>Clear filters</button>
          </div>
        )}

        {/* CTA */}
        <div className="tp-cta">
          <h2>Don&apos;t see what you need?</h2>
          <p>Describe your business in your own words and our AI will build it.</p>
          <a href="/build" className="tp-cta-btn">
            Build from scratch &rarr;
          </a>
        </div>

        <SiteFooter />
      </main>
    </>
  );
}
