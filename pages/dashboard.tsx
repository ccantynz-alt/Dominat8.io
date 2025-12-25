import Head from "next/head";
import Link from "next/link";
import { Container } from "../components/Container";

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard — Placeholder</title>
        <meta
          name="description"
          content="Your website builder dashboard. Start building without rebuilding."
        />
      </Head>

      <Container>
        <section className="section">
          <h1 className="h1">Dashboard</h1>
          <p className="p">
            This is the foundation. Next we add auth and your first “Create site”
            flow.
          </p>

          <div className="dashGrid">
            <div className="card">
              <div className="card__title">Quick start</div>
              <div className="card__text">
                Start from a foundation and customise without breaking anything.
              </div>
            </div>

            <div className="card">
              <div className="card__title">Next step</div>
              <div className="card__text">
                Go to{" "}
                <Link className="link" href="/settings">
                  Settings
                </Link>{" "}
                to set up your workspace.
              </div>
            </div>

            <div className="card">
              <div className="card__title">Proof it’s live</div>
              <div className="card__text">
                Timestamp: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
