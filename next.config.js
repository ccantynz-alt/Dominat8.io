/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Windows/OneDrive fix: avoid watchpack lstat EINVAL on protected system files
    config.watchOptions = {
      ...config.watchOptions,
      poll: 1000,
      aggregateTimeout: 300,
      ignored: [
        "**/.git/**",
        "**/.next/**",
        "**/node_modules/**",
        "C:\\\\hiberfil.sys",
        "C:\\\\pagefile.sys",
        "C:\\\\swapfile.sys",
        "C:\\\\DumpStack.log.tmp",
      ],
    };
    return config;
  },
};

module.exports = nextConfig;
