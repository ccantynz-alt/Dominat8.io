"use client";
import * as React from "react";

type VoiceState = "idle" | "listening" | "processing" | "error";

interface VoiceMicButtonProps {
  onTranscript: (text: string) => void;
  size?: number;
}

export function VoiceMicButton({ onTranscript, size = 40 }: VoiceMicButtonProps) {
  const [state, setState] = React.useState<VoiceState>("idle");
  const [errorMsg, setErrorMsg] = React.useState<string>("");
  const recognitionRef = React.useRef<any>(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  function startListening() {
    if (!supported) {
      setErrorMsg("Speech recognition not supported in this browser.");
      setState("error");
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setState("listening");
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setState("processing");
      onTranscript(transcript);
      setTimeout(() => setState("idle"), 800);
    };
    rec.onerror = (e: any) => {
      setErrorMsg(e.error === "not-allowed" ? "Mic access denied." : `Error: ${e.error}`);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    };
    rec.onend = () => {
      if (state === "listening") setState("idle");
    };

    recognitionRef.current = rec;
    rec.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setState("idle");
  }

  function handleClick() {
    if (state === "listening") return stopListening();
    if (state === "idle") return startListening();
  }

  const label =
    state === "listening" ? "Stop" :
    state === "processing" ? "..." :
    state === "error" ? "!" :
    "Mic";

  const glowColor =
    state === "listening" ? "rgba(255,77,109,0.65)" :
    state === "processing" ? "rgba(61,240,255,0.55)" :
    state === "error" ? "rgba(255,209,102,0.55)" :
    "rgba(124,92,255,0.40)";

  const borderColor =
    state === "listening" ? "rgba(255,77,109,0.70)" :
    state === "processing" ? "rgba(61,240,255,0.60)" :
    state === "error" ? "rgba(255,209,102,0.60)" :
    "rgba(255,255,255,0.22)";

  const bgColor =
    state === "listening" ? "rgba(255,77,109,0.18)" :
    state === "processing" ? "rgba(61,240,255,0.14)" :
    state === "error" ? "rgba(255,209,102,0.14)" :
    "rgba(255,255,255,0.08)";

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={handleClick}
        title={state === "error" ? errorMsg : state === "listening" ? "Click to stop" : "Click to speak"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `1.5px solid ${borderColor}`,
          background: bgColor,
          backdropFilter: "blur(12px)",
          boxShadow: `0 0 ${state === "listening" ? "18px 4px" : "10px 0px"} ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.18s ease",
          padding: 0,
        }}
      >
        {state === "listening" ? (
          /* Animated waveform bars */
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <rect x="1" y="4" width="2.5" height="8" rx="1.2" fill="rgba(255,77,109,0.9)">
              <animate attributeName="height" values="8;14;6;12;8" dur="0.7s" repeatCount="indefinite"/>
              <animate attributeName="y" values="4;1;5;2;4" dur="0.7s" repeatCount="indefinite"/>
            </rect>
            <rect x="5.5" y="2" width="2.5" height="12" rx="1.2" fill="rgba(255,77,109,0.9)">
              <animate attributeName="height" values="12;6;14;8;12" dur="0.6s" repeatCount="indefinite"/>
              <animate attributeName="y" values="2;5;1;4;2" dur="0.6s" repeatCount="indefinite"/>
            </rect>
            <rect x="10" y="1" width="2.5" height="14" rx="1.2" fill="rgba(255,77,109,1)">
              <animate attributeName="height" values="14;8;12;6;14" dur="0.5s" repeatCount="indefinite"/>
              <animate attributeName="y" values="1;4;2;5;1" dur="0.5s" repeatCount="indefinite"/>
            </rect>
            <rect x="14.5" y="3" width="2.5" height="10" rx="1.2" fill="rgba(255,77,109,0.9)">
              <animate attributeName="height" values="10;14;6;12;10" dur="0.65s" repeatCount="indefinite"/>
              <animate attributeName="y" values="3;1;5;2;3" dur="0.65s" repeatCount="indefinite"/>
            </rect>
          </svg>
        ) : state === "error" ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3L16 15H2L9 3Z" stroke="rgba(255,209,102,0.9)" strokeWidth="1.5" fill="rgba(255,209,102,0.15)"/>
            <rect x="8.25" y="8" width="1.5" height="4" rx="0.75" fill="rgba(255,209,102,0.9)"/>
            <circle cx="9" cy="13.5" r="0.75" fill="rgba(255,209,102,0.9)"/>
          </svg>
        ) : (
          /* Mic icon */
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="6" y="2" width="6" height="9" rx="3" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5"/>
            <path d="M3.5 9A5.5 5.5 0 0 0 14.5 9" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="9" y1="14.5" x2="9" y2="16.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="6.5" y1="16.5" x2="11.5" y2="16.5" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      {/* Pulse ring when listening */}
      {state === "listening" && (
        <span style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,77,109,0.45)",
          animation: "mic-pulse 1s ease-out infinite",
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}
