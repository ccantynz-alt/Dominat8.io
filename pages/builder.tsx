import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";
import { Container } from "../components/Container";
import { ButtonLink } from "../components/Button";
import { isAuthedFromReq } from "../lib/auth";

type SiteType = "Personal" | "Business";

type SitePlan = {
  id: string;
  name: string;
  type: SiteType;
  goal: string;
  createdAt: string;
  suggestedPages: string[];
};

const LS_KEY = "mysaas_site_plans_v1";

export default function BuilderPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState<SiteType>("Business");
  const [goal, setGoal] = useState("");
  const [savedPlans, setSavedPlans] = useState<SitePlan[]>([]);
  const [created, setCreated] = useState<SitePlan | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? (JSON.parse(raw) as SitePlan[]) : [];
      setSavedPlans(parsed);
    } catch {
      setSavedPlans([]);
    }
  }, []);

  const suggestedPages = useMemo(() => {
    const base = ["Home", "Pricing", "Login", "Signup"];
    const personal = ["About", "Work", "Contact"];
    const business = ["Features", "Use cases", "FAQ", "Contact"];
    return type === "Personal" ? base.concat(personal) : base.concat(business);
  }, [type]);

  function savePlan(plan: SitePlan) {
    const next = [plan, ...savedPlans].slice(0, 20);
    setSavedPlans(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const plan: SitePlan = {
      id: `site_${Math.random().toString(36).slice(2, 10)}`,
      name: trimmed,
      type,
      goal: goal.trim() || "Launch a professional website that converts.",
      createdAt: new Date().toISOString(),
      suggestedPages,
    };

    savePlan(plan);
    setCreated(plan);
    setName("");
    setGoal("");
  }

  return (
    <>
      <Head>
        <title>Builder — Placeholder</title>
        <meta name="description" content="Create your website in minutes." />
      </Head>

      <Container>
        <section className="section">
          <h1 className="h1">Builder</h1>
          <p className="p">
            Create a site plan in seconds. (Prototype: saved locally in your browser.)
          </p>

          <div className="grid" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
            <div className="card">
              <h2 className="h2" style={{ marginBottom: 12 }}>Create a website</h2>

              <form onSubmit={onCreate}>
                <label style={labelStyle}>Website name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Placeholder Marketing Site"
                  style={inputStyle}
                  required
                />

                <div style={{ height: 12 }} />

                <label style={labelStyle}>Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SiteType)}
                  style={inputStyle}
                >
                  <option value="Business">Business</option>
                  <option value="Personal">Personal</option>
                </select>

                <div style={{ height: 12 }} />

                <label style={labelStyle}>Goal (optional)</label>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Convert visitors into trials"
                  style={inputStyle}
                />

                <div style={{ height: 16 }} />

                <button className="btn" type="submit" style={{ width: "100%" }}>
                  Create site plan
                </button>

                <p style={{ marginTop: 10, color: "var(--muted-2)", fontSize: 13 }}>
                  Next: we’ll store this in a database and generate pages automatically.
                </p>
              </form>
            </div>

            <div className="card">
              <h2 className="h2" style={{ marginBottom: 12 }}>Suggested pages</h2>
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                {suggestedPages.map((p) => (
                  <li key={p} style={{ color: "var(--muted)" }}>{p}</li>
                ))}
              </ul>

              <div style={{ height: 16 }} />
              <ButtonLink href="/dashboard">Back to dashboard</ButtonLink>
            </div>
          </div>

          {created && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="h2">Created: {created.name}</h2>
              <p className="p">
                Type: <strong>{created.type}</strong>
                <br />
                Goal: <strong>{created.goal}</strong>
              </p>

              <h3 style={{ marginTop: 12 }}>Next steps</h3>
              <ul>
                <li>We’ll generate these pages automatically.</li>
                <li>We’ll add templates and editing controls.</li>
                <li>We’ll connect “Port” to bring in existing sites.</li>
              </ul>
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <h2 className="h2">Recent site plans</h2>
            {savedPlans.length === 0 ? (
              <p className="p">None yet. Create your first one above.</p>
            ) : (
              <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                {savedPlans.slice(0, 6).map((p) => (
                  <div key={p.id} className="card">
                    <div className="card__title">{p.name}</div>
                    <div className="card__text">
                      {p.type} · {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const authed = isAuthedFromReq({ headers: { cookie: req.headers.cookie } });
  if (!authed) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};

const labelStyle: React.CSSProperties = { display: "block", marginBottom: 8 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.85rem",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.92)",
  outline: "none",
};
