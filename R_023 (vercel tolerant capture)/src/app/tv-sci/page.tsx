"use client";
import { useEffect, useState } from "react";

export default function TVSci() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/io/health?ts=" + Date.now(), { cache: "no-store" })
      .then(r => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-cyan-300 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_60%)]" />
      <div className="relative flex items-center justify-center min-h-screen">
        <div className="border border-cyan-400/30 rounded-xl p-10 text-center bg-black/60 backdrop-blur">
          <div className="text-xs tracking-widest opacity-60 mb-2">MISSION CONTROL</div>
          <div className="text-3xl font-bold mb-4">Agent Grid Online</div>
          <div className={"px-4 py-2 rounded " + (ok ? "bg-cyan-500/20" : "bg-red-500/20")}>
            {ok ? "CORE STATUS: STABLE" : "CORE STATUS: FAULT"}
          </div>
        </div>
      </div>
    </div>
  );
}