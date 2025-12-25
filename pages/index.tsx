import Head from "next/head";
import Link from "next/link";
import { Container } from "../components/Container";
import { ButtonLink } from "../components/Button";

export default function HomePage() {
  const title = "The last website you’ll ever need to build";
  const description =
    "Build, launch, and grow professional websites without rebuilding or starting over. One foundation that scales.";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>

      <Container>
        {/* HERO */}
        <section className="hero">
          <h1 className="hero__title">
            The last website you’ll ever need to build.
          </h1>

          <p className="hero__subtitle">
            Build, launch, and grow professional websites without rebuilding,
            rewiring, or starting over. One foundation that scales with you.
          </p>

          <div className="hero__cta">
            <ButtonLink href="/dashboard">
              Start your 7-day free trial
            </ButtonLink>
            <Link href="/pricing" className="link">
              See how it works →
            </Link>
          </div>

          <p className="hero__trust">
            No credit card required · Cancel anytime
          </p>
        </section>

        {/* CONFIDENCE STRIP */}
        <section className="confidence">
          <div>Built for real projects</div>
          <div>Designed to scale</div>
          <div>Personal & business ready</div>
          <div>SEO built in</div>
        </section>

        {/* PROBLEM */}
        <section className="section">
          <h2 className="h2">
            Most website builders don’t scale. They just make you rebuild later.
          </h2>
          <p className="p">
            You start simple. Then your site grows — and everything breaks.
            Structure doesn’t scale. SEO becomes an afterthought. “Version two”
            turns into a full rebuild.
          </p>
          <p className="p">That’s friction. Not progress.</p>
        </section>

        {/* SOLUTION */}
        <section className="section">
          <h2 className="h2">One platform. One structure. No rebuilds.</h2>

          <div className="grid">
            <div className="card">
              <h3>Designed to evolve</h3>
              <p>Your site grows without redesigning everything.</p>
            </div>
            <div className="card">
              <h3>Built-in structure</h3>
              <p>Layouts, pages, and SEO handled properly from day one.</p>
            </div>
            <div className="card">
              <h3>Personal or business</h3>
              <p>Start small. Scale up. Same foundation.</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section">
          <h2 className="h2">How it works</h2>

          <ol className="steps">
            <li>
              <strong>Start with a foundation</strong>
              <span>Professional structure out of the box.</span>
            </li>
            <li>
              <strong>Build and customise</strong>
              <span>Add pages and features without breaking anything.</span>
            </li>
            <li>
              <strong>Scale without rebuilding</strong>
              <span>Your site evolves instead of being replaced.</span>
            </li>
          </ol>
        </section>

        {/* USE CASES */}
        <section className="section">
          <h2 className="h2">Built for how people actually use websites</h2>

          <div className="grid">
            <div className="card">
              <h3>Personal</h3>
              <ul>
                <li>Personal brands</li>
                <li>Portfolios</li>
                <li>Side projects</li>
                <li>Life admin hubs</li>
              </ul>
            </div>

            <div className="card">
              <h3>Business</h3>
              <ul>
                <li>SaaS websites</li>
                <li>Company sites</li>
                <li>Client projects</li>
                <li>Internal tools</li>
              </ul>
            </div>
          </div>
        </section>

        {/* STICKINESS */}
        <section className="section">
          <h2 className="h2">
            Once you build this way, going back feels impossible.
          </h2>
          <p className="p">
            Changes don’t break things. Structure doesn’t fight you. Progress
            feels continuous.
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="cta">
          <h2>Start building the last website you’ll ever need.</h2>
          <ButtonLink href="/dashboard">
            Start your 7-day free trial
          </ButtonLink>
          <p className="cta__sub">
            No credit card · No lock-in · No rebuilding later
          </p>
        </section>
      </Container>
    </>
  );
}
