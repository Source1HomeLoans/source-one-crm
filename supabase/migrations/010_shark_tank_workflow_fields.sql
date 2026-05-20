alter table public.leads add column if not exists assigned_to uuid references public.profiles(id);
alter table public.leads add column if not exists dnc_hold_until timestamptz;
alter table public.leads add column if not exists shark_tank_status text;
alter table public.leads add column if not exists archived_at timestamptz;
alter table public.leads add column if not exists deleted_at timestamptz;

create index if not exists leads_shark_tank_status_idx
on public.leads(status, assigned_to, dnc_hold_until)
where archived_at is null and deleted_at is null;

notify pgrst, 'reload schema';
