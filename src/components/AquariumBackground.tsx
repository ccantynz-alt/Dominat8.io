"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 3D aquarium background — realistic fish, water volume, and bubbles.
 * Uses React Three Fiber; full-screen fixed layer behind Builder content.
 */

const FISH_COUNT = 8;
const BUBBLE_COUNT = 24;

// ─── Single 3D fish: body + tail + fins, swims along a 3D path ─────────────────
function Fish({ seed = 0 }: { seed?: number }) {
  const group = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const dorsalRef = useRef<THREE.Mesh>(null);

  const path = useMemo(() => {
    const s = seed * 0.7;
    return (t: number) => {
      const x = Math.sin(t + s) * 2.2 + Math.sin(t * 0.5 + s) * 0.4;
      const y = Math.cos(t * 0.8 + s * 1.3) * 1.4 + Math.cos(t * 0.3) * 0.3;
      const z = Math.sin(t * 0.6 + s * 0.9) * 1.2 - 1.5;
      return new THREE.Vector3(x, y, z);
    };
  }, [seed]);

  const prevPos = useRef(new THREE.Vector3());
  const t = useRef(seed * 10);

  useFrame((_, delta) => {
    if (!group.current || !tailRef.current || !dorsalRef.current) return;
    t.current += delta * (0.4 + (seed % 3) * 0.15);
    const pos = path(t.current);
    const prev = prevPos.current;
    group.current.position.copy(pos);
    // Face direction of travel
    const dir = pos.clone().sub(prev);
    if (dir.lengthSq() > 1e-6) {
      dir.normalize();
      group.current.lookAt(pos.clone().sub(dir));
    }
    prevPos.current.copy(pos);
    // Tail and dorsal wiggle
    const wiggle = Math.sin(t.current * 12) * 0.35;
    tailRef.current.rotation.z = wiggle;
    dorsalRef.current.rotation.z = wiggle * 0.6;
  });

  const bodyColor = useMemo(() => {
    const hues = [0.55, 0.58, 0.62, 0.52]; // blue–green fish tones
    return new THREE.Color().setHSL(hues[seed % hues.length], 0.5, 0.45);
  }, [seed]);

  return (
    <group ref={group}>
      {/* Body: elongated capsule (length along Z for swimming) */}
      <mesh castShadow receiveShadow scale={[0.9, 1, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.12, 0.55, 4, 10]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.5}
          metalness={0.08}
          envMapIntensity={0.4}
        />
      </mesh>
      {/* Tail fin: flat fan shape */}
      <mesh
        ref={tailRef}
        position={[0, 0, -0.4]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <circleGeometry args={[0.22, 8, 0, Math.PI * 0.85]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.6}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Dorsal fin */}
      <mesh
        ref={dorsalRef}
        position={[0, 0.22, 0.05]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <planeGeometry args={[0.08, 0.2]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.6}
          metalness={0.05}
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

// ─── Rising bubble ───────────────────────────────────────────────────────────
function Bubble({ seed = 0 }: { seed?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const start = useMemo(() => ({
    x: (seed * 0.17) % 4 - 2,
    y: -2.5 - (seed % 5) * 0.4,
    z: (seed * 0.13) % 2 - 1,
    speed: 0.5 + (seed % 10) * 0.05,
    wobble: 0.3 + (seed % 7) * 0.05,
  }), [seed]);
  const offset = useRef(0);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    offset.current += delta * start.speed;
    const y = start.y + offset.current * 1.2;
    if (y > 3) offset.current = -start.y / 1.2;
    mesh.current.position.set(
      start.x + Math.sin(offset.current * 2) * start.wobble,
      start.y + offset.current * 1.2,
      start.z + Math.cos(offset.current * 1.7) * start.wobble * 0.5
    );
  });

  const size = 0.04 + (seed % 5) * 0.012;
  return (
    <mesh ref={mesh} position={[start.x, start.y, start.z]}>
      <sphereGeometry args={[size, 8, 6]} />
      <meshStandardMaterial
        color="#a8e6f0"
        roughness={0.2}
        metalness={0.1}
        transparent
        opacity={0.65}
      />
    </mesh>
  );
}

// ─── Water volume: fog + caustic-style lighting ───────────────────────────────
function WaterVolume() {
  return (
    <>
      <fog attach="fog" args={["#041a28", 2, 12]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[2, 4, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <directionalLight position={[-1, 2, -1]} intensity={0.4} />
      <pointLight position={[0, 2, 0]} color="#5ba3b8" intensity={0.3} />
    </>
  );
}

function AquariumScene() {
  return (
    <>
      <WaterVolume />
      {Array.from({ length: FISH_COUNT }, (_, i) => (
        <Fish key={`fish-${i}`} seed={i} />
      ))}
      {Array.from({ length: BUBBLE_COUNT }, (_, i) => (
        <Bubble key={`bubble-${i}`} seed={i} />
      ))}
    </>
  );
}

const gradientStyle = {
  position: "fixed" as const,
  inset: 0,
  zIndex: 0,
  overflow: "hidden" as const,
  background: "linear-gradient(180deg, #020a12 0%, #041a28 30%, #052535 60%, #030d14 100%)",
};

export default function AquariumBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="aquarium-bg" aria-hidden style={gradientStyle}>
      {mounted && (
        <Canvas
          camera={{
            position: [0, 0, 6],
            fov: 55,
            near: 0.1,
            far: 20,
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
          style={{ width: "100%", height: "100%" }}
        >
          <AquariumScene />
        </Canvas>
      )}
    </div>
  );
}
