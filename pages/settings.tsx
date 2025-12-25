import Head from "next/head";
import { Container } from "../components/Container";

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings — MySaaS</title>
      </Head>

      <Container>
        <section className="section">
          <h1 className="h1">Settings</h1>
          <p className="p">Account and application settings.</p>
        </section>
      </Container>
    </>
  );
}
