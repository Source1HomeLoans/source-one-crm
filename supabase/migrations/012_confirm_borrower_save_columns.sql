alter table public.borrowers add column if not exists loan_program public.loan_program_type;
alter table public.borrowers add column if not exists estimated_loan_amount numeric(14, 2);
alter table public.borrowers add column if not exists property_address text;
alter table public.borrowers add column if not exists property_state text;
alter table public.borrowers add column if not exists borrower_status text;
alter table public.borrowers add column if not exists notes text;
alter table public.borrowers add column if not exists archived_at timestamptz;
alter table public.borrowers add column if not exists deleted_at timestamptz;

notify pgrst, 'reload schema';
