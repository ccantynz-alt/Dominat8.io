import { Nav } from "@/app/_client/Nav";
import { Footer } from "@/app/_client/Footer";

export const metadata = {
  title: "Privacy Policy — Dominat8.io",
  description: "How Dominat8.io collects, uses, and protects your data.",
};

const SECTION_STYLE = {
  marginBottom: 36 as const,
};

const H2_STYLE = {
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: "-0.02em" as const,
  margin: "0 0 12px",
  color: "rgba(255,255,255,0.90)",
};

const P_STYLE = {
  fontSize: 15,
  lineHeight: 1.75,
  color: "rgba(255,255,255,0.55)",
  margin: "0 0 12px",
};

const UL_STYLE = {
  paddingLeft: 20,
  margin: "0 0 12px",
  color: "rgba(255,255,255,0.55)",
  fontSize: 15,
  lineHeight: 1.75,
};

export default function PrivacyPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#08080c",
      color: "#c8c8d4",
      fontFamily: "ui-sans-serif,system-ui,-apple-system,sans-serif",
      padding: 0,
    }}>
      <Nav />

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 999, border: "1px solid rgba(124,90,255,0.25)", background: "rgba(124,90,255,0.06)", color: "rgba(124,90,255,0.85)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 20 }}>
            PRIVACY POLICY
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, margin: "0 0 14px", letterSpacing: "-0.04em" }}>Your privacy matters.</h1>
          <p style={{ ...P_STYLE, fontSize: 16 }}>Last updated: February 2026. This policy explains how Dominat8.io ("we", "us", "our") collects, uses, and protects information when you use our service.</p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>1. Information we collect</h2>
          <p style={P_STYLE}>We collect the minimum information necessary to provide our service:</p>
          <ul style={UL_STYLE}>
            <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>Prompts you enter</strong> — the text you type to describe the website you want to build. These are sent to OpenAI to generate your site.</li>
            <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>Generated HTML</strong> — when you use the Share feature, your site HTML is stored on our servers for up to 90 days.</li>
            <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>Usage data</strong> — standard server logs including IP address, browser type, and pages visited. Used for security and performance monitoring only.</li>
            <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>Account information</strong> — if you create an account: email address and subscription status.</li>
          </ul>
          <p style={P_STYLE}>We do <strong style={{ color: "rgba(255,255,255,0.80)" }}>not</strong> collect payment card data (handled by Stripe), sell your data to third parties, or use your prompts to train AI models.</p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>2. How we use your information</h2>
          <ul style={UL_STYLE}>
            <li>To generate websites from your prompts via OpenAI's API</li>
            <li>To store and serve shared sites you publish via the Share feature</li>
            <li>To send transactional emails (e.g. subscription receipts)</li>
            <li>To detect and prevent abuse</li>
            <li>To improve the reliability and performance of our service</li>
          </ul>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>3. Third-party services</h2>
          <p style={P_STYLE}>We use the following third-party services, each with their own privacy policy:</p>
          <ul style={UL_STYLE}>
            <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>OpenAI</strong> — processes your prompts to generate website HTML. Subject to <a href="https://openai.com/privacy" style={{ color: "rgba(124,90,255,0.75)", textDecoration: "none" }}>OpenAI's Privacy Policy</a>.</li>
            <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>Vercel</strong> — hosts our application and stores shared site files.</li>
            <li><strong style={{ color: "rgba(255,255,255,0.80)" }}>Stripe</strong> — processes payments for Pro and Business subscriptions.</li>
          </ul>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>4. Data retention</h2>
          <p style={P_STYLE}>Shared sites are automatically deleted after <strong style={{ color: "rgba(255,255,255,0.80)" }}>90 days</strong>. Account data is retained while your account is active and for 30 days after deletion. You can request deletion at any time by emailing <a href="mailto:privacy@dominat8.io" style={{ color: "rgba(124,90,255,0.75)", textDecoration: "none" }}>privacy@dominat8.io</a>.</p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>5. Cookies</h2>
          <p style={P_STYLE}>We use only essential cookies required for authentication and session management. We do not use advertising or tracking cookies.</p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>6. Your rights</h2>
          <p style={P_STYLE}>Depending on your location, you may have rights under GDPR, CCPA, or other privacy laws. These include the right to access, correct, or delete your personal data. To exercise these rights, contact <a href="mailto:privacy@dominat8.io" style={{ color: "rgba(124,90,255,0.75)", textDecoration: "none" }}>privacy@dominat8.io</a>.</p>
        </div>

        <div style={SECTION_STYLE}>
          <h2 style={H2_STYLE}>7. Changes to this policy</h2>
          <p style={P_STYLE}>We may update this policy occasionally. We'll notify you of material changes by email or by prominently displaying a notice on our site. Continued use of Dominat8.io after changes take effect constitutes acceptance.</p>
        </div>

        <div style={{ padding: "24px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", marginTop: 24 }}>
          <p style={{ ...P_STYLE, margin: 0 }}>Questions about this policy? Email us at <a href="mailto:privacy@dominat8.io" style={{ color: "rgba(124,90,255,0.75)", textDecoration: "none", fontWeight: 600 }}>privacy@dominat8.io</a></p>
        </div>
      </div>

      <div style={{ height: 80 }} />
      <Footer />
    </main>
  );
}
