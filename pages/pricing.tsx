import Head from "next/head";
import { Container } from "../components/Container";
import { ButtonLink } from "../components/Button";

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing — MySaaS</title>
        <meta
          name="description"
          content="Simple pricing structure for MySaaS."
        />
      </Head>

      <Container>
        <section className="section">
          <h1 className="h1">Pricing</h1>

          <div className="pricing">
            <div className="priceCard">
              <div className="priceCard__name">Starter</div>
              <div className="priceCard__price">$19</div>
              <ButtonLink href="/dashboard">Get Started</ButtonLink>
            </div>

            <div className="priceCard priceCard--featured">
              <div className="priceCard__name">Pro</div>
              <div className="priceCard__price">$49</div>
              <ButtonLink href="/dashboard">Start Pro</ButtonLink>
            </div>

            <div className="priceCard">
              <div className="priceCard__name">Business</div>
              <div className="priceCard__price">Custom</div>
              <ButtonLink href="/settings">Contact</ButtonLink>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
