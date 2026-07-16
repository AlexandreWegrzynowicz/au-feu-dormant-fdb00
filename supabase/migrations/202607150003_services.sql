-- Au Feu Dormant - transactional application services

create or replace function public.write_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_details jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.audit_log (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_details, '{}'::jsonb));
$$;

create or replace function public.api_update_profile(p_display_name text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;

  update public.profiles
  set display_name = left(trim(coalesce(p_display_name, '')), 80),
      updated_at = now()
  where id = auth.uid()
  returning * into result;

  return result;
end;
$$;

create or replace function public.api_create_character(p_character jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  character_id uuid;
  active_count integer;
  character_name text := trim(coalesce(p_character ->> 'name', ''));
begin
  if auth.uid() is null then
    raise exception 'Connexion requise';
  end if;
  if character_name = '' then
    raise exception 'Le nom du personnage est obligatoire';
  end if;

  select count(*) into active_count
  from public.characters
  where owner_id = auth.uid()
    and status <> 'archivee';

  if active_count >= 3 and not public.is_staff() then
    raise exception 'Un joueur peut avoir au maximum trois personnages actifs';
  end if;

  insert into public.characters (
    owner_id, status, name, people, profession, guild, faction_id,
    rumor, story, lodge, public_notes, last_activity, skill_points, talent_points
  ) values (
    auth.uid(),
    case when public.is_staff() then coalesce(nullif(p_character ->> 'status', ''), 'brouillon') else 'brouillon' end,
    left(character_name, 100),
    left(coalesce(p_character ->> 'people', ''), 100),
    left(coalesce(p_character ->> 'profession', ''), 100),
    left(coalesce(p_character ->> 'guild', ''), 120),
    nullif(p_character ->> 'faction_id', '')::uuid,
    left(coalesce(p_character ->> 'rumor', ''), 500),
    left(coalesce(p_character ->> 'story', ''), 5000),
    left(coalesce(p_character ->> 'lodge', ''), 3000),
    left(coalesce(p_character ->> 'public_notes', ''), 3000),
    left(coalesce(p_character ->> 'last_activity', ''), 500),
    15,
    3
  ) returning id into character_id;

  insert into public.character_skills (character_id, skill_id, rank)
  select character_id, id, 0
  from public.skill_catalog
  where is_active
  on conflict do nothing;

  perform public.write_audit('character.create', 'character', character_id);
  return character_id;
end;
$$;

create or replace function public.api_update_character_identity(p_character_id uuid, p_character jsonb)
returns public.characters
language plpgsql
security definer
set search_path = public
as $$
declare
  current_character public.characters;
  result public.characters;
begin
  select * into current_character
  from public.characters
  where id = p_character_id
  for update;

  if not found or (current_character.owner_id <> auth.uid() and not public.is_staff()) then
    raise exception 'Fiche inaccessible';
  end if;
  if not public.is_staff() and current_character.status = 'en_attente' then
    raise exception 'La fiche est en attente de validation MJ';
  end if;

  update public.characters
  set name = left(trim(coalesce(p_character ->> 'name', name)), 100),
      people = left(coalesce(p_character ->> 'people', people), 100),
      profession = left(coalesce(p_character ->> 'profession', profession), 100),
      guild = left(coalesce(p_character ->> 'guild', guild), 120),
      faction_id = case
        when p_character ? 'faction_id' then nullif(p_character ->> 'faction_id', '')::uuid
        else faction_id
      end,
      rumor = left(coalesce(p_character ->> 'rumor', rumor), 500),
      story = left(coalesce(p_character ->> 'story', story), 5000),
      lodge = left(coalesce(p_character ->> 'lodge', lodge), 3000),
      public_notes = left(coalesce(p_character ->> 'public_notes', public_notes), 3000),
      last_activity = left(coalesce(p_character ->> 'last_activity', last_activity), 500),
      portrait_path = case when p_character ? 'portrait_path' then nullif(p_character ->> 'portrait_path', '') else portrait_path end,
      updated_at = now()
  where id = p_character_id
  returning * into result;

  if result.name = '' then
    raise exception 'Le nom du personnage est obligatoire';
  end if;

  perform public.write_audit('character.identity.update', 'character', p_character_id);
  return result;
end;
$$;

create or replace function public.api_submit_character(p_character_id uuid)
returns public.characters
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.characters;
begin
  update public.characters
  set status = 'en_attente', updated_at = now()
  where id = p_character_id
    and owner_id = auth.uid()
    and status = 'brouillon'
  returning * into result;

  if not found then
    raise exception 'Seul un brouillon vous appartenant peut etre soumis';
  end if;

  perform public.write_audit('character.submit', 'character', p_character_id);
  return result;
end;
$$;

create or replace function public.api_validate_character(p_character_id uuid, p_accepted boolean, p_response text default '')
returns public.characters
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.characters;
begin
  if not public.is_staff() then
    raise exception 'Droits MJ requis';
  end if;

  update public.characters
  set status = case when p_accepted then 'active' else 'brouillon' end,
      public_notes = case
        when trim(coalesce(p_response, '')) = '' then public_notes
        else left(p_response, 3000)
      end,
      validated_by = case when p_accepted then auth.uid() else null end,
      validated_at = case when p_accepted then now() else null end,
      updated_at = now()
  where id = p_character_id
    and status in ('brouillon', 'en_attente')
  returning * into result;

  if not found then
    raise exception 'Fiche introuvable ou deja traitee';
  end if;

  perform public.write_audit(
    case when p_accepted then 'character.validate' else 'character.reject' end,
    'character',
    p_character_id
  );
  return result;
end;
$$;

create or replace function public.api_staff_update_character(p_character_id uuid, p_patch jsonb)
returns public.characters
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.characters;
begin
  if not public.is_staff() then
    raise exception 'Droits MJ requis';
  end if;

  update public.characters
  set reputation = left(coalesce(p_patch ->> 'reputation', reputation), 100),
      notoriety = left(coalesce(p_patch ->> 'notoriety', notoriety), 100),
      balance = case when p_patch ? 'balance' then greatest(0, (p_patch ->> 'balance')::integer) else balance end,
      skill_points = case when p_patch ? 'skill_points' then greatest(0, (p_patch ->> 'skill_points')::integer) else skill_points end,
      talent_points = case when p_patch ? 'talent_points' then greatest(0, (p_patch ->> 'talent_points')::integer) else talent_points end,
      public_notes = left(coalesce(p_patch ->> 'public_notes', public_notes), 3000),
      last_activity = left(coalesce(p_patch ->> 'last_activity', last_activity), 500),
      updated_at = now()
  where id = p_character_id
  returning * into result;

  if not found then
    raise exception 'Personnage introuvable';
  end if;

  if p_patch ? 'private_note' then
    insert into public.character_private_notes (character_id, note, updated_by, updated_at)
    values (p_character_id, left(p_patch ->> 'private_note', 10000), auth.uid(), now())
    on conflict (character_id) do update
    set note = excluded.note,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at;
  end if;

  perform public.write_audit('character.staff.update', 'character', p_character_id, p_patch - 'private_note');
  return result;
end;
$$;

create or replace function public.api_allocate_skill(p_character_id uuid, p_skill_id uuid, p_points integer default 1)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  available_points integer;
  current_rank integer;
  maximum_rank integer;
begin
  if p_points <= 0 then
    raise exception 'Le nombre de points doit etre positif';
  end if;
  if not public.owns_character(p_character_id) and not public.is_staff() then
    raise exception 'Fiche inaccessible';
  end if;

  select skill_points into available_points
  from public.characters
  where id = p_character_id and status in ('brouillon', 'active')
  for update;

  if not found or available_points < p_points then
    raise exception 'Points de competence insuffisants';
  end if;

  select max_rank into maximum_rank
  from public.skill_catalog
  where id = p_skill_id and is_active;
  if not found then
    raise exception 'Competence introuvable';
  end if;

  select rank into current_rank
  from public.character_skills
  where character_id = p_character_id and skill_id = p_skill_id
  for update;
  current_rank := coalesce(current_rank, 0);

  if current_rank + p_points > maximum_rank then
    raise exception 'Rang maximum depasse';
  end if;

  insert into public.character_skills (character_id, skill_id, rank, updated_at)
  values (p_character_id, p_skill_id, current_rank + p_points, now())
  on conflict (character_id, skill_id) do update
  set rank = excluded.rank, updated_at = now();

  update public.characters
  set skill_points = skill_points - p_points, updated_at = now()
  where id = p_character_id;

  return jsonb_build_object('rank', current_rank + p_points, 'remaining', available_points - p_points);
end;
$$;

create or replace function public.api_acquire_talent(p_character_id uuid, p_talent_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  available_points integer;
  talent_cost integer;
begin
  if not public.owns_character(p_character_id) and not public.is_staff() then
    raise exception 'Fiche inaccessible';
  end if;

  select talent_points into available_points
  from public.characters
  where id = p_character_id and status in ('brouillon', 'active')
  for update;
  if not found then
    raise exception 'Personnage indisponible';
  end if;

  select cost into talent_cost
  from public.talent_catalog
  where id = p_talent_id and is_active;
  if not found then
    raise exception 'Talent introuvable';
  end if;
  if available_points < talent_cost then
    raise exception 'Points de talent insuffisants';
  end if;

  insert into public.character_talents (character_id, talent_id)
  values (p_character_id, p_talent_id);

  update public.characters
  set talent_points = talent_points - talent_cost, updated_at = now()
  where id = p_character_id;

  return jsonb_build_object('cost', talent_cost, 'remaining', available_points - talent_cost);
exception
  when unique_violation then
    raise exception 'Talent deja acquis';
end;
$$;

create or replace function public.api_reset_build(p_character_id uuid, p_kind text default 'both')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  character_level integer;
begin
  if not public.is_staff() then
    raise exception 'Droits MJ requis';
  end if;
  if p_kind not in ('skills', 'talents', 'both') then
    raise exception 'Type de reinitialisation invalide';
  end if;

  select level into character_level
  from public.characters where id = p_character_id for update;
  if not found then
    raise exception 'Personnage introuvable';
  end if;

  if p_kind in ('skills', 'both') then
    update public.character_skills set rank = 0, updated_at = now() where character_id = p_character_id;
    update public.characters set skill_points = 15 + character_level - 1 where id = p_character_id;
  end if;
  if p_kind in ('talents', 'both') then
    delete from public.character_talents where character_id = p_character_id;
    update public.characters set talent_points = 3 + character_level - 1 where id = p_character_id;
  end if;

  update public.characters set updated_at = now() where id = p_character_id;
  perform public.write_audit('character.build.reset', 'character', p_character_id, jsonb_build_object('kind', p_kind));
  return jsonb_build_object('skill_points', 15 + character_level - 1, 'talent_points', 3 + character_level - 1);
end;
$$;

create or replace function public.apply_xp(p_character_id uuid, p_amount integer, p_actor uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_level integer;
  current_xp integer;
  threshold integer;
  gained_levels integer := 0;
begin
  if p_amount < 0 then
    raise exception 'Le gain XP ne peut pas etre negatif';
  end if;

  select level, xp into current_level, current_xp
  from public.characters where id = p_character_id for update;
  if not found then
    raise exception 'Personnage introuvable';
  end if;

  current_xp := current_xp + p_amount;
  while current_level < 20 loop
    threshold := current_level * 100;
    exit when current_xp < threshold;
    current_xp := current_xp - threshold;
    current_level := current_level + 1;
    gained_levels := gained_levels + 1;
  end loop;

  if current_level = 20 then
    current_xp := least(current_xp, 20000);
  end if;

  update public.characters
  set level = current_level,
      xp = current_xp,
      skill_points = skill_points + gained_levels,
      talent_points = talent_points + gained_levels,
      updated_at = now()
  where id = p_character_id;

  insert into public.character_history (character_id, event_type, summary, created_by)
  values (
    p_character_id,
    'xp',
    p_amount || ' XP attribues' || case when gained_levels > 0 then ' - ' || gained_levels || ' niveau(x) gagne(s)' else '' end,
    p_actor
  );

  return jsonb_build_object(
    'level', current_level,
    'xp', current_xp,
    'levels_gained', gained_levels,
    'next_threshold', case when current_level = 20 then 20000 else current_level * 100 end
  );
end;
$$;

create or replace function public.api_grant_xp(p_character_id uuid, p_amount integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_staff() then
    raise exception 'Droits MJ requis';
  end if;
  result := public.apply_xp(p_character_id, p_amount, auth.uid());
  perform public.write_audit('character.xp.grant', 'character', p_character_id, jsonb_build_object('amount', p_amount));
  return result;
end;
$$;

create or replace function public.api_accept_quest(p_character_id uuid, p_quest_id uuid)
returns public.quest_participants
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.quest_participants;
begin
  if not public.owns_character(p_character_id) then
    raise exception 'Fiche inaccessible';
  end if;
  if not exists (select 1 from public.characters where id = p_character_id and status = 'active') then
    raise exception 'La fiche doit etre active';
  end if;
  if not exists (select 1 from public.quests where id = p_quest_id and status = 'disponible') then
    raise exception 'Quete indisponible';
  end if;

  insert into public.quest_participants (quest_id, character_id, status, accepted_at, completed_at)
  values (p_quest_id, p_character_id, 'en_cours', now(), null)
  on conflict (quest_id, character_id) do update
  set status = 'en_cours', accepted_at = now(), completed_at = null
  returning * into result;

  return result;
end;
$$;

create or replace function public.api_abandon_quest(p_character_id uuid, p_quest_id uuid)
returns public.quest_participants
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.quest_participants;
begin
  if not public.owns_character(p_character_id) then
    raise exception 'Fiche inaccessible';
  end if;

  update public.quest_participants
  set status = 'abandonnee', completed_at = now()
  where quest_id = p_quest_id
    and character_id = p_character_id
    and status = 'en_cours'
  returning * into result;

  if not found then
    raise exception 'Quete en cours introuvable';
  end if;
  return result;
end;
$$;

create or replace function public.api_buy_item(p_character_id uuid, p_catalog_item_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  character_balance integer;
  item public.item_catalog;
  inventory_count integer;
  inventory_id uuid;
begin
  if not public.owns_character(p_character_id) then
    raise exception 'Fiche inaccessible';
  end if;

  select balance into character_balance
  from public.characters where id = p_character_id and status = 'active' for update;
  if not found then raise exception 'Personnage inactif'; end if;

  select * into item
  from public.item_catalog where id = p_catalog_item_id and is_active for update;
  if not found or item.quantity <= 0 then raise exception 'Objet indisponible'; end if;
  if character_balance < item.price then raise exception 'Solde insuffisant'; end if;

  select count(*) into inventory_count
  from public.inventory_items where character_id = p_character_id;
  if inventory_count >= 10 then raise exception 'Inventaire plein (10 objets maximum)'; end if;

  update public.characters set balance = balance - item.price, updated_at = now() where id = p_character_id;
  update public.item_catalog set quantity = quantity - 1, updated_at = now() where id = item.id;
  insert into public.inventory_items (
    character_id, catalog_item_id, name, description, image_path, purchase_price
  ) values (
    p_character_id, item.id, item.name, item.description, item.image_path, item.price
  ) returning id into inventory_id;

  return inventory_id;
end;
$$;

create or replace function public.api_sell_inventory_item(p_character_id uuid, p_inventory_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item public.inventory_items;
  refund integer;
begin
  if not public.owns_character(p_character_id) then raise exception 'Fiche inaccessible'; end if;

  select * into item from public.inventory_items
  where id = p_inventory_item_id and character_id = p_character_id for update;
  if not found then raise exception 'Objet introuvable'; end if;
  if item.locked_reason is not null then raise exception 'Objet actuellement verrouille'; end if;

  refund := (item.purchase_price * 8 + 9) / 10;
  update public.characters set balance = balance + refund, updated_at = now() where id = p_character_id;
  if item.catalog_item_id is not null then
    update public.item_catalog set quantity = quantity + 1, updated_at = now() where id = item.catalog_item_id;
  end if;
  delete from public.inventory_items where id = item.id;

  return jsonb_build_object('refund', refund);
end;
$$;

create or replace function public.api_destroy_inventory_item(p_character_id uuid, p_inventory_item_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.owns_character(p_character_id) and not public.is_staff() then
    raise exception 'Fiche inaccessible';
  end if;
  delete from public.inventory_items
  where id = p_inventory_item_id
    and character_id = p_character_id
    and locked_reason is null;
  if not found then raise exception 'Objet introuvable ou verrouille'; end if;
  return true;
end;
$$;

create or replace function public.api_create_transfer(
  p_sender_character_id uuid,
  p_recipient_character_id uuid,
  p_inventory_item_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  transfer_id uuid;
begin
  if not public.owns_character(p_sender_character_id) then raise exception 'Fiche expediteur inaccessible'; end if;
  if not exists (select 1 from public.characters where id = p_recipient_character_id and status = 'active') then
    raise exception 'Destinataire introuvable';
  end if;
  if not exists (
    select 1 from public.inventory_items
    where id = p_inventory_item_id and character_id = p_sender_character_id and locked_reason is null
    for update
  ) then raise exception 'Objet indisponible'; end if;

  insert into public.transfers (sender_character_id, recipient_character_id, inventory_item_id)
  values (p_sender_character_id, p_recipient_character_id, p_inventory_item_id)
  returning id into transfer_id;
  update public.inventory_items set locked_reason = 'transfer:' || transfer_id where id = p_inventory_item_id;
  return transfer_id;
end;
$$;

create or replace function public.api_resolve_transfer(p_transfer_id uuid, p_accept boolean)
returns public.transfers
language plpgsql
security definer
set search_path = public
as $$
declare
  transfer_row public.transfers;
  result public.transfers;
  inventory_count integer;
begin
  select * into transfer_row from public.transfers where id = p_transfer_id for update;
  if not found or transfer_row.status <> 'en_attente' then raise exception 'Transfert indisponible'; end if;
  if not public.owns_character(transfer_row.recipient_character_id) and not public.is_staff() then
    raise exception 'Seul le destinataire peut repondre';
  end if;

  if p_accept then
    select count(*) into inventory_count from public.inventory_items where character_id = transfer_row.recipient_character_id;
    if inventory_count >= 10 then raise exception 'Inventaire du destinataire plein'; end if;
    update public.inventory_items
    set character_id = transfer_row.recipient_character_id, locked_reason = null
    where id = transfer_row.inventory_item_id;
  else
    update public.inventory_items set locked_reason = null where id = transfer_row.inventory_item_id;
  end if;

  update public.transfers
  set status = case when p_accept then 'accepte' else 'refuse' end, resolved_at = now()
  where id = p_transfer_id returning * into result;
  return result;
end;
$$;

create or replace function public.api_create_direct_sale(p_seller_character_id uuid, p_inventory_item_id uuid, p_price integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sale_id uuid;
begin
  if p_price <= 0 then raise exception 'Prix invalide'; end if;
  if not public.owns_character(p_seller_character_id) then raise exception 'Fiche inaccessible'; end if;
  if not exists (
    select 1 from public.inventory_items
    where id = p_inventory_item_id and character_id = p_seller_character_id and locked_reason is null
    for update
  ) then raise exception 'Objet indisponible'; end if;

  insert into public.direct_sales (seller_character_id, inventory_item_id, price)
  values (p_seller_character_id, p_inventory_item_id, p_price)
  returning id into sale_id;
  update public.inventory_items set locked_reason = 'sale:' || sale_id where id = p_inventory_item_id;
  return sale_id;
end;
$$;

create or replace function public.api_buy_direct_sale(p_sale_id uuid, p_buyer_character_id uuid)
returns public.direct_sales
language plpgsql
security definer
set search_path = public
as $$
declare
  sale_row public.direct_sales;
  buyer_balance integer;
  inventory_count integer;
  result public.direct_sales;
begin
  if not public.owns_character(p_buyer_character_id) then raise exception 'Fiche acheteur inaccessible'; end if;
  select * into sale_row from public.direct_sales where id = p_sale_id for update;
  if not found or sale_row.status <> 'ouverte' then raise exception 'Vente indisponible'; end if;
  if sale_row.seller_character_id = p_buyer_character_id then raise exception 'Achat de son propre objet impossible'; end if;

  select balance into buyer_balance from public.characters where id = p_buyer_character_id for update;
  if buyer_balance < sale_row.price then raise exception 'Solde insuffisant'; end if;
  select count(*) into inventory_count from public.inventory_items where character_id = p_buyer_character_id;
  if inventory_count >= 10 then raise exception 'Inventaire plein'; end if;

  update public.characters set balance = balance - sale_row.price, updated_at = now() where id = p_buyer_character_id;
  update public.characters set balance = balance + sale_row.price, updated_at = now() where id = sale_row.seller_character_id;
  update public.inventory_items set character_id = p_buyer_character_id, locked_reason = null where id = sale_row.inventory_item_id;
  update public.direct_sales
  set buyer_character_id = p_buyer_character_id, status = 'vendue', closed_at = now()
  where id = p_sale_id returning * into result;
  return result;
end;
$$;

create or replace function public.api_create_auction(
  p_seller_character_id uuid,
  p_inventory_item_id uuid,
  p_starting_price integer,
  p_duration_hours integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  auction_id uuid;
begin
  if p_starting_price <= 0 or p_duration_hours not in (24, 48, 72) then
    raise exception 'Parametres d enchere invalides';
  end if;
  if not public.owns_character(p_seller_character_id) then raise exception 'Fiche inaccessible'; end if;
  if not exists (
    select 1 from public.inventory_items
    where id = p_inventory_item_id and character_id = p_seller_character_id and locked_reason is null
    for update
  ) then raise exception 'Objet indisponible'; end if;

  insert into public.auctions (
    seller_character_id, inventory_item_id, starting_price, current_price, duration_hours, ends_at
  ) values (
    p_seller_character_id, p_inventory_item_id, p_starting_price, p_starting_price,
    p_duration_hours, now() + make_interval(hours => p_duration_hours)
  ) returning id into auction_id;
  update public.inventory_items set locked_reason = 'auction:' || auction_id where id = p_inventory_item_id;
  return auction_id;
end;
$$;

create or replace function public.api_place_bid(p_auction_id uuid, p_bidder_character_id uuid, p_amount integer)
returns public.auctions
language plpgsql
security definer
set search_path = public
as $$
declare
  auction_row public.auctions;
  bidder_balance integer;
  charge integer;
  result public.auctions;
begin
  if not public.owns_character(p_bidder_character_id) then raise exception 'Fiche inaccessible'; end if;
  select * into auction_row from public.auctions where id = p_auction_id for update;
  if not found or auction_row.status <> 'ouverte' or auction_row.ends_at <= now() then
    raise exception 'Enchere terminee';
  end if;
  if auction_row.seller_character_id = p_bidder_character_id then raise exception 'Encherir sur son objet est impossible'; end if;
  if p_amount <= auction_row.current_price then raise exception 'L offre doit depasser le prix actuel'; end if;

  select balance into bidder_balance from public.characters where id = p_bidder_character_id for update;
  charge := case
    when auction_row.current_bidder_character_id = p_bidder_character_id then p_amount - auction_row.current_price
    else p_amount
  end;
  if bidder_balance < charge then raise exception 'Solde insuffisant'; end if;

  if auction_row.current_bidder_character_id is not null
     and auction_row.current_bidder_character_id <> p_bidder_character_id then
    update public.characters
    set balance = balance + auction_row.current_price, updated_at = now()
    where id = auction_row.current_bidder_character_id;
  end if;
  update public.characters set balance = balance - charge, updated_at = now() where id = p_bidder_character_id;
  insert into public.auction_bids (auction_id, bidder_character_id, amount)
  values (p_auction_id, p_bidder_character_id, p_amount);
  update public.auctions
  set current_price = p_amount, current_bidder_character_id = p_bidder_character_id
  where id = p_auction_id returning * into result;
  return result;
end;
$$;

create or replace function public.api_close_due_auctions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  auction_row public.auctions;
  inventory_count integer;
  closed_count integer := 0;
begin
  for auction_row in
    select * from public.auctions
    where status = 'ouverte' and ends_at <= now()
    order by ends_at
    for update skip locked
  loop
    if auction_row.current_bidder_character_id is null then
      update public.inventory_items set locked_reason = null where id = auction_row.inventory_item_id;
      update public.auctions set status = 'invendue', closed_at = now() where id = auction_row.id;
    else
      select count(*) into inventory_count
      from public.inventory_items where character_id = auction_row.current_bidder_character_id;
      if inventory_count >= 10 then
        update public.characters
        set balance = balance + auction_row.current_price, updated_at = now()
        where id = auction_row.current_bidder_character_id;
        update public.inventory_items set locked_reason = null where id = auction_row.inventory_item_id;
        update public.auctions set status = 'invendue', closed_at = now() where id = auction_row.id;
      else
        update public.characters
        set balance = balance + auction_row.current_price, updated_at = now()
        where id = auction_row.seller_character_id;
        update public.inventory_items
        set character_id = auction_row.current_bidder_character_id, locked_reason = null
        where id = auction_row.inventory_item_id;
        update public.auctions set status = 'vendue', closed_at = now() where id = auction_row.id;
      end if;
    end if;
    closed_count := closed_count + 1;
  end loop;
  return closed_count;
end;
$$;

create or replace function public.api_claim_mail(p_mail_id uuid, p_character_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  mail_row public.mail;
  attachment public.mail_attachments;
  inventory_count integer;
  attachment_count integer;
  xp_result jsonb := '{}'::jsonb;
begin
  select * into mail_row from public.mail where id = p_mail_id for update;
  if not found or mail_row.recipient_id <> auth.uid() or mail_row.status <> 'envoye' then
    raise exception 'Courrier indisponible';
  end if;
  if not public.owns_character(p_character_id) then raise exception 'Fiche inaccessible'; end if;
  if mail_row.recipient_character_id is not null and mail_row.recipient_character_id <> p_character_id then
    raise exception 'Ce courrier est destine a un autre personnage';
  end if;

  select count(*) into inventory_count from public.inventory_items where character_id = p_character_id;
  select count(*) into attachment_count from public.mail_attachments where mail_id = p_mail_id;
  if inventory_count + attachment_count > 10 then raise exception 'Inventaire insuffisant pour les pieces jointes'; end if;

  update public.characters set balance = balance + mail_row.reward_balance, updated_at = now() where id = p_character_id;
  if mail_row.reward_xp > 0 then
    xp_result := public.apply_xp(p_character_id, mail_row.reward_xp, mail_row.sender_id);
  end if;

  for attachment in select * from public.mail_attachments where mail_id = p_mail_id loop
    insert into public.inventory_items (
      character_id, catalog_item_id, name, description, image_path, purchase_price
    ) values (
      p_character_id, attachment.catalog_item_id, attachment.name,
      attachment.description, attachment.image_path, 0
    );
  end loop;

  update public.mail set status = 'reclame', claimed_at = now() where id = p_mail_id;
  return jsonb_build_object('balance', mail_row.reward_balance, 'xp', xp_result, 'items', attachment_count);
end;
$$;

revoke execute on function public.write_audit(text, text, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.apply_xp(uuid, integer, uuid) from public, anon, authenticated;
revoke execute on function public.api_close_due_auctions() from public, anon, authenticated;
grant execute on function public.api_close_due_auctions() to service_role;

do $$
declare
  function_signature text;
begin
  foreach function_signature in array array[
    'public.api_update_profile(text)',
    'public.api_create_character(jsonb)',
    'public.api_update_character_identity(uuid,jsonb)',
    'public.api_submit_character(uuid)',
    'public.api_validate_character(uuid,boolean,text)',
    'public.api_staff_update_character(uuid,jsonb)',
    'public.api_allocate_skill(uuid,uuid,integer)',
    'public.api_acquire_talent(uuid,uuid)',
    'public.api_reset_build(uuid,text)',
    'public.api_grant_xp(uuid,integer)',
    'public.api_accept_quest(uuid,uuid)',
    'public.api_abandon_quest(uuid,uuid)',
    'public.api_buy_item(uuid,uuid)',
    'public.api_sell_inventory_item(uuid,uuid)',
    'public.api_destroy_inventory_item(uuid,uuid)',
    'public.api_create_transfer(uuid,uuid,uuid)',
    'public.api_resolve_transfer(uuid,boolean)',
    'public.api_create_direct_sale(uuid,uuid,integer)',
    'public.api_buy_direct_sale(uuid,uuid)',
    'public.api_create_auction(uuid,uuid,integer,integer)',
    'public.api_place_bid(uuid,uuid,integer)',
    'public.api_claim_mail(uuid,uuid)'
  ] loop
    execute format('revoke execute on function %s from public, anon', function_signature);
    execute format('grant execute on function %s to authenticated', function_signature);
  end loop;
end;
$$;
