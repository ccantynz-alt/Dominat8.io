/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    // Icon/metadata file conventions can 404 when both app/ and src/app exist; serve from API routes instead
    return [
      { source: "/icon", destination: "/api/icon" },
      { source: "/opengraph-image", destination: "/api/opengraph-image" },
    ];
  },
  async headers() {
    return [
      {
        // HTML routes - keep fresh (Cloudflare/Vercel edge caches can confuse during rapid upgrades)
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        // Proof endpoints - always fresh
        source: "/api/__d8__/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/api/__health__",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

module.exports = nextConfig;