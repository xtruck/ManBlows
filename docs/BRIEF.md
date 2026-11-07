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
- Titres d'onglet : ils suivent la langue choisie (`components/TitleSync.tsx`, « Work | EGC Studio » en anglais).
- Pas fait : la description (balise meta) et l'image de partage restent en français.

## Nouvelles photos (03/11)
- 24 photos ajoutées (`photos.ts`, n° 12 à 35) : 5 portraits professionnels en studio (filtre Portraits) et 19 photos d'une soirée de future mariée (filtre Cérémonies, type « Particulier »).
- Portrait d'Egu (IMG_9865) sur la page À propos, entre le 1er et le 2e paragraphe de la bio (`public/egu.webp`). IMG_9866 non utilisée.
- À confirmer : accord des personnes photographiées pour la publication.

## Ajout du 03/11 (suite)
- Photos 36 à 41 : un portrait de studio (Portraits) et 5 photos du client SIFEC (Événements), ajouté à « Ils m'ont fait confiance ». Nom complet de SIFEC à confirmer.
- 10 vidéos ajoutées aux Films (n° 14 à 23) : 6 plans de coulisses (drone, tournage), 3 reportages d'événement et le clip « Alors, ta date ? ». IMG_1482 (enregistrement d'écran) non publiée.
- Titres génériques écrits d'après les images : à corriger avec lui.

## Mise à jour du 05/11
- Titres des 10 derniers films (n° 14 à 23) réécrits d'après leurs images : drone en ville, danse filmée
  dans la rue, marche de groupe, arrivée de l'équipe, caméraman, séance photo en robe kente (type passé à
  « Portrait »), réception sous chapiteau, salon professionnel. À valider avec lui.
- **Vidéo abîmée : `film-2585.mp4` (réception sous chapiteau, logo « MO Events »).** Seules 592 images sur
  1 570 se décodent, la lecture saute. Il faut la reconvertir depuis l'original (IMG_2585) dans son dossier.
- Le salon (n° 22) semble être « Brand Icons Africa » d'après un panneau : à confirmer.
- Aperçu de partage (WhatsApp, Facebook, X) en français et en anglais : texte et image `og.png`
  (refaite avec `node scripts/make-og.mjs`). La description de la page suit aussi la langue choisie.
- `npm run typecheck` ajouté ; le déploiement lance maintenant lint et vérification des types avant le build.
- README réécrit pour ce site.

## Vitesse sur téléphone (05/11)
Mesuré avec Lighthouse en mode téléphone (4G lente). Score performance avant → après :
Travaux 69 → 91, Films 75 → 88, À propos 77 → 92, Contact 76 → 92. Accessibilité 100 partout.
- La caméra 3D (613 Ko) se téléchargeait sur **toutes** les pages ; elle ne se charge plus que sur l'accueil
  (petit script dans `layout.tsx`). Contact : 1 Mo → 394 Ko.
- Les images de la galerie et les affiches des films existent maintenant en 3 tailles (400 px `xs/`,
  640 px `sm/`, pleine taille) ; le téléphone prend la plus petite qui suffit (`src/lib/image-loader.ts`).
  Après tout ajout d'image : `node scripts/make-thumbs.mjs`.
