// import type { NextConfig } from "next";
//
// const nextConfig: NextConfig = {
//   reactStrictMode: true,
// };
//
// export default nextConfig;

import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL;

if (!backendApiUrl) {
  throw new Error(
    "BACKEND_API_URL is not configured. Please set it in your environment variables.",
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendApiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
