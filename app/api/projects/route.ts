import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const keys = await kv.keys("project:*");

    const projects = await Promise.all(
      keys.map(async (key) => {
        const project = await kv.get<any>(key);
        if (!project) return null;

        return {
          id: project.id,
          name: project.name,
          createdAt: project.createdAt,
          published: project.published === true,
          domain: project.domain ?? null,
          domainStatus: project.domainStatus ?? null,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      projects: projects.filter(Boolean),
    });
  } catch (err) {
    console.error("Projects list error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load projects" },
      { status: 500 }
    );
  }
}
