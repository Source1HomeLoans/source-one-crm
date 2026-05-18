# Source One CRM Supabase Setup Guide

This project is designed to be deployed Supabase-first, then Vercel-second. Apply the database and storage migration before connecting the hosted app.

## 1. Create The Supabase Project

1. Create a Supabase project for Source One Home Loans.
2. Save the project URL and anon key from **Project Settings > API**.
3. Save the service role key in a secure password manager. It is server-only and must never be exposed in browser code.
4. In **Authentication > URL Configuration**, set the site URL:
   - Local: `http://localhost:3000`
   - Production: `https://your-vercel-domain.vercel.app` or the final custom CRM domain
5. Add redirect URLs:
   - `http://localhost:3000/dashboard`
   - `https://your-vercel-domain.vercel.app/dashboard`
   - The final production domain dashboard URL, when known

## 2. Apply Migrations

The initial production schema is in:

```text
supabase/migrations/001_initial_mortgage_crm.sql
```

Then apply:

```text
supabase/migrations/002_auth_profile_trigger.sql
supabase/migrations/003_owner_admin_profile_trigger.sql
```

These migrations create CRM `profiles` automatically for new Supabase Auth users and backfill any existing Auth users without a profile. New users default to the `loan_officer` role. The owner email `source1homeloans@gmail.com` is assigned the `admin` role automatically.

It includes:

- `profiles` linked to `auth.users`
- leads
- borrowers
- loan programs
- loan pipeline records
- referral partners
- tasks and reminders
- notes
- communication history
- secure document metadata
- role permission overrides
- audit logs
- user activity events
- data exports
- encrypted credit report metadata safeguards
- Supabase Storage bucket setup for borrower documents
- Row Level Security policies
- audit triggers
- indexes
- seed loan programs
- initial CRM settings

Apply it with the Supabase CLI:

```powershell
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or paste the SQL into the Supabase SQL Editor and run it once against a new project.

## 3. Required Tables And Modules

| Module | Table or object |
| --- | --- |
| Users and roles | `auth.users`, `public.profiles`, `public.role_permission_overrides` |
| Leads | `public.leads` |
| Borrowers | `public.borrowers` |
| Loan pipeline | `public.loans`, `public.loan_programs` |
| Referral partners | `public.referral_partners` |
| Tasks | `public.tasks` |
| Notes | `public.notes` |
| Communication logs | `public.communication_history` |
| Document uploads | `public.secure_documents`, `storage.buckets`, `storage.objects` |
| Audit logs | `public.audit_logs`, `public.user_activity_events` |

## 4. Row Level Security Summary

All application tables have RLS enabled.

- Admins can access everything.
- Loan Officers are scoped to assigned leads, borrowers, loans, tasks, notes, communication logs, and documents.
- Processors can view borrowers and update loan files, loan documents, tasks, notes, and communication logs.
- Marketing Assistants can manage leads, campaigns, and referral partners.
- Audit logs, settings, and permission overrides are admin-only.
- Secure document storage is private. Files can be read by processors/admins or the assigned loan officer through matching `secure_documents` metadata.

## 5. Storage Bucket

The migration creates a private bucket:

```text
borrower-documents
```

The app stores files in Supabase Storage and stores only the storage path plus compliance metadata in `public.secure_documents`.

Do not mark this bucket public. Use signed URLs or server actions for download workflows.

## 6. Create Production Users

1. Create users in Supabase Auth or let users sign up from the CRM.
2. The `on_auth_user_created` trigger creates matching `profiles` rows automatically.
3. To manually repair or create a profile, use the user's real Auth UUID:

```sql
insert into public.profiles (id, full_name, email, role, nmls_id, phone)
values (
  'AUTH_USER_UUID',
  'Jane Loan Officer',
  'jane@example.com',
  'loan_officer',
  'NMLS123456',
  '555-555-0100'
);
```

Allowed roles:

- `admin`
- `loan_officer`
- `processor`
- `marketing_assistant`

To promote a user safely, edit and run:

```text
supabase/admin_promote_user.sql
```

The default target email in that script is `source1homeloans@gmail.com`.

## 7. Required Supabase Environment Variables

Use these locally in `.env.local` and in Vercel Project Settings:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_STORAGE_BUCKET=borrower-documents
SUPABASE_HEALTHCHECK_SECRET=
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for browser auth and middleware.
- `SUPABASE_SERVICE_ROLE_KEY` is required for protected server-side deployment health checks and future admin jobs.
- `NEXT_PUBLIC_SITE_URL` must match the deployed app URL for auth redirects.
- `SUPABASE_STORAGE_BUCKET` should stay `borrower-documents` unless you also change the migration.
- `SUPABASE_HEALTHCHECK_SECRET` protects the Vercel/Supabase health check route.

## 8. Validate Supabase Before Vercel

After migration:

1. Confirm seed records exist in `public.loan_programs`.
2. Confirm the private `borrower-documents` bucket exists.
3. Create one user per role and matching `profiles` rows.
4. Test RLS from the SQL Editor by impersonating users or using authenticated sessions.
5. Confirm audit rows appear after inserts/updates/deletes.
6. Confirm document metadata writes to `secure_documents`.
