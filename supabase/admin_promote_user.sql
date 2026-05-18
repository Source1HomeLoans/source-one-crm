-- Safe admin promotion script for Source One CRM.
-- Replace the email below, review the matched user, then run in Supabase SQL Editor.
-- This only updates an existing Supabase Auth user with a matching public.profiles row.

begin;

do $$
declare
  target_email text := 'source1homeloans@gmail.com';
  matched_profile public.profiles%rowtype;
begin
  select *
  into matched_profile
  from public.profiles
  where lower(email) = lower(target_email);

  if not found then
    raise exception 'No profile found for %. Create/sign up the Supabase Auth user first, then rerun this script.', target_email;
  end if;

  update public.profiles
  set role = 'admin'::public.app_role,
      is_active = true,
      updated_at = now()
  where id = matched_profile.id;

  raise notice 'Promoted % (%) to admin.', matched_profile.email, matched_profile.id;
end;
$$;

select id, full_name, email, role, is_active, updated_at
from public.profiles
where lower(email) = lower('source1homeloans@gmail.com');

commit;
