# Pass Avenir (Demo)

This Next.js 13 application demonstrates a multi-role membership platform with email/password authentication, social login (Google/Facebook), and a simple event registration page. The auth flow now uses NextAuth with a Prisma/SQLite backend.

## Setup

1. **Install dependencies**

   ```bash
   # using npm
   npm install
   # or pnpm
   pnpm install
   ```

2. **Database**

   This project uses Prisma with SQLite for convenience.

   - Create `.env` at the project root (already provided) containing:
     ```env
     DATABASE_URL="file:./dev.db"
     NEXTAUTH_URL=http://localhost:3000
     # a secret used by NextAuth to encrypt JWTs; generate one and keep it consistent
     NEXTAUTH_SECRET=<une-chaîne-aléatoire>
     GOOGLE_CLIENT_ID=...        # optional for social login
     GOOGLE_CLIENT_SECRET=...
     FACEBOOK_CLIENT_ID=...
     FACEBOOK_CLIENT_SECRET=...
     ```

     (the code will generate a temporary secret and log a warning if you forget this, but sessions may break when the server restarts unless you set it.)

   - Generate and push the schema:
     ```bash
     npx prisma generate
     npx prisma db push   # creates `dev.db` and tables
     ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Authentication Flow

- **Sign up** (`/signup`): multi-step form. Creates a user via an API route (`POST /api/auth/register`) which hashes passwords and stores them in SQLite. Upon success the user is automatically signed in via the credentials provider and redirected to `/dashboard`.

- **Sign in** (`/signin`): submits credentials to NextAuth's `credentials` provider. Error messages are shown for invalid credentials.

- **Social login**: Google and Facebook buttons call NextAuth directly. To enable:
  1. **Create OAuth credentials** on Google Cloud Console and Facebook for Developers.
  2. Set the redirect URI to `http://localhost:3000/api/auth/callback/google` (or `/facebook`).
  3. Add the resulting `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` to your `.env` file.
  4. Restart the dev server. When a user clicks "Continue with Google"/"Facebook" they will be redirected through the OAuth flow, and a new account is created in the database.

  New users created via OAuth automatically receive the default role `youth` (via a NextAuth `createUser` event).

- **Session management**: NextAuth stores a JWT in a secure http-only cookie. The custom `AuthProvider` wraps `useSession` and exposes helpers (`signIn`, `signUp`, `signOut`, `signInWithProvider`).

- **Password reset**: the app includes `/forgot-password` and `/reset-password` pages. A token is generated and logged when requesting a reset; the `/api/auth/reset-password` endpoint updates the hashed password.
- **Protected routes**: a `middleware.ts` file applies NextAuth's `withAuth` helper to guard `/dashboard`, `/profile`, `/crm`, and other private paths, redirecting unauthenticated users to `/signin`.
- **Prisma adapter**: NextAuth uses the official `@next-auth/prisma-adapter` to store accounts and sessions in the database.

## Testing the flow

1. Start the server (it will automatically seed two demo accounts if they don't already exist).
2. Visit `/signin` and sign in with one of the seeded users:
   - `test@example.com` / `password123`
   - `second@example.com` / `Password123!`
3. After successful login you should be redirected to `/dashboard`.
4. You may also register a new account via `/signup`, log out, and then sign back in.
5. Try social login (if credentials are configured).

## Notes

- This implementation is built for demonstration. In production, switch to a proper database (PostgreSQL, MySQL, etc.), add email verification, password-reset flows, 2FA, and hardened security.
- Translation keys are stored in `lib/i18n.ts` (English and French supported).
- UI components live under `components/ui` and are based on Radix UI.

Happy coding!
