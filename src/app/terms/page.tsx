import { SiteNav } from "@/components/shared/SiteNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

export const metadata = {
  title: "Terms of Service — Dominat8.io",
  description: "The terms and conditions governing your use of Dominat8.io.",
};

export default function TermsPage() {
  return (
    <>
      <style>{`
@keyframes lgFade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.lg-a{animation:lgFade 700ms cubic-bezier(.16,1,.3,1) both}
.lg-d1{animation-delay:80ms}
.lg-page{min-height:100vh;background:#060810;color:#e9eef7;font-family:'Outfit',system-ui,sans-serif;}
.lg-wrap{max-width:720px;margin:0 auto;padding:120px 24px 80px;}
.lg-badge{display:inline-block;padding:5px 16px;border-radius:999px;border:1px solid rgba(61,240,255,.20);background:rgba(61,240,255,.05);color:rgba(61,240,255,.80);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;}
.lg-h1{font-size:clamp(28px,4.5vw,42px);font-weight:800;margin:0 0 14px;letter-spacing:-.04em;}
.lg-updated{font-size:16px;color:rgba(255,255,255,.45);line-height:1.7;margin:0 0 48px;}
.lg-section{margin-bottom:40px;}
.lg-h2{font-size:18px;font-weight:700;letter-spacing:-.02em;margin:0 0 14px;color:rgba(255,255,255,.88);}
.lg-p{font-size:15px;line-height:1.80;color:rgba(255,255,255,.52);margin:0 0 14px;}
.lg-p:last-child{margin:0;}
.lg-p strong{color:rgba(255,255,255,.78);}
.lg-p a{color:rgba(61,240,255,.70);text-decoration:none;transition:color 150ms;}
.lg-p a:hover{color:rgba(61,240,255,.90);}
.lg-ul{padding-left:20px;margin:0 0 14px;color:rgba(255,255,255,.52);font-size:15px;line-height:1.80;}
.lg-ul strong{color:rgba(255,255,255,.78);}
.lg-contact{padding:24px;border-radius:18px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-top:32px;}
      `}</style>
      <main className="lg-page">
        <SiteNav />
        <div className="lg-wrap">
          <div className="lg-a">
            <div className="lg-badge">TERMS OF SERVICE</div>
            <h1 className="lg-h1">Terms of Service</h1>
            <p className="lg-updated">Last updated: February 2026. By using Dominat8.io, you agree to these terms.</p>
          </div>
          <div className="lg-a lg-d1">
            <div className="lg-section">
              <h2 className="lg-h2">1. Acceptance of terms</h2>
              <p className="lg-p">By accessing or using Dominat8.io (&ldquo;Service&rdquo;), you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Service.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">2. The Service</h2>
              <p className="lg-p">Dominat8.io is an AI-powered website generation tool. You provide a text prompt and our system generates HTML code. The generated output is provided &ldquo;as-is&rdquo; and we make no guarantees about its fitness for any particular purpose.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">3. Your content and prompts</h2>
              <p className="lg-p">You retain ownership of your prompts and generated websites. You grant us a limited licence to process your prompts to provide the Service.</p>
              <p className="lg-p">You <strong>must not</strong> use the Service to generate:</p>
              <ul className="lg-ul">
                <li>Content that is illegal, defamatory, or violates any law</li>
                <li>Phishing pages, scam sites, or deceptive content</li>
                <li>Content that infringes intellectual property rights</li>
                <li>Malware, spam, or harmful content</li>
                <li>Adult content or content harmful to minors</li>
              </ul>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">4. Acceptable use</h2>
              <p className="lg-p">You agree not to:</p>
              <ul className="lg-ul">
                <li>Attempt to circumvent rate limits or access restrictions</li>
                <li>Use automated tools to send bulk requests to the generation API</li>
                <li>Resell or white-label the Service without a Business plan</li>
                <li>Reverse engineer or attempt to extract the underlying AI models</li>
                <li>Use the Service to damage, disable, or impair our infrastructure</li>
              </ul>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">5. Subscriptions and billing</h2>
              <p className="lg-p">Paid plans are billed monthly or annually. Cancel anytime; your plan remains active until the end of the billing period. Prices are in USD and exclusive of taxes where applicable. We reserve the right to change pricing with 30 days&apos; notice.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">6. Intellectual property</h2>
              <p className="lg-p">The Dominat8.io brand and platform are our intellectual property. Generated HTML is yours — host it, sell it, modify it without restriction, subject to the acceptable use policy above.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">7. Disclaimers and limitation of liability</h2>
              <p className="lg-p">THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND. OUR LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">8. Termination</h2>
              <p className="lg-p">We may suspend or terminate your access if you violate these terms. You may stop using the Service and close your account at any time.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">9. Changes to terms</h2>
              <p className="lg-p">We may update these terms from time to time. Material changes will be communicated by email. Continued use constitutes acceptance.</p>
            </div>
            <div className="lg-section">
              <h2 className="lg-h2">10. Governing law</h2>
              <p className="lg-p">These terms are governed by the laws of New Zealand. Disputes shall be resolved in the courts of Auckland, New Zealand.</p>
            </div>
            <div className="lg-contact">
              <p className="lg-p">Questions? Email <a href="mailto:legal@dominat8.io"><strong>legal@dominat8.io</strong></a></p>
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    </>
  );
}
