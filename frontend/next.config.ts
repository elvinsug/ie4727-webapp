import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: '/nova',
  assetPrefix: '/nova/',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/nova"
  }
};


export default nextConfig;
