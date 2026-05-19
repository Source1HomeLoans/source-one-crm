alter table public.leads add column if not exists property_address text;
alter table public.borrowers add column if not exists borrower_status text;
notify pgrst, 'reload schema';
