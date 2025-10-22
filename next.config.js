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
    // HAPUS Prisma dari optimizePackageImports - bisa menyebabkan tree-shaking yang tidak diinginkan
    // Biarkan kosong atau hanya lib UI
    optimizePackageImports: [
      "next-auth",
      // JANGAN: "@prisma/client", - ini bisa menyebabkan Prisma engine tidak ter-bundle
    ],

    // Tambahkan ini agar Next tidak meng-tree-shake Prisma saat tracing
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
  },

  // Pastikan engine Prisma ikut dibundel untuk semua route server
  outputFileTracingIncludes: {
    "/api/**": [
      "./node_modules/.prisma/client/**",
      "./node_modules/@prisma/engines/**",
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

