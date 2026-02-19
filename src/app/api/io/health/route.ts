import { NextResponse } from 'next/server';

type Json = Record<string, unknown>;

export async function GET(): Promise<NextResponse<Json>> {
  const payload: Json = {
    ok: true,
    service: 'io',
    route: 'health',
    ts: Date.now()
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'X-D8-Proof': 'MONSTER_046_20260207_105254'
    }
  });
}