create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'New CRM User'),
    new.email,
    case
      when lower(new.email) = 'source1homeloans@gmail.com' then 'admin'::public.app_role
      else 'loan_officer'::public.app_role
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = case
      when lower(excluded.email) = 'source1homeloans@gmail.com' then 'admin'::public.app_role
      else public.profiles.role
    end,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.profiles (id, full_name, email, role)
select
  users.id,
  coalesce(nullif(users.raw_user_meta_data->>'full_name', ''), split_part(users.email, '@', 1), 'New CRM User'),
  users.email,
  case
    when lower(users.email) = 'source1homeloans@gmail.com' then 'admin'::public.app_role
    else 'loan_officer'::public.app_role
  end
from auth.users
on conflict (id) do update
set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  role = case
    when lower(excluded.email) = 'source1homeloans@gmail.com' then 'admin'::public.app_role
    else public.profiles.role
  end,
  updated_at = now();

update public.profiles
set role = 'admin'::public.app_role, updated_at = now()
where lower(email) = 'source1homeloans@gmail.com';
