import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const host = headers.get("x-forwarded-host");
  
  if (host && host.includes(",")) {
    const cleanHost = host.split(",")[0].trim();
    headers.set("x-forwarded-host", cleanHost);
    
    // Forward the request with the cleaned headers
    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercept all routes except static files
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|logo.png).*)",
  ],
};
