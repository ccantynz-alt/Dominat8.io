export function parseGitHubRepo(repoUrl: string) {
  // supports: https://github.com/org/repo or git@github.com:org/repo.git
  const cleaned = repoUrl.trim().replace(/\.git$/, "");
  if (cleaned.startsWith("git@github.com:")) {
    const tail = cleaned.replace("git@github.com:", "");
    const [owner, repo] = tail.split("/");
    return { owner, repo };
  }
  try {
    const u = new URL(cleaned);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

export async function fetchRepoMeta(repoUrl: string) {
  const token = process.env.GITHUB_TOKEN;
  const parsed = parseGitHubRepo(repoUrl);
  if (!parsed) return null;

  // If no token, we’ll still try public GitHub API (rate-limited)
  const headers: Record<string, string> = {
    "accept": "application/vnd.github+json",
    "user-agent": "agent-platform",
  };
  if (token) headers["authorization"] = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
    headers,
    // Next.js route handlers: avoid caching
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return {
    defaultBranch: data.default_branch as string | undefined,
    name: (data.name as string | undefined) ?? undefined,
    fullName: (data.full_name as string | undefined) ?? undefined,
    private: (data.private as boolean | undefined) ?? undefined,
  };
}
