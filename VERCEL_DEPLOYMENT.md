# Vercel Deployment Guide

Deploy this CRM to Vercel after Supabase is configured and the migration has been applied.

## 1. GitHub Connection

This workspace currently does not contain a `.git` directory, and `git` is not available on the local PowerShell PATH. That means the project is not confirmably connected to GitHub from this machine yet.

Before importing into Vercel:

```powershell
git init
git add .
git commit -m "Prepare Source One CRM for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/source-one-crm.git
git push -u origin main
```

Then import that GitHub repository in Vercel.

## 2. Vercel Project Settings

Use these settings:

- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `.next`
- Node.js version: 20.x or 22.x

The local Windows environment should use `npm.cmd` because PowerShell blocks `npm.ps1`. Vercel runs on Linux, so Vercel project settings must use `npm install` and `npm run build`.

## 3. Environment Variables

Set these in **Vercel > Project > Settings > Environment Variables** for Production, Preview, and Development as appropriate:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR_VERCEL_DOMAIN
SUPABASE_STORAGE_BUCKET=borrower-documents
SUPABASE_HEALTHCHECK_SECRET=LONG_RANDOM_SECRET
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code. In Vercel it must remain a server-only environment variable.

## 4. Supabase Auth Redirects

In Supabase, add the deployed Vercel domain:

- Site URL: `https://YOUR_VERCEL_DOMAIN`
- Redirect URL: `https://YOUR_VERCEL_DOMAIN/dashboard`

When a custom domain is attached, add:

- Site URL: `https://YOUR_CUSTOM_DOMAIN`
- Redirect URL: `https://YOUR_CUSTOM_DOMAIN/dashboard`

## 5. Deployment Order

1. Apply Supabase migration.
2. Create production users and `profiles` rows.
3. Push the app to GitHub.
4. Import GitHub repo into Vercel.
5. Add Vercel environment variables.
6. Deploy.
7. Confirm the deployment health route.
8. Test login, route protection, RLS, CRUD, and document upload workflows.

## 6. Supabase Connection Check From Vercel

After deployment, open:

```text
https://YOUR_VERCEL_DOMAIN/api/health/supabase
```

Expected result when public Supabase env vars are set:

```json
{
  "ok": true,
  "status": "environment_present_database_check_skipped"
}
```

To run the protected database and storage check, send the secret:

```powershell
Invoke-RestMethod `
  -Uri "https://YOUR_VERCEL_DOMAIN/api/health/supabase" `
  -Headers @{ "x-healthcheck-secret" = "YOUR_SUPABASE_HEALTHCHECK_SECRET" }
```

Expected result:

```json
{
  "ok": true,
  "status": "supabase_connected",
  "bucket": "borrower-documents"
}
```

This confirms Vercel can reach Supabase, query the migrated database, and read the private storage bucket metadata using the server-only key.

## 7. Final Production Smoke Test

Run locally before pushing:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run lint
npm.cmd run qa:smoke
```

Then test the deployed Vercel URL on desktop and mobile widths.
