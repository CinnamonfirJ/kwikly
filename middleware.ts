import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug: log the path for every request
  console.log("Request Path:", pathname);

  const isProtectedRoute = !publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const userCookie = request.cookies.get("jwt");
  const isAuthenticated = !!userCookie;

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access login/signup pages, redirect to dashboard
  if (
    isAuthenticated &&
    (pathname === "/auth/login" || pathname === "/auth/signup")
  ) {
    return NextResponse.redirect(new URL("/quizzes", request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Update the matcher to ensure that all the static and public assets are included properly
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|public/images/|api).*)",
  ],
};
