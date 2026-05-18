# Source One Mortgage CRM

Production-oriented Next.js CRM foundation for Source One Home Loans.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres with RLS
- Role-based permissions

## First Slice Included

- Auth-protected CRM shell with responsive desktop/mobile navigation
- Supabase sign-in, signup, password reset, logout, and session-protected routing
- Dashboard for lead follow-up, pipeline visibility, tasks, referral partners, secure document signals, and compliance indicators
- Module routes for dashboard, leads, borrowers, loan pipeline, referral partners, campaigns, tasks, notes, SMS/email activity, file uploads, and admin settings
- Database migration with mortgage-specific tables, enums, indexes, seed loan programs, admin settings, audit triggers, storage bucket policies, and RLS policies
- Role permissions for Admin, Loan Officer, Processor, and Marketing Assistant users
- Compliance-friendly audit trails, user activity tracking, export requests, consent fields, secure document metadata, and encrypted credit report safeguards
- Server actions for leads, borrowers, loans, referral partners, tasks, notes, communication logs, and secure document uploads

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment values:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in Supabase values in `.env.local`:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SITE_URL=
   SUPABASE_STORAGE_BUCKET=borrower-documents
   ```

4. Apply the database migration in Supabase:

   ```bash
   supabase db push
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

## Supabase Notes

- Create users through Supabase Auth.
- Insert a matching `profiles` row for each auth user with one of these roles: `admin`, `loan_officer`, `processor`, or `marketing_assistant`.
- Secure borrower files live in the private `borrower-documents` Supabase Storage bucket. The `secure_documents.storage_path` column stores the bucket path, not the file itself.
- Credit reports should not be stored as raw report data. Use `credit_report_metadata` with an encrypted storage path and key reference only.
- Lead and borrower communication consent is tracked with SMS/email consent flags, source, and collection timestamp.
- RLS policies are role-scoped: Admin has full access, Loan Officers are scoped to assigned records, Processors can update loan files and tasks, and Marketing Assistants can manage leads, campaigns, and referral partners.
- Full Supabase setup instructions live in [supabase/README.md](supabase/README.md).
- Vercel deployment instructions live in [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL used by browser and server clients.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key. RLS policies still control access.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only service role key for future admin jobs. Never expose it to the browser.
- `NEXT_PUBLIC_SITE_URL`: Public app URL for auth redirects, for example `https://crm.sourceonehomeloans.com`.
- `SUPABASE_STORAGE_BUCKET`: Private document bucket name. Defaults to `borrower-documents`.
- `SUPABASE_HEALTHCHECK_SECRET`: Shared secret for the protected Vercel-to-Supabase health check.

## Production Validation Checklist

1. Apply `supabase/migrations/001_initial_mortgage_crm.sql` to a live Supabase project.
2. Confirm the private `borrower-documents` bucket exists and the migration storage policies are active.
3. Create one real user per role and add matching `profiles` rows.
4. Validate signup, login, logout, password reset, and session expiration in the deployed URL configured in Supabase Auth.
5. Run CRUD checks for leads, borrowers, loans, partners, tasks, notes, communication history, and document uploads as each role.
6. Confirm denied reads/writes return Supabase RLS errors for unauthorized users.
7. Review audit logs and user activity events after create/update/delete workflows.
8. Confirm no credit report data is stored outside encrypted storage metadata.

## Roles

- Admin: full application and database access.
- Loan Officer: assigned leads, borrowers, loans, tasks, documents, notes, and activity.
- Processor: borrower visibility plus loan file, document, and task updates.
- Marketing Assistant: leads, campaigns, and referral partners.

## Suggested Next Steps

1. Wire existing demo list/detail screens to the server actions and live Supabase queries.
2. Add admin user invitation and role management workflows.
3. Add signed download actions for Supabase Storage.
4. Add borrower and loan detail pages with fully live activity timelines.
