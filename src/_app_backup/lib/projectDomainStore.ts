// src/app/lib/projectDomainStore.ts

import { kv } from "@vercel/kv";
import crypto from "crypto";

export type ProjectDomainV1 = {
  version: 1;
  projectId: string;
  domain: string; // apex/root domain like "example.com"
  token: string;  // verification token
  createdAt: string; // ISO
  verifiedAt: string | null; // ISO
};

const key = (projectId: string) => `project:${projectId}:domain:v1`;

function normalizeDomain(input: string): string {
  const raw = (input || "").trim().toLowerCase();

  // remove protocol if user pastes https://
  const noProto = raw.replace(/^https?:\/\//, "");

  // remove path if any
  const noPath = noProto.split("/")[0];

  // remove trailing dot
  const d = noPath.replace(/\.$/, "");

  // very light validation
  if (!d || d.includes(" ") || !d.includes(".")) return "";
  return d;
}

function newToken(): string {
  // URL-safe token
  return crypto.randomBytes(18).toString("base64url");
}

export async function getProjectDomain(projectId: string): Promise<ProjectDomainV1 | null> {
  const val = await kv.get<ProjectDomainV1>(key(projectId));
  if (!val || typeof val !== "object") return null;
  if ((val as any).version !== 1) return null;
  return val;
}

export async function setProjectDomain(projectId: string, domainInput: string): Promise<ProjectDomainV1> {
  const domain = normalizeDomain(domainInput);
  if (!domain) throw new Error("Please enter a valid domain (example: example.com)");

  const existing = await getProjectDomain(projectId);
  // If same domain already exists, keep existing token
  const token = existing?.domain === domain ? existing.token : newToken();

  const record: ProjectDomainV1 = {
    version: 1,
    projectId,
    domain,
    token,
    createdAt: existing?.createdAt || new Date().toISOString(),
    verifiedAt: existing?.verifiedAt || null,
  };

  await kv.set(key(projectId), record);
  return record;
}

export async function markDomainVerified(projectId: string): Promise<ProjectDomainV1> {
  const rec = await getProjectDomain(projectId);
  if (!rec) throw new Error("No domain saved for this project.");
  const next: ProjectDomainV1 = { ...rec, verifiedAt: new Date().toISOString() };
  await kv.set(key(projectId), next);
  return next;
}

export async function clearProjectDomain(projectId: string) {
  await kv.del(key(projectId));
}
