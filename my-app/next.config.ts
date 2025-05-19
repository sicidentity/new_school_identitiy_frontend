import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    BACKEND_API_URL: "http://localhost:3001/api",
    API_TOKEN: "your_api_token_here",
    BACKEND_BASE_URL: "http://localhost:3001",
    NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
    B2_ACCOUNT_ID: "your_b2_account_id",
    B2_APPLICATION_KEY: "your_b2_application_key",
    B2_BUCKET_NAME: "your_bucket_name",
    B2_BUCKET_ID: "your_bucket_id",
    B2_REGION: "us-west-002"
  },
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
