import { NextResponse } from "next/server";
import { getDomainStatuses } from "@/app/lib/domainAttachKV";

export async function GET(
  _: Request,
  { params }: { params: { projectId: string } }
) {
  const statuses = await getDomainStatuses(params.projectId);
  return NextResponse.json({ ok: true, statuses });
}
