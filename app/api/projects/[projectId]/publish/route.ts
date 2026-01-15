// src/app/api/projects/[projectId]/publish/route.ts

import { NextResponse } from "next/server";
import { getProjectTemplateId } from "@/app/lib/projectTemplateStore";
import { getProjectContent } from "@/app/lib/projectContentStore";
import { getProjectScaffold } from "@/app/lib/projectScaffoldStore";
import { setPublishedProject, getPublishedProject, clearPublishedProject } from "@/app/lib/projectPublishStore";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    const published = await getPublishedProject(projectId);
    return NextResponse.json({ ok: true, projectId, published });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to read publish state" },
      { status: 500 }
    );
  }
}

export async function POST(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;

    const templateId = await getProjectTemplateId(projectId);

    // Prefer saved content; fallback to scaffold so you can publish immediately
    const saved = await getProjectContent(projectId);
    const scaffold = await getProjectScaffold(projectId);

    const contentToPublish = saved || (scaffold
      ? {
          version: 1 as const,
          updatedAt: new Date().toISOString(),
          templateId: templateId ?? null,
          sections: scaffold.sections,
        }
      : null);

    if (!contentToPublish) {
      return NextResponse.json(
        { ok: false, error: "No content found to publish (save something first)." },
        { status: 400 }
      );
    }

    const published = {
      version: 1 as const,
      publishedAt: new Date().toISOString(),
      projectId,
      templateId: templateId ?? null,
      content: contentToPublish,
    };

    await setPublishedProject(projectId, published);

    return NextResponse.json({
      ok: true,
      projectId,
      publishedAt: published.publishedAt,
      publicUrl: `/p/${projectId}`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to publish" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    await clearPublishedProject(projectId);
    return NextResponse.json({ ok: true, projectId, unpublished: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Failed to unpublish" },
      { status: 500 }
    );
  }
}
