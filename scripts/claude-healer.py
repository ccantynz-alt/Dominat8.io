#!/usr/bin/env python3
"""Claude AI healer: reads build.log and generates a patch via Claude API."""
import json, os, sys, urllib.request

with open("build.log", "r", encoding="utf-8", errors="ignore") as f:
    log = f.read()
# Trim to avoid oversized requests
if len(log) > 40000:
    log = log[-40000:]

prompt = f"""You are an automated code-fix agent for a Next.js 14 App Router project (Dominat8).

Your job: produce a minimal unified diff (git-apply compatible) that makes `npm run build` succeed.

RULES:
- Output ONLY a unified diff. No explanation, no markdown fences, no commentary.
- Do NOT make visible UI or design changes.
- Do NOT modify package.json or lock files.
- Prefer surgical fixes: types, imports, syntax, file routing conflicts.
- If a .tsx file contains PowerShell content, replace it with a proper re-export shim.
- Common re-export pattern for root app/ shims:
    export {{ default }} from "../../src/app/ROUTE/page";

BUILD LOG:
{log}
""".strip()

payload = {
    "model": "claude-sonnet-4-5",
    "max_tokens": 4096,
    "messages": [
        {"role": "user", "content": prompt}
    ]
}

req = urllib.request.Request(
    "https://api.anthropic.com/v1/messages",
    data=json.dumps(payload).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "x-api-key": os.environ["ANTHROPIC_API_KEY"],
        "anthropic-version": "2023-06-01"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=120) as resp:
        body = json.loads(resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print(f"Claude API error {e.code}: {e.read().decode()}")
    sys.exit(1)

patch = ""
for block in body.get("content", []):
    if block.get("type") == "text":
        patch += block.get("text", "")

patch = patch.strip()

# Strip markdown fences if model wrapped the diff
if "```" in patch:
    lines = patch.split("\n")
    inside = False
    clean = []
    for line in lines:
        if line.startswith("```"):
            inside = not inside
            continue
        if inside:
            clean.append(line)
    patch = "\n".join(clean).strip()

if not patch or not (patch.startswith("diff --git ") or patch.startswith("--- ")):
    print("Claude did not return a valid unified diff.")
    print("Raw output:", patch[:500])
    sys.exit(2)

with open("agent.patch", "w", encoding="utf-8") as f:
    f.write(patch)
print("agent.patch written successfully.")
