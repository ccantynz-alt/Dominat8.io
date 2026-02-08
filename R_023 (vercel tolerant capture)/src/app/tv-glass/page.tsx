"use client";
import { useEffect, useState } from "react";

export default function TVGlass() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/io/health?ts=" + Date.now(), { cache: "no-store" })
      .then(r => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white flex items-center justify-center">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
        <div className="text-sm opacity-60 mb-3">DOMINAT8</div>
        <div className="text-4xl font-bold mb-6">Glass Cockpit</div>
        <div className={"inline-flex items-center gap-2 px-4 py-2 rounded-full " + (ok ? "bg-emerald-500/20" : "bg-red-500/20")}>
          <span className={"h-2.5 w-2.5 rounded-full " + (ok ? "bg-emerald-400" : "bg-red-400")} />
          {ok ? "SYSTEM GREEN" : "SYSTEM RED"}
        </div>
      </div>
    </div>
  );
}