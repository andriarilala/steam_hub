import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/** Maps a user role to its home/dashboard route. */
function getRoleHome(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "youth":
      return "/youth";
    case "sponsor":
      return "/sponsor-dashboard";
    default:
      // company, institution, mentor
      return "/dashboard";
  }
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = (token?.role as string) || "youth";

    // ── Admin guard ──────────────────────────────────────────────────────────
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(getRoleHome(role), req.url));
    }

    // ── Youth guard ──────────────────────────────────────────────────────────
    if (pathname.startsWith("/youth") && role !== "youth" && role !== "admin") {
      return NextResponse.redirect(new URL(getRoleHome(role), req.url));
    }

    // ── Sponsor-dashboard guard ──────────────────────────────────────────────
    if (
      pathname.startsWith("/sponsor-dashboard") &&
      role !== "sponsor" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL(getRoleHome(role), req.url));
    }

    // ── Smart redirect from /dashboard to role-specific home ─────────────────
    // Covers users who land on /dashboard after OAuth or a generic redirect.
    if (pathname === "/dashboard") {
      const home = getRoleHome(role);
      if (home !== "/dashboard") {
        return NextResponse.redirect(new URL(home, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/signin",
    },
    callbacks: {
      // withAuth will only run the middleware function when authorized() returns true
      authorized({ token }) {
        return !!token;
      },
    },
  },
);

// apply middleware to all private areas
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile/:path*",
    "/crm/:path*",
    "/sponsor-dashboard/:path*",
    "/admin/:path*",
    "/youth/:path*",
  ],
};
