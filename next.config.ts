import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // @ts-ignore
  turbopack: {
    root: "/Users/ahmed/4Me/2026 Projects/DontSkipHumanity/dsh-landing",
  },
};

export default nextConfig;
