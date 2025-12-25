import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { Container } from "../components/Container";
import { isAuthedFromReq } from "../lib/auth";

export default function DashboardPage() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <>
      <Head>
        <title>Dashboard — Placeholder</title>
        <meta name="description" content="Your dashboard." />
      </Head>

      <Container>
        <section className="section">
          <h1 className="h1">Dashboard</h1>
          <p className="p">
            You’re logged in (prototype). Next: the Builder flow.
          </p>

          <div className="dashGrid">
            <div className="card">
              <div className="card__title">Start building</div>
              <div className="card__text">
                Go to <Link className="link" href="/builder">/builder</Link> to create your first site.
              </div>
            </div>

            <div className="card">
              <div className="card__title">Settings</div>
              <div className="card__text">
                Configure workspace in <Link className="link" href="/settings">Settings</Link>.
              </div>
            </div>

            <div className="card">
              <div className="card__title">Session</div>
              <div className="card__text">Protected by a server-side cookie check.</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn" onClick={logout}>Log out</button>
          </div>
        </section>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const authed = isAuthedFromReq({ headers: { cookie: req.headers.cookie } });
  if (!authed) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return { props: {} };
};
