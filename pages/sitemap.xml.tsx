import type { GetServerSideProps } from "next";
import { kv } from '../src/lib/kv';

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absUrlFromReq(req: any) {
  const host = (req?.headers?.host as string) || "";
  const proto =
    (req?.headers?.["x-forwarded-proto"] as string) ||
    (req?.headers?.["x-forwarded-protocol"] as string) ||
    "https";
  return proto + "://" + host;
}

function asStringArray(v: any) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x)).filter(Boolean);
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const base = absUrlFromReq(req);
  const indexKey = "marketing:dominat8:usecases:index:v1";
  const slugs = asStringArray((await kv.get(indexKey)) as any);

  const urls: string[] = [];
  urls.push(base + "/");
  for (const slug of slugs) {
    urls.push(base + "/use-cases/" + encodeURIComponent(slug));
  }

  const now = new Date().toISOString();

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls
      .map((u) => {
        return "<url><loc>" + escapeXml(u) + "</loc><lastmod>" + now + "</lastmod></url>";
      })
      .join("") +
    "</urlset>";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function SiteMap() {
  return null;
}

