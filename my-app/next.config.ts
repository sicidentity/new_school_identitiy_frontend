import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@radix-ui/react-use-effect-event': path.resolve(process.cwd(), './polyfills/useEffectEvent.ts')
    };
    return config;
  },
};

export default nextConfig;