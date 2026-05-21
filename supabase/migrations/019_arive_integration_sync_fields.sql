alter table public.borrowers add column if not exists arive_loan_id text;
alter table public.borrowers add column if not exists arive_sync_status text default 'not_synced';
alter table public.borrowers add column if not exists arive_last_synced_at timestamptz;
alter table public.borrowers add column if not exists arive_sync_error text;
alter table public.borrowers add column if not exists sent_to_arive_at timestamptz;
notify pgrst, 'reload schema';
