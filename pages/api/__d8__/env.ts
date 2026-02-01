import type { NextApiRequest, NextApiResponse } from "next";

function present(name: string) {
  const v = process.env[name];
  return !!(typeof v === "string" && v.length);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("pragma", "no-cache");
  res.setHeader("x-d8-proof", "D8_PAGES_ENV_OK");
  res.status(200).json({
    ok: true,
    stamp: "D8_ENV_2026-02-02_ROUTE_LANDING_PAD",
    now: new Date().toISOString(),
    via: "pages-api",
    present: {
      NODE_ENV: present("NODE_ENV"),
      VERCEL: present("VERCEL"),
      VERCEL_ENV: present("VERCEL_ENV"),
      VERCEL_URL: present("VERCEL_URL"),
      NEXT_PUBLIC_SITE_URL: present("NEXT_PUBLIC_SITE_URL"),
      OPENAI_API_KEY: present("OPENAI_API_KEY"),
      ADMIN_API_KEY: present("ADMIN_API_KEY"),
    },
  });
}
