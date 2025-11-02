import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: '/miona',
  assetPrefix: '/miona/',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/miona"
  }
};


export default nextConfig;
