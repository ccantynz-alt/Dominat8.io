Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail([string]$m) { throw "ERROR: $m" }

if (-not (Test-Path -LiteralPath ".\package.json")) {
  Fail "Run this from your repo root (the folder that contains package.json)."
}

function WriteUtf8NoBom([string]$path, [string]$content) {
  $dir = Split-Path -Parent $path
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

$pagePath = ".\src\app\page.tsx"

WriteUtf8NoBom $pagePath @'
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Pt = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/75">
      <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
      {children}
    </span>
  );
}

export default function HomePage() {
  const [pos, setPos] = useState<Pt>({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const target = useRef<Pt>({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const last = useRef<Pt>({ x: 0, y: 0 });

  // Smooth cursor-follow glow (the “lights up” effect)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!hasMoved) setHasMoved(true);
    };

    const tick = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const fallback = { x: w * 0.55, y: h * 0.35 };
      const desiredX = hasMoved ? target.current.x : fallback.x;
      const desiredY = hasMoved ? target.current.y : fallback.y;

      const nx = last.current.x + (desiredX - last.current.x) * 0.18;
      const ny = last.current.y + (desiredY - last.current.y) * 0.18;

      last.current = { x: nx, y: ny };
