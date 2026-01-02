import { NextResponse } from "next/server";
import { addDomainToProject, checkDomain } from "@/app/lib/vercelDomains";
import { saveDomainStatus } from "@/app/lib/domainAttachKV";

export async function POST(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await _.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { ok: false, error: "Missing domain" },
        { status: 400 }
      );
    }

    await addDomainToProject(domain);
    const status = await checkDomain(domain);

    await saveDomainStatus(params.projectId, domain, status);

    return NextResponse.json({ ok: true, status });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
