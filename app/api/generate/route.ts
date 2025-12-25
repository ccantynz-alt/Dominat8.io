import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
  }

  // Placeholder AI response (hardcoded for stability)
  return NextResponse.json({
    files: {
      "app/page.tsx": `
export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>AI Website Builder</h1>
      <p>${prompt}</p>
    </main>
  );
}
      `,
      "app/globals.css": `
body {
  font-family: system-ui, sans-serif;
}
      `
    }
  });
}
