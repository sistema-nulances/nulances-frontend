import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_TOKEN_COOKIE } from "@/lib/auth-constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isVendedorArea = pathname.startsWith("/painel-vendedor");
  const isProfileArea = pathname.startsWith("/profile");
  const isLegacyDashboard = pathname === "/dashboard";

  if (!isAdmin && !isVendedorArea && !isProfileArea && !isLegacyDashboard) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value?.trim();
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/401";
    url.searchParams.set("returnUrl", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/painel-vendedor",
    "/painel-vendedor/:path*",
    "/profile",
    "/profile/:path*",
    "/dashboard",
  ],
};
