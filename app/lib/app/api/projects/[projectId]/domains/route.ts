cd C:\Users\ccant\OneDrive\Documents\my-saas-app

$path = "app\lib\app\api\projects\[projectId]\domains\route.ts"

New-Item -ItemType Directory -Force -Path (Split-Path $path) | Out-Null

@'
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    projectId: params.projectId,
    userId,
  });
}
'@ | Set-Content -Encoding UTF8 $path

Write-Host "WROTE FILE:" (Resolve-Path $path)

Write-Host "SHOW LINE 1-40:"
Get-Content $path -TotalCount 40

Write-Host "CONFIRM BAD LINE IS GONE:"
Select-String -Path $path -Pattern "const\s+\{\s*userId\s*\}\s*=\s*auth\(\)" -List
