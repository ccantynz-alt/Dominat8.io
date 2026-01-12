export async function GET() {
  return Response.json({
    ok: true,
    route: "preview",
    methods: ["GET", "POST"],
    note: "If POST 405 happens, Vercel is not deploying this file.",
  });
}

export async function POST() {
  return Response.json({
    ok: true,
    route: "preview",
    post: true,
    note: "POST is live. Replace this stub with real preview logic after POST works on Vercel.",
  });
}
