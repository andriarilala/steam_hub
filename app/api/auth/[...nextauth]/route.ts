import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// automatically seed demo users (no intervention required)
async function seedDemoData() {
  // users (includes a default admin account)
  const users = [
    {
      email: "andriarilala04@gmail.com",
      name: "Andriarilala User",
      password: "PassAvenir2025!",
      role: "youth",
    },
    {
      email: "ainafandresena9@gmail.com",
      name: "Aina User",
      password: "PassAvenir2025!",
      role: "youth",
    },
    {
      email: "admin@passavenir.com",
      name: "Admin PASS AVENIR",
      password: "AdminPass2025!",
      role: "admin",
    },
  ];
  for (const u of users) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email },
    });
    if (!existing) {
      const hash = await bcrypt.hash(u.password, 10);
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          hashedPassword: hash,
          role: u.role,
        },
      });
      console.log(`seeded demo user ${u.email} (role: ${u.role})`);
    }
  }

  // events
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    await prisma.event.createMany({
      data: [
        {
          title: "AERO EXPO – La technologie au cœur de l'aéronautique",
          description:
            "2ème édition du Salon Aéro Expo. Une journée pour découvrir les métiers de l'aéronautique, rencontrer des professionnels et explorer les technologies innovantes.",
          date: new Date("2026-05-30T06:00:00Z"),
          type: "Journée",
        },
        {
          title: "Ateliers métiers & échanges avec des professionnels",
          description:
            "Des ateliers interactifs et des stands pour poser tes questions aux professionnels et découvrir différents parcours.",
          date: new Date("2026-03-28T09:00:00Z"),
          type: "Atelier",
        },
        {
          title: "Temps d’échanges et orientation",
          description:
            "Un moment pour discuter avec l’équipe PASS AVENIR et clarifier ton projet d’études ou professionnel.",
          date: new Date("2026-03-28T12:00:00Z"),
          type: "Rencontre",
        },
      ],
    });
    console.log("seeded demo events");
  }

  // sample connection between the two demo users
  const userA = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  });
  const userB = await prisma.user.findUnique({
    where: { email: "second@example.com" },
  });
  if (userA && userB) {
    const existingConn = await prisma.userConnection
      .findUnique({
        where: { userId_targetId: { userId: userA.id, targetId: userB.id } },
      })
      .catch(() => null);
    if (!existingConn) {
      await prisma.userConnection.create({
        data: { userId: userA.id, targetId: userB.id, status: "connected" },
      });
      console.log("seeded demo connection between users");
    }
  }
}

// trigger seeding asynchronously (errors logged)
seedDemoData().catch((e) => {
  console.error("Error seeding demo data", e);
});

// read secrets from environment variables
// make sure to define NEXTAUTH_URL as well (e.g. http://localhost:3000)

// use provided secret or generate a random one in development
let nextAuthSecret = process.env.NEXTAUTH_SECRET;
if (!nextAuthSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "❌ NEXTAUTH_SECRET is required in production. Please set it in your environment variables.",
    );
  }
  nextAuthSecret = crypto.randomBytes(32).toString("hex");
  // set it on the environment so NextAuth internal checks pass
  process.env.NEXTAUTH_SECRET = nextAuthSecret;
  console.warn(
    "⚠️ NEXTAUTH_SECRET not set – generated temporary secret for this session. Set NEXTAUTH_SECRET in your .env for stable sessions.",
  );
}
if (!process.env.NEXTAUTH_URL) {
  console.warn(
    "⚠️ NEXTAUTH_URL not defined – social callbacks and redirects may fail. Add NEXTAUTH_URL to your .env.",
  );
}

export const authOptions = {
  secret: nextAuthSecret,
  logger: {
    error(code: string, ...metadata: unknown[]) {
      console.error("NextAuth error", code, metadata);
    },
    warn(code: string) {
      console.warn("NextAuth warn", code);
    },
    debug(code: string, ...metadata: unknown[]) {
      console.debug("NextAuth debug", code, metadata);
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Credentials authorize called", { credentials });
        try {
          if (!credentials) return null;
          // normalize incoming values
          const email = credentials.email?.trim().toLowerCase();
          const password = credentials.password?.trim();
          const user = await prisma.user.findUnique({ where: { email } });
          console.log("Found user in authorize", { user });
          if (user && user.hashedPassword) {
            const valid = await bcrypt.compare(
              password as string,
              user.hashedPassword,
            );
            console.log("Password valid?", valid);
            if (valid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                image: user.image || null,
              };
            }
          }
          return null;
        } catch (err) {
          console.error("authorize error", err);
          throw err; // propagate so NextAuth logs it
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  // optionally customize pages, callbacks, etc.
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    secret: nextAuthSecret,
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      console.log("signIn callback:", { user, account });
      return true;
    },
    async jwt({
      token,
      user,
      account,
    }: {
      token: any;
      user: any;
      account: any;
    }) {
      console.log("jwt callback:", { user, account });
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "youth";
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      console.log("session callback:", { session, token });
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log("redirect callback:", { url, baseUrl });
      // Always redirect authenticated users to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async createUser({ user }: { user: any }) {
      if (!user.role || !user.emailVerified) {
        const data: any = {};
        if (!user.role) data.role = "youth";
        if (!user.emailVerified) data.emailVerified = new Date();
        await prisma.user.update({ where: { id: user.id }, data });
      }
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
};

// NextAuth handler for App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
