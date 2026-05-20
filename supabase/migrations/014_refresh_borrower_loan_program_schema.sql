alter table public.borrowers add column if not exists loan_program text;
notify pgrst, 'reload schema';
