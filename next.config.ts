import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "https://dsh-dashboard.vercel.app/admin",
      },
      {
        source: "/admin/:path*",
        destination: "https://dsh-dashboard.vercel.app/admin/:path*",
      },
    ];
  },
};

export default nextConfig;
