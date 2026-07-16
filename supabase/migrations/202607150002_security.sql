-- Au Feu Dormant - authentication, roles and row level security

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_staff(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and role in ('mj', 'administrateur')
  );
$$;

create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and role = 'administrateur'
  );
$$;

create or replace function public.owns_character(p_character_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.characters
    where id = p_character_id
      and owner_id = p_user_id
  );
$$;

create or replace function public.can_access_character(p_character_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.owns_character(p_character_id, p_user_id) or public.is_staff(p_user_id);
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'factions', 'skill_catalog', 'talent_catalog', 'characters',
    'character_private_notes', 'character_skills', 'character_talents', 'quests',
    'quest_participants', 'item_catalog', 'inventory_items', 'gm_requests', 'mail',
    'mail_attachments', 'transfers', 'direct_sales', 'auctions', 'auction_bids',
    'character_history', 'audit_log', 'legacy_imports'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
  end loop;
end;
$$;

grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.is_staff(uuid) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.owns_character(uuid, uuid) to authenticated;
grant execute on function public.can_access_character(uuid, uuid) to authenticated;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_staff());

drop policy if exists profiles_staff_write on public.profiles;
create policy profiles_staff_write on public.profiles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists factions_read on public.factions;
create policy factions_read on public.factions
for select to authenticated
using (is_active or public.is_staff());

drop policy if exists factions_staff_write on public.factions;
create policy factions_staff_write on public.factions
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists skill_catalog_read on public.skill_catalog;
create policy skill_catalog_read on public.skill_catalog
for select to authenticated
using (is_active or public.is_staff());

drop policy if exists skill_catalog_staff_write on public.skill_catalog;
create policy skill_catalog_staff_write on public.skill_catalog
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists talent_catalog_read on public.talent_catalog;
create policy talent_catalog_read on public.talent_catalog
for select to authenticated
using (is_active or public.is_staff());

drop policy if exists talent_catalog_staff_write on public.talent_catalog;
create policy talent_catalog_staff_write on public.talent_catalog
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists characters_read on public.characters;
create policy characters_read on public.characters
for select to authenticated
using (owner_id = auth.uid() or public.is_staff());

drop policy if exists characters_staff_write on public.characters;
create policy characters_staff_write on public.characters
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists private_notes_staff_only on public.character_private_notes;
create policy private_notes_staff_only on public.character_private_notes
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists character_skills_read on public.character_skills;
create policy character_skills_read on public.character_skills
for select to authenticated
using (public.can_access_character(character_id));

drop policy if exists character_skills_staff_write on public.character_skills;
create policy character_skills_staff_write on public.character_skills
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists character_talents_read on public.character_talents;
create policy character_talents_read on public.character_talents
for select to authenticated
using (public.can_access_character(character_id));

drop policy if exists character_talents_staff_write on public.character_talents;
create policy character_talents_staff_write on public.character_talents
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists quests_read on public.quests;
create policy quests_read on public.quests
for select to authenticated
using (status = 'disponible' or public.is_staff());

drop policy if exists quests_staff_write on public.quests;
create policy quests_staff_write on public.quests
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists quest_participants_read on public.quest_participants;
create policy quest_participants_read on public.quest_participants
for select to authenticated
using (public.can_access_character(character_id));

drop policy if exists quest_participants_staff_write on public.quest_participants;
create policy quest_participants_staff_write on public.quest_participants
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists item_catalog_read on public.item_catalog;
create policy item_catalog_read on public.item_catalog
for select to authenticated
using (is_active or public.is_staff());

drop policy if exists item_catalog_staff_write on public.item_catalog;
create policy item_catalog_staff_write on public.item_catalog
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists inventory_read on public.inventory_items;
create policy inventory_read on public.inventory_items
for select to authenticated
using (public.can_access_character(character_id));

drop policy if exists inventory_staff_write on public.inventory_items;
create policy inventory_staff_write on public.inventory_items
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists requests_read on public.gm_requests;
create policy requests_read on public.gm_requests
for select to authenticated
using (public.can_access_character(character_id));

drop policy if exists requests_insert on public.gm_requests;
create policy requests_insert on public.gm_requests
for insert to authenticated
with check (public.owns_character(character_id));

drop policy if exists requests_staff_write on public.gm_requests;
create policy requests_staff_write on public.gm_requests
for update to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists mail_read on public.mail;
create policy mail_read on public.mail
for select to authenticated
using (recipient_id = auth.uid() or public.is_staff());

drop policy if exists mail_staff_write on public.mail;
create policy mail_staff_write on public.mail
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists mail_attachments_read on public.mail_attachments;
create policy mail_attachments_read on public.mail_attachments
for select to authenticated
using (
  exists (
    select 1 from public.mail m
    where m.id = mail_id
      and (m.recipient_id = auth.uid() or public.is_staff())
  )
);

drop policy if exists mail_attachments_staff_write on public.mail_attachments;
create policy mail_attachments_staff_write on public.mail_attachments
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists transfers_read on public.transfers;
create policy transfers_read on public.transfers
for select to authenticated
using (
  public.can_access_character(sender_character_id)
  or public.can_access_character(recipient_character_id)
);

drop policy if exists transfers_staff_write on public.transfers;
create policy transfers_staff_write on public.transfers
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists direct_sales_read on public.direct_sales;
create policy direct_sales_read on public.direct_sales
for select to authenticated
using (
  status = 'ouverte'
  or public.can_access_character(seller_character_id)
  or (buyer_character_id is not null and public.can_access_character(buyer_character_id))
);

drop policy if exists direct_sales_staff_write on public.direct_sales;
create policy direct_sales_staff_write on public.direct_sales
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists auctions_read on public.auctions;
create policy auctions_read on public.auctions
for select to authenticated
using (
  status = 'ouverte'
  or public.can_access_character(seller_character_id)
  or (current_bidder_character_id is not null and public.can_access_character(current_bidder_character_id))
);

drop policy if exists auctions_staff_write on public.auctions;
create policy auctions_staff_write on public.auctions
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists auction_bids_read on public.auction_bids;
create policy auction_bids_read on public.auction_bids
for select to authenticated
using (
  exists (
    select 1 from public.auctions a
    where a.id = auction_id
      and (
        a.status = 'ouverte'
        or public.can_access_character(a.seller_character_id)
        or public.can_access_character(bidder_character_id)
      )
  )
);

drop policy if exists auction_bids_staff_write on public.auction_bids;
create policy auction_bids_staff_write on public.auction_bids
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists history_read on public.character_history;
create policy history_read on public.character_history
for select to authenticated
using (
  public.is_staff()
  or (not is_private and public.owns_character(character_id))
);

drop policy if exists history_staff_write on public.character_history;
create policy history_staff_write on public.character_history
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists audit_staff_only on public.audit_log;
create policy audit_staff_only on public.audit_log
for select to authenticated
using (public.is_staff());

drop policy if exists legacy_imports_staff_only on public.legacy_imports;
create policy legacy_imports_staff_only on public.legacy_imports
for all to authenticated
using (public.is_staff())
with check (public.is_staff());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'factions', 'skill_catalog', 'talent_catalog', 'characters',
    'character_private_notes', 'character_skills', 'quests', 'item_catalog'
  ] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

