"use client";

import React, { useState, useEffect, useRef } from "react";
import FOG from "vanta/dist/vanta.fog.min";
import * as THREE from "three";

const FuturisticLandingPage = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        FOG({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          highlightColor: 0xFFE066,
          midtoneColor: 0xE6A23C,
          lowlightColor: 0x8B6914,
          baseColor: 0x1a0f00,
          blurFactor: 0.5,
          speed: 1.5,
          zoom: 0.5,
        })
      );
    }
    return () => {
      if (vantaEffect) (vantaEffect as any).destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="gold-card"
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
          Dominat8 is Coming
        </h1>
        <p style={{ fontSize: "1.2rem" }}>
          The future of web development is on its way.
        </p>
      </div>
    </div>
  );
};

export default FuturisticLandingPage;
