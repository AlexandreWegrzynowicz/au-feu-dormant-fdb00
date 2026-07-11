# Au Feu Dormant

Portail RP fantasy public pour l'auberge **Au Feu Dormant**.

Le site sert de porte d'entree vers l'univers RP : voyageurs, contrats, murmures, chroniques et acces a la salle commune Discord.

## Version

Version 1.0 publique.

Version 2.0 en preparation : registre MJ connecte a Supabase.

## Structure

```text
.
|-- index.html
|-- css/
|   `-- styles.css
|-- js/
|   |-- script.js
|   |-- mj.js
|   |-- supabase-config.js
|   `-- supabase-store.js
|-- assets/
|   |-- favicon.svg
|   `-- og-image.svg
|-- mj.html
|-- supabase-schema.sql
|-- images/
|   `-- .gitkeep
|-- fonts/
|   `-- .gitkeep
`-- README.md
```

## Pages

- `index.html` : portail public.
- `mj.html` : console MJ protegee par Supabase Auth.
- `arriere-salle.html` : registre collectif prive, accessible par mot de passe partage.

## Mise en ligne avec GitHub Pages

1. Creer un depot GitHub nomme `au-feu-dormant` ou `au-feu-dormant-rp`.
2. Envoyer ce dossier sur la branche `main`.
3. Dans GitHub, ouvrir `Settings > Pages`.
4. Selectionner `Deploy from a branch`.
5. Choisir `main` puis `/root`.
6. Enregistrer.

L'adresse aura generalement cette forme :

```text
https://VOTRE-NOM.github.io/au-feu-dormant/
```

## Mise a jour

Apres modification :

```bash
git add .
git commit -m "Mise a jour du portail"
git push
```

GitHub Pages republie automatiquement le site apres le push.

## Supabase

La console MJ utilise Supabase pour publier les voyageurs, contrats, murmures et chroniques sur le site public.

Avant usage :

1. Ouvrir Supabase > SQL Editor.
2. Executer `supabase-schema.sql`.
3. Ouvrir Supabase > Authentication > Users.
4. Creer le compte du maitre de jeu.
5. Se connecter sur `mj.html`.

### Arriere-salle

L'Arriere-salle utilise des tables Supabase separees :

- `backroom_state` : progression RP et notes MJ ;
- `backroom_settings` : hash du mot de passe joueur.

Les joueurs ne lisent jamais ces tables directement. Ils passent par les fonctions Netlify :

- `/.netlify/functions/backroom-login`
- `/.netlify/functions/backroom-data`

Variables Netlify obligatoires :

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
BACKROOM_SESSION_SECRET
```

Le mot de passe joueur n'est pas stocke en clair dans le depot. Apres avoir lance `supabase-schema.sql`, definissez-le depuis l'onglet MJ `Arriere-salle`.

Ne jamais publier :

- mot de passe de base ;
- cle `service_role` ;
- chaine de connexion Postgres ;
- secret JWT.

## Console MJ

La console MJ sauvegarde dans Supabase et garde une copie locale de secours dans `localStorage`.

Cela signifie :

- le site public lit le registre en ligne ;
- le MJ doit etre connecte via Supabase Auth pour ecrire ;
- les visiteurs anonymes peuvent lire seulement la table publique `portal_state`.

Une version ulterieure pourra brancher :

- comptes joueurs ;
- tables separees ;
- roles MJ plus fins ;
- stockage d'images Supabase.

## SEO minimal

Le site contient :

- titre de page ;
- meta description ;
- Open Graph ;
- favicon ;
- image de partage ;
- lien Discord officiel.

## Discord

Invitation officielle :

```text
https://discord.gg/atbfrdFfNr
```

## Hebergement futur

Le site est statique et peut migrer facilement vers :

- GitHub Pages ;
- Netlify ;
- Vercel.

Il ne depend d'aucun framework ni service payant obligatoire.
