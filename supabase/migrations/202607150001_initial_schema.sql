-- Au Feu Dormant - secure online schema
-- Run through the Supabase CLI or SQL editor as the postgres role.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role text not null default 'joueur' check (role in ('joueur', 'mj', 'administrateur')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.factions (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  description text not null default '',
  bonus text not null default '',
  image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_catalog (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  description text not null default '',
  max_rank integer not null default 20 check (max_rank between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.talent_catalog (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  description text not null default '',
  cost integer not null default 1 check (cost between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'brouillon' check (status in ('brouillon', 'en_attente', 'active', 'archivee')),
  name text not null default '',
  portrait_path text,
  people text not null default '',
  profession text not null default '',
  guild text not null default '',
  faction_id uuid references public.factions(id) on delete set null,
  reputation text not null default 'A valider',
  notoriety text not null default 'Inconnu',
  rumor text not null default '',
  story text not null default '',
  lodge text not null default '',
  public_notes text not null default '',
  level integer not null default 1 check (level between 1 and 20),
  xp integer not null default 0 check (xp >= 0),
  balance integer not null default 0 check (balance >= 0),
  skill_points integer not null default 15 check (skill_points >= 0),
  talent_points integer not null default 3 check (talent_points >= 0),
  last_activity text not null default '',
  validated_by uuid references public.profiles(id) on delete set null,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.character_private_notes (
  character_id uuid primary key references public.characters(id) on delete cascade,
  note text not null default '',
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.character_skills (
  character_id uuid not null references public.characters(id) on delete cascade,
  skill_id uuid not null references public.skill_catalog(id) on delete restrict,
  rank integer not null default 0 check (rank >= 0),
  updated_at timestamptz not null default now(),
  primary key (character_id, skill_id)
);

create table if not exists public.character_talents (
  character_id uuid not null references public.characters(id) on delete cascade,
  talent_id uuid not null references public.talent_catalog(id) on delete restrict,
  acquired_at timestamptz not null default now(),
  primary key (character_id, talent_id)
);

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  title text not null,
  description text not null default '',
  quest_type text not null default 'Mission',
  recommended_level integer not null default 1 check (recommended_level between 1 and 20),
  reward_text text not null default '',
  image_path text,
  status text not null default 'disponible' check (status in ('brouillon', 'disponible', 'fermee', 'archivee')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quest_participants (
  quest_id uuid not null references public.quests(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  status text not null default 'en_cours' check (status in ('en_cours', 'abandonnee', 'terminee')),
  accepted_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (quest_id, character_id)
);

create table if not exists public.item_catalog (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  description text not null default '',
  image_path text,
  price integer not null default 0 check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  catalog_item_id uuid references public.item_catalog(id) on delete set null,
  name text not null,
  description text not null default '',
  image_path text,
  purchase_price integer not null default 0 check (purchase_price >= 0),
  acquired_at timestamptz not null default now(),
  locked_reason text,
  unique (id, character_id)
);

create table if not exists public.gm_requests (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  request_type text not null default 'general',
  title text not null,
  message text not null default '',
  status text not null default 'en_attente' check (status in ('en_attente', 'acceptee', 'refusee', 'fermee')),
  response text not null default '',
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.mail (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete set null,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  recipient_character_id uuid references public.characters(id) on delete cascade,
  subject text not null,
  body text not null default '',
  reward_balance integer not null default 0 check (reward_balance >= 0),
  reward_xp integer not null default 0 check (reward_xp >= 0),
  status text not null default 'envoye' check (status in ('brouillon', 'envoye', 'reclame', 'archive')),
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create table if not exists public.mail_attachments (
  id uuid primary key default gen_random_uuid(),
  mail_id uuid not null references public.mail(id) on delete cascade,
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  catalog_item_id uuid references public.item_catalog(id) on delete set null,
  name text not null,
  description text not null default '',
  image_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  sender_character_id uuid not null references public.characters(id) on delete cascade,
  recipient_character_id uuid not null references public.characters(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  status text not null default 'en_attente' check (status in ('en_attente', 'accepte', 'refuse', 'annule')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (sender_character_id <> recipient_character_id)
);

create table if not exists public.direct_sales (
  id uuid primary key default gen_random_uuid(),
  seller_character_id uuid not null references public.characters(id) on delete cascade,
  buyer_character_id uuid references public.characters(id) on delete set null,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  price integer not null check (price > 0),
  status text not null default 'ouverte' check (status in ('ouverte', 'vendue', 'annulee', 'expiree')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  seller_character_id uuid not null references public.characters(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  starting_price integer not null check (starting_price > 0),
  current_price integer not null check (current_price > 0),
  current_bidder_character_id uuid references public.characters(id) on delete set null,
  duration_hours integer not null check (duration_hours in (24, 48, 72)),
  status text not null default 'ouverte' check (status in ('ouverte', 'vendue', 'invendue', 'annulee')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  closed_at timestamptz
);

create table if not exists public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  bidder_character_id uuid not null references public.characters(id) on delete cascade,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.character_history (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  event_type text not null,
  summary text not null,
  is_private boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.legacy_imports (
  id uuid primary key default gen_random_uuid(),
  imported_by uuid not null references public.profiles(id) on delete cascade,
  source_version integer,
  checksum text not null unique,
  summary jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now()
);

create index if not exists characters_owner_idx on public.characters(owner_id, status);
create index if not exists quest_participants_character_idx on public.quest_participants(character_id, status);
create index if not exists inventory_character_idx on public.inventory_items(character_id);
create index if not exists requests_character_idx on public.gm_requests(character_id, status);
create index if not exists mail_recipient_idx on public.mail(recipient_id, status);
create index if not exists transfers_parties_idx on public.transfers(sender_character_id, recipient_character_id, status);
create index if not exists direct_sales_status_idx on public.direct_sales(status, created_at);
create index if not exists auctions_status_ends_idx on public.auctions(status, ends_at);
create index if not exists auction_bids_auction_idx on public.auction_bids(auction_id, amount desc);
create index if not exists history_character_idx on public.character_history(character_id, created_at desc);
create index if not exists audit_created_idx on public.audit_log(created_at desc);
