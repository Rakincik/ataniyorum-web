import { readFileSync } from "fs";
import { join } from "path";

try {
  // Read .env file manually to guarantee variables are loaded before next-auth imports
  const envPath = join(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    
    const [key, ...values] = trimmed.split("=");
    const rawValue = values.join("=");
    if (!key || !rawValue) return;
    
    // Remove quotes
    const value = rawValue.replace(/^['"]|['"]$/g, "").trim();
    
    // Set environment variable
    process.env[key.trim()] = value;
  });
} catch (e) {
  // Ignore if file doesn't exist
}

// Sanitize duplicate environment variables caused by VPS/Cloudflare double proxying
if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes(",")) {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL.split(",")[0].trim();
}
if (process.env.AUTH_URL && process.env.AUTH_URL.includes(",")) {
  process.env.AUTH_URL = process.env.AUTH_URL.split(",")[0].trim();
}
