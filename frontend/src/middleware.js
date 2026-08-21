import { NextResponse } from "next/server";
import customerService from "./services/customer.service";

const ROLE_PATHS = {
  customer: "/customer",
  vendor: "/vendor",
  admin: "/admin",
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  // const role = request.cookies.get("role")?.value?.toLowerCase();
  const role =  "customer";
  const isProtectedRoute = ["/customer", "/vendor", "/admin"].some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (!role || !ROLE_PATHS[role]) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  const expectedBasePath = ROLE_PATHS[role];

  if (
    pathname === expectedBasePath ||
    pathname.startsWith(`${expectedBasePath}/`)
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(
    new URL(expectedBasePath, request.url)
  );
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/vendor/:path*",
    "/admin/:path*",
  ],
};