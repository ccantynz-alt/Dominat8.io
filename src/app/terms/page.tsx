import type { CSSProperties } from "react";

export const metadata = {
  title: "Terms of Service — Dominat8.io",
  description: "The terms and conditions governing your use of Dominat8.io.",
};

const P = { fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.55)", margin: "0 0 12px" } as const;
const H2 = { fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" as const, margin: "0 0 12px", color: "rgba(255,255,255,0.90)" };
const UL = { paddingLeft: 20, margin: "0 0 12px", color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.75 } as const;
const STRONG: CSSProperties = { color: "rgba(255,255,255,0.80)" };

export default function TermsPage() {
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
        <a href="/" style={{ padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.60)", textDecoration: "none", fontSize: 13 }}>← Back</a>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 999, border: "1px solid rgba(61,240,255,0.25)", background: "rgba(61,240,255,0.06)", color: "rgba(61,240,255,0.85)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 20 }}>
            TERMS OF SERVICE
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, margin: "0 0 14px", letterSpacing: "-0.04em" }}>Terms of Service</h1>
          <p style={{ ...P, fontSize: 16 }}>Last updated: February 2026. By using Dominat8.io, you agree to these terms. Please read them carefully.</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>1. Acceptance of terms</h2>
          <p style={P}>By accessing or using Dominat8.io ("Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Service. These terms apply to all visitors, users, and others who access the Service.</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>2. The Service</h2>
          <p style={P}>Dominat8.io is an AI-powered website generation tool. You provide a text prompt describing a website, and our system generates HTML code for that website. The generated output is provided "as-is" and we make no guarantees about its fitness for any particular purpose.</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>3. Your content and prompts</h2>
          <p style={P}>You retain ownership of the prompts you enter and the websites generated from them. By using the Service, you grant us a limited licence to process your prompts to provide the Service.</p>
          <p style={P}>You are responsible for ensuring your use of generated content does not infringe third-party rights. You <strong style={STRONG}>must not</strong> use the Service to generate:</p>
          <ul style={UL}>
            <li>Content that is illegal, defamatory, or violates any law</li>
            <li>Phishing pages, scam sites, or deceptive content intended to mislead</li>
            <li>Content that infringes intellectual property rights</li>
            <li>Malware, spam, or otherwise harmful content</li>
            <li>Adult content or content harmful to minors</li>
          </ul>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>4. Acceptable use</h2>
          <p style={P}>You agree not to:</p>
          <ul style={UL}>
            <li>Attempt to circumvent rate limits or access restrictions</li>
            <li>Use automated tools to send bulk requests to the generation API</li>
            <li>Resell or white-label the Service without a Business plan or explicit written agreement</li>
            <li>Reverse engineer or attempt to extract the underlying AI models or prompts</li>
            <li>Use the Service in any way that could damage, disable, or impair our infrastructure</li>
          </ul>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>5. Subscriptions and billing</h2>
          <p style={P}>Paid plans are billed monthly or annually. You may cancel at any time; your plan remains active until the end of the current billing period. We do not offer refunds for partial months. All prices are in USD and exclusive of taxes where applicable.</p>
          <p style={P}>We reserve the right to change pricing with 30 days' notice to existing subscribers.</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>6. Intellectual property</h2>
          <p style={P}>The Dominat8.io brand, logo, and underlying platform are our intellectual property. The HTML generated for you is yours to use freely — you may host it, sell it, or modify it without restriction, subject to the acceptable use policy above.</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>7. Disclaimers and limitation of liability</h2>
          <p style={P}>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT WARRANT THAT GENERATED WEBSITES WILL BE ERROR-FREE, ACCESSIBLE, OR FIT FOR A PARTICULAR PURPOSE.</p>
          <p style={P}>TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>8. Termination</h2>
          <p style={P}>We may suspend or terminate your access to the Service at any time if you violate these terms. You may stop using the Service and close your account at any time.</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>9. Changes to terms</h2>
          <p style={P}>We may update these terms from time to time. We will notify you of material changes by email. Continued use of the Service after the effective date of any changes constitutes acceptance.</p>
        </div>

        <div style={{ marginBottom: 36 }}>
          <h2 style={H2}>10. Governing law</h2>
          <p style={P}>These terms are governed by the laws of New Zealand, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Auckland, New Zealand.</p>
        </div>

        <div style={{ padding: "24px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginTop: 24 }}>
          <p style={{ ...P, margin: 0 }}>Questions? Email us at <a href="mailto:legal@dominat8.io" style={{ color: "rgba(61,240,255,0.75)", textDecoration: "none", fontWeight: 600 }}>legal@dominat8.io</a></p>
        </div>
      </div>
    </main>
  );
}
