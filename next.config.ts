import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // allowedDevOrigins: ["192.168.1.186"],
  },
};

export default nextConfig;
