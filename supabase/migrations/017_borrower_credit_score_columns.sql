alter table public.borrowers add column if not exists credit_score integer;
alter table public.borrowers add column if not exists credit_score_range text;
notify pgrst, 'reload schema';
