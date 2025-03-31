"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  // Define public routes
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  );

  useEffect(() => {
    // Only run after initial loading is complete
    if (!isLoading) {
      // If not authenticated and not on a public route, redirect to login
      if (!isAuthenticated && !isPublicRoute) {
        router.push(
          `/auth/login?callbackUrl=${encodeURIComponent(pathname || "/")}`
        );
      }

      // If authenticated and on login/signup page, redirect to dashboard
      if (
        isAuthenticated &&
        (pathname === "/auth/login" || pathname === "/auth/signup")
      ) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, pathname, router]);

  // Show loading or nothing while checking authentication
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='border-pink-500 border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin'></div>
      </div>
    );
  }

  // If it's a protected route and user is not authenticated, don't render children
  if (!isPublicRoute && !isAuthenticated) {
    return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
