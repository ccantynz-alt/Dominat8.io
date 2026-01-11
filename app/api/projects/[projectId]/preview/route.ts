export async function GET() {
  return Response.json({
    ok: true,
    probe: "preview-route-live",
    note: "If you can see this JSON on Vercel, you are hitting THIS file.",
    methodsExpected: ["GET", "POST"],
  });
}

