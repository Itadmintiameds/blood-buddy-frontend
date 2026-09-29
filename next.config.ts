// import type { NextConfig } from "next";
//
// const nextConfig: NextConfig = {
//   reactStrictMode: true,
// };
//
// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Expose BACKEND_API_URL to browser code (axios baseURL). Vars without the
  // NEXT_PUBLIC_ prefix aren't inlined into the client bundle unless listed here.
  env: {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
};

export default nextConfig;
