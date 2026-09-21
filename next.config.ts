import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
  },
};

export default nextConfig;
