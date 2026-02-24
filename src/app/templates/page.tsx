"use client";

import * as React from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  const [isRecording, setIsRecording] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);
  const interimTextRef = React.useRef<HTMLDivElement>(null);
  const finalTextRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Update the UI in real-time
        if (interimTextRef.current) interimTextRef.current.textContent = interimTranscript;
        if (finalTranscript) {
          if (finalTextRef.current) finalTextRef.current.textContent = finalTranscript;
          
          const transcript = finalTranscript.toLowerCase().trim();
          console.log("Voice Command Received:", transcript);

          if (transcript.includes("go gold")) {
            document.body.classList.add("gold-theme");
            speakResponse("Initializing Gold Interface.");
          } else if (transcript.includes("center everything")) {
            const hero = document.querySelector('.main-hero') as HTMLElement;
            if(hero) {
              hero.style.margin = "0 auto";
            }
            speakResponse("Layout balanced.");
          } else if (transcript.includes("deploy project")) {
            startDeploymentAnimation();
            speakResponse("Deploying to production.");
          } else {
            setSearch(transcript);
          }

          // Clear subtitles after a few seconds of inactivity
          setTimeout(() => {
            if (interimTextRef.current) interimTextRef.current.textContent = "";
            if (finalTextRef.current) finalTextRef.current.textContent = "";
          }, 3000);
        }
      };
      
      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (finalTextRef.current) finalTextRef.current.textContent = '';
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
      recognitionRef.current?.start();
    }
  };

  const speakResponse = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 1.1;
    msg.pitch = 1.2;
    window.speechSynthesis.speak(msg);
  }

  const startDeploymentAnimation = () => {
    console.log("Starting deployment animation...");
    // In a real implementation, you would trigger progress bars or other UI elements.
  }

  const filtered = TEMPLATES.filter(t => {
    const matchCat = active === "All" || t.category === active;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main style={{
      minHeight: "100vh",
      background: "#06080e",
      color: "#e9eef7",
      fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
      padding: "0 0 80px",
    }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.04em" }}>D8</span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(61,240,255,0.7)", display: "inline-block" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>Dominat8.io</span>
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/gallery" style={{ padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>Gallery</a>
          <a href="/pricing" style={{ padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>Pricing</a>
          <a href="/" style={{ padding: "8px 18px", borderRadius: 999, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Start building →</a>
        </div>
      </nav>

      {/* Hero */}
      <div className="main-hero" style={{ textAlign: "center", padding: "56px 24px 36px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 999, border: "1px solid rgba(61,240,255,0.25)", background: "rgba(61,240,255,0.06)", color: "rgba(61,240,255,0.85)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 20 }}>
          TEMPLATES
        </div>
        <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, margin: "0 0 14px", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
          Start with a template.<br />Own the result.
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.42)", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          {TEMPLATES.length}+ expertly crafted prompts across every industry. Click one to generate your site instantly.
        </p>

        {/* Search */}
        <div style={{ maxWidth: 400, margin: "0 auto", position: "relative" }}>
          <input
            type="text"
            placeholder="Search templates… or give a command"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 40px 10px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "#e9eef7",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={toggleVoice}
            className={`mic-btn ${isRecording ? "listening" : ""}`}
            title={isRecording ? "Stop listening" : "Start listening"}
            style={{
              color: isRecording ? "#3DF0FF" : "rgba(255,255,255,0.4)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={isRecording ? "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" : "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"}/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </button>
        </div>
        <div id="subtitle-container" className="subtitle-overlay">
          <div ref={interimTextRef} className="interim"></div>
          <div ref={finalTextRef} className="final"></div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", padding: "0 24px 32px" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              border: `1px solid ${active === cat ? "rgba(61,240,255,0.40)" : "rgba(255,255,255,0.10)"}`,
              background: active === cat ? "rgba(61,240,255,0.10)" : "rgba(255,255,255,0.03)",
              color: active === cat ? "rgba(61,240,255,0.95)" : "rgba(255,255,255,0.55)",
              fontSize: 13,
              fontWeight: active === cat ? 600 : 400,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {filtered.map((t, i) => (
          <a
            key={i}
            href={`/?prompt=${encodeURIComponent(t.prompt)}`}
            style={{
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              background: t.grad,
              transition: "transform 180ms ease, border-color 180ms ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            {/* Mini preview */}
            <div style={{ height: 100, padding: 12, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderRadius: 5, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ width: 30, height: 4, borderRadius: 2, background: t.accent, opacity: 0.8 }} />
                <div style={{ display: "flex", gap: 4 }}>
                  {[0,1,2].map(j => <div key={j} style={{ width: 16, height: 3, borderRadius: 1, background: "rgba(255,255,255,0.20)" }} />)}
                </div>
              </div>
              <div style={{ flex: 1, borderRadius: 5, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", padding: "8px 10px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 4 }}>
                <div style={{ width: "70%", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.50)" }} />
                <div style={{ width: "45%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.22)" }} />
                <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                  <div style={{ width: 40, height: 12, borderRadius: 3, background: t.accent }} />
                </div>
              </div>
            </div>

            {/* Meta */}
            <div style={{ padding: "10px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.55)" }}>{t.category}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.90)", lineHeight: 1.3 }}>{t.name}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginTop: "auto" }}>{t.desc}</div>
              <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: t.accent, fontWeight: 600 }}>
                Use template →
              </div>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(255,255,255,0.30)", fontSize: 15 }}>
          No templates match your search. <button onClick={() => { setSearch(""); setActive("All"); }} style={{ background: "none", border: "none", color: "rgba(61,240,255,0.70)", cursor: "pointer", fontSize: 15 }}>Clear filters</button>
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "56px 24px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 10px" }}>Don't see what you need?</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "0 0 22px" }}>Describe your business in your own words and our AI will build it.</p>
        <a href="/" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 14, background: "linear-gradient(135deg,#00C97A,#00B36B)", color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,201,122,0.40)", letterSpacing: "-0.01em" }}>
          Build from scratch →
        </a>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: repeat(3"] { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          div[style*="gridTemplateColumns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.25); }
        button:hover { opacity: 0.85; }
        .gold-theme {
          background: linear-gradient(135deg, #FFD700, #DAA520);
          color: #333;
          transition: all 0.5s ease;
        }
        .mic-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 40px; 
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: 0.4s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Pulsing "Listening" State */
        .mic-btn.listening {
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          animation: pulse-gold 1.5s infinite;
        }

        @keyframes pulse-gold {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .subtitle-overlay {
          position: fixed;
          bottom: 120px; /* Sits above your dock */
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          max-width: 600px;
          padding: 15px 25px;
          background: rgba(15, 15, 15, 0.4);
          backdrop-filter: blur(12px) saturate(180%); /* Pro glass effect */
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          text-align: center;
          z-index: 200;
          pointer-events: none; /* User can click through it */
        }

        .interim {
          color: rgba(255, 255, 255, 0.5); /* Dimmer text for in-progress words */
          font-style: italic;
          font-size: 1.1rem;
        }

        .final {
          color: #FFD700; /* Gold for confirmed commands */
          font-weight: bold;
          font-size: 1.3rem;
          margin-top: 5px;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
        }
      `}</style>
    </main>
  );
}
