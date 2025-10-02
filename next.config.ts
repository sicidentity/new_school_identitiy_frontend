import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "f003.backblazeb2.com",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/faker-js/assets-person-portrait/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@radix-ui/react-use-effect-event": path.resolve(
        process.cwd(),
        "./polyfills/useEffectEvent.ts"
      ),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@radix-ui/react-use-effect-event": "./polyfills/useEffectEvent.ts",
    },
  },
  output: 'standalone'
};

export default nextConfig;
