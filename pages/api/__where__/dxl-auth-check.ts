import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("cache-control", "no-store, max-age=0");
  res.setHeader("x-dxl-where", "DXL_WHERE_LOCATOR_ALLROOTS_20260129");
  res.setHeader("x-dxl-route", "pages-router");
  res.status(200).json({
    ok: true,
    stamp: "DXL_WHERE_LOCATOR_ALLROOTS_20260129",
    at: new Date().toISOString(),
    path: "/api/__where__/dxl-auth-check",
    note: "Locator endpoint. If you see this JSON, the API route exists on this deploy."
  });
}