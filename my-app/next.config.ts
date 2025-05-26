import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ], // ✅ Allow external images from this domain
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@radix-ui/react-use-effect-event": path.resolve(process.cwd(), "./polyfills/useEffectEvent.ts"),
    };
    return config;
  },
  // Using turbopack (stable) configuration
  turbopack: {
    resolveAlias: {
      "@radix-ui/react-use-effect-event": "./polyfills/useEffectEvent.ts"
    }
  }
};

export default nextConfig;
