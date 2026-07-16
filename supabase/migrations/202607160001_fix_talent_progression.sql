-- Talent progression rule:
-- level 1 starts with 3 points, then every gained level grants 1 point.

alter table public.characters
  alter column talent_points set default 3;

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

-- Preserve selected talents and only correct the remaining balance.
with spent as (
  select
    c.id,
    coalesce(sum(tc.cost), 0)::integer as spent_points
  from public.characters c
  left join public.character_talents ct on ct.character_id = c.id
  left join public.talent_catalog tc on tc.id = ct.talent_id
  group by c.id
)
update public.characters c
set
  talent_points = greatest(0, (3 + greatest(c.level, 1) - 1) - spent.spent_points),
  updated_at = now()
from spent
where spent.id = c.id;

notify pgrst, 'reload schema';
