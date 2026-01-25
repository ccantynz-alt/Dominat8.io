export const dynamic = "force-dynamic";

export default function HomePage() {
  const BUILD_ID = "BUILD_ID_20260125_160848";
  const BUILD_ISO = "2026-01-25T03:08:48.8881848Z";

  return (
    <main className="d8-root" data-build-id={BUILD_ID} data-build-iso={BUILD_ISO}>
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
            <a className="d8-cta" href="/templates">Launch -></a>
          </nav>
        </div>
      </header>

      <section className="d8-hero">
        <div className="d8-bg" aria-hidden="true"></div>
        <div className="d8-rain" aria-hidden="true"></div>

        <div className="d8-wrap">
          <div className="d8-badge">
            <span className="d8-dot" aria-hidden="true"></span>
            <span>Premium results without premium effort</span>
            <span className="d8-sep">•</span>
            <span className="d8-build">Build: {BUILD_ID}</span>
          </div>

          <div className="d8-grid">
            <div>
              <h1 className="d8-h1">
                The AI that builds<br />
                <span className="d8-grad">a flagship website</span><br />
                you are proud to launch.
              </h1>

              <p className="d8-lead">
                Dominat8 generates your pages, structure, copy, and polish - fast.
                Clean layout. Strong spacing. Premium feel. Ready for your domain.
              </p>

              <div className="d8-ctas">
                <a className="d8-primary" href="/templates">Start from a template -></a>
                <a className="d8-secondary" href="/use-cases">See real outcomes</a>
              </div>

              <div className="d8-pills">
                <span className="d8-pill">Fast build</span>
                <span className="d8-pill">SEO-ready structure</span>
                <span className="d8-pill">Custom domains</span>
                <span className="d8-pill">Publish pipeline</span>
              </div>
            </div>

            <aside className="d8-card">
              <div className="d8-card-top">
                <div>
                  <div className="d8-card-title">Launch-ready checklist</div>
                  <div className="d8-card-sub">The stuff that makes it feel expensive.</div>
                </div>
                <span className="d8-chip">Live</span>
              </div>

              <div className="d8-list">
                {[
                  ["Hero and sections", "Spacing and typography tuned"],
                  ["Pages generated", "Templates, pricing, use-cases"],
                  ["SEO foundations", "Metadata and structure ready"],
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

          <div className="d8-feats">
            {[
              ["Finish-for-me pipeline", "Idea -> pages -> publish. Orchestrated and consistent."],
              ["Premium by default", "Clean rhythm, glass UI, modern gradients, trust signals."],
              ["Built for scale", "Add agents, domain wizard, billing - without redesigning everything."],
            ].map(([t, d]) => (
              <div className="d8-feat" key={t}>
                <div className="d8-feat-t">{t}</div>
                <div className="d8-feat-d">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="d8-footer">
        <div className="d8-footer-in">
          <div className="d8-footer-brand">Dominat8</div>
          <div className="d8-footer-build">Build: {BUILD_ID}</div>
        </div>
      </footer>

      <style>{
        .d8-root{
          min-height:100vh; color:#EAF0FF; overflow-x:hidden;
          background:
            radial-gradient(1400px 800px at 15% -10%, rgba(255,215,0,0.14), transparent 60%),
            radial-gradient(1200px 700px at 85% 0%, rgba(0,255,200,0.11), transparent 55%),
            radial-gradient(900px 500px at 55% 35%, rgba(140,120,255,0.10), transparent 60%),
            linear-gradient(180deg,#05060a 0%,#070913 55%,#05060a 100%);
        }
        .d8-hidden{ position:absolute; left:-9999px; top:-9999px; }
        .d8-header{ position:sticky; top:0; z-index:50; backdrop-filter: blur(14px); }
        .d8-nav{
          max-width:1180px; margin:0 auto; padding:14px 18px;
          display:flex; align-items:center; justify-content:space-between; gap:14px;
          background:rgba(6,7,12,0.55); border-bottom:1px solid rgba(255,255,255,0.08);
        }
        .d8-brand{ display:flex; align-items:center; gap:10px; text-decoration:none; color:#EAF0FF; }
        .d8-logo{
          width:30px; height:30px; border-radius:10px; display:inline-block;
          background:linear-gradient(135deg, rgba(255,215,0,0.92), rgba(0,255,200,0.70));
          box-shadow:0 10px 30px rgba(0,0,0,0.55);
        }
        .d8-brand-name{ font-weight:800; letter-spacing:0.2px; }
        .d8-brand-sub{ opacity:0.65; font-size:12px; }
        .d8-links{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .d8-link{
          color:rgba(234,240,255,0.85); text-decoration:none; font-size:13px;
          padding:8px 10px; border-radius:10px;
        }
        .d8-link:hover{ background:rgba(255,255,255,0.06); }
        .d8-cta{
          text-decoration:none; font-weight:800; color:#061018;
          padding:10px 14px; border-radius:14px; white-space:nowrap;
          background:linear-gradient(135deg, rgba(255,215,0,0.95), rgba(0,255,200,0.78));
          border:1px solid rgba(255,255,255,0.10);
          box-shadow:0 16px 40px rgba(0,0,0,0.45);
        }
        .d8-hero{ position:relative; padding:82px 18px 36px 18px; }
        .d8-bg{
          position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(900px 520px at 50% 25%, rgba(255,255,255,0.06), transparent 60%),
            radial-gradient(1000px 650px at 50% 110%, rgba(0,0,0,0.72), rgba(0,0,0,0.92));
        }
        .d8-rain{
          position:absolute; inset:-30% 0 -30% 0; pointer-events:none; opacity:0.95;
          background-image:
            repeating-linear-gradient(90deg, rgba(255,215,0,0.00) 0px, rgba(255,215,0,0.00) 10px, rgba(255,215,0,0.12) 11px, rgba(255,215,0,0.00) 12px),
            repeating-linear-gradient(180deg, rgba(0,255,200,0.00) 0px, rgba(0,255,200,0.00) 16px, rgba(0,255,200,0.07) 17px, rgba(0,255,200,0.00) 18px);
          -webkit-mask-image: radial-gradient(640px 400px at 50% 22%, #000 22%, transparent 72%);
          mask-image: radial-gradient(640px 400px at 50% 22%, #000 22%, transparent 72%);
          animation:d8_drift 7s linear infinite;
        }
        @keyframes d8_drift{
          0%{ transform:translateY(-10px); opacity:0.75; }
          50%{ transform:translateY(10px); opacity:0.98; }
          100%{ transform:translateY(-10px); opacity:0.75; }
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
        .d8-dot{ width:10px; height:10px; border-radius:999px; background:rgba(255,215,0,0.92); box-shadow:0 0 22px rgba(255,215,0,0.55); }
        .d8-sep{ opacity:0.55; }
        .d8-build{ opacity:0.75; font-size:12px; }
        .d8-grid{ display:grid; grid-template-columns: 1.18fr 0.82fr; gap:26px; align-items:center; }
        .d8-h1{
          margin:0; font-size:64px; line-height:1.03; letter-spacing:-1.4px;
          text-shadow:0 24px 90px rgba(0,0,0,0.65);
        }
        .d8-grad{
          background:linear-gradient(90deg, rgba(255,215,0,0.95), rgba(0,255,200,0.90), rgba(140,120,255,0.90));
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        .d8-lead{ margin:18px 0 0 0; font-size:18px; line-height:1.65; max-width:720px; opacity:0.86; }
        .d8-ctas{ display:flex; gap:12px; flex-wrap:wrap; margin-top:26px; }
        .d8-primary{
          display:inline-flex; align-items:center; justify-content:center;
          padding:14px 18px; border-radius:16px; min-width:220px;
          font-weight:900; text-decoration:none; color:#061018;
          background:linear-gradient(135deg, rgba(255,215,0,0.95), rgba(0,255,200,0.78));
          border:1px solid rgba(255,255,255,0.10);
          box-shadow:0 18px 60px rgba(0,0,0,0.55);
        }
        .d8-secondary{
          display:inline-flex; align-items:center; justify-content:center;
          padding:14px 18px; border-radius:16px; min-width:190px;
          font-weight:800; text-decoration:none; color:rgba(234,240,255,0.92);
          background:rgba(10,12,18,0.35);
          border:1px solid rgba(255,255,255,0.16);
          box-shadow:0 18px 50px rgba(0,0,0,0.35);
        }
        .d8-primary:hover{ filter:brightness(1.03); transform:translateY(-1px); }
        .d8-secondary:hover{ background:rgba(10,12,18,0.48); transform:translateY(-1px); }
        .d8-pills{ display:flex; gap:14px; flex-wrap:wrap; align-items:center; margin-top:18px; font-size:13px; opacity:0.86; }
        .d8-pill{ padding:8px 10px; border-radius:999px; border:1px solid rgba(255,255,255,0.12); background:rgba(8,10,16,0.35); }
        .d8-card{
          border-radius:22px; padding:18px; overflow:hidden;
          border:1px solid rgba(255,255,255,0.14);
          background:linear-gradient(180deg, rgba(10,12,18,0.55), rgba(10,12,18,0.28));
          box-shadow:0 30px 100px rgba(0,0,0,0.55);
          backdrop-filter: blur(16px);
        }
        .d8-card-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .d8-card-title{ font-weight:800; }
        .d8-card-sub{ font-size:13px; opacity:0.72; margin-top:4px; }
        .d8-chip{
          font-size:12px; padding:6px 10px; border-radius:999px;
          border:1px solid rgba(255,255,255,0.14); background:rgba(255,255,255,0.06);
        }
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
        .d8-row-t{ font-weight:750; }
        .d8-row-d{ opacity:0.72; font-size:13px; margin-top:2px; }
        .d8-card-foot{ margin-top:16px; border-top:1px solid rgba(255,255,255,0.10); padding-top:14px; }
        .d8-foot-line{ font-size:12px; opacity:0.65; }
        .d8-foot-strong{ opacity:0.95; }
        .d8-foot-line2{ font-size:12px; opacity:0.55; margin-top:4px; }
        .d8-feats{ margin-top:34px; display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:14px; }
        .d8-feat{
          border-radius:22px; padding:18px;
          border:1px solid rgba(255,255,255,0.12);
          background:rgba(10,12,18,0.35);
          box-shadow:0 26px 90px rgba(0,0,0,0.35);
          backdrop-filter: blur(14px);
        }
        .d8-feat-t{ font-weight:850; margin-bottom:6px; }
        .d8-feat-d{ opacity:0.78; line-height:1.55; }
        .d8-footer{ padding:44px 18px 70px 18px; opacity:0.78; }
        .d8-footer-in{
          max-width:1180px; margin:0 auto; display:flex;
          justify-content:space-between; gap:14px; flex-wrap:wrap;
        }
        .d8-footer-brand{ font-weight:800; }
        .d8-footer-build{ font-size:12px; opacity:0.65; }
        @media (max-width: 980px){
          .d8-grid{ grid-template-columns: 1fr; }
          .d8-h1{ font-size: 52px; }
        }
        @media (max-width: 520px){
          .d8-h1{ font-size: 42px; }
          .d8-brand-sub{ display:none; }
        }
      }</style>
    </main>
  );
}