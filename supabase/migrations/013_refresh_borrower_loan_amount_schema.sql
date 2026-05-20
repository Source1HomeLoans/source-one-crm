alter table public.borrowers add column if not exists estimated_loan_amount numeric;
notify pgrst, 'reload schema';
