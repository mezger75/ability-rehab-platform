import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    OPENROUTER_API_KEY_1: process.env.OPENROUTER_API_KEY_1,
    YANDEX_API_KEY: process.env.YANDEX_API_KEY,
  },
};

export default nextConfig;
