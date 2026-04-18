import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    OPENROUTER_API_KEY_1: process.env.OPENROUTER_API_KEY_1,
    YANDEX_API_KEY: process.env.YANDEX_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
