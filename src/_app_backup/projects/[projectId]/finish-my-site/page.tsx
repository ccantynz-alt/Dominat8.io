// src/app/projects/[projectId]/finish-my-site/page.tsx
import FinishMySiteClient from "./FinishMySiteClient";

export const metadata = {
  title: "Finish My Site",
  description: "Run launch-run and monitor pipeline status.",
};

export default function FinishMySitePage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Finish My Site</h1>
      <p className="mt-2 text-sm opacity-80">
        This triggers <code className="px-1">launch-run</code> and polls{" "}
        <code className="px-1">pipeline</code> for status.
      </p>

      <div className="mt-6">
        <FinishMySiteClient projectId={params.projectId} />
      </div>
    </main>
  );
}
