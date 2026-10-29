# EGC Studio : fiche client

- Fondateur : Egu, freelance, Abidjan. Site en français et anglais.
- Trois métiers : **photo**, **vidéo** et **design graphique / infographie**
  (le studio se présente aussi comme « Production audiovisuelle et marketing digital »).
- Il a commencé comme **infographiste**, surtout sur **Canva**, et va parfois **au-delà de Canva**
  (ne pas inventer d'autres outils tant que le client ne les nomme pas).
- Puis photographe et vidéaste : mariages, baptêmes, événements, portraits.

## Contenu réel déjà sur le site
- 35 créations graphiques (dossier du client), classées par client et par type
  (église, entreprise, école, événement, particulier) dans `src/content/design.ts`.
- 4 visuels sont **ses propres offres** (forfaits réseaux sociaux, services, tarifs) :
  catégorie « studio », pas du travail client.
- 3 vidéos verticales (2 mariages, 1 reportage d'événement) dans `public/films/`.
- Clients identifiés sur les affiches : Église Mesev, Assemblée Internationale Royaume de Lumière,
  Mission Évangélique Source d'Eau Vive, Vitall Institut, Les Bols du Bonheur, KMK Collection,
  Salon International de l'Investissement (SII), SGS Consulting, AGEF, Eliah Home Déco, Javelot Bar Resto.

## Encore de la démonstration
- Photos (cérémonies, événements, portraits, films) : images de remplacement tant qu'il n'a pas envoyé les siennes.
- Témoignages, portrait, coordonnées (WhatsApp, e-mail, Instagram).
- Ses affiches montrent peut-être ses vraies coordonnées (WhatsApp +225 01 60 66 86 82,
  Instagram egc_studio) : à confirmer avec lui avant de les mettre dans `content/site.ts`.

## À confirmer avec lui
- Accord des clients pour montrer leurs affiches (surtout le programme d'obsèques et les cartes
  d'anniversaire de particuliers).
- Les outils exacts qu'il utilise en dehors de Canva.

## Ajouter de nouveaux fichiers
`node scripts/ingest-watch.mjs` surveille `D:\OneDrive\Desktop\MAN BLOWS`, convertit les nouvelles
photos (WebP 1400 px) et vidéos (H.264, 1280 px sur le grand côté) dans `inbox/ready/` et les liste
dans `inbox/queue.json`. Rien n'est publié tant qu'on ne les a pas copiés dans `public/`.
