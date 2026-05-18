alter table public.leads
add column if not exists archived_at timestamptz,
add column if not exists deleted_at timestamptz,
add column if not exists property_address text,
add column if not exists property_type text;

alter table public.borrowers
add column if not exists credit_score_range text,
add column if not exists estimated_loan_amount numeric(14, 2),
add column if not exists loan_program public.loan_program_type,
add column if not exists loan_purpose public.lead_loan_purpose,
add column if not exists source_lead_id uuid references public.leads(id) on delete set null,
add column if not exists lead_source text,
add column if not exists property_state text,
add column if not exists property_address text,
add column if not exists property_type text,
add column if not exists archived_at timestamptz,
add column if not exists deleted_at timestamptz;

create unique index if not exists borrowers_source_lead_id_unique_idx
on public.borrowers(source_lead_id)
where source_lead_id is not null;

create index if not exists leads_owner_active_idx
on public.leads(owner_id, created_at desc)
where archived_at is null and deleted_at is null;

create index if not exists borrowers_owner_active_idx
on public.borrowers(owner_id, created_at desc)
where archived_at is null and deleted_at is null;

notify pgrst, 'reload schema';
