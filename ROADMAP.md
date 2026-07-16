# Au Feu Dormant - Console RP V2

## Etat actuel

Prototype local de l'outil RP valide sur :

http://127.0.0.1:4190/

Le projet concerne l'application pratique MJ / joueurs, pas l'ancien site vitrine.

Fonctions deja presentes :

- fiches personnages multiples ;
- selection de fiche active ;
- mode joueur / mode MJ ;
- competences et talents ;
- XP et niveaux ;
- points de competences et talents ;
- quetes ;
- allegiances ;
- coffre de l'organisation ;
- achat, vente et destruction d'objets ;
- inventaire joueur ;
- banque d'icones pour les objets ;
- journal MJ ;
- sauvegarde locale.

## Priorite avant mise en ligne

Continuer au maximum en local, puis passer en ligne quand la base est suffisamment stable.

Objectif : limiter les aller-retours inutiles une fois le projet branche sur une vraie base.

## Systeme de comptes a prevoir

Mode recommande :

- un compte joueur par adresse e-mail ;
- un joueur peut posseder jusqu'a 3 fiches personnage ;
- le MJ peut creer et gerer autant de fiches que necessaire ;
- le joueur ne peut modifier que ses propres fiches ;
- le MJ peut tout modifier.

Champs reserves au MJ :

- XP ;
- niveau ;
- solde ;
- objets valides ;
- quetes validees ;
- bonus ;
- notes MJ ;
- corrections ;
- points ajoutes.

## Plusieurs fiches par joueur

Regle cible :

- 3 fiches maximum par joueur ;
- fiches illimitees pour le MJ ;
- chaque fiche garde ses propres competences, talents, inventaire, solde, quetes et historique ;
- le joueur voit uniquement ses fiches ;
- le MJ voit toutes les fiches.

## Echanges entre joueurs

### Don direct

Un joueur peut donner un objet de son inventaire a une autre fiche.

Resultat :

- l'objet quitte l'inventaire du donneur ;
- l'objet rejoint l'inventaire du receveur ;
- une ligne est ajoutee a l'historique.

### Vente directe

Un joueur peut mettre un objet en vente a prix fixe.

Resultat :

- l'acheteur paie ;
- le vendeur recoit le solde ;
- l'objet change d'inventaire ;
- l'historique garde la trace.

### Encheres

Systeme cible :

- duree predefinie, par exemple 24h, 48h ou 72h ;
- l'objet est bloque pendant l'enchere ;
- les joueurs peuvent surencherir ;
- a la fin du compteur, l'objet part au meilleur encherrisseur ;
- si personne n'encherit, l'objet retourne dans l'inventaire du vendeur ;
- les montants sont arrondis, sans virgules.

Pour un premier usage a 5 ou 6 joueurs, une verification a l'ouverture de l'application peut suffire.

## Boite aux lettres par fiche

Idee prioritaire apres les comptes.

Chaque fiche personnage possede une boite aux lettres.

Le MJ peut envoyer :

- messages RP ;
- convocations ;
- recompenses ;
- indices ;
- contrats prives ;
- objets joints.

Le joueur peut lire les messages de ses fiches.

Option future :

- reponse du joueur au MJ ;
- messages entre joueurs ;
- pieces jointes d'objet ou de solde.

## Demandes au MJ

Ajouter un systeme simple de demandes :

- reset talents ;
- reset competences ;
- correction de fiche ;
- demande d'objet ;
- demande de validation RP ;
- proposition de rumeur ;
- declaration d'action RP.

Le MJ peut accepter, refuser ou commenter.

## Relations RP entre personnages

Ajouter sur chaque fiche :

- allie ;
- rival ;
- dette ;
- contact ;
- mefiance ;
- lien inconnu.

Objectif : rendre les interactions entre personnages plus visibles.

## Contrats prives

Le MJ peut assigner une quete a :

- une fiche precise ;
- plusieurs fiches ;
- une allegiances ;
- un groupe temporaire.

Les contrats prives ne sont visibles que par les personnages concernes.

## Boutique cachee / marche noir

Zone future accessible selon :

- allegiances ;
- niveau ;
- reputation ;
- notoriete ;
- titre ;
- autorisation MJ.

## Titres RP

Ajouter des titres visibles sur fiche :

- Habitue du comptoir ;
- Main d'Hector ;
- Dette impayee ;
- Ami des marins ;
- Visage connu ;
- Porteur de rumeurs.

Les titres doivent etre accordes par le MJ.

## Ordre conseille pour demain

1. Stabiliser les fiches, talents, competences, XP et inventaires.
2. Ameliorer la lecture du coffre et de l'inventaire.
3. Finir les actions d'objet : achat, vente, destruction, transfert.
4. Ajouter les demandes au MJ.
5. Preparer la logique comptes joueurs / 3 fiches.
6. Ajouter la boite aux lettres.
7. Envisager la mise en ligne.

## Note importante

Ne pas confondre avec l'ancien site vitrine.

Le bon projet est :

C:\Users\xelor\OneDrive\Documents\Test\au-feu-dormant-app-v2

