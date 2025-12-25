import Head from "next/head";
import { Container } from "../components/Container";

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings — Placeholder</title>
        <meta
          name="description"
          content="Account and workspace settings for your website builder."
        />
      </Head>

      <Container>
        <section className="section">
          <h1 className="h1">Settings</h1>
          <p className="p">
            Placeholder settings screen. Next we add workspace + billing + profile.
          </p>

          <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <div className="card">
              <div className="card__title">Workspace</div>
              <div className="card__text">
                Name, brand, domain, and default settings.
              </div>
            </div>

            <div className="card">
              <div className="card__title">Billing</div>
              <div className="card__text">
                Trial status, plan, invoices, and upgrades.
              </div>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
