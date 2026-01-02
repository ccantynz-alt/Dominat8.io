import { NextResponse } from "next/server";
import { z } from "zod";
import { addProjectDomain, getProjectDomains, removeProjectDomain } from "@/app/lib/domainsKV";

const AddSchema = z.object({
  domain: z.string().min(3),
});

const RemoveSchema = z.object({
  domainId: z.string().min(3),
});

export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params.projectId;
    const domains = await getProjectDomains(projectId);
    return NextResponse.json({ ok: true, domains, count: domains.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params.projectId;
    const body = await req.json();
    const parsed = AddSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const domains = await addProjectDomain(projectId, parsed.data.domain);
    return NextResponse.json({ ok: true, domains, count: domains.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const projectId = params.projectId;
    const body = await req.json();
    const parsed = RemoveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const domains = await removeProjectDomain(projectId, parsed.data.domainId);
    return NextResponse.json({ ok: true, domains, count: domains.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
