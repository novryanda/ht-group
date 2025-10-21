/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    // Allow warnings during build, only fail on errors
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Optimize server components and middleware
    optimizePackageImports: [
      "next-auth",
      "@prisma/client",
    ],
  },
  // Exclude heavy packages from middleware bundle
  webpack: (config, { isServer, nextRuntime }) => {
    // Exclude Prisma and bcrypt from Edge Runtime middleware
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@prisma/client": false,
        "bcryptjs": false,
      };
    }
    return config;
  },
};

export default config;
