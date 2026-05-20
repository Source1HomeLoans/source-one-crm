alter table public.leads add column if not exists assigned_to uuid null;
alter table public.leads add column if not exists assigned_at timestamptz null;
alter table public.leads add column if not exists assignment_expires_at timestamptz null;
alter table public.leads add column if not exists converted_at timestamptz null;
alter table public.leads add column if not exists dnc_hold_until timestamptz null;
alter table public.leads add column if not exists archived_at timestamptz null;
alter table public.leads add column if not exists deleted_at timestamptz null;

notify pgrst, 'reload schema';
