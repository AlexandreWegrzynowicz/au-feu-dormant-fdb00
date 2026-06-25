-- Au Feu Dormant - schema Supabase V2
-- A lancer dans Supabase > SQL Editor.

create table if not exists public.portal_state (
  id text primary key default 'main',
  data jsonb not null default '{"quests":[],"travelers":[],"rumors":[],"history":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portal_state enable row level security;

drop policy if exists "Lecture publique du portail" on public.portal_state;
create policy "Lecture publique du portail"
on public.portal_state
for select
to anon, authenticated
using (id = 'main');

drop policy if exists "Ecriture reservee aux MJ connectes" on public.portal_state;
create policy "Ecriture reservee aux MJ connectes"
on public.portal_state
for all
to authenticated
using (id = 'main')
with check (id = 'main');

insert into public.portal_state (id, data)
values (
  'main',
  '{
    "quests": [
      {
        "id": "q-tonneau",
        "title": "Le tonneau qui murmure",
        "summary": "Une livraison venue du port emet des coups depuis l interieur. Hector veut des volontaires avant de l ouvrir.",
        "status": "disponible",
        "difficulty": "Debutant",
        "reputation": "Etranger accepte",
        "participants": "1 a 4",
        "reward": "Rumeur + faveur d Hector",
        "motif": "barrel",
        "image": ""
      },
      {
        "id": "q-marin",
        "title": "La dette du marin rouge",
        "summary": "Un ancien compagnon d Hector cherche un nom efface de son carnet. Trois voyageurs l ont deja vu.",
        "status": "encours",
        "difficulty": "Intermediaire",
        "reputation": "Visage connu",
        "participants": "2 inscrits",
        "reward": "Acces a une chronique",
        "motif": "map",
        "image": ""
      }
    ],
    "travelers": [
      {
        "id": "t-maelys",
        "name": "Maelys Cornebrume",
        "portrait": "",
        "faction": "Alliance",
        "people": "Humaine",
        "situation": "Exploratrice",
        "reputation": "Respecte",
        "reputationScore": 62,
        "notoriety": "Visage apercu",
        "notorietyScore": 28,
        "rumor": "Elle paie toujours ses dettes, mais jamais avec la meme monnaie.",
        "description": "Une exploratrice prudente, connue pour ecouter avant de promettre.",
        "recentHistory": "+2 reputation apres avoir ramene une carte humide au comptoir.",
        "completedQuests": "Le tonneau qui murmure",
        "chronicles": "Chronique des cartes salees",
        "lastActivity": "Vue pres de la table du fond."
      },
      {
        "id": "t-gorvak",
        "name": "Gorvak Brise-Amarre",
        "portrait": "",
        "faction": "Horde",
        "people": "Orc",
        "situation": "Marin",
        "reputation": "Tolere",
        "reputationScore": 46,
        "notoriety": "Connu",
        "notorietyScore": 52,
        "rumor": "On dit qu il connait trois routes maritimes qui n existent sur aucune carte.",
        "description": "Un marin rugueux dont les silences valent parfois plus que ses recits.",
        "recentHistory": "A ete cite dans une rumeur de port.",
        "completedQuests": "La dette du marin rouge",
        "chronicles": "Le carnet mouille",
        "lastActivity": "A quitte l auberge avant l aube."
      }
    ],
    "rumors": [
      {
        "id": "r-carte",
        "text": "Une carte humide aurait ete payee trois fois trop cher.",
        "status": "visible",
        "source": "Une table du fond"
      },
      {
        "id": "r-client",
        "text": "Hector refuse de servir un client que personne ne voit.",
        "status": "visible",
        "source": "Hector"
      },
      {
        "id": "r-lanterne",
        "text": "La lanterne du perron ne s eteint plus depuis trois nuits.",
        "status": "visible",
        "source": "Le perron"
      }
    ],
    "history": []
  }'::jsonb
)
on conflict (id) do nothing;
