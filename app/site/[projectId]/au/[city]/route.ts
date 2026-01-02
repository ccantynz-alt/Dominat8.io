// app/site/[projectId]/au/[city]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string; city: string } }
) {
  return NextResponse.redirect(
    new URL(`/site/${params.projectId}/location/au/${params.city}`, "http://localhost")
  );
}
