import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jwt");

  const isAuth = !!token;
  const isPublic =
    ["/", "/auth/login", "/auth/signup"].includes(pathname) ||
    pathname.startsWith("/public"); // Assuming /public contains static public assets

  if (!isAuth && !isPublic) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(request.url)); // Use encodeURIComponent
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && ["/auth/login", "/auth/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|public/images/|api/auth).*)", // Exclude /api/auth routes
  ],
};
