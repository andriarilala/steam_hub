import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Guard admin routes: must have role === "admin"
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
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

// apply middleware to private areas + admin area
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/crm/:path*",
    "/sponsor-dashboard/:path*",
    "/admin/:path*",
  ],
};
