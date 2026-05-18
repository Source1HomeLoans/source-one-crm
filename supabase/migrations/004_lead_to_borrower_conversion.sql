alter table public.borrowers
add column if not exists source_lead_id uuid references public.leads(id) on delete set null,
add column if not exists loan_purpose public.lead_loan_purpose,
add column if not exists estimated_loan_amount numeric(14, 2),
add column if not exists property_state text;

create unique index if not exists borrowers_source_lead_id_unique_idx
on public.borrowers(source_lead_id)
where source_lead_id is not null;

create index if not exists borrowers_owner_created_idx
on public.borrowers(owner_id, created_at desc);
