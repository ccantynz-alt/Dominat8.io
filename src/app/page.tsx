export default function HomePage() {
  const marker = "HERO_WOW_V1_2_GOLD_OK_20260125_153352";

  return (
    <main className="d8-root">
      <div className="d8-hidden">{marker}</div>

      <section className="d8-hero">
        {/* Background */}
        <div className="d8-bg d8-bgBase" aria-hidden="true" />
        <div className="d8-bg d8-bgVignette" aria-hidden="true" />

        {/* Premium halo (headline focus) */}
        <div className="d8-halo d8-haloMain" aria-hidden="true" />
        <div className="d8-halo d8-haloSide" aria-hidden="true" />

        {/* NEW: Golden “signal rain” (champagne + warm gold) */}
        <div className="d8-gold" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span className="d8-goldDrop" key={i} />
          ))}
        </div>

        {/* Subtle grain */}
        <div className="d8-grain" aria-hidden="true" />

        <div className="d8-shell">
          <div className="d8-badge d8-enter">
            <span className="d8-dot" />
            <span className="d8-badgeText">Dominat8 — Enterprise AI website automation</span>
            <span className="d8-badgePill">Premium</span>
          </div>

          <h1 className="d8-h1 d8-enter d8-delay1">
            Launch a{" "}
            <span className="d8-gradText d8-strong">world-class</span>{" "}
            site
            <br />
            <span className="d8-h1Lite">in minutes — not weeks.</span>
          </h1>

          <p className="d8-sub d8-enter d8-delay2">
            Dominat8 generates pages, writes SEO, and prepares your publish pipeline —
            so you ship faster with control, consistency, and confidence.
          </p>

          <div className="d8-ctaRow d8-enter d8-delay3">
            <a className="d8-btn d8-btnPrimary" href="/new">
              Build my site <span className="d8-btnArrow">→</span>
            </a>

            <a className="d8-btn d8-btnSecondary" href="/templates">
              View templates
            </a>

            <div className="d8-proof">
              <div className="d8-proofTop">Built for serious launches</div>
              <div className="d8-proofSub">Structured outputs • Repeatable quality • Clean publishing</div>
            </div>
          </div>

          <div className="d8-cards d8-enter d8-delay4">
            <div className="d8-card">
              <div className="d8-cardTitle">Finish-for-me</div>
              <div className="d8-cardBody">From brief → full site structure, automatically.</div>
            </div>
            <div className="d8-card">
              <div className="d8-cardTitle">SEO V2</div>
              <div className="d8-cardBody">Titles, descriptions, sitemap, and IA built in.</div>
            </div>
            <div className="d8-card">
              <div className="d8-cardTitle">Publish-ready</div>
              <div className="d8-cardBody">A clean pipeline from spec → live pages.</div>
            </div>
          </div>

          <div className="d8-bottomFade" aria-hidden="true" />
        </div>
      </section>

      <section className="d8-footer">
        <small>Marker: {marker}</small>
      </section>

      <style>{\
        :root { color-scheme: dark; }
        .d8-root{
          min-height:100vh;
          background:#000;
          color:#fff;
          overflow:hidden;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        }
        .d8-hidden{ position:absolute; left:-9999px; top:-9999px; }

        /* Hero layout */
        .d8-hero{
          position:relative;
          min-height:92vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:96px 20px 72px;
        }

        /* Slight left bias */
        .d8-shell{
          position:relative;
          width:min(1120px, 100%);
          z-index:3;
          transform: translateX(-34px);
        }
        @media (max-width: 860px){
          .d8-shell{ transform:none; }
        }

        /* Background base */
        .d8-bg{ position:absolute; inset:0; z-index:0; }
        .d8-bgBase{
          background-image:url('/hero/hero-bg.svg');
          background-size:cover;
          background-position:center;
          transform:scale(1.03);
          filter:saturate(1.12) contrast(1.05);
        }
        .d8-bgVignette{
          background:
            radial-gradient(1000px 560px at 35% 32%, rgba(0,0,0,0.10), rgba(0,0,0,0.80) 72%),
            linear-gradient(to bottom, rgba(0,0,0,0.10), rgba(0,0,0,0.84));
          z-index:1;
        }

        /* Premium halo glows */
        .d8-halo{
          position:absolute;
          z-index:2;
          pointer-events:none;
          filter: blur(10px);
          opacity: 0.95;
        }
        .d8-haloMain{
          width: 920px;
          height: 560px;
          left: 120px;
          top: 110px;
          background:
            radial-gradient(closest-side at 35% 35%, rgba(124,92,255,0.50), rgba(0,0,0,0) 68%),
            radial-gradient(closest-side at 55% 45%, rgba(77,210,255,0.18), rgba(0,0,0,0) 70%);
        }
        .d8-haloSide{
          width: 760px;
          height: 520px;
          left: -140px;
          top: 220px;
          background:
            radial-gradient(closest-side at 55% 45%, rgba(77,210,255,0.12), rgba(0,0,0,0) 70%),
            radial-gradient(closest-side at 45% 35%, rgba(124,92,255,0.16), rgba(0,0,0,0) 72%);
          opacity: 0.62;
        }
        @media (max-width: 720px){
          .d8-haloMain{ left: -40px; top: 70px; width: 760px; height: 520px; }
          .d8-haloSide{ display:none; }
        }

        /* NEW: Golden Signal Rain */
        .d8-gold{
          position:absolute;
          left:0; right:0;
          top:0;
          height: 52vh;          /* only above hero / never over cards */
          z-index:2;
          pointer-events:none;
          overflow:hidden;
          mix-blend-mode: screen;
          opacity: 0.70;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0));
        }

        .d8-goldDrop{
          position:absolute;
          top:-18vh;
          width: 2px;
          height: 22vh;
          border-radius: 999px;
          background:
            linear-gradient(
              to bottom,
              rgba(255, 244, 220, 0),
              rgba(255, 236, 205, 0.22),   /* champagne */
              rgba(255, 214, 160, 0.20),   /* warm gold */
              rgba(255, 244, 220, 0)
            );
          filter: blur(0.2px);
          box-shadow:
            0 0 14px rgba(255, 236, 205, 0.16),
            0 0 26px rgba(255, 214, 160, 0.10);
          animation: d8GoldFall linear infinite;
          opacity: 0.75;
        }

        /* Positioning + timing (fixed but varied) */
        .d8-goldDrop:nth-child(1)  { left: 10%; animation-duration: 10.5s; animation-delay: -1.2s; opacity: 0.40; transform: rotate(2deg); }
        .d8-goldDrop:nth-child(2)  { left: 18%; animation-duration:  9.2s; animation-delay: -6.0s; opacity: 0.55; transform: rotate(-2deg); }
        .d8-goldDrop:nth-child(3)  { left: 26%; animation-duration: 11.8s; animation-delay: -3.4s; opacity: 0.42; transform: rotate(1deg); }
        .d8-goldDrop:nth-child(4)  { left: 34%; animation-duration:  8.6s; animation-delay: -7.2s; opacity: 0.60; transform: rotate(-1deg); }
        .d8-goldDrop:nth-child(5)  { left: 42%; animation-duration: 12.6s; animation-delay: -2.6s; opacity: 0.36; transform: rotate(2deg); }
        .d8-goldDrop:nth-child(6)  { left: 50%; animation-duration:  9.8s; animation-delay: -5.4s; opacity: 0.58; transform: rotate(-2deg); }
        .d8-goldDrop:nth-child(7)  { left: 58%; animation-duration: 13.4s; animation-delay: -1.8s; opacity: 0.34; transform: rotate(1deg); }
        .d8-goldDrop:nth-child(8)  { left: 66%; animation-duration: 10.9s; animation-delay: -6.8s; opacity: 0.46; transform: rotate(-1deg); }
        .d8-goldDrop:nth-child(9)  { left: 74%; animation-duration:  8.9s; animation-delay: -3.9s; opacity: 0.62; transform: rotate(2deg); }
        .d8-goldDrop:nth-child(10) { left: 82%; animation-duration: 12.2s; animation-delay: -7.7s; opacity: 0.38; transform: rotate(-2deg); }
        .d8-goldDrop:nth-child(11) { left: 90%; animation-duration:  9.6s; animation-delay: -2.2s; opacity: 0.52; transform: rotate(1deg); }
        .d8-goldDrop:nth-child(12) { left: 94%; animation-duration: 14.1s; animation-delay: -5.9s; opacity: 0.30; transform: rotate(-1deg); }

        @keyframes d8GoldFall{
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(0, 78vh, 0); }
        }

        /* Grain */
        .d8-grain{
          position:absolute;
          inset:0;
          z-index:2;
          pointer-events:none;
          opacity:0.09;
          background-image:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 7px);
          mix-blend-mode: overlay;
        }

        /* Badge */
        .d8-badge{
          display:inline-flex;
          align-items:center;
          gap:10px;
          padding:10px 14px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,0.16);
          background:rgba(0,0,0,0.38);
          backdrop-filter: blur(12px);
          box-shadow: 0 12px 50px rgba(0,0,0,0.55);
          margin-bottom:18px;
        }
        .d8-dot{
          width:8px; height:8px; border-radius:999px;
          background:#7CFFB2;
          box-shadow: 0 0 0 6px rgba(124,255,178,0.10);
        }
        .d8-badgeText{
          font-size:13px;
          letter-spacing:0.2px;
          opacity:0.92;
          white-space:nowrap;
        }
        .d8-badgePill{
          margin-left:6px;
          font-size:12px;
          padding:4px 10px;
          border-radius:999px;
          border:1px solid rgba(255,255,255,0.14);
          background:rgba(255,255,255,0.06);
          opacity:0.9;
        }

        /* Headline */
        .d8-h1{
          font-size:clamp(2.7rem, 5.0vw, 4.35rem);
          line-height:1.03;
          letter-spacing:-1.15px;
          margin:0 0 16px;
          text-shadow: 0 18px 70px rgba(0,0,0,0.70);
        }
        .d8-strong{
          font-weight: 950;
          letter-spacing: -1.35px;
        }
        .d8-h1Lite{
          font-weight: 650;
          opacity: 0.96;
        }
        .d8-gradText{
          background: linear-gradient(135deg, rgba(124,92,255,1), rgba(77,210,255,1));
          -webkit-background-clip:text;
          background-clip:text;
          color:transparent;
        }
        .d8-sub{
          max-width:760px;
          font-size:clamp(1.05rem, 1.35vw, 1.2rem);
          line-height:1.6;
          opacity:0.82;
          margin:0 0 26px;
        }

        /* CTA */
        .d8-ctaRow{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
          align-items:flex-start;
        }
        .d8-btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          padding:14px 18px;
          border-radius:14px;
          text-decoration:none;
          user-select:none;
          transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease, border-color 160ms ease;
          will-change: transform;
        }
        .d8-btnPrimary{
          font-weight:900;
          color:#06070b;
          background: linear-gradient(135deg, #7c5cff, #4dd2ff);
          box-shadow: 0 18px 70px rgba(124,92,255,0.24);
        }
        .d8-btnPrimary:hover{
          transform: translateY(-1px);
          box-shadow: 0 22px 92px rgba(124,92,255,0.32);
        }
        .d8-btnArrow{ margin-left:10px; font-weight:900; opacity:0.85; }
        .d8-btnSecondary{
          font-weight:800;
          color:#fff;
          border:1px solid rgba(255,255,255,0.16);
          background: rgba(0,0,0,0.36);
          backdrop-filter: blur(12px);
        }
        .d8-btnSecondary:hover{
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.22);
          box-shadow: 0 18px 70px rgba(0,0,0,0.55);
        }

        /* Proof block */
        .d8-proof{
          margin-left: 6px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.28);
          backdrop-filter: blur(12px);
          max-width: 420px;
        }
        .d8-proofTop{ font-weight:900; opacity:0.95; margin-bottom:2px; }
        .d8-proofSub{ font-size:13px; opacity:0.72; line-height:1.35; }

        /* Cards */
        .d8-cards{
          margin-top:22px;
          display:grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap:12px;
          max-width: 980px;
        }
        .d8-card{
          border:1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.34);
          backdrop-filter: blur(14px);
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 18px 80px rgba(0,0,0,0.45);
        }
        .d8-cardTitle{ font-weight:900; margin-bottom:6px; letter-spacing:-0.2px; }
        .d8-cardBody{ opacity:0.78; font-size:14px; line-height:1.45; }

        /* Bottom fade */
        .d8-bottomFade{
          position:absolute;
          left:0; right:0; bottom:-1px;
          height:120px;
          background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1));
          z-index:2;
          pointer-events:none;
        }

        /* Footer */
        .d8-footer{
          padding: 22px 20px 46px;
          opacity:0.65;
          text-align:center;
        }

        /* Motion: keep tasteful */
        .d8-enter{ animation: d8Enter 680ms cubic-bezier(.2,.8,.2,1) both; }
        .d8-delay1{ animation-delay: 80ms; }
        .d8-delay2{ animation-delay: 150ms; }
        .d8-delay3{ animation-delay: 220ms; }
        .d8-delay4{ animation-delay: 290ms; }
        @keyframes d8Enter{
          from{ opacity:0; transform: translateY(8px); filter: blur(1px); }
          to{ opacity:1; transform: translateY(0); filter: blur(0); }
        }

        @media (prefers-reduced-motion: reduce){
          .d8-enter{ animation:none !important; }
          .d8-goldDrop{ animation:none !important; }
          .d8-btn{ transition:none !important; }
        }

        @media (max-width: 720px){
          .d8-proof{ max-width: 100%; }
          .d8-badgeText{ white-space:normal; }
        }
      \}</style>
    </main>
  );
}
