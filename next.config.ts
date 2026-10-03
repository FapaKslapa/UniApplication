import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import { buildSecurityHeaders, noUmami } from "./lib/security-headers";

initOpenNextCloudflareForDev();

const isProduction = process.env.NODE_ENV === "production";
const umami = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  ? {
      script: " https://cloud.umami.is",
      connect: " https://cloud.umami.is https://api-gateway.umami.dev",
    }
  : noUmami;

const securityHeaders = buildSecurityHeaders({ isProduction, umami });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
  },
};

export default nextConfig;
