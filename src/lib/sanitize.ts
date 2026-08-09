import { readFileSync } from "fs";
import { join } from "path";

console.log("NextAuth Sanitizer - process.cwd():", process.cwd());

// Global URL class override to clean comma-separated duplicate URLs at runtime
if (typeof global !== "undefined" && (global as any).URL) {
  const OriginalURL = (global as any).URL;
  (global as any).URL = class PatchedURL extends OriginalURL {
    constructor(input: string | URL, base?: string | URL) {
      if (typeof input === "string" && input.includes(",")) {
        const parts = input.split(",");
        if (parts.length > 0 && parts[0].trim().startsWith("http")) {
          const cleanInput = parts[0].trim();
          console.log(`[PatchedURL] Sanitized input URL: "${input}" -> "${cleanInput}"`);
          super(cleanInput, base);
          return;
        }
      }
      super(input, base);
    }
  };
  console.log("NextAuth Sanitizer - Global URL class constructor override installed successfully");
}

// Global prototype override to fix duplicate X-Forwarded-Host headers injected by VPS/Cloudflare double proxying
if (typeof Headers !== "undefined" && Headers.prototype) {
  const originalGet = Headers.prototype.get;
  Headers.prototype.get = function (this: Headers, name: string) {
    const value = originalGet.call(this, name);
    if (name.toLowerCase() === "x-forwarded-host" && value && value.includes(",")) {
      const cleanValue = value.split(",")[0].trim();
      console.log(`[Headers.get] Sanitized duplicate X-Forwarded-Host: "${value}" -> "${cleanValue}"`);
      return cleanValue;
    }
    return value;
  };

  const originalEntries = Headers.prototype.entries;
  (Headers.prototype.entries as any) = function* (this: Headers) {
    for (const [key, value] of originalEntries.call(this)) {
      if (key.toLowerCase() === "x-forwarded-host" && value && value.includes(",")) {
        const cleanValue = value.split(",")[0].trim();
        console.log(`[Headers.entries] Sanitized duplicate X-Forwarded-Host: "${value}" -> "${cleanValue}"`);
        yield [key, cleanValue];
      } else {
        yield [key, value];
      }
    }
  };

  const originalForEach = Headers.prototype.forEach;
  (Headers.prototype.forEach as any) = function (
    this: Headers,
    callbackfn: (value: string, key: string, parent: Headers) => void,
    thisArg?: any
  ) {
    originalForEach.call(
      this,
      (value, key) => {
        if (key.toLowerCase() === "x-forwarded-host" && value && value.includes(",")) {
          const cleanValue = value.split(",")[0].trim();
          console.log(`[Headers.forEach] Sanitized duplicate X-Forwarded-Host: "${value}" -> "${cleanValue}"`);
          callbackfn.call(thisArg, cleanValue, key, this);
        } else {
          callbackfn.call(thisArg, value, key, this);
        }
      },
      thisArg
    );
  };
  console.log("NextAuth Sanitizer - Global Headers.prototype overrides (get, entries, forEach) installed successfully");
}

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
