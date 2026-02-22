import { withAuth } from "next-auth/middleware"

// protect certain routes, redirect to /signin if unauthenticated
export default withAuth({
  pages: {
    signIn: "/signin",
  },
})

// apply middleware to private areas
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/crm/:path*",
    "/sponsor-dashboard/:path*",
  ],
}
