alter table public.borrowers
add column if not exists borrower_status text not null default 'file_started';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'borrowers_borrower_status_check'
      and conrelid = 'public.borrowers'::regclass
  ) then
    alter table public.borrowers
    add constraint borrowers_borrower_status_check
    check (borrower_status in ('file_started', 'docs_needed', 'submitted', 'approved', 'clear_to_close', 'funded', 'inactive'));
  end if;
end $$;

create index if not exists borrowers_owner_status_idx
on public.borrowers(owner_id, borrower_status);

notify pgrst, 'reload schema';
