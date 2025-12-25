import Head from "next/head";
import Link from "next/link";
import { Container } from "../components/Container";
import { ButtonLink } from "../components/Button";

export default function HomePage() {
  const title = "MySaaS — Simple, fast, professional SaaS foundation";
  const description =
    "A clean Next.js Pages Router foundation with layout, navigation, SEO defaults, and an app shell.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>

      <Container>
        <section className="hero">
          <div className="hero__badge">
            SaaS Foundation • Pages Router • Production-ready
          </div>

          <h1 className="hero__title">
            Build a clean, scalable SaaS
            <span className="hero__titleAccent"> without chaos</span>.
          </h1>

          <p className="hero__subtitle">
            A professional starting point with structure, navigation, and SEO
            defaults. Designed so your agent can safely build inside the rails.
          </p>

          <div className="hero__cta">
            <ButtonLink href="/dashboard">Open Dashboard</ButtonLink>
            <Link className="link" href="/pricing">
              View Pricing →
            </Link>
          </div>

          <div className="hero__grid">
            <div className="card">
              <div className="card__title">Structure</div>
              <div className="card__text">
                Clean layout, components, and routing.
              </div>
            </div>
            <div className="card">
              <div className="card__title">SEO Defaults</div>
              <div className="card__text">
                Correct titles, meta tags, and structure.
              </div>
            </div>
            <div className="card">
              <div className="card__title">Agent-safe</div>
              <div className="card__text">
                Clear boundaries prevent rogue changes.
              </div>
            </div>
          </div>

          <div className="note">
            <strong>Sanity check:</strong> If you see this in production,
            deployments are working.
            <div className="note__sub">
              Timestamp: {new Date().toLocaleString()}
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
