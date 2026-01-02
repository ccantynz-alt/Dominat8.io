import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { storeGet, storeSet } from "../../../../lib/store";

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
const RUNS_INDEX_KEY = (projectId: string) => `runs:index:${projectId}`;

function nowISO() {
  return new Date().toISOString();
}

/**
 * We store the runs index as an array in KV to avoid needing Redis set ops
 * (since different KV setups sometimes differ in supported commands).
 */
async function getRunIds(projectId: string): Promise<string[]> {
  const ids = (await storeGet<string[]>(RUNS_INDEX_KEY(projectId))) || [];
  return Array.isArray(ids) ? ids : [];
}

async function setRunIds(projectId: string, ids: string[]) {
  await storeSet(RUNS_INDEX_KEY(projectId), ids);
}

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  const ids = await getRunIds(projectId);
  if (ids.length === 0) return NextResponse.json({ ok: true, runs: [] });

  const runs = await Promise.all(ids.map((id) => storeGet<Run>(RUN_KEY(id))));
  const cleaned = runs.filter(Boolean) as Run[];

  // newest first
  cleaned.sort((a, b) => {
    const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bd - ad;
  });

  return NextResponse.json({ ok: true, runs: cleaned });
}

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "Missing prompt" }, { status: 400 });
  }

  const id = `run_${randomUUID().replace(/-/g, "")}`;

  const run: Run = {
    id,
    projectId,
    prompt,
    status: "queued",
    createdAt: nowISO(),
  };

  // Save run
  await storeSet(RUN_KEY(id), run);

  // Update index (array)
  const ids = await getRunIds(projectId);
  await setRunIds(projectId, [id, ...ids]);

  return NextResponse.json({ ok: true, run });
}
