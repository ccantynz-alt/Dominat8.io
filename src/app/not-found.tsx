import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <style>{`
@keyframes nfFade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes nfPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(1.12)}}
@keyframes nfFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes nfGlow{0%{box-shadow:0 0 30px rgba(0,212,255,.12)}50%{box-shadow:0 0 60px rgba(0,102,255,.15)}100%{box-shadow:0 0 30px rgba(0,212,255,.12)}}

.nf{min-height:100vh;background:#030712;color:#E8F0FF;font-family:'Outfit',system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;position:relative;overflow:hidden;}
.nf-blob{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;}
.nf-blob-1{width:500px;height:400px;background:radial-gradient(ellipse,rgba(0,212,255,.06),transparent 70%);top:-100px;left:-100px;}
.nf-blob-2{width:400px;height:400px;background:radial-gradient(ellipse,rgba(0,102,255,.05),transparent 70%);bottom:-100px;right:-100px;}

.nf-orb{width:140px;height:140px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,.20) 0%,rgba(0,102,255,.08) 60%,transparent 100%);border:1px solid rgba(0,212,255,.15);display:flex;align-items:center;justify-content:center;margin-bottom:36px;position:relative;animation:nfFloat 4s ease-in-out infinite,nfGlow 6s ease-in-out infinite,nfFade 800ms cubic-bezier(.16,1,.3,1) both;}
.nf-orb-ring{position:absolute;inset:-10px;border-radius:50%;border:1px solid rgba(0,212,255,.08);animation:nfPulse 3s ease-in-out infinite;}
.nf-orb-ring2{position:absolute;inset:-22px;border-radius:50%;border:1px solid rgba(0,102,255,.06);animation:nfPulse 3s ease-in-out infinite .5s;}
.nf-404{font-size:48px;font-weight:900;letter-spacing:-.05em;background:linear-gradient(135deg,#00D4FF,#0066FF);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}

.nf h1{font-size:clamp(28px,5vw,44px);font-weight:800;margin:0 0 12px;letter-spacing:-.04em;animation:nfFade 800ms cubic-bezier(.16,1,.3,1) both 150ms;}
.nf-sub{font-size:16px;color:rgba(200,220,255,.45);margin:0 0 10px;line-height:1.65;max-width:420px;animation:nfFade 800ms cubic-bezier(.16,1,.3,1) both 250ms;font-family:'Inter',system-ui,sans-serif;}
.nf-joke{font-size:13px;color:rgba(200,220,255,.22);margin:0 0 36px;font-style:italic;animation:nfFade 800ms cubic-bezier(.16,1,.3,1) both 350ms;font-family:'Inter',system-ui,sans-serif;}

.nf-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;animation:nfFade 800ms cubic-bezier(.16,1,.3,1) both 400ms;}
.nf-btn-primary{display:inline-flex;align-items:center;gap:6px;padding:14px 28px;border-radius:14px;background:linear-gradient(135deg,#00D4FF,#0066FF);border:none;color:#030712;text-decoration:none;font-size:15px;font-weight:700;transition:all 200ms;position:relative;overflow:hidden;}
.nf-btn-primary::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);animation:nfShim 4s ease-in-out infinite;}
@keyframes nfShim{0%{left:-100%}40%{left:100%}100%{left:100%}}
.nf-btn-primary:hover{transform:translateY(-2px);box-shadow:0 4px 24px rgba(0,212,255,.25);}
.nf-btn-secondary{display:inline-flex;align-items:center;gap:6px;padding:14px 28px;border-radius:14px;border:1px solid rgba(100,180,255,.10);background:rgba(100,180,255,.03);color:rgba(200,220,255,.60);text-decoration:none;font-size:15px;font-weight:600;transition:all 180ms;}
.nf-btn-secondary:hover{background:rgba(100,180,255,.07);border-color:rgba(100,180,255,.18);color:#E8F0FF;}

.nf-links{margin-top:56px;display:flex;gap:24px;animation:nfFade 800ms cubic-bezier(.16,1,.3,1) both 500ms;}
.nf-links a{color:rgba(200,220,255,.25);text-decoration:none;font-size:13px;transition:color 150ms;font-family:'Inter',system-ui,sans-serif;}
.nf-links a:hover{color:rgba(200,220,255,.60);}
      `}</style>

      <main className="nf">
        <div className="nf-blob nf-blob-1" />
        <div className="nf-blob nf-blob-2" />

        <div className="nf-orb">
          <div className="nf-orb-ring" />
          <div className="nf-orb-ring2" />
          <span className="nf-404">404</span>
        </div>

        <h1>Lost in the loop.</h1>
        <p className="nf-sub">
          The page you&apos;re looking for doesn&apos;t exist — but your future website does. It&apos;s just one prompt away.
        </p>
        <p className="nf-joke">Even our self-heal agent couldn&apos;t find this one.</p>

        <div className="nf-btns">
          <Link href="/build" className="nf-btn-primary">Start building &rarr;</Link>
          <Link href="/gallery" className="nf-btn-secondary">Browse gallery</Link>
        </div>

        <div className="nf-links">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/templates">Templates</Link>
          <Link href="/about">About</Link>
        </div>
      </main>
    </>
  );
}
