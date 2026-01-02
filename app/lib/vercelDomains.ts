const VERCEL_API = "https://api.vercel.com";

const token = process.env.VERCEL_TOKEN!;
const projectId = process.env.VERCEL_PROJECT_ID!;
const teamId = process.env.VERCEL_TEAM_ID;

function withTeam(url: string) {
  return teamId ? `${url}?teamId=${teamId}` : url;
}

export async function addDomainToProject(domain: string) {
  const res = await fetch(
    withTeam(`${VERCEL_API}/v10/projects/${projectId}/domains`),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Failed to add domain");

  return data;
}

export async function checkDomain(domain: string) {
  const res = await fetch(
    withTeam(`${VERCEL_API}/v9/projects/${projectId}/domains/${domain}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Failed to check domain");

  return data;
}
