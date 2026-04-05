import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware runs on the Edge runtime; we only require a session cookie here.
 * JWT signature and expiry are verified in Node (e.g. getSessionUser, API routes).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/portal")) {
    const token = request.cookies.get("portal_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/products/acm-panels") {
    const token = request.cookies.get("portal_token")?.value;
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", "/products/acm-panels");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/products/acm-panels"],
};
