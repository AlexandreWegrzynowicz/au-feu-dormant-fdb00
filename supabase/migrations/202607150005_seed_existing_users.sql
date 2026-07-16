-- Register users created before the application schema existed.
insert into public.profiles (id, email, display_name)
select
  users.id,
  coalesce(users.email, ''),
  coalesce(
    nullif(users.raw_user_meta_data ->> 'display_name', ''),
    split_part(coalesce(users.email, ''), '@', 1)
  )
from auth.users as users
on conflict (id) do update
set email = excluded.email,
    display_name = case
      when public.profiles.display_name = '' then excluded.display_name
      else public.profiles.display_name
    end,
    updated_at = now();

-- Bootstrap the oldest account only when no staff account exists yet.
update public.profiles
set role = 'administrateur', updated_at = now()
where id = (
  select users.id
  from auth.users as users
  order by users.created_at asc
  limit 1
)
and not exists (
  select 1
  from public.profiles
  where role in ('mj', 'administrateur')
);
