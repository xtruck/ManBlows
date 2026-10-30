# EGC Studio : fiche client

- Fondateur : Egu, freelance, Abidjan. Site en français et anglais, en production sur GitHub Pages.
- Trois métiers : **photo**, **vidéo** et **design graphique / infographie**
  (le studio se présente aussi comme « Production audiovisuelle et marketing digital »).
- Il a commencé comme **infographiste**, surtout sur **Canva**, et va parfois **au-delà de Canva**
  (ne pas inventer d'autres outils tant que le client ne les nomme pas).
- Puis photographe et vidéaste : mariages, baptêmes, événements, portraits.

## Contenu du site (tout est de lui, plus aucune maquette)
- **Travaux** (`/travaux/`) : 35 créations graphiques (`src/content/design.ts`) et 11 photos
  (`src/content/photos.ts`), chacune avec le client et le type (église, entreprise, école, événement).
  Filtres : Tout, Design (avec un sous-filtre par type de client), Produits, Événements.
  Images optimisées dans `public/work/`.
- **Offres et tarifs** (section sur l'accueil, `components/Offers.tsx`) : ses 4 affiches rouges
  (forfaits réseaux sociaux, création de design, services, grille tarifaire) sont **à part** du travail
  client, dans un carrousel avec agrandissement. Elles sont dans `design.ts` (catégorie `studio`,
  exportées en `offerShots`) et ne s'affichent pas dans la galerie.
- **Films** (`/films/`) : 8 vidéos (3 mariages en vertical, un montage Les Bols du Bonheur, un plan serré au clavier, une vidéo AGEF, un reportage Archibat, un reportage Maracana) dans `public/films/`, plus le **showreel**.
- **Showreel** : sa vidéo de reportage d'événement de 25 s, en 1080×1920 (`public/films/showreel.mp4`).
- **Trois métiers** (accueil, `components/Disciplines.tsx` + `Deck.tsx`) : la sélection du début de
  l'accueil est fusionnée ici. Chaque carte montre un paquet de ses vraies images qui défilent
  (compteur « 11 photos », « 5 vidéos », « 35 créations ») et mène directement à `/travaux/#photos`,
  `/films/` ou `/travaux/#design` (le filtre est choisi par le lien). La carte Design a aussi
  « Voir les tarifs ». Les images de chaque paquet se choisissent par numéro dans `Disciplines.tsx`.
- Clients identifiés : Église Mesev, Assemblée Internationale Royaume de Lumière, Mission Évangélique
  Source d'Eau Vive, Vitall Institut, Les Bols du Bonheur, KMK Collection, Salon International de
  l'Investissement (SII), SGS Consulting, AGEF, Eliah Home Déco, Skinnys, Javelot Bar Resto.
- Coordonnées (dans `src/content/site.ts`) : WhatsApp +225 01 60 66 86 82 et e-mail vegcstudio@gmail.com,
  lus sur ses affiches ; Instagram `egc_studio225` et TikTok `egc_studio225`, confirmés par les liens
  de ses profils (les affiches indiquaient `egc_studio`, sans le 225).

## Mis à l'écart volontairement (contenu personnel)
Le programme d'obsèques d'une famille et les cartes d'anniversaire de personnes (Duncan-Williams,
Adebo, Roland Amuzu sans logo d'église) ne sont pas sur le site. Les fichiers sont dans
`inbox/private/` (non publié, ignoré par git). Les originaux restent dans son dossier.
Aussi laissée de côté : une vidéo de 3 secondes (`5D40DC1D-….mov`), trop courte.

## Pas encore sur le site (il n'a pas envoyé de photos)
- Photos de cérémonies, de portraits, et son portrait pour la page À propos.
- Témoignages de clients (les faux ont été retirés).
- Les filtres Cérémonies, Portraits et Films apparaîtront tout seuls dès que des photos de ces
  catégories seront ajoutées (`photos.ts`).

## À confirmer avec lui
- Accord des clients pour montrer leurs affiches et leurs photos (visages sur les photos de salon).
- Les photos de stand et de dégustation sont attribuées aux Bols du Bonheur d'après les barquettes
  étiquetées visibles : à vérifier. Les photos de marche en équipe sont attribuées à AGEF d'après les
  tenues orange et blanc.
- Les outils exacts qu'il utilise en dehors de Canva.
- Les vidéos de mariage portent un filigrane « SM Production » en plus de « egc studio ».

## Ajouter de nouveaux fichiers
`node scripts/ingest-watch.mjs` surveille `D:\OneDrive\Desktop\MAN BLOWS`, convertit les nouvelles
photos (WebP 1400 px ; les HEIC passent par ffmpeg) et vidéos (H.264, 1280 px sur le grand côté) dans
`inbox/ready/` et les liste dans `inbox/queue.json`. Rien n'est publié tant qu'on ne les a pas copiés
dans `public/` et ajoutés dans `design.ts`, `photos.ts` ou `site.ts` (films).

## Continuer sur un autre ordinateur
`git clone https://github.com/xtruck/ManBlows.git`, `npm install`, puis `npm run dev`.
Les fichiers convertis mais pas triés sont sur la branche `inbox-media` :
`git fetch && git checkout inbox-media -- inbox`. Les vidéos brutes (jusqu'à 140 Mo) restent dans le
dossier OneDrive, pas sur GitHub.

## Page Travaux : audit fait
- Les colonnes CSS posaient un problème de chargement des images : la galerie utilise des colonnes
  calculées (2 sur téléphone, 3 sur ordinateur) dans `Work.tsx`.
- Testé : toutes les images se chargent au défilement rapide (téléphone et ordinateur), aucun
  chevauchement ni débordement, visionneuse correcte, filtres corrects.

## Animations : deux modes (`src/lib/motion.ts`)
- **Complet** : tout joue (caméra 3D qui s'envole au défilement, apparitions, rideau entre les pages,
  lueurs, défilement fluide).
- **Doux** : uniquement des fondus (accueil statique, pas de rideau ni de défilement fluide).
- Le réglage « moins d'animations » de l'appareil choisit le mode par défaut. Beaucoup de téléphones
  l'ont activé uniquement pour aller plus vite (Android « Supprimer les animations »), donc : un message
  propose « Activer les animations » en un geste, et un interrupteur reste dans le pied de page.
  Le choix est mémorisé sur l'appareil (`localStorage`, clé `egc-motion`).
- Avant ce changement, un téléphone avec ce réglage perdait presque toutes les animations.

## Nouvelles vidéos (30/10)
- Trois courts plans de préparation de fruits (IMG_1445, 1447, 1448) montés en un seul film avec des fondus : « Les Bols du Bonheur, en cuisine ».
- IMG_2001 (mains au clavier) et IMG_2144 (détail de mariage, filigrane SM Production) ajoutées telles quelles.
- Aucune nouvelle photo n'était arrivée dans le dossier à ce moment-là.

## Indicateur de défilement (accueil, `Hero.tsx`)
La caméra de l'accueil reste fixe pendant une longue séquence au défilement : un visiteur pouvait croire la
page bloquée. Un indicateur « Faites défiler » avec trois chevrons jaunes en cascade (style C, choisi par le
propriétaire) reste visible pendant toute la séquence, avec le texte « Continuez » une fois la caméra en
mouvement, et disparaît quand l'écran s'ouvre sur le site. En mode d'animations réduites, il disparaît
dès le premier défilement.

## Référencement et nettoyage (30/10)
- `robots.txt` et `sitemap.xml` générés au build (`src/app/robots.ts`, `src/app/sitemap.ts`) : les 5 pages sont listées pour les moteurs de recherche.
- Code et textes devenus inutiles retirés (ancien mode « sélection » de la galerie, options `featured`, textes de l'ancienne section).
- `Maracana.mp4` allégée (18,7 → 14,2 Mo, 30 images/s).
- Pas fait : les titres d'onglet restent en français quand le site est en anglais.