- Les premières images de la galerie se chargent tout de suite au lieu d'attendre.
- Gris des textes secondaires un peu plus foncé (`--muted` : #5c5954) pour être lisible au soleil (contraste AA).
- Reste : l'accueil (score 35). Le texte reste caché derrière l'intro (≈ 2,5 s minimum sur chaque page,
  plus sur l'accueil le temps de charger la caméra 3D) ; c'est un choix de design, à décider avec lui.

## Intro une fois par visite + bouton WhatsApp (05/11)
- L'intro (appareil photo, diaphragme) ne joue plus qu'au **premier chargement d'une visite** (par onglet,
  `sessionStorage`, clé `egc-intro-seen`). Ensuite : simple fondu de 0,4 s. Mesuré sur téléphone : 4,3 s la
  première fois, 0,7 à 0,8 s ensuite. Lighthouse simule toujours une première visite, donc ses scores ne bougent pas.
- **Bouton WhatsApp flottant** sur téléphone (`components/WhatsAppButton.tsx`), vert WhatsApp, en bas à droite.
  Il ouvre la discussion avec un premier message déjà écrit dans la langue choisie, qui cite la page
  (« Bonjour EGC Studio, je viens de votre site (page Travaux)… »). Absent sur la page Contact (elle a son
  formulaire), caché pendant l'intro, pendant la séquence caméra de l'accueil et quand le pied de page est visible.

## Finitions (05/11, suite)
- Bouton WhatsApp redessiné : même verre sombre que la barre de menu, pastille verte avec le logo,
  « Réponse sous 24 h / Écrivez-moi » (la promesse de la page Contact). Il s'efface quand les commandes
  d'une vidéo passent dessous.
- Affiche du showreel remplacée : l'ancienne était la 1re image de la vidéo (des pieds, flous, teinte lavande).
  La nouvelle est le plan à 0:16,8, Egu en train de photographier dans le salon.
- La bio de la page À propos passe à la **1re personne** (« Je m'appelle Egu. J'ai commencé… »), comme le reste
  du site (« Ce que je fais », « Comment je travaille », « Je réponds sous 24 heures »). Mêmes faits. À valider avec lui.
- Accueil : espace ajouté entre le titre « Derrière l'objectif » et son texte.

## Refonte « Quatre métiers » (05/11)
Le studio présente maintenant **quatre métiers** : photo, vidéo, design graphique et **sites web** (nouveau).
- **Accueil** : l'appareil photo 3D est remplacé par un **prisme 3D à quatre faces** (une vraie réalisation par
  métier, avec son signe : cadrage photo, REC, poignées de sélection, fenêtre de navigateur). Il tourne d'un
  quart de tour toutes les 4 s, les mots « Photo. Vidéo. Design. Web. » permettent de choisir. En 3D CSS, sans
  three.js : score Lighthouse téléphone de l'accueil 35 → 74. Visuels choisis dans `src/content/crafts.ts`.
- **Intro** (1re visite) : le même prisme tourne sur les quatre métiers avec un compteur, puis jaune et logo.
- **Transition entre pages** : quatre bandes (01 Photo … 04 Web) qui montent l'une après l'autre.
- **Nouvelle page `/web/`** : ce que je crée (site vitrine, portfolio, page de lancement, refonte), ce qui est
  inclus, étude de cas = ce site (Lighthouse : accessibilité, SEO et bonnes pratiques à 100), méthode, FAQ,
  bouton WhatsApp avec message prérempli. Lien « Web » dans le menu, « Site web » dans le formulaire de contact.
- Quatre cartes métiers (la carte Web est sombre, badge « Nouveau »), bandeau **En chiffres** calculé depuis le
  contenu (photos, créations, films, clients, réponse sous 24 h), titre avec une serif italique (Instrument Serif).
- Pas de tarifs ajoutés pour le moment (demande du propriétaire). Pas d'affiche pour le web (demande du propriétaire).
- À confirmer avec Egu : l'offre web (types de sites, accompagnement nom de domaine / hébergement).

