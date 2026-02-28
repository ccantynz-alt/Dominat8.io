import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

export const metadata = {
  title: "Privacy Policy — Dominat8.io",
  description: "How Dominat8.io collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <style>{`
@keyframes lgFade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.lg-a{animation:lgFade 700ms cubic-bezier(.16,1,.3,1) both}
.lg-d1{animation-delay:80ms}
.lg-page{min-height:100vh;background:#08070B;color:#F5F0EB;font-family:'Outfit',system-ui,sans-serif;}
.lg-wrap{max-width:720px;margin:0 auto;padding:120px 24px 80px;}
.lg-badge{display:inline-block;padding:5px 16px;border-radius:999px;border:1px solid rgba(240,179,90,.25);background:rgba(240,179,90,.06);color:rgba(240,179,90,.85);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;}
.lg-h1{font-size:clamp(28px,4.5vw,42px);font-weight:800;margin:0 0 14px;letter-spacing:-.04em;color:#F5F0EB;}
.lg-updated{font-size:16px;color:rgba(245,240,235,0.55);line-height:1.7;margin:0 0 48px;}
.lg-section{margin-bottom:40px;}
.lg-h2{font-size:18px;font-weight:700;letter-spacing:-.02em;margin:0 0 14px;color:rgba(245,240,235,0.88);}
.lg-p{font-size:15px;line-height:1.80;color:rgba(245,240,235,0.55);margin:0 0 14px;}
.lg-p:last-child{margin:0;}
.lg-p strong{color:rgba(245,240,235,0.78);}
.lg-p a{color:rgba(240,179,90,.75);text-decoration:none;transition:color 150ms;}
.lg-p a:hover{color:rgba(240,179,90,.95);}
.lg-ul{padding-left:20px;margin:0 0 14px;color:rgba(245,240,235,0.55);font-size:15px;line-height:1.80;}
.lg-ul strong{color:rgba(245,240,235,0.78);}
.lg-ul a{color:rgba(240,179,90,.75);text-decoration:none;}
.lg-contact{padding:24px;border-radius:18px;border:1px solid rgba(245,240,235,0.08);background:rgba(245,240,235,0.035);margin-top:32px;}
      `}</style>
      <main className="lg-page">
        <SiteNav />
        <div className="lg-wrap">
          <div className="lg-a">
            <div className="lg-badge">PRIVACY POLICY</div>
            <h1 className="lg-h1">Your privacy matters.</h1>
            <p className="lg-updated">Last updated: February 2026. This policy explains how Dominat8.io (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, and protects information when you use our service.</p>
          </div>
          <div className="lg-a lg-d1">
            <div className="lg-section">
              <h2 className="lg-h2">1. Information we collect</h2>
              <p className="lg-p">We collect the minimum information necessary to provide our service:</p>
              <ul className="lg-ul">
                <li><strong>Prompts you enter</strong> — the text you type to describe the website you want to build. These are sent to OpenAI to generate your site.</li>
                <li><strong>Generated HTML</strong> — when you use the Share feature, your site HTML is stored on our servers for up to 90 days.</li>
                <li><strong>Usage data</strong> — standard server logs including IP address, browser type, and pages visited.</li>
                <li><strong>Account information</strong> — if you create an account: email address and subscription status.</li>
              </ul>
              <p className="lg-p">We do <strong>not</strong> collect payment card data (handled by Stripe), sell your data to third parties, or use your prompts to train AI models.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">2. How we use your information</h2>
              <ul className="lg-ul">
                <li>To generate websites from your prompts via OpenAI&apos;s API</li>
                <li>To store and serve shared sites you publish</li>
                <li>To send transactional emails (e.g. subscription receipts)</li>
                <li>To detect and prevent abuse</li>
                <li>To improve the reliability and performance of our service</li>
              </ul>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">3. Third-party services</h2>
              <p className="lg-p">We use the following third-party services:</p>
              <ul className="lg-ul">
                <li><strong>OpenAI</strong> — processes your prompts. Subject to <a href="https://openai.com/privacy">OpenAI&apos;s Privacy Policy</a>.</li>
                <li><strong>Vercel</strong> — hosts our application and stores shared site files.</li>
                <li><strong>Stripe</strong> — processes payments for paid subscriptions.</li>
              </ul>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">4. Data retention</h2>
              <p className="lg-p">Shared sites are automatically deleted after <strong>90 days</strong>. Account data is retained while your account is active and for 30 days after deletion. Request deletion anytime at <a href="mailto:privacy@dominat8.io">privacy@dominat8.io</a>.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">5. Cookies</h2>
              <p className="lg-p">We use only essential cookies required for authentication and session management. No advertising or tracking cookies.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">6. Your rights</h2>
              <p className="lg-p">Depending on your location, you may have rights under GDPR, CCPA, or other privacy laws including the right to access, correct, or delete your personal data. Contact <a href="mailto:privacy@dominat8.io">privacy@dominat8.io</a>.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">7. Changes to this policy</h2>
              <p className="lg-p">We may update this policy occasionally. Material changes will be communicated by email. Continued use constitutes acceptance.</p>
            </div>
            <div className="lg-contact">
              <p className="lg-p">Questions? Email <a href="mailto:privacy@dominat8.io"><strong>privacy@dominat8.io</strong></a></p>
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}
