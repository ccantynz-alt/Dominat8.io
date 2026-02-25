import { ImageResponse } from "next/og";

export const runtime = "edge";

const size = { width: 32, height: 32 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06080e",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 900,
            color: "#3DF0FF",
            letterSpacing: "-0.05em",
            display: "flex",
          }}
        >
          D8
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
