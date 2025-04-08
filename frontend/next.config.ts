import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Intercept all /api requests
        destination: "http://localhost:10000/api/:path*", // Redirect to backend
        // destination: "https://kwikly.onrender.com/api/:path*", // Redirect to backend
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
    loader: "default",
  },
};

export default nextConfig;
