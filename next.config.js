/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  async rewrites() {
    return {
      beforeFiles: [
        // ✅ HARD BYPASS: never rewrite API routes
        { source: "/api/:path*", destination: "/api/:path*" },

        // ✅ also bypass Next internals
        { source: "/_next/:path*", destination: "/_next/:path*" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;
