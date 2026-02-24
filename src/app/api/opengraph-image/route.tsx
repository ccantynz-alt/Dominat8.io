import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = { width: 1200, height: 630 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#06080e",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(61,240,255,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 900, color: "#e9eef7", letterSpacing: "-0.04em" }}>D8</span>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(61,240,255,0.8)" }} />
          <span style={{ fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>Dominat8.io</span>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#e9eef7",
            textAlign: "center",
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            maxWidth: 900,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Build a world-class</span>
          <span style={{ color: "rgba(61,240,255,0.90)" }}>website in seconds.</span>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Describe your business. Our AI builds it. No templates, no drag and drop.
        </div>
        <div
          style={{
            display: "flex",
            padding: "14px 32px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #00C97A, #00B36B)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Start building for free →
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/png",
      },
    }
  );
}
