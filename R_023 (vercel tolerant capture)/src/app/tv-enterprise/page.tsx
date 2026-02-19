"use client";
import { useEffect, useState } from "react";

export default function TVEnterprise() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/io/health?ts=" + Date.now(), { cache: "no-store" })
      .then(r => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-xl p-10 w-[480px]">
        <div className="text-sm text-gray-500 mb-2">Dominat8</div>
        <div className="text-2xl font-semibold mb-6">System Cockpit</div>
        <div className="flex items-center justify-between border rounded-lg p-4">
          <div className="text-sm font-medium">IO Health</div>
          <div className={"text-sm font-semibold " + (ok ? "text-emerald-600" : "text-red-600")}>
            {ok ? "Healthy" : "Offline"}
          </div>
        </div>
      </div>
    </div>
  );
}