'use client';

export async function createProjectClient(name: string) {
  if (!name || !name.trim()) {
    throw new Error('Project name is required');
  }

  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  // Handle Free plan limit cleanly
  if (res.status === 403) {
    const data = await res.json().catch(() => null);
    throw new Error(
      data?.error ||
        'Free plan limit reached. Please upgrade to Pro.'
    );
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to create project');
  }

  return res.json();
}
