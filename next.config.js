/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // IMPORTANT:
  // Do NOT use `output: "export"` for this project.
  // Static export breaks/limits dynamic App Router routes and causes build-time export failures (like /start).
  // We want standard Vercel Next.js routing (pages + API) to work normally.
};

module.exports = nextConfig;
