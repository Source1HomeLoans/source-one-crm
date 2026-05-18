create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'loan_officer', 'processor', 'marketing_assistant');
create type public.lead_status as enum ('new', 'contacted', 'prequalified', 'application_sent', 'in_process', 'closed', 'lost');
create type public.loan_stage as enum ('new_lead', 'contacted', 'prequalified', 'application_sent', 'docs_needed', 'submitted_to_lender', 'conditional_approval', 'clear_to_close', 'funded', 'lost');
create type public.loan_program_type as enum ('conventional', 'fha', 'va', 'dscr', 'bank_statement', 'p_and_l', 'no_doc', 'non_qm', 'hard_money');
create type public.lead_loan_purpose as enum ('purchase', 'refinance', 'dscr', 'bank_statement', 'p_and_l', 'no_doc');
create type public.task_status as enum ('open', 'completed', 'overdue');
create type public.communication_channel as enum ('call', 'text', 'email', 'note', 'system_update');
create type public.document_status as enum ('requested', 'uploaded', 'reviewed', 'accepted', 'rejected', 'expired');
create type public.partner_status as enum ('prospect', 'active', 'vip', 'inactive');
create type public.export_status as enum ('requested', 'processing', 'completed', 'failed', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'loan_officer',
  nmls_id text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.referral_partners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id),
  company_name text not null,
  contact_name text not null,
  partner_type text not null check (partner_type in ('realtor', 'builder', 'cpa', 'attorney', 'investor', 'financial_advisor', 'past_client', 'other')),
  market_city text,
  status public.partner_status not null default 'prospect',
  referrals_sent integer not null default 0 check (referrals_sent >= 0),
  email text,
  phone text,
  source_score integer not null default 50 check (source_score between 0 and 100),
  last_touch_at timestamptz,
  notes text,
  follow_up_task text,
  follow_up_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.borrowers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  referral_partner_id uuid references public.referral_partners(id),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  credit_score integer check (credit_score between 300 and 850),
  annual_income numeric(14, 2),
  consent_to_contact boolean not null default false,
  sms_consent boolean not null default false,
  email_consent boolean not null default false,
  consent_collected_at timestamptz,
  consent_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  borrower_id uuid references public.borrowers(id) on delete set null,
  referral_partner_id uuid references public.referral_partners(id),
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  status public.lead_status not null default 'new',
  source text not null default 'direct',
  loan_purpose public.lead_loan_purpose not null default 'purchase',
  intent text,
  desired_loan_program public.loan_program_type,
  estimated_loan_amount numeric(14, 2),
  credit_score_range text check (credit_score_range in ('below_580', '580_619', '620_679', '680_739', '740_plus', 'unknown')),
  property_state text,
  next_follow_up_at timestamptz,
  last_contact_at timestamptz,
  notes text,
  sms_consent boolean not null default false,
  email_consent boolean not null default false,
  consent_collected_at timestamptz,
  consent_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.loan_programs (
  id uuid primary key default gen_random_uuid(),
  program_type public.loan_program_type not null,
  name text not null,
  description text not null,
  min_credit_score integer,
  max_ltv numeric(5, 2),
  requires_income_docs boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  borrower_id uuid not null references public.borrowers(id),
  lead_id uuid references public.leads(id),
  loan_program_id uuid references public.loan_programs(id),
  stage public.loan_stage not null default 'new_lead',
  subject_property_address text,
  property_state text,
  purchase_price numeric(14, 2),
  loan_amount numeric(14, 2),
  interest_rate numeric(5, 3),
  target_close_date date,
  lock_expires_at timestamptz,
  conditions_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  borrower_id uuid references public.borrowers(id),
  lead_id uuid references public.leads(id),
  loan_id uuid references public.loans(id),
  referral_partner_id uuid references public.referral_partners(id),
  title text not null,
  description text,
  related_name text,
  related_type text check (related_type in ('lead', 'borrower', 'partner', 'loan')),
  status public.task_status not null default 'open',
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  borrower_id uuid references public.borrowers(id),
  lead_id uuid references public.leads(id),
  loan_id uuid references public.loans(id),
  referral_partner_id uuid references public.referral_partners(id),
  body text not null,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.communication_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  borrower_id uuid references public.borrowers(id),
  lead_id uuid references public.leads(id),
  loan_id uuid references public.loans(id),
  referral_partner_id uuid references public.referral_partners(id),
  channel public.communication_channel not null,
  direction text not null default 'internal' check (direction in ('inbound', 'outbound', 'internal', 'system')),
  subject text,
  summary text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.secure_documents (
  id uuid primary key default gen_random_uuid(),
  borrower_id uuid not null references public.borrowers(id),
  loan_id uuid references public.loans(id),
  requested_by uuid references public.profiles(id),
  document_type text not null,
  storage_path text not null,
  status public.document_status not null default 'requested',
  contains_pii boolean not null default true,
  encrypted_at_rest boolean not null default true,
  encryption_key_ref text,
  uploaded_by uuid references public.profiles(id),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  entity_table text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.user_activity_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.data_exports (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.profiles(id),
  export_type text not null check (export_type in ('leads', 'borrowers', 'loans', 'partners', 'tasks', 'audit_logs', 'full_crm')),
  status public.export_status not null default 'requested',
  storage_path text,
  filters jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.credit_report_metadata (
  id uuid primary key default gen_random_uuid(),
  borrower_id uuid not null references public.borrowers(id),
  loan_id uuid references public.loans(id),
  bureau text,
  report_reference text not null,
  encrypted_storage_path text,
  encryption_key_ref text not null,
  encrypted_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  constraint credit_reports_require_encryption check (encrypted_storage_path is not null and encryption_key_ref <> '')
);

create table public.crm_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Source One Home Loans',
  primary_nmls_id text,
  support_email text,
  default_timezone text not null default 'America/Phoenix',
  sms_compliance_footer text,
  email_compliance_footer text,
  lead_sla_minutes integer not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.role_permission_overrides (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null,
  permission_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (role, permission_key)
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null,
  audience text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  channel text not null default 'email' check (channel in ('email', 'sms', 'phone', 'multi_channel')),
  leads_count integer not null default 0 check (leads_count >= 0),
  last_sent_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.can_manage_all_records()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'admin'
$$;

create or replace function public.can_manage_marketing_records()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() in ('admin', 'marketing_assistant')
$$;

create or replace function public.can_process_loan_files()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() in ('admin', 'processor')
$$;

alter table public.profiles enable row level security;
alter table public.referral_partners enable row level security;
alter table public.borrowers enable row level security;
alter table public.leads enable row level security;
alter table public.loan_programs enable row level security;
alter table public.loans enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.communication_history enable row level security;
alter table public.secure_documents enable row level security;
alter table public.audit_logs enable row level security;
alter table public.user_activity_events enable row level security;
alter table public.data_exports enable row level security;
alter table public.credit_report_metadata enable row level security;
alter table public.crm_settings enable row level security;
alter table public.role_permission_overrides enable row level security;
alter table public.campaigns enable row level security;

create policy "profiles are visible to authenticated users" on public.profiles for select to authenticated using (true);
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "loan programs readable" on public.loan_programs for select to authenticated using (is_active = true or public.can_manage_all_records());
create policy "admins manage loan programs" on public.loan_programs for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "marketing can read referral partners" on public.referral_partners for select to authenticated using (owner_id = auth.uid() or public.can_manage_marketing_records());
create policy "marketing can write referral partners" on public.referral_partners for all to authenticated using (owner_id = auth.uid() or public.can_manage_marketing_records()) with check (owner_id = auth.uid() or public.can_manage_marketing_records());

create policy "assigned loan team reads borrowers" on public.borrowers for select to authenticated using (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor');
create policy "assigned loan officers write borrowers" on public.borrowers for all to authenticated using (owner_id = auth.uid() or public.can_manage_all_records()) with check (owner_id = auth.uid() or public.can_manage_all_records());

create policy "assigned or marketing reads leads" on public.leads for select to authenticated using (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'marketing_assistant');
create policy "assigned or marketing writes leads" on public.leads for all to authenticated using (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'marketing_assistant') with check (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'marketing_assistant');

create policy "assigned loan team reads loans" on public.loans for select to authenticated using (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor');
create policy "assigned loan team writes loans" on public.loans for all to authenticated using (owner_id = auth.uid() or public.can_process_loan_files()) with check (owner_id = auth.uid() or public.can_process_loan_files());

create policy "task team reads tasks" on public.tasks for select to authenticated using (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor');
create policy "task team writes tasks" on public.tasks for all to authenticated using (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor') with check (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor');

create policy "role permitted users read notes" on public.notes for select to authenticated using (author_id = auth.uid() or is_private = false or public.can_manage_all_records() or public.current_user_role() = 'processor');
create policy "role permitted users write notes" on public.notes for all to authenticated using (author_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor') with check (author_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor');

create policy "permitted users read communication" on public.communication_history for select to authenticated using (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor');
create policy "permitted users write communication" on public.communication_history for all to authenticated using (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor') with check (owner_id = auth.uid() or public.can_manage_all_records() or public.current_user_role() = 'processor');

create policy "document access is owner or processor" on public.secure_documents for select to authenticated using (
  public.can_process_loan_files()
  or exists (
    select 1 from public.borrowers b
    where b.id = secure_documents.borrower_id and b.owner_id = auth.uid()
  )
);
create policy "loan team can request documents" on public.secure_documents for insert to authenticated with check (
  requested_by = auth.uid()
  or public.current_user_role() in ('admin', 'processor')
);
create policy "processors can update loan documents" on public.secure_documents for update to authenticated using (public.can_process_loan_files()) with check (public.can_process_loan_files());
create policy "admin audit read" on public.audit_logs for select to authenticated using (public.current_user_role() = 'admin');
create policy "admin user activity read" on public.user_activity_events for select to authenticated using (public.current_user_role() = 'admin');
create policy "authenticated users record own activity" on public.user_activity_events for insert to authenticated with check (actor_id = auth.uid() or public.current_user_role() = 'admin');
create policy "admin exports read" on public.data_exports for select to authenticated using (public.current_user_role() = 'admin' or requested_by = auth.uid());
create policy "admin exports write" on public.data_exports for all to authenticated using (public.current_user_role() = 'admin' or requested_by = auth.uid()) with check (public.current_user_role() = 'admin' or requested_by = auth.uid());
create policy "credit report metadata loan team read" on public.credit_report_metadata for select to authenticated using (
  public.can_process_loan_files()
  or exists (
    select 1 from public.borrowers b
    where b.id = credit_report_metadata.borrower_id and b.owner_id = auth.uid()
  )
);
create policy "credit report metadata processor write" on public.credit_report_metadata for all to authenticated using (public.can_process_loan_files()) with check (public.can_process_loan_files());
create policy "admins read settings" on public.crm_settings for select to authenticated using (public.current_user_role() = 'admin');
create policy "admins write settings" on public.crm_settings for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admins read permission overrides" on public.role_permission_overrides for select to authenticated using (public.current_user_role() = 'admin');
create policy "admins write permission overrides" on public.role_permission_overrides for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "marketing reads campaigns" on public.campaigns for select to authenticated using (owner_id = auth.uid() or public.can_manage_marketing_records());
create policy "marketing writes campaigns" on public.campaigns for all to authenticated using (owner_id = auth.uid() or public.can_manage_marketing_records()) with check (owner_id = auth.uid() or public.can_manage_marketing_records());

insert into storage.buckets (id, name, public)
values ('borrower-documents', 'borrower-documents', false)
on conflict (id) do nothing;

create policy "authenticated users upload borrower documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'borrower-documents');

create policy "document owners and processors can read borrower files"
on storage.objects for select to authenticated
using (
  bucket_id = 'borrower-documents'
  and (
    public.can_process_loan_files()
    or exists (
      select 1
      from public.secure_documents d
      join public.borrowers b on b.id = d.borrower_id
      where d.storage_path = storage.objects.name
      and b.owner_id = auth.uid()
    )
  )
);

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_id uuid;
  before_payload jsonb;
  after_payload jsonb;
begin
  if tg_op = 'INSERT' then
    record_id := new.id;
    after_payload := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    record_id := new.id;
    before_payload := to_jsonb(old);
    after_payload := to_jsonb(new);
  else
    record_id := old.id;
    before_payload := to_jsonb(old);
  end if;

  insert into public.audit_logs (
    actor_id,
    entity_table,
    entity_id,
    action,
    before_data,
    after_data
  )
  values (
    auth.uid(),
    tg_table_name,
    record_id,
    tg_op,
    before_payload,
    after_payload
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger audit_referral_partners after insert or update or delete on public.referral_partners for each row execute function public.write_audit_log();
create trigger audit_borrowers after insert or update or delete on public.borrowers for each row execute function public.write_audit_log();
create trigger audit_leads after insert or update or delete on public.leads for each row execute function public.write_audit_log();
create trigger audit_loans after insert or update or delete on public.loans for each row execute function public.write_audit_log();
create trigger audit_tasks after insert or update or delete on public.tasks for each row execute function public.write_audit_log();
create trigger audit_notes after insert or update or delete on public.notes for each row execute function public.write_audit_log();
create trigger audit_communication after insert or update or delete on public.communication_history for each row execute function public.write_audit_log();
create trigger audit_secure_documents after insert or update or delete on public.secure_documents for each row execute function public.write_audit_log();
create trigger audit_data_exports after insert or update or delete on public.data_exports for each row execute function public.write_audit_log();
create trigger audit_credit_report_metadata after insert or update or delete on public.credit_report_metadata for each row execute function public.write_audit_log();
create trigger audit_crm_settings after insert or update or delete on public.crm_settings for each row execute function public.write_audit_log();
create trigger audit_role_permission_overrides after insert or update or delete on public.role_permission_overrides for each row execute function public.write_audit_log();
create trigger audit_campaigns after insert or update or delete on public.campaigns for each row execute function public.write_audit_log();

create index leads_owner_follow_up_idx on public.leads(owner_id, next_follow_up_at);
create index loans_owner_stage_idx on public.loans(owner_id, stage);
create index tasks_owner_due_idx on public.tasks(owner_id, due_at) where status <> 'completed';
create index communication_borrower_idx on public.communication_history(borrower_id, occurred_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_table, entity_id, created_at desc);
create index user_activity_actor_idx on public.user_activity_events(actor_id, created_at desc);
create index data_exports_requested_by_idx on public.data_exports(requested_by, created_at desc);
create index credit_report_metadata_borrower_idx on public.credit_report_metadata(borrower_id, created_at desc);

insert into public.loan_programs (program_type, name, description, min_credit_score, max_ltv, requires_income_docs) values
('conventional', 'Conventional Purchase or Refinance', 'Agency loan options for well-qualified primary, second home, and investment borrowers.', 620, 97.00, true),
('fha', 'FHA', 'Government-backed financing with flexible credit and down payment options.', 580, 96.50, true),
('va', 'VA', 'VA-backed purchase and refinance options for eligible veterans and service members.', 580, 100.00, true),
('dscr', 'DSCR Investor Loan', 'Debt-service coverage underwriting for rental investors using property cash flow.', 660, 80.00, false),
('bank_statement', 'Bank Statement', 'Self-employed borrower option using business or personal bank statement deposits.', 640, 85.00, false),
('p_and_l', 'P&L Loan', 'Alternative income documentation using CPA or borrower-prepared profit and loss.', 660, 80.00, false),
('no_doc', 'No Doc', 'Asset and equity-focused option for qualified borrowers with limited income documentation.', 700, 70.00, false),
('non_qm', 'Non-QM', 'Flexible non-agency options for complex borrower profiles and property scenarios.', 620, 90.00, false),
('hard_money', 'Hard Money', 'Asset-based short-term financing for investors, fix-and-flip projects, and bridge scenarios.', 620, 75.00, false);

insert into public.crm_settings (company_name, primary_nmls_id, support_email, sms_compliance_footer, email_compliance_footer)
values (
  'Source One Home Loans',
  'NMLS 000000',
  'support@sourceonehomeloans.com',
  'Reply STOP to opt out. Msg/data rates may apply.',
  'This message may contain confidential mortgage information intended only for the recipient.'
);
