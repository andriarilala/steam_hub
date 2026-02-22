import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"

// read secrets from environment variables
// make sure to define NEXTAUTH_URL as well (e.g. http://localhost:3000)
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],
  // optionally customize pages, callbacks, etc.
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token, user }) {
      // session.user contains name, email, image
      return session
    },
  },
}

// NextAuth must be the default export from the route
export default NextAuth(authOptions)
