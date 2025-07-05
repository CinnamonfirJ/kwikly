import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// const publicRoutes = [
//   "/",
//   "/auth/login",
//   "/auth/signup",
//   "/auth/forgot-password",
//   "/auth/reset-password",
// ];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jwt");

  const isAuth = !!token;
  const isPublic =
    ["/", "/auth/login", "/auth/signup"].includes(pathname) ||
    pathname.startsWith("/public");

  if (!isAuth && !isPublic) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && ["/auth/login", "/auth/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Update the matcher to ensure that all the static and public assets are included properly
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|public/images/|api).*)",
  ],
};
