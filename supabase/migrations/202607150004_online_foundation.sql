-- Au Feu Dormant - online foundation, seed data and protected media.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('character-portraits', 'character-portraits', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('item-images', 'item-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('faction-images', 'faction-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('quest-images', 'quest-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated media read" on storage.objects;
create policy "Authenticated media read"
on storage.objects for select to authenticated
using (bucket_id in ('character-portraits', 'item-images', 'faction-images', 'quest-images'));

drop policy if exists "Owners and staff upload media" on storage.objects;
create policy "Owners and staff upload media"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('character-portraits', 'item-images', 'faction-images', 'quest-images')
  and (
    public.is_staff()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Owners and staff update media" on storage.objects;
create policy "Owners and staff update media"
on storage.objects for update to authenticated
using (
  bucket_id in ('character-portraits', 'item-images', 'faction-images', 'quest-images')
  and (public.is_staff() or owner_id::text = auth.uid()::text)
)
with check (
  bucket_id in ('character-portraits', 'item-images', 'faction-images', 'quest-images')
  and (public.is_staff() or owner_id::text = auth.uid()::text)
);

drop policy if exists "Owners and staff delete media" on storage.objects;
create policy "Owners and staff delete media"
on storage.objects for delete to authenticated
using (
  bucket_id in ('character-portraits', 'item-images', 'faction-images', 'quest-images')
  and (public.is_staff() or owner_id::text = auth.uid()::text)
);

insert into public.skill_catalog (legacy_id, name, description, max_rank)
values
  ('survie', 'Survie', 'Tenir sur la route, lire les traces et eviter les pieges naturels.', 20),
  ('negociation', 'Negociation', 'Obtenir un accord, marchander et convaincre sans violence.', 20),
  ('discretion', 'Discretion', 'Passer sans bruit, disparaitre dans une foule et observer sans etre vu.', 20),
  ('combat', 'Combat', 'Tenir une arme, proteger un allie et survivre a une escarmouche.', 20),
  ('artisanat', 'Artisanat', 'Reparer, fabriquer et identifier la valeur d un objet.', 20),
  ('erudition', 'Erudition', 'Connaitre les textes, les peuples, les symboles et les vieilles histoires.', 20)
on conflict (legacy_id) do update set
  name = excluded.name,
  description = excluded.description,
  max_rank = excluded.max_rank,
  is_active = true;

insert into public.talent_catalog (legacy_id, name, description, cost)
values
  ('oreille-comptoir', 'Oreille du comptoir', 'Le personnage capte plus facilement les rumeurs utiles.', 1),
  ('main-ferme', 'Main ferme', 'Le personnage garde son calme sous pression.', 1),
  ('pas-feutres', 'Pas feutres', 'Le personnage gagne un avantage narratif en infiltration.', 1),
  ('sang-froid', 'Sang-froid', 'Une fois par intrigue, le personnage peut ignorer une intimidation.', 2),
  ('nom-qui-circule', 'Nom qui circule', 'La notoriete progresse plus vite quand une action est publique.', 2)
on conflict (legacy_id) do update set
  name = excluded.name,
  description = excluded.description,
  cost = excluded.cost,
  is_active = true;

insert into public.factions (legacy_id, name, description, bonus)
values
  ('hector', 'Les Gens d Hector', 'Ceux qui rendent service au comptoir avant de demander une faveur.', '+1 point social lorsque l auberge est impliquee.'),
  ('routes', 'Les Routes Salees', 'Marins, convoyeurs, guides et voyageurs qui sentent encore le sel.', '+1 en Survie lors des voyages ou affaires maritimes.'),
  ('plumes', 'Les Plumes Blanches', 'Informateurs, faussaires, messagers et diplomates de l ombre.', '+1 en Negociation quand une rumeur peut changer l issue.'),
  ('clefs', 'Les Clefs Rouillees', 'Ceux qui trouvent toujours une porte, meme quand elle n existe pas.', '+1 en Discretion pour entrer, sortir ou ouvrir sans bruit.'),
  ('jardin', 'Le Jardin Clos', 'Alchimistes discrets, soigneurs troubles et connaisseurs de recettes interdites.', '+1 en Erudition pour herbes, poisons, remedes et substances.')
on conflict (legacy_id) do update set
  name = excluded.name,
  description = excluded.description,
  bonus = excluded.bonus,
  is_active = true;

drop policy if exists auction_bids_read on public.auction_bids;
create policy auction_bids_read on public.auction_bids
for select to authenticated
using (
  exists (
    select 1
    from public.auctions a
    where a.id = auction_bids.auction_id
      and (
        a.status = 'ouverte'
        or public.can_access_character(a.seller_character_id)
        or public.can_access_character(auction_bids.bidder_character_id)
      )
  )
);

create or replace function public.api_claim_first_admin()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if exists (select 1 from public.profiles where role in ('mj', 'administrateur')) then
    raise exception 'ADMIN_ALREADY_CONFIGURED';
  end if;

  update public.profiles
  set role = 'administrateur', updated_at = now()
  where id = auth.uid()
  returning * into result;

  return result;
end;
$$;

create or replace function public.api_set_profile_role(p_email text, p_role text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if p_role not in ('joueur', 'mj', 'administrateur') then
    raise exception 'INVALID_ROLE';
  end if;

  update public.profiles
  set role = p_role, updated_at = now()
  where lower(email) = lower(trim(p_email))
  returning * into result;

  if result.id is null then
    raise exception 'PROFILE_NOT_FOUND';
  end if;
  return result;
end;
$$;

create or replace function public.api_assign_character_owner(p_character_id uuid, p_email text)
returns public.characters
language plpgsql
security definer
set search_path = public
as $$
declare
  target_owner uuid;
  result public.characters;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select id into target_owner
  from public.profiles
  where lower(email) = lower(trim(p_email));

  if target_owner is null then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  update public.characters
  set owner_id = target_owner, updated_at = now()
  where id = p_character_id
  returning * into result;

  return result;
end;
$$;

grant execute on function public.api_claim_first_admin() to authenticated;
grant execute on function public.api_set_profile_role(text, text) to authenticated;
grant execute on function public.api_assign_character_owner(uuid, text) to authenticated;
