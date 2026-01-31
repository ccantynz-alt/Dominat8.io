export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      marker: "D8_AUTOMATION_PROOF_v1_20260201_064300",
      note: "If you can see this, automation executed successfully."
    }),
    { headers: { "content-type": "application/json" } }
  );
}
