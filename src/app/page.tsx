export const dynamic = "force-dynamic";

export default function HomePage() {
  const BUILD_ID = "BUILD_ID_20260125_161543";
  const BUILD_ISO = "2026-01-25T03:15:43.2486278Z";

  const steps = [
    ["Describe your business", "Answer a few prompts. We infer structure, tone, and intent."],
    ["Generate pages + copy", "Hero, sections, pricing, FAQs - cohesive and editable."],
    ["Publish to your domain", "Push to production. Verify DNS. Go live with confidence."],
  ];

  const features = [
    ["Finish-for-me pipeline", "Idea -> site -> launch. Orchestrated steps, consistent output."],
    ["Premium by default", "Type rhythm, spacing, glass UI, and modern gradients."],
    ["SEO-ready foundation", "Structured pages, metadata hooks, and clean semantics."],
    ["Domain & routing", "Custom domains, verification, and deployment alignment."],
    ["Fast iteration", "One script upgrades. One marker proves what's live."],
    ["Built to scale", "Add agents, billing, and templates without redesign."],
  ];

  return (
    <main className="d8-root" data-build-id={BUILD_ID} data-build-iso={BUILD_ISO}>
      {/* HARD PROOF MARKER (hidden, safe) */}
      <div className="d8-hidden">{BUILD_ID}</div>

      <header className="d8-header">
        <div className="d8-nav">
          <a className="d8-brand" href="/">
            <span className="d8-logo" aria-hidden="true"></span>
            <span className="d8-brand-name">Dominat8</span>
            <span className="d8-brand-sub">AI Website Automation</span>
          </a>

          <nav className="d8-links">
            <a className="d8-link" href="/templates">Templates</a>
            <a className="d8-link" href="/use-cases">Use Cases</a>
            <a className="d8-link" href="/pricing">Pricing</a>
            <a className="d8-cta" href="/templates">
              <span className="d8-cta-in">Launch</span>
              <span className="d8-cta-arrow" aria-hidden="true">-></span>
            </a>
          </nav>
        </div>
      </header>

      <section className="d8-hero">
        <div className="d8-bg" aria-hidden="true"></div>
        <div className="d8-rain" aria-hidden="true"></div>
        <div className="d8-noise" aria-hidden="true"></div>

        <div className="d8-wrap">
          <div className="d8-badge">
            <span className="d8-dot" aria-hidden="true"></span>
            <span>Flagship design, generated fast</span>
            <span className="d8-sep">•</span>
            <span className="d8-build">Build: {BUILD_ID}</span>
          </div>

          <div className="d8-grid">
            <div>
              <h1 className="d8-h1">
                The AI that builds<br />
                <span className="d8-grad">a premium homepage</span><br />
                people trust instantly.
              </h1>

              <p className="d8-lead">
                Dominat8 generates your pages, structure, copy, and polish - fast.
                Clean rhythm. Strong hierarchy. Launch-ready feel.
              </p>

              <div className="d8-ctas">
                <a className="d8-primary" href="/templates">
                  <span className="d8-primary-in">Start building</span>
                  <span className="d8-primary-shine" aria-hidden="true"></span>
                </a>

                <a className="d8-secondary" href="/use-cases">See outcomes</a>
              </div>

              <div className="d8-trust">
                <div className="d8-trust-in">
                  <span className="d8-pill">Fast build</span>
                  <span className="d8-pill">SEO-ready</span>
                  <span className="d8-pill">Domains</span>
                  <span className="d8-pill">Publish pipeline</span>
                  <span className="d8-pill">Markers prove deploy</span>
                </div>
              </div>
            </div>

            <aside className="d8-card">
              <div className="d8-card-top">
                <div>
                  <div className="d8-card-title">Launch-ready checklist</div>
                  <div className="d8-card-sub">The details that make it feel expensive.</div>
                </div>
                <span className="d8-chip">Live</span>
              </div>

              <div className="d8-list">
                {[
                  ["Hero + sections", "Hierarchy and spacing tuned"],
                  ["Template pages", "Pricing, use-cases, templates"],
                  ["Production proof", "Build marker + deploy sanity"],
                  ["Domain-ready", "Deploy on your brand"],
                ].map(([t, d]) => (
                  <div className="d8-row" key={t}>
                    <span className="d8-check">✓</span>
                    <div>
                      <div className="d8-row-t">{t}</div>
                      <div className="d8-row-d">{d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d8-card-foot">
                <div className="d8-foot-line">Marker: <span className="d8-foot-strong">{BUILD_ID}</span></div>
                <div className="d8-foot-line2">{BUILD_ISO}</div>
              </div>
            </aside>
          </div>

          {/* Feature grid (6 cards) */}
          <section className="d8-section">
            <div className="d8-section-top">
              <h2 className="d8-h2">Premium by default</h2>
              <p className="d8-sub">
                The homepage you wanted - calm, modern, and "wow" without chaos.
              </p>
            </div>

            <div className="d8-fgrid">
              {features.map(([t, d]) => (
                <div className="d8-fcard" key={t}>
                  <div className="d8-icon" aria-hidden="true"></div>
                  <div className="d8-f-t">{t}</div>
                  <div className="d8-f-d">{d}</div>
                  <a className="d8-mini" href="/templates">Explore -></a>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="d8-section">
            <div className="d8-section-top">
              <h2 className="d8-h2">How it works</h2>
              <p className="d8-sub">
                A simple, reliable path to production - with proof at each step.
              </p>
            </div>

            <div className="d8-steps">
              {steps.map(([t, d], i) => (
                <div className="d8-step" key={t}>
                  <div className="d8-step-n">{i + 1}</div>
                  <div>
                    <div className="d8-step-t">{t}</div>
                    <div className="d8-step-d">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA strip */}
          <section className="d8-ctaStrip">
            <div className="d8-ctaStrip-in">
              <div>
                <div className="d8-ctaStrip-t">Ready to generate a flagship homepage?</div>
                <div className="d8-ctaStrip-d">Start from a template and iterate fast.</div>
              </div>
              <a className="d8-ctaStrip-btn" href="/templates">Launch -></a>
            </div>
          </section>
        </div>
      </section>

      <footer className="d8-footer">
        <div className="d8-footer-in">
          <div className="d8-footer-brand">Dominat8</div>
          <div className="d8-footer-links">
            <a className="d8-footlink" href="/templates">Templates</a>
            <a className="d8-footlink" href="/pricing">Pricing</a>
            <a className="d8-footlink" href="/use-cases">Use Cases</a>
          </div>
          <div className="d8-footer-build">Build: {BUILD_ID}</div>
        </div>
      </footer>

      <style>{
        :root { color-scheme: dark; }

        .d8-root{
          min-height:100vh; color:#EEF2FF; overflow-x:hidden;
          background:
            radial-gradient(1400px 800px at 15% -10%, rgba(255,215,0,0.16), transparent 60%),
            radial-gradient(1200px 700px at 85% 0%, rgba(0,255,200,0.12), transparent 55%),
            radial-gradient(900px 500px at 55% 35%, rgba(140,120,255,0.12), transparent 60%),
            linear-gradient(180deg,#05060a 0%,#070913 55%,#05060a 100%);
        }

        .d8-hidden{ position:absolute; left:-9999px; top:-9999px; }

        .d8-header{ position:sticky; top:0; z-index:60; backdrop-filter: blur(16px); }
        .d8-nav{
          max-width:1180px; margin:0 auto; padding:14px 18px;
          display:flex; align-items:center; justify-content:space-between; gap:14px;
          background:rgba(6,7,12,0.55);
          border-bottom:1px solid rgba(255,255,255,0.08);
        }

        .d8-brand{ display:flex; align-items:center; gap:10px; text-decoration:none; color:#EEF2FF; }
        .d8-logo{
          width:30px; height:30px; border-radius:10px; display:inline-block;
          background:linear-gradient(135deg, rgba(255,215,0,0.92), rgba(0,255,200,0.70));
          box-shadow:0 10px 30px rgba(0,0,0,0.55);
        }
        .d8-brand-name{ font-weight:850; letter-spacing:0.2px; }
        .d8-brand-sub{ opacity:0.65; font-size:12px; }

        .d8-links{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .d8-link{
          color:rgba(238,242,255,0.86); text-decoration:none; font-size:13px;
          padding:8px 10px; border-radius:10px;
        }
        .d8-link:hover{ background:rgba(255,255,255,0.06); }

        /* Nav CTA with animated border */
        .d8-cta{
          position:relative; display:inline-flex; align-items:center; gap:10px;
          padding:10px 14px; border-radius:14px; text-decoration:none; font-weight:900;
          color:#061018; white-space:nowrap;
          background:linear-gradient(135deg, rgba(255,215,0,0.95), rgba(0,255,200,0.78));
          box-shadow:0 16px 40px rgba(0,0,0,0.45);
          border:1px solid rgba(255,255,255,0.12);
          overflow:hidden;
        }
        .d8-cta:before{
          content:""; position:absolute; inset:-2px;
          background:conic-gradient(from 180deg,
            rgba(255,215,0,0.85),
            rgba(0,255,200,0.75),
            rgba(140,120,255,0.75),
            rgba(255,215,0,0.85));
          filter:blur(10px); opacity:0.55;
          animation:d8_spin 3.6s linear infinite;
        }
        .d8-cta-in, .d8-cta-arrow{
          position:relative; z-index:2;
        }

        .d8-hero{ position:relative; padding:84px 18px 74px 18px; }
        .d8-bg{
          position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(900px 520px at 50% 25%, rgba(255,255,255,0.07), transparent 60%),
            radial-gradient(1000px 650px at 50% 110%, rgba(0,0,0,0.72), rgba(0,0,0,0.92));
        }
        .d8-rain{
          position:absolute; inset:-30% 0 -30% 0; pointer-events:none; opacity:0.95;
          background-image:
            repeating-linear-gradient(90deg, rgba(255,215,0,0.00) 0px, rgba(255,215,0,0.00) 10px, rgba(255,215,0,0.14) 11px, rgba(255,215,0,0.00) 12px),
            repeating-linear-gradient(180deg, rgba(0,255,200,0.00) 0px, rgba(0,255,200,0.00) 16px, rgba(0,255,200,0.08) 17px, rgba(0,255,200,0.00) 18px);
          -webkit-mask-image: radial-gradient(640px 400px at 50% 22%, #000 22%, transparent 72%);
          mask-image: radial-gradient(640px 400px at 50% 22%, #000 22%, transparent 72%);
          animation:d8_drift 7s linear infinite;
        }
        .d8-noise{
          position:absolute; inset:0; pointer-events:none; opacity:0.12;
          background-image:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0.5px, transparent 0.6px),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.25) 0.5px, transparent 0.6px),
            radial-gradient(circle at 40% 70%, rgba(255,255,255,0.25) 0.5px, transparent 0.6px),
            radial-gradient(circle at 70% 80%, rgba(255,255,255,0.30) 0.5px, transparent 0.6px);
          background-size: 120px 120px, 160px 160px, 140px 140px, 180px 180px;
          mix-blend-mode: overlay;
        }

        @keyframes d8_drift{
          0%{ transform:translateY(-10px); opacity:0.75; }
          50%{ transform:translateY(10px); opacity:0.98; }
          100%{ transform:translateY(-10px); opacity:0.75; }
        }
        @keyframes d8_spin{
          0%{ transform:rotate(0deg); }
          100%{ transform:rotate(360deg); }
        }

        .d8-wrap{ max-width:1180px; margin:0 auto; position:relative; z-index:2; }

        .d8-badge{
          display:inline-flex; align-items:center; gap:10px;
          padding:10px 14px; border-radius:999px;
          border:1px solid rgba(255,255,255,0.12);
          background:rgba(8,10,16,0.55);
          box-shadow:0 18px 60px rgba(0,0,0,0.45);
          margin-bottom:18px;
          font-size:13px;
        }
        .d8-dot{ width:10px; height:10px; border-radius:999px; background:rgba(255,215,0,0.95); box-shadow:0 0 22px rgba(255,215,0,0.55); }
        .d8-sep{ opacity:0.55; }
        .d8-build{ opacity:0.75; font-size:12px; }

        .d8-grid{ display:grid; grid-template-columns: 1.18fr 0.82fr; gap:28px; align-items:start; }

        .d8-h1{
          margin:0; font-size:62px; line-height:1.02; letter-spacing:-1.5px;
          text-shadow:0 24px 90px rgba(0,0,0,0.65);
        }
        .d8-grad{
          background:linear-gradient(90deg, rgba(255,215,0,0.98), rgba(0,255,200,0.92), rgba(140,120,255,0.92));
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        .d8-lead{ margin:18px 0 0 0; font-size:18px; line-height:1.7; max-width:720px; opacity:0.86; }

        .d8-ctas{ display:flex; gap:12px; flex-wrap:wrap; margin-top:26px; align-items:center; }

        /* Primary CTA with animated gradient border + shine */
        .d8-primary{
          position:relative;
          display:inline-flex; align-items:center; justify-content:center;
          padding:14px 18px; border-radius:16px; min-width:220px;
          font-weight:950; text-decoration:none; color:#061018;
          background:linear-gradient(135deg, rgba(255,215,0,0.96), rgba(0,255,200,0.80));
          border:1px solid rgba(255,255,255,0.12);
          box-shadow:0 18px 64px rgba(0,0,0,0.55);
          overflow:hidden;
          transform: translateY(0px);
        }
        .d8-primary:before{
          content:""; position:absolute; inset:-2px; border-radius:18px;
          background:conic-gradient(from 180deg,
            rgba(255,215,0,0.85),
            rgba(0,255,200,0.75),
            rgba(140,120,255,0.75),
            rgba(255,215,0,0.85));
          opacity:0.38; filter:blur(10px);
          animation:d8_spin 3.2s linear infinite;
        }
        .d8-primary-in{
          position:relative; z-index:2;
          letter-spacing:0.1px;
        }
        .d8-primary-shine{
          position:absolute; inset:-40px -60px auto auto; width:180px; height:180px;
          background:radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0.0) 60%);
          transform: translate(0px, 0px);
          opacity:0.35;
          z-index:1;
        }
        .d8-primary:hover{ transform: translateY(-1px); filter: brightness(1.02); }

        .d8-secondary{
          display:inline-flex; align-items:center; justify-content:center;
          padding:14px 18px; border-radius:16px; min-width:190px;
          font-weight:850; text-decoration:none; color:rgba(238,242,255,0.92);
          background:rgba(10,12,18,0.32);
          border:1px solid rgba(255,255,255,0.18);
          box-shadow:0 18px 52px rgba(0,0,0,0.32);
          transform: translateY(0px);
        }
        .d8-secondary:hover{ background:rgba(10,12,18,0.46); transform: translateY(-1px); }

        .d8-trust{ margin-top:18px; }
        .d8-trust-in{
          display:flex; flex-wrap:wrap; gap:12px; align-items:center;
          padding:12px 12px;
          border-radius:18px;
          border:1px solid rgba(255,255,255,0.10);
          background:rgba(8,10,16,0.28);
        }
        .d8-pill{
          padding:8px 10px; border-radius:999px;
          border:1px solid rgba(255,255,255,0.12);
          background:rgba(8,10,16,0.28);
          font-size:13px; opacity:0.90;
        }

        .d8-card{
          border-radius:22px; padding:18px; overflow:hidden;
          border:1px solid rgba(255,255,255,0.14);
          background:linear-gradient(180deg, rgba(10,12,18,0.55), rgba(10,12,18,0.24));
          box-shadow:0 30px 110px rgba(0,0,0,0.55);
          backdrop-filter: blur(16px);
        }
        .d8-card-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .d8-card-title{ font-weight:900; }
        .d8-card-sub{ font-size:13px; opacity:0.72; margin-top:4px; }
        .d8-chip{ font-size:12px; padding:6px 10px; border-radius:999px; border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06); }

        .d8-list{ margin-top:14px; display:grid; gap:10px; }
        .d8-row{
          display:grid; grid-template-columns:22px 1fr; gap:10px;
          padding:10px 10px; border-radius:16px;
          border:1px solid rgba(255,255,255,0.10);
          background:rgba(255,255,255,0.03);
        }
        .d8-check{
          width:22px; height:22px; border-radius:8px;
          display:inline-flex; align-items:center; justify-content:center;
          background:rgba(0,255,200,0.14);
          border:1px solid rgba(0,255,200,0.20);
          color:rgba(0,255,200,0.95);
          font-weight:900;
        }
        .d8-row-t{ font-weight:800; }
        .d8-row-d{ opacity:0.72; font-size:13px; margin-top:2px; }

        .d8-card-foot{ margin-top:16px; border-top:1px solid rgba(255,255,255,0.10); padding-top:14px; }
        .d8-foot-line{ font-size:12px; opacity:0.65; }
        .d8-foot-strong{ opacity:0.95; }
        .d8-foot-line2{ font-size:12px; opacity:0.55; margin-top:4px; }

        /* Sections */
        .d8-section{ margin-top:56px; }
        .d8-section-top{ max-width:820px; }
        .d8-h2{ margin:0; font-size:34px; letter-spacing:-0.6px; }
        .d8-sub{ margin-top:10px; opacity:0.78; line-height:1.65; }

        .d8-fgrid{
          margin-top:18px;
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap:14px;
        }
        .d8-fcard{
          position:relative;
          border-radius:22px;
          padding:18px;
          border:1px solid rgba(255,255,255,0.12);
          background:rgba(10,12,18,0.30);
          box-shadow:0 26px 90px rgba(0,0,0,0.32);
          backdrop-filter: blur(14px);
          transform: translateY(0px);
        }
        .d8-fcard:before{
          content:""; position:absolute; inset:0;
          border-radius:22px;
          background: radial-gradient(600px 240px at 20% 0%, rgba(255,215,0,0.12), transparent 60%);
          opacity:0.9; pointer-events:none;
        }
        .d8-fcard:hover{ transform: translateY(-2px); }
        .d8-icon{
          width:34px; height:34px; border-radius:12px; margin-bottom:10px;
          background:linear-gradient(135deg, rgba(255,215,0,0.18), rgba(0,255,200,0.10));
          border:1px solid rgba(255,255,255,0.10);
        }
        .d8-f-t{ font-weight:900; margin-bottom:6px; }
        .d8-f-d{ opacity:0.78; line-height:1.55; }
        .d8-mini{ display:inline-block; margin-top:10px; text-decoration:none; color:rgba(238,242,255,0.88); opacity:0.88; }
        .d8-mini:hover{ opacity:1; }

        .d8-steps{
          margin-top:18px;
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap:14px;
        }
        .d8-step{
          border-radius:22px; padding:18px;
          border:1px solid rgba(255,255,255,0.12);
          background:rgba(10,12,18,0.30);
          box-shadow:0 24px 80px rgba(0,0,0,0.28);
          display:grid; grid-template-columns:44px 1fr; gap:12px;
          backdrop-filter: blur(14px);
        }
        .d8-step-n{
          width:44px; height:44px; border-radius:16px;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,215,0,0.14);
          border:1px solid rgba(255,215,0,0.22);
          color:rgba(255,215,0,0.96);
          font-weight:950;
        }
        .d8-step-t{ font-weight:950; margin-top:2px; }
        .d8-step-d{ opacity:0.78; line-height:1.55; margin-top:6px; }

        .d8-ctaStrip{
          margin-top:34px;
          border-radius:26px;
          border:1px solid rgba(255,255,255,0.12);
          background:linear-gradient(180deg, rgba(10,12,18,0.40), rgba(10,12,18,0.22));
          box-shadow:0 30px 110px rgba(0,0,0,0.42);
          backdrop-filter: blur(16px);
          overflow:hidden;
          position:relative;
        }
        .d8-ctaStrip:before{
          content:""; position:absolute; inset:-2px;
          background: radial-gradient(500px 220px at 20% 0%, rgba(0,255,200,0.14), transparent 60%),
                      radial-gradient(600px 260px at 80% 20%, rgba(255,215,0,0.14), transparent 60%);
          opacity:0.9;
        }
        .d8-ctaStrip-in{
          position:relative; z-index:2;
          padding:18px;
          display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;
        }
        .d8-ctaStrip-t{ font-weight:950; font-size:18px; }
        .d8-ctaStrip-d{ opacity:0.78; margin-top:6px; }
        .d8-ctaStrip-btn{
          text-decoration:none; font-weight:950; color:#061018;
          padding:12px 16px; border-radius:16px; white-space:nowrap;
          background:linear-gradient(135deg, rgba(255,215,0,0.96), rgba(0,255,200,0.80));
          border:1px solid rgba(255,255,255,0.12);
          box-shadow:0 18px 60px rgba(0,0,0,0.40);
        }

        .d8-footer{ padding:44px 18px 70px 18px; opacity:0.82; }
        .d8-footer-in{
          max-width:1180px; margin:0 auto;
          display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; align-items:center;
        }
        .d8-footer-brand{ font-weight:900; }
        .d8-footer-links{ display:flex; gap:12px; flex-wrap:wrap; }
        .d8-footlink{ text-decoration:none; color:rgba(238,242,255,0.84); font-size:13px; }
        .d8-footlink:hover{ opacity:1; }
        .d8-footer-build{ font-size:12px; opacity:0.65; }

        @media (max-width: 980px){
          .d8-grid{ grid-template-columns: 1fr; }
          .d8-h1{ font-size: 52px; }
          .d8-fgrid{ grid-template-columns: 1fr; }
          .d8-steps{ grid-template-columns: 1fr; }
        }
        @media (max-width: 520px){
          .d8-h1{ font-size: 42px; }
          .d8-brand-sub{ display:none; }
        }
      }</style>
    </main>
  );
}