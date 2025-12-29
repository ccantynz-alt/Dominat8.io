import { NextResponse } from "next/server";
import { createProject } from "@/app/lib/store";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const name = url.searchParams.get("name") || "Test";

    const project = await createProject({ name });

    return NextResponse.json({
      ok: true,
      project,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? String(err),
        stack: err?.stack ?? null,
      },
      { status: 500 }
    );
  }
}

