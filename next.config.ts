import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep mupdf as an external package — its WASM binaries don't bundle well
  // with Next.js's bundler. This tells the serverless function to use the
  // installed node_modules version instead of trying to inline it.
  serverExternalPackages: ["mupdf"],
};

export default nextConfig;
