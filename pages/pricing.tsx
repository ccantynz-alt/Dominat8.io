import Head from "next/head";
import { Container } from "../components/Container";
import { ButtonLink } from "../components/Button";

export default function PricingPage() {
  const title = "Pricing — The last website you’ll ever need to build";
  const description =
    "Try it free for 7 days. Simple plans that scale from personal projects to businesses.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>

      <Container>
        <section className="section">
          <h1 className="h1">Pricing</h1>
          <p className="p">
            Try it free for 7 days. Upgrade when you’re ready. No lock-in.
          </p>

          <div className="pricing">
            <div className="priceCard">
              <div className="priceCard__name">Starter</div>
              <div className="priceCard__price">$19</div>
              <div className="priceCard__desc">
                Personal projects and quick launches.
              </div>
              <ul className="list">
                <li>1 site</li>
                <li>Core templates + pages</li>
                <li>Basic SEO structure</li>
              </ul>
              <ButtonLink href="/dashboard">Start free trial</ButtonLink>
            </div>

            <div className="priceCard priceCard--featured">
              <div className="priceCard__name">Pro</div>
              <div className="priceCard__price">$49</div>
              <div className="priceCard__desc">
                For professionals who ship regularly.
              </div>
              <ul className="list">
                <li>Multiple sites</li>
                <li>Advanced components</li>
                <li>Priority updates</li>
              </ul>
              <ButtonLink href="/dashboard">Start free trial</ButtonLink>
            </div>

            <div className="priceCard">
              <div className="priceCard__name">Business</div>
              <div className="priceCard__price">Custom</div>
              <div className="priceCard__desc">
                Teams, agencies, and serious scale.
              </div>
              <ul className="list">
                <li>Team workspaces</li>
                <li>Custom onboarding</li>
                <li>Billing + permissions</li>
              </ul>
              <ButtonLink href="/settings">Talk to us</ButtonLink>
            </div>
          </div>

          <div className="note" style={{ marginTop: "1.5rem" }}>
            <strong>Simple promise:</strong> you won’t rebuild your site later.
            <div className="note__sub">
              Cancel anytime · Keep your momentum
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
