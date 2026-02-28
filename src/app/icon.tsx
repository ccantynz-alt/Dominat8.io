import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08070B",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "#F0B35A",
            letterSpacing: "-0.05em",
            display: "flex",
          }}
        >
          D8
        </div>
      </div>
    ),
    { ...size }
  );
}