## Réalisations web (06/11)
- Page `/web/`, section **Réalisations** : six sites créés par le studio, chacun avec sa page d'accueil sur
  ordinateur dans un cadre de navigateur (avec l'adresse), sa version téléphone posée devant, et un lien vers le site.
  ANAREKA-CI, BMT Green Academy, Graya Holistic, Espace Mima, Espace Kignon, VIP Garage.
- **Espace Mima, Espace Kignon et VIP Garage** affichent eux-mêmes « Maquette de démonstration… ni commandée ni
  validée par » le commerce : ils portent un badge **Maquette** (EN : « Concept »), et le texte d'intro le dit.
  Les trois autres n'ont pas de badge. À corriger dans `webPage.works` (`concept`) si un statut change.
- Sur téléphone, les cartes défilent au doigt (une carte et le début de la suivante) ; tablette 2 colonnes,
  ordinateur 3 colonnes. Sur ordinateur, la carte s'incline vers la souris et le téléphone avance.
- Captures : `node scripts/make-real-shots.mjs [slug]` (Playwright, hors dépendances du projet ;
  `PW_CHANNEL=msedge` pour utiliser Edge), fichiers `public/web/real-<slug>-desk.webp` (1280 × 800) et
  `-phone.webp` (420 px de large).

## Nouvel intro, hero et vrais sites partout (06/11, suite)
- **Plus aucune capture de ce site-ci** dans les animations ni comme exemple de site : la carte « Sites web »
  de l'accueil montre ANAREKA-CI, BMT Green Academy, Graya Holistic, Espace Kignon et VIP Garage (avec leur nom) ;
  l'en-tête de `/web/` montre ANAREKA-CI ; la face Web du prisme et l'étape Web de l'intro aussi
  (`real-anareka-face.webp`, capture téléphone nette 780 px : `SHOTS=face node scripts/make-real-shots.mjs anareka`).
  Seule l'« Étude de cas : ce site » de `/web/` garde des captures de ce site, puisqu'elle en parle.
- **Intro** (1re visite, `components/Preloader.tsx`), inspirée de démos Codrops (RapidLayersAnimation,
  IntroTrailEffect) : un même cadre vit les quatre métiers. Photo : rafale de deux vraies photos dévoilées
  « en couches », puis le portrait passe du négatif au positif, mise au point, déclencheur. Vidéo : pellicule qui
  défile et s'arrête, timecode. Design : poignées de sélection, curseur qui redimensionne, nuancier. Web : barre de
  navigateur, l'adresse anarekaci.com se tape, la page défile. Puis jaune et logo. Sur l'accueil, le cadre
  **s'envole jusqu'au prisme** avec une traînée d'images et devient sa face avant (aucune coupure) ; ailleurs le
  fond se dissout. Bouton « Passer l'intro ». L'étape Photo est en CSS (transform et opacité seulement), donc
  visible avant même le chargement du JavaScript sur un téléphone lent.
- **Hero** (`components/Hero.tsx`) : le prisme se tourne au doigt ou à la souris (élan, puis il se pose sur la
  face la plus proche ; un geste net avance toujours d'une face), chaque face est éclairée selon son angle
  (trigonométrie CSS), et joue un petit moment de son métier en arrivant devant (flash, ligne de scan, poignées,
  page qui défile). Le nom du métier en contour géant derrière, re-lettré à chaque tour ; lumière sous la souris.
  La rotation automatique s'arrête quand l'onglet est en arrière-plan.
- Les sections ne « clignotent » plus à la fin de l'intro : elles se préparent quand le fond commence à se dissoudre.
- Lighthouse téléphone (mesuré sur la même machine lente que le site en ligne précédent : 44) : accueil 36,
  `/web/` 37 ; accessibilité 100, bonnes pratiques 96–100, SEO 92. L'écart vient de l'intro, qui retient la page
  jusqu'au JavaScript. Piste si on veut remonter : intro plus courte, ou pas d'intro sur les pages autres que l'accueil.

## Hero : diaporama, film et nouvelles idées (06/11, suite)
- **Diaporama sur le prisme** (`src/content/crafts.ts`, champ `slides`) : chaque face passe à l'image suivante
  pendant qu'elle est derrière (invisible), donc chaque retour devant montre autre chose. Photo : 5 photos ;
  Vidéo : 4 films ; Design : 5 affiches (sans les affiches de tarifs du studio) ; Web : 5 sites
  (ANAREKA-CI, Graya Holistic, BMT Green Academy, Espace Kignon, VIP Garage). Seuls des visuels en portrait ou
  carrés, pour ne pas trop recadrer.
- **Le film joue sur la face Vidéo** quand elle est devant (et s'arrête sinon, si le hero n'est plus à l'écran,
  si l'onglet est caché ou en mode « animations réduites »). Ce sont des boucles de 6 s sans son, en 480 × 600,
  320 à 670 Ko chacune, dans `public/films/loop/` (tirées du showreel, du henné, du mariage à la calebasse et
  des Bols du Bonheur ; refaites-les avec ffmpeg si on change de film).
- **Lumière d'ambiance** derrière le prisme dans la couleur du métier devant (bleu, or, orange, vert), qui glisse
  d'une couleur à l'autre.
- En faisant défiler la page, le prisme **bascule en arrière** et se pose. Flèches du clavier pour le tourner
  (quand sa face a le focus), petite vibration sur Android quand il se pose après un geste.
- Le prisme ne tourne plus quand le hero est hors de l'écran.

## Intro et hero façon « Square Kiosk » (07/11)
Inspiré de l'animation de squareup.com/us/en/hardware/kiosk (vue sur Land-book), refaite aux couleurs du studio :
- **Intro** (`components/Preloader.tsx`) : une pilule s'ouvre sur une photo du studio et grandit ; une pilule jaune
  en sort et envahit l'écran ; le mot géant « studio. » se forme avec des bulles qui fusionnent (filtre SVG
  « gooey », lettres arrondies comme chez Square) ; « egc » s'écrit par-dessus ; le jaune se lève comme un rideau
  pendant que le prisme du hero monte depuis le bas. ~3,5 s (au lieu de ~6 s), bouton « Passer l'intro ».
  La pilule du début est en CSS (transform et opacité), donc visible avant le chargement du JavaScript.
- **Collage de stickers** autour du prisme (`components/HeroCollage.tsx`) : ticket de shooting rose, bulle
  « On shoote quand ? », badge étoile « Nouveau : sites web », cœur « Réserve ta date », tirage photo et affiche
  (ordinateur). Ils apparaissent après l'intro, flottent, suivent la souris et défilent à des vitesses différentes.
  Sur téléphone, les quatre plus petits seulement. Textes dans `hero.sticker` (FR/EN).
- Correction : après son entrée, le prisme gardait une transformation fixe qui bloquait l'inclinaison à la souris.

## Composants 21st.dev intégrés (07/11)
Dossier `src/components/ui/` créé (convention shadcn : briques réutilisables à part des composants du site ;
le projet n'utilise pas le CLI shadcn, l'alias `@/` pointe sur `src/`). Pas de dépendance ajoutée :
`gsap` était déjà là, et `motion/react` remplace `framer-motion` (même API, déjà installé).
- **`ui/perspective-tunnel-hero.tsx`** : couloir 3D de cartes qui sortent du fond autour d'un titre. Adapté :
  il avance avec le défilement de la page (section haute de 3 écrans, scène collante) au lieu de capturer la
  molette — il marche au doigt et ne bloque jamais la page ; couleurs du studio ; images et textes en props.
  Utilisé sur l'accueil juste après le hero (`components/WorkTunnel.tsx`, textes `home.tunnel`) avec 9 vraies
  réalisations (photos, affiches, film, sites).
- **`ui/tumble-deck-showcase.tsx`** : pile de captures de sites debout, qui basculent une à une. Ajout de deux
  options : `captureWheel` (désactivée sur le site pour que la page défile) et `dragAxis="x"` (sur téléphone,
  glisser sur le côté fait basculer, glisser vers le haut fait défiler). Utilisé dans `/web/` › Réalisations,
  au-dessus des cartes, avec les 6 captures ordinateur. Touche, clic, flèches du clavier.
