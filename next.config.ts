import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    OPENROUTER_API_KEY_1: process.env.OPENROUTER_API_KEY_1,
  },
};

export default nextConfig;
