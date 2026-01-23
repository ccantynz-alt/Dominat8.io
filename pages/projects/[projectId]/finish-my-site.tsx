// pages/projects/[projectId]/finish-my-site.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import FinishMySiteClient from "../../../components/FinishMySiteClient";

export default function FinishMySitePage() {
  const router = useRouter();
  const projectId = typeof router.query.projectId === "string" ? router.query.projectId : "";

  return (
    <>
      <Head>
        <title>Finish My Site</title>
        <meta
          name="description"
          content="Run launch-run and monitor pipeline status."
        />
      </Head>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Finish My Site</h1>

        <p style={{ marginTop: 8, opacity: 0.8 }}>
          This triggers <code>launch-run</code> and polls <code>pipeline</code>.
        </p>

        <div style={{ marginTop: 24 }}>
          {projectId ? (
            <FinishMySiteClient projectId={projectId} />
          ) : (
            <div style={{ marginTop: 12, opacity: 0.8 }}>Loading project…</div>
          )}
        </div>
      </main>
    </>
  );
}
