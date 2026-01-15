import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    ok: true,
    source: "pages/api/__probe__.ts",
    method: req.method,
    time: new Date().toISOString(),
  });
}

