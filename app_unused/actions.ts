"use server";

export async function publishProject(projectId: string) {
  if (!projectId) throw new Error("Missing projectId");

  // Call your API route (adjust path if yours differs)
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/projects/${projectId}/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    // If your API expects JSON body, include it. If not, remove body.
    body: JSON.stringify({}),
    cache: "no-store",
  });

  const text = await res.text();
  let data: any = null;

  try {
    data = JSON.parse(text);
  } catch {
    // If it returned HTML, show a useful error
    throw new Error(`Publish returned non-JSON (status ${res.status}). First 120 chars: ${text.slice(0, 120)}`);
  }

  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Publish failed (status ${res.status})`);
  }

  return data;
}
