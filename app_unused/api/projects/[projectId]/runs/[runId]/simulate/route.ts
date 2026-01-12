import { NextResponse } from "next/server";
import { storeGet, storeSet } from "../../../../../../lib/store";

export const runtime = "nodejs";

type Run = {
  id: string;
  projectId: string;
  prompt: string;
  status: "queued" | "running" | "complete" | "failed";
  createdAt: string;
  updatedAt?: string;
  output?: {
    summary?: string;
    files?: { path: string; content: string }[];
  };
};

const RUN_KEY = (id: string) => `run:${id}`;

function nowISO() {
  return new Date().toISOString();
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string; runId: string } }
) {
  const { runId, projectId } = params;

  const run = await storeGet<Run>(RUN_KEY(runId));
  if (!run) {
    return NextResponse.json({ ok: false, error: "Run not found" }, { status: 404 });
  }
  if (run.projectId !== projectId) {
    return NextResponse.json({ ok: false, error: "Run/project mismatch" }, { status: 400 });
  }

  // Step 1: running
  const running: Run = { ...run, status: "running", updatedAt: nowISO() };
  await storeSet(RUN_KEY(runId), running);

  // Step 2: complete with fake output
  const completed: Run = {
    ...running,
    status: "complete",
    updatedAt: nowISO(),
    output: {
      summary:
        "Generated a clean landing page with hero, features, pricing, FAQ, and contact section.",
      files: [
        {
          path: "app/generated/page.tsx",
          content:
            `export default function GeneratedPage(){\n` +
            `  return (\n` +
            `    <main style={{padding:24,fontFamily:"system-ui"}}>\n` +
            `      <h1 style={{fontSize:40,marginBottom:8}}>Your new landing page</h1>\n` +
            `      <p style={{opacity:.8,marginBottom:16}}>Built from prompt: ${JSON.stringify(
              run.prompt
            )}</p>\n` +
            `      <section style={{marginTop:24}}>\n` +
            `        <h2>Pricing</h2>\n` +
            `        <ul>\n` +
            `          <li>Starter — $29/mo</li>\n` +
            `          <li>Pro — $99/mo</li>\n` +
            `          <li>Enterprise — Let’s talk</li>\n` +
            `        </ul>\n` +
            `      </section>\n` +
            `      <section style={{marginTop:24}}>\n` +
            `        <h2>FAQ</h2>\n` +
            `        <p><b>How fast?</b> In minutes.</p>\n` +
            `        <p><b>Can I edit?</b> Yes, everything is code.</p>\n` +
            `      </section>\n` +
            `    </main>\n` +
            `  );\n` +
            `}\n`,
        },
        {
          path: "README.generated.md",
          content:
            `# Generated Output\n\n` +
            `This is a simulated agent run.\n\n` +
            `## Prompt\n\n${run.prompt}\n`,
        },
      ],
    },
  };

  await storeSet(RUN_KEY(runId), completed);

  return NextResponse.json({ ok: true, run: completed });
}
