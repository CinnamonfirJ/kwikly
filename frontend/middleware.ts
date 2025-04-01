import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes are public (accessible without authentication)
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected (not in public routes)
  const isProtectedRoute = !publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get the user cookie
  const userCookie = request.cookies.get("jwt");
  const isAuthenticated = !!userCookie;

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/auth/login", request.url);
    // Add the original URL as a parameter to redirect after login
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access login/signup pages, redirect to dashboard
  if (
    isAuthenticated &&
    (pathname === "/auth/login" || pathname === "/auth/signup")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (we'll handle auth in the API routes separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
