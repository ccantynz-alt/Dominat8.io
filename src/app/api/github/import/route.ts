import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Missing GITHUB_TOKEN in environment variables" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const name = (body.name as string) || `emergent-import-${Date.now()}`;
  const description = (body.description as string) || "Imported via AI agent platform";

  const res = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify({
      name,
      description,
      private: true,
      auto_init: true
    })
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: "GitHub API error", details: data },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    repo: {
      name: data.name,
      full_name: data.full_name,
      html_url: data.html_url,
      clone_url: data.clone_url,
      default_branch: data.default_branch
    }
  });
}
