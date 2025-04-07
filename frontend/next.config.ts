import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Intercept all /api requests
        destination: "http://localhost:5000/api/:path*", // Redirect to backend
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone", // This creates a more self-contained build
  // Ensure the basePath is empty for production
  basePath: "",
  // Configure asset prefix if needed
  assetPrefix: process.env.NODE_ENV === "production" ? "" : undefined,
};

export default nextConfig;
