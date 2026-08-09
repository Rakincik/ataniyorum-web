import { readFileSync } from "fs";
import { join } from "path";

console.log("NextAuth Sanitizer - process.cwd():", process.cwd());

try {
  const envPath = join(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    
    const [key, ...values] = trimmed.split("=");
    const rawValue = values.join("=");
    if (!key || !rawValue) return;
    
    const value = rawValue.replace(/^['"]|['"]$/g, "").trim();
    process.env[key.trim()] = value;
  });
  console.log("NextAuth Sanitizer - Loaded .env file successfully");
} catch (e: any) {
  console.error("NextAuth Sanitizer - Failed to read .env file:", e.message);
}

// Sanitize duplicate environment variables caused by VPS/Cloudflare double proxying
if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes(",")) {
  console.log("NextAuth Sanitizer - Detected duplicate NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.split(",")[0].trim();
}
if (process.env.AUTH_URL && process.env.AUTH_URL.includes(",")) {
  process.env.AUTH_URL = process.env.AUTH_URL.split(",")[0].trim();
}

console.log("NextAuth Sanitizer - Resolved NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
