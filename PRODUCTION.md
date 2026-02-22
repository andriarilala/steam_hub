# Production Deployment Guide

To ensure a functional deployment on Vercel, you need to configure the following environment variables in your Vercel project settings.

## Required Variables

| Variable | Description | Recommended Value |
| :--- | :--- | :--- |
| **`DATABASE_URL`** | PostgreSQL connection string | `postgres://user:password@host:port/db` (e.g. from Neon, Supabase) |
| **`NEXTAUTH_SECRET`** | A random string to encrypt JWTs | Generate one with `openssl rand -base64 32` |
| **`NEXTAUTH_URL`** | The full URL of your production site | `https://your-domain.vercel.app` |

## Optional (External Providers)

If you use Google or Facebook login, these are also required:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

## Setup Instructions

1. **Database Migration**: Once `DATABASE_URL` is set, run:
   ```bash
   npx prisma db push
   ```
   *Note: On Vercel, the `build` script will automatically run `prisma generate`.*

2. **Seeding**: The demo users (`test@example.com`) are **only created in development mode**. For production, users should register via the `/signup` page.

3. **HTTPS**: Vercel handles HTTPS automatically. Ensure `NEXTAUTH_URL` starts with `https://`.
