export async function createRun(
  userId: string,
  projectId: string,
  input: { prompt?: string; status?: string } = {}
): Promise<Run> {
  const runId = `run_${cryptoRandomId()}`;

  const run: Run = {
    id: runId,
    projectId,
    status: input.status || "queued",
    prompt: input.prompt,
    createdAt: kvNowISO(),
  };

  await kvJsonSet(runKey(userId, runId), run);
  await kv.sadd(runsIndexKey(userId, projectId), runId);

  // -----------------------------
  // Demo runner: queued -> running -> complete
  // -----------------------------
  setTimeout(async () => {
    try {
      const running: Run = { ...run, status: "running" };
      await kvJsonSet(runKey(userId, runId), running);

      setTimeout(async () => {
        try {
          const complete: Run = {
            ...running,
            status: "complete",
            files: [
              {
                path: "app/page.tsx",
                content:
                  "export default function Home(){return(<main style={{padding:40,fontFamily:'system-ui'}}><h1>Generated Landing Page</h1><p>This is demo generated content.</p></main>)}",
              },
            ],
          };
          await kvJsonSet(runKey(userId, runId), complete);
        } catch {}
      }, 1500);
    } catch {}
  }, 500);

  return run;
}
