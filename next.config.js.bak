/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === "1";

const nextConfig = {
  // ✅ SPEED: Skip lint/typecheck ONLY on Vercel deploy builds
  // ✅ SAFETY: Keep local builds strict (so you still catch problems locally)
  eslint: {
    ignoreDuringBuilds: isVercel,
  },
  typescript: {
    ignoreBuildErrors: isVercel,
  },
};

module.exports = nextConfig;
