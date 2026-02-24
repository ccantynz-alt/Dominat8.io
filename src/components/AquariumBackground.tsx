"use client";

import React from "react";

const FISH_COUNT = 6;
const BUBBLE_COUNT = 12;

/**
 * Live fish aquarium background — CSS-only animated fish and bubbles.
 * Use as a full-screen layer behind content (e.g. Builder home).
 */
export default function AquariumBackground() {
  return (
    <div
      className="aquarium-bg"
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #020a12 0%, #041a28 25%, #052535 50%, #041e2e 75%, #030d14 100%)",
      }}
    >
      {/* Subtle caustics / light ripple */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 40% at 50% 20%, rgba(61,240,255,0.06) 0%, transparent 50%)",
          animation: "aquarium-pulse 8s ease-in-out infinite",
        }}
      />
      {/* Fish */}
      {Array.from({ length: FISH_COUNT }, (_, i) => (
        <div
          key={`fish-${i}`}
          className="aquarium-fish"
          style={{
            "--delay": `${i * 2.2}s`,
            "--duration": `${14 + i * 3}s`,
            "--y": `${15 + (i * 14) % 70}%`,
            "--size": `${14 + (i % 3) * 6}px`,
          } as React.CSSProperties}
        >
          <span className="aquarium-fish-body" />
          <span className="aquarium-fish-tail" />
        </div>
      ))}
      {/* Bubbles */}
      {Array.from({ length: BUBBLE_COUNT }, (_, i) => (
        <div
          key={`bubble-${i}`}
          className="aquarium-bubble"
          style={{
            "--delay": `${i * 0.8}s`,
            "--x": `${5 + (i * 9) % 90}%`,
            "--size": `${4 + (i % 4) * 2}px`,
          } as React.CSSProperties}
        />
      ))}
      <style dangerouslySetInnerHTML={{ __html: AQUARIUM_CSS }} />
    </div>
  );
}

const AQUARIUM_CSS = `
  @keyframes aquarium-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes aquarium-swim {
    0% { left: -8%; transform: scaleX(1); }
    49% { transform: scaleX(1); }
    50% { left: 108%; transform: scaleX(-1); }
    99% { transform: scaleX(-1); }
    100% { left: -8%; transform: scaleX(1); }
  }
  @keyframes aquarium-swim-tail {
    0%, 100% { transform: scaleX(1) rotate(-8deg); }
    25% { transform: scaleX(1) rotate(8deg); }
    50% { transform: scaleX(-1) rotate(8deg); }
    75% { transform: scaleX(-1) rotate(-8deg); }
  }
  @keyframes aquarium-bubble-rise {
    0% {
      bottom: -10%;
      opacity: 0.3;
      transform: translateX(0) scale(0.8);
    }
    10% { opacity: 0.6; }
    90% { opacity: 0.4; }
    100% {
      bottom: 110%;
      opacity: 0;
      transform: translateX(20px) scale(1.2);
    }
  }
  .aquarium-fish {
    position: absolute;
    top: var(--y, 30%);
    left: -8%;
    width: var(--size, 18px);
    height: var(--size, 18px);
    animation: aquarium-swim var(--duration, 18s) var(--delay, 0s) linear infinite;
    pointer-events: none;
  }
  .aquarium-fish-body {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 65%;
    height: 45%;
    background: linear-gradient(90deg, rgba(61,240,255,0.5), rgba(61,200,230,0.35));
    border-radius: 50% 40% 40% 50%;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.15);
  }
  .aquarium-fish-tail {
    position: absolute;
    right: -2px;
    top: 50%;
    transform: translateY(-50%) rotate(-8deg);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 10px solid rgba(61,240,255,0.4);
    animation: aquarium-swim-tail 0.4s ease-in-out infinite;
  }
  .aquarium-bubble {
    position: absolute;
    left: var(--x, 20%);
    bottom: -10%;
    width: var(--size, 6px);
    height: var(--size, 6px);
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(61,240,255,0.2));
    border-radius: 50%;
    animation: aquarium-bubble-rise 6s var(--delay, 0s) linear infinite;
    pointer-events: none;
  }
`;
