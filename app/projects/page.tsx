"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: string;
  name?: string;
  published?: string | boolean;
  domain?: string;
};

export default function ProjectsPage() {
  const userId = "demo-user"; // replace later with real auth

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function checkAccess() {
      const res = await fetch(`/api/user/${userId}`);
      const data = await res.json();

      if (data?.subscriptionActive === "true") {
        setAllowed(true);
        loadProjects();
      } else {
        setAllowed(false);
      }
    }

    async function loadProjects() {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      setProjects(data.projects || []);
    }

    checkAccess();
  }, []);

  if (allowed === false) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Upgrade required</h1>
        <p>You need an active subscription to use Projects.</p>
        <Link href="/billing">Go to billing →</Link>
      </main>
    );
  }

  if (allowed === null) {
    return <p style={{ padding: 40 }}>Checking access…</p>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Projects</h1>

      {projects.length === 0 && <p>No projects yet.</p>}

      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`}>
              {p.name || p.id}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
