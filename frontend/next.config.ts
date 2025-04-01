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
};

export default nextConfig;
