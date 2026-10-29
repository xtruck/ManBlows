# EGC Studio : fiche client

- Fondateur : Egu, freelance, Abidjan. Site en français et anglais, en production sur GitHub Pages.
- Trois métiers : **photo**, **vidéo** et **design graphique / infographie**
  (le studio se présente aussi comme « Production audiovisuelle et marketing digital »).
- Il a commencé comme **infographiste**, surtout sur **Canva**, et va parfois **au-delà de Canva**
  (ne pas inventer d'autres outils tant que le client ne les nomme pas).
- Puis photographe et vidéaste : mariages, baptêmes, événements, portraits.

## Contenu du site (tout est de lui, plus aucune maquette)
- 32 créations graphiques, classées par client et par type (église, entreprise, école, événement)
  dans `src/content/design.ts`. Images optimisées dans `public/work/`.
- 4 visuels sont **ses propres offres** (forfaits réseaux sociaux, services, tarifs) :
  catégorie « studio », affichée dans « Mes offres », pas du travail client.
- 3 vidéos verticales (2 mariages, 1 reportage d'événement) dans `public/films/`.
- Clients identifiés sur les affiches : Église Mesev, Assemblée Internationale Royaume de Lumière,
  Mission Évangélique Source d'Eau Vive, Vitall Institut, Les Bols du Bonheur, KMK Collection,
  Salon International de l'Investissement (SII), SGS Consulting, AGEF, Eliah Home Déco, Javelot Bar Resto.
- Coordonnées lues sur ses affiches : WhatsApp +225 01 60 66 86 82, e-mail vegcstudio@gmail.com,
  Instagram egc_studio (dans `src/content/site.ts`).

## Mis à l'écart volontairement (contenu personnel)
Le programme d'obsèques d'une famille et les cartes d'anniversaire de deux personnes ne sont plus
sur le site. Les fichiers sont dans `inbox/private/` (non publié, ignoré par git). Les originaux
restent dans son dossier.

## Pas encore sur le site (il n'a pas envoyé de photos)
- Photos de cérémonies, événements, portraits, et son portrait pour la page À propos.
- Témoignages de clients (les faux ont été retirés).
- Les filtres Cérémonies, Événements, Portraits et Films apparaîtront tout seuls dès que des photos
  de ces catégories seront ajoutées dans `src/content/site.ts`.

## À confirmer avec lui
- Accord des clients pour montrer leurs affiches.
- Les outils exacts qu'il utilise en dehors de Canva.
- Les vidéos portent un filigrane « SM Production » en plus de « egc studio » : à vérifier.

## Ajouter de nouveaux fichiers
`node scripts/ingest-watch.mjs` surveille `D:\OneDrive\Desktop\MAN BLOWS`, convertit les nouvelles
photos (WebP 1400 px) et vidéos (H.264, 1280 px sur le grand côté) dans `inbox/ready/` et les liste
dans `inbox/queue.json`. Rien n'est publié tant qu'on ne les a pas copiés dans `public/`.

## Showreel
Section « Le showreel » (accueil + page Films) : montage de l'événement Archibat
(`public/films/showreel.mp4`). C'est un choix à confirmer : remplacer le fichier et
`showreel` dans `src/content/site.ts` pour changer de vidéo.

## Continuer sur un autre ordinateur
`git clone https://github.com/xtruck/ManBlows.git`, `npm install`, puis `npm run dev`.
Les photos/vidéos non publiées (converties, pas encore triées) sont sur la branche `inbox-media` :
`git fetch && git checkout inbox-media -- inbox`. Deux photos HEIC (IMG_3480, IMG_3489) n'ont pas pu
être converties (OneDrive ne les avait pas téléchargées) : relancer `node scripts/ingest-watch.mjs`.
Les fichiers vidéo bruts de plus de 100 Mo restent dans le dossier OneDrive, pas sur GitHub.
