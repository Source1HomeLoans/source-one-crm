alter table public.borrowers add column if not exists arive_status text;
alter table public.borrowers add column if not exists arive_sent_at timestamptz;
alter table public.borrowers add column if not exists arive_reference_id text;
alter table public.borrowers add column if not exists arive_last_error text;
notify pgrst, 'reload schema';
