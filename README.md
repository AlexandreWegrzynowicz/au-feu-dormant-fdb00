# Au Feu Dormant

Portail RP fantasy public pour l'auberge **Au Feu Dormant**.

Le site sert de porte d'entree vers l'univers RP : voyageurs, contrats, murmures, chroniques et acces a la salle commune Discord.

## Version

Version 1.0 publique.

## Structure

```text
.
|-- index.html
|-- css/
|   `-- styles.css
|-- js/
|   `-- script.js
|-- assets/
|   |-- favicon.svg
|   `-- og-image.svg
|-- images/
|   `-- .gitkeep
|-- fonts/
|   `-- .gitkeep
`-- README.md
```

## Pages

- `index.html` : portail public.
- La console MJ reste locale et n'est pas publiee sur GitHub Pages.

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

## Console MJ

La console MJ du prototype local utilise `localStorage`.

Cela signifie :

- les donnees restent dans le navigateur utilise ;
- elles ne sont pas partagees entre appareils ;
- elle ne doit pas etre exposee telle quelle sur un depot public ;
- elle ne constitue pas une securite de production ;
- aucune donnee sensible ne doit y etre stockee.

La future version 2 pourra brancher :

- Supabase Auth ;
- comptes joueurs ;
- base de donnees des voyageurs ;
- contrats persistants ;
- chroniques ;
- reputation et notoriete ;
- stockage d'images.

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
