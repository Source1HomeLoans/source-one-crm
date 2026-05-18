alter table public.borrowers
add column if not exists source_lead_id uuid references public.leads(id) on delete set null,
add column if not exists loan_purpose public.lead_loan_purpose,
add column if not exists loan_program public.loan_program_type,
add column if not exists estimated_loan_amount numeric(14, 2),
add column if not exists property_state text,
add column if not exists property_address text,
add column if not exists borrower_status text not null default 'file_started'
  check (borrower_status in ('file_started', 'docs_needed', 'submitted', 'approved', 'clear_to_close', 'funded', 'inactive')),
add column if not exists notes text;

create unique index if not exists borrowers_source_lead_id_unique_idx
on public.borrowers(source_lead_id)
where source_lead_id is not null;

create index if not exists borrowers_owner_status_idx
on public.borrowers(owner_id, borrower_status);

notify pgrst, 'reload schema';
