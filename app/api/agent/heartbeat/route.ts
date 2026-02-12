import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function cockpitDir(){ return path.join(process.cwd(), ".d8_cockpit"); }
function heartbeatFile(){ return path.join(cockpitDir(), "heartbeat.json"); }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.mkdirSync(cockpitDir(), { recursive: true });
    fs.writeFileSync(heartbeatFile(), JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 400 });
  }
}

export async function GET() {
  try {
    const file = heartbeatFile();
    if (!fs.existsSync(file)) return NextResponse.json({ ok: true, heartbeat: null });
    const raw = fs.readFileSync(file, "utf8");
    return NextResponse.json({ ok: true, heartbeat: JSON.parse(raw) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}