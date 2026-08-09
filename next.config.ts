import type { NextConfig } from "next";

// Sanitize duplicate environment variables caused by VPS/Cloudflare double proxying
if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes(",")) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.split(",")[0].trim();
}
if (process.env.AUTH_URL && process.env.AUTH_URL.includes(",")) {
  process.env.AUTH_URL = process.env.AUTH_URL.split(",")[0].trim();
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
