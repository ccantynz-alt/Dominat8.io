import { NextResponse } from "next/server";
import { z } from "zod";
import { addDomain, getDomains, removeDomain } from "@/app/lib/domainsKV";

const AddSchema = z.object({
  domain: z.string().min(1),
  lastCheckedAt: z.string().optional(),
  lastStatus: z.enum([
    "ok",
    "needs_action",
    "propagating_or_unknown",
    "domain_not_found",
    "blocked_or_conflicting",
  ]).optional(),
  lastCode: z.string().optional(),
});

const DeleteSchema = z.object({
  domain: z.string().min(1),
});

export async function GET(_: Request, { params }: { params: { projectId: string } }) {
  try {
    const domains = await getDomains(params.projectId);
    return NextResponse.json({ ok: true, domains, count: domains.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = AddSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload. Expected { domain }" }, { status: 400 });
    }

    const domains = await addDomain(params.projectId, parsed.data.domain, {
      lastCheckedAt: parsed.data.lastCheckedAt,
      lastStatus: parsed.data.lastStatus,
      lastCode: parsed.data.lastCode,
    });

    return NextResponse.json({ ok: true, domains, count: domains.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { projectId: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload. Expected { domain }" }, { status: 400 });
    }

    const domains = await removeDomain(params.projectId, parsed.data.domain);
    return NextResponse.json({ ok: true, domains, count: domains.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Failed" }, { status: 500 });
  }
}
