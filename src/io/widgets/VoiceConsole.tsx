"use client";
import * as React from "react";
import { VoiceMicButton } from "../ui/VoiceMicButton";

type ConsoleLine = {
  id: number;
  type: "voice" | "system" | "response";
  text: string;
  ts: string;
};

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export function VoiceConsole() {
  const [lines, setLines] = React.useState<ConsoleLine[]>([
    { id: 0, type: "system", text: "Voice console ready. Click the mic and speak a command.", ts: now() },
  ]);
  const [inputText, setInputText] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const idRef = React.useRef(1);

  function addLine(type: ConsoleLine["type"], text: string) {
    setLines((prev) => [...prev, { id: idRef.current++, type, text, ts: now() }]);
  }

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  function handleTranscript(text: string) {
    addLine("voice", `🎙 "${text}"`);
    // Route transcript to a system response (extend this to call an API)
    setTimeout(() => {
      addLine("response", `> Command received: ${text}`);
    }, 400);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = inputText.trim();
    if (!t) return;
    addLine("voice", `⌨ "${t}"`);
    setInputText("");
    setTimeout(() => {
      addLine("response", `> Command received: ${t}`);
    }, 200);
  }

  const lineColor = (type: ConsoleLine["type"]) => {
    if (type === "voice") return "rgba(61,240,255,0.90)";
    if (type === "response") return "rgba(56,248,166,0.88)";
    return "rgba(255,255,255,0.52)";
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.04)",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.52)" }}>
            Voice Console
          </div>
          <div style={{ fontSize: 14, marginTop: 2, color: "rgba(255,255,255,0.88)" }}>
            Speak or type commands
          </div>
        </div>
        <span style={{
          fontSize: 10, padding: "4px 8px", borderRadius: 999,
          border: "1px solid rgba(56,248,166,0.35)", background: "rgba(56,248,166,0.10)",
          color: "rgba(56,248,166,0.92)",
        }}>LIVE</span>
      </div>

      {/* Log */}
      <div style={{
        flex: 1,
        minHeight: 160,
        maxHeight: 240,
        overflowY: "auto",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
        fontSize: 12,
      }}>
        {lines.map((l) => (
          <div key={l.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "rgba(255,255,255,0.30)", flexShrink: 0 }}>{l.ts}</span>
            <span style={{ color: lineColor(l.type), wordBreak: "break-word" }}>{l.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderTop: "1px solid rgba(255,255,255,0.09)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <VoiceMicButton onTranscript={handleTranscript} size={36} />
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or speak a command…"
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 10,
            padding: "8px 12px",
            color: "rgba(255,255,255,0.90)",
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
          }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(61,240,255,0.45)"; e.target.style.boxShadow = "0 0 0 2px rgba(61,240,255,0.12)"; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.14)"; e.target.style.boxShadow = "none"; }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "1px solid rgba(124,92,255,0.45)",
            background: "rgba(124,92,255,0.22)",
            color: "rgba(255,255,255,0.92)",
            fontSize: 12,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
