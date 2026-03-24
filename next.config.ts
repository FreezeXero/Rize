import type { NextConfig } from "next";

/**
 * Mirror of `next.config.mjs` for TypeScript / editor tooling.
 * Next.js 14.x only auto-loads `next.config.{js,mjs,cjs}` — the active file is `next.config.mjs`.
 */
const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist", "canvas"],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        encoding: false,
      };
    }

    return config;
  },
};

export default nextConfig;
