# EGC Studio : fiche client

- Fondateur : Egu, freelance, Abidjan. Site en français et anglais, en production sur GitHub Pages.
- Trois métiers : **photo**, **vidéo** et **design graphique / infographie**
  (le studio se présente aussi comme « Production audiovisuelle et marketing digital »).
- Il a commencé comme **infographiste**, surtout sur **Canva**, et va parfois **au-delà de Canva**
  (ne pas inventer d'autres outils tant que le client ne les nomme pas).
- Puis photographe et vidéaste : mariages, baptêmes, événements, portraits.

## Contenu du site (tout est de lui, plus aucune maquette)
- **Travaux** (`/travaux/`) : 35 créations graphiques (`src/content/design.ts`) et 41 photos
  (`src/content/photos.ts`), chacune avec le client et le type (église, entreprise, école, événement).
  Filtres : Tout, Design (avec un sous-filtre par type de client), Produits, Événements.
  Images optimisées dans `public/work/`.
- **Offres et tarifs** (section sur l'accueil, `components/Offers.tsx`) : ses 4 affiches rouges
  (forfaits réseaux sociaux, création de design, services, grille tarifaire) sont **à part** du travail
  client, dans un carrousel avec agrandissement. Elles sont dans `design.ts` (catégorie `studio`,
  exportées en `offerShots`) et ne s'affichent pas dans la galerie.
- **Films** (`/films/`) : 18 vidéos (à l'origine 8 : 3 mariages en vertical, un montage Les Bols du Bonheur, un plan serré au clavier, une vidéo AGEF, un reportage Archibat, un reportage Maracana) dans `public/films/`, plus le **showreel**.
- **Showreel** : sa vidéo de reportage d'événement de 25 s, en 1080×1920 (`public/films/showreel.mp4`).
- **Trois métiers** (accueil, `components/Disciplines.tsx` + `Deck.tsx`) : la sélection du début de
  l'accueil est fusionnée ici. Chaque carte montre un paquet de ses vraies images qui défilent
  (compteurs calculés depuis les données : 41 photos, 18 vidéos, 35 créations au 09/11) et mène directement à `/travaux/#photos`,
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
  1 570 se décodaient. Réparée le 09/11 : on a gardé les deux passages intacts (0 à 6,4 s et 39,3 s à la fin)
  collés en un film de 20 s qui se lit sans saut. Pour retrouver les 53 s, reconvertir l'original (IMG_2585).
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
- Le tunnel ouvre aussi **Travaux** (« Des images qui restent. », affiches et photos) et **Films**
  (« Moteur. Ça tourne. », affiches des films), un peu plus court (2,4 écrans) ; textes dans `tunnels`.
  Les liens directs `/travaux/#photos`, `#design`… sautent le tunnel et arrivent sur la galerie filtrée.

## Images variées et audit final — version 1.0 (08/11)
- **Une image, une animation** : le prisme, l'intro, les stickers, les trois tunnels et les cartes métiers de
  l'accueil n'affichent plus jamais la même photo, affiche ou film (voir la règle dans le README). Seuls les
  6 sites reviennent, sous des captures différentes (téléphone, ordinateur, pleine hauteur).
- Tunnel de l'accueil un peu plus court (2,6 écrans).
- Accessibilité : les faces du prisme prennent leur nom de leur contenu (plus d'`aria-label` qui masquait le texte visible).
- Audit : 0 lien ou image cassé (531 liens, 1 146 tailles d'images), 0 débordement et 0 erreur JavaScript sur les
  7 pages en ordinateur et en téléphone 360 px, textes FR/EN identiques (168 clés).
  Lighthouse téléphone : accessibilité 100, bonnes pratiques 100, SEO 92 (le `robots.txt` doit être à la racine
  du domaine : il le sera avec un nom de domaine à soi), performance 35 à 43 (l'intro et les vidéos).
- Reste à faire plus tard : alléger `public/films/` (137 Mo), reconvertir `film-2585.mp4` depuis l'original (version réduite à 20 s),
  remplacer les coordonnées et contenus par ceux validés par Egu, nom de domaine.

## Sept sites de plus dans les Réalisations (08/11)
Sandwish Republic, Agence W, D.Myr, Overstyle CI, Under The Tree, Miss Fatima Wigs et Pharmacie Ebena : captures
ordinateur et téléphone (`scripts/make-real-shots.mjs`), en FR/EN dans `webPage.works`. Tous affichent eux-mêmes
« Maquette de démonstration… ni commandée ni validée » : ils portent le badge **Maquette**. `/web/` montre
maintenant 13 sites (3 réalisations, 10 maquettes), dans la pile qui bascule et dans les cartes.

Puis Bouchée Royale, Maison Awa, MASS Immobilier et Pharmacie Perusia (maquettes aussi) : 17 sites au total.

## Page Web plus professionnelle (08/11)
- Le web est fait par **le pôle web d'EGC Studio** (un partenaire d'Egu, pas Egu lui-même) : la page parle
  maintenant au **« nous »** (intro, offres, méthode, appel à l'action), en FR et EN.
- Bandeau de confiance sous les boutons : nombre de sites conçus (calculé depuis la liste), pensés pour le
  téléphone, FR/EN, WhatsApp intégré.
- **Filtres par secteur** sur les réalisations, avec le nombre de sites : Restauration, Mode, Immobilier,
  Santé & beauté, Services & formation (champ `sector` de chaque site dans `webPage.works`).
- Étude de cas : « 100 référencement » retiré (mesure actuelle 92), remplacé par « 0 lien cassé » (vérifié).

- Précision (08/11) : le site est celui d'Egu, fondateur et patron. Le web est réalisé pour lui par un prestataire,
  présenté comme « l'équipe web d'EGC Studio » : Egu pilote, son équipe réalise. FAQ « Qui réalise mon site ? ».

## Assistant de demande (08/11)
Bulle « Une question ? Écrivez-nous » en bas à gauche de toutes les pages (`components/Assistant.tsx`, textes
`assistant` en FR/EN). Assistant **guidé, sans IA ni serveur, gratuit** : il répond tout de suite, propose la FAQ
(fonctionnement, devis, déplacements, délais) et pose une question à la fois — service, type, date, lieu, budget
(devis ou montant), détails, nom — puis ouvre WhatsApp vers le numéro d'Egu avec la demande complète, prête à envoyer.
Il ne donne ni prix ni date : Egu confirme sous 24 h. À compléter avec Egu : zones de déplacement, délais types.
IA pour les questions libres (Cloudflare Workers AI) : voir la section « Assistant IA » plus bas.

- (08/11) Assistant : plus de question de budget ni de réponse sur les prix ou les zones ; il recueille seulement ce qu'il faut à Egu pour son devis. Stickers du hero : textes, formes et positions changent à chaque tour du prisme (un jeu par métier dans `hero.sticker.sets`).

## Autocollants de l'accueil : tailles et bords (09/11)
Mesuré (Playwright) à 9 largeurs, de 320 à 2560 px : sur téléphone le ticket rose dépassait de 5 px à gauche de
l'écran, et à 1024 px trois paires d'autocollants se chevauchaient (le prisme rétrécit avec la fenêtre, pas eux).
- Ticket : décalage à gauche réduit sur téléphone (`HeroCollage.tsx`), avec de la marge pour le déplacement à chaque tour.
- Les autocollants suivent la taille du prisme sur ordinateur : `--sticker-k` (0,72 à 1024 px, 0,8 dès 1100,
  0,9 dès 1260, 1 dès 1440) appliqué en `zoom` dans `globals.css`. Résultat : aucun chevauchement ni débordement,
  au moins 14 px de marge au bord de l'écran.

## Assistant IA (Cloudflare Workers AI) (09/11)
- `worker/` : Worker Cloudflare (`index.mjs`, `guard.mjs`, `brief.mjs`, `knowledge.generated.mjs`, `wrangler.jsonc`,
  `README.md` avec le déploiement). Sans l'URL du Worker, l'assistant garde sa demande guidée seule.
- **Questions libres** : réponses affichées mot à mot, à partir des vraies informations du studio
  (`npm run knowledge` les extrait de `dict.ts` et `site.ts`, à relancer puis redéployer après une modification de la FAQ,
  des services, du processus ou des coordonnées). Trois questions types sont proposées en un geste.
- **« Décrire mon projet en une phrase »** : l'IA remplit service, type, date, lieu, détails et nom d'après le texte du
  visiteur ; l'assistant ne pose que les questions restantes, puis ouvre WhatsApp avec la demande complète. Tout ce que le
  visiteur n'a pas écrit est écarté, rien n'est inventé. Si l'IA est en panne, le service est quand même deviné par mots-clés.
- **Règles appliquées par le code** (`guard.mjs`), quelle que soit la réponse du modèle : aucun prix ni montant, aucun
  « gratuit » ou remise, aucun numéro, e-mail ou lien autre que ceux du studio, aucune fuite des consignes. Une réponse
  fautive est remplacée par « Egu confirme lui-même les prix, les dates… » (FR ou EN). Pendant l'affichage mot à mot, le
  texte est retenu de quelques caractères et le texte final contrôlé remplace ce qui était affiché.
- Une mention indique que les réponses sont générées par une IA. En cas d'erreur (quota gratuit dépassé, Worker hors
  ligne), le visiteur est renvoyé vers WhatsApp ou la demande guidée.
- Testé sans compte Cloudflare : 15 tests (`npm run test:worker`, lancés aussi par `pages.yml`) avec une IA simulée :
  origines, rôles falsifiés, messages trop longs, limite de débit, règles du garde-fou, flux coupé n'importe où, prix
  jamais envoyé même en morceaux, extraction du projet ; page dans un navigateur contre un faux Worker (mot à mot,
  prix bloqué, description complète puis partielle, URL de WhatsApp, Worker hors ligne). `wrangler deploy --dry-run` valide.
- **Pas testé : la vraie IA.** Après le déploiement, `node worker/eval.mjs <url du Worker> --show` pose 20 questions
  pièges (prix, « ignore tes consignes », hors sujet, anglais) et lit les réponses.
- **À faire par Egu / le propriétaire** : compte Cloudflare, `npx wrangler deploy` dans `worker/`, variable `ASSISTANT_URL`
  dans GitHub, relancer le déploiement, vérifier l'identifiant du modèle (`MODEL`) dans la liste de Cloudflare.

## Présentation de l'assistant (09/11)
Refonte de l'apparence du panneau (`Assistant.tsx`, `assistant/parts.tsx`, styles `.assistant-*` dans `globals.css`) :
- **En-tête** : pastille EGC, titre, badge « IA » (seulement si l'IA est branchée), état « Réponse immédiate » (plus de texte coupé
  sur téléphone), boutons Recommencer et Fermer. Une barre de progression en 5 étapes apparaît pendant la demande.
- **Écran d'accueil** à trois entrées claires : carte jaune « Décrire mon projet en une phrase » (IA), quatre tuiles avec
  icônes (Photo, Vidéo, Design, Site web), puis « Poser une question ». Après le premier échange, les mêmes choix passent en
  petites réponses rapides sous la conversation (avant, le grand menu repoussait la réponse hors de vue).
- **Conversation** : avatar sur les messages de l'assistant, apparition douce, indicateur de saisie (trois points) pendant
  qu'il écrit, défilement vers le dernier message (vers le haut sur l'écran d'accueil).
- **Demande prête** : fiche « Votre demande » (Service, Type, Date, Lieu, Détails, Nom) et gros bouton WhatsApp vert.
- **Pied toujours visible** : « Réponses générées par une IA. Egu confirme chaque devis sous 24 h. » (sans IA : « Egu confirme
  chaque devis sous 24 h. ») et un bouton **« Écrire à Egu »** : un humain est toujours à un geste.
- **Téléphone** : feuille en bas de l'écran, page assombrie derrière, clic à côté pour fermer, focus gardé dans le panneau.
  **Ordinateur** : carte flottante, la page reste utilisable. Échap ferme et rend le focus au bouton d'ouverture.
- Animations coupées en mode « doux » et avec « réduire les animations ». Textes FR et EN (`assistant` dans `dict.ts`).
- Vérifié (Playwright) : 390 et 1440 px, FR et EN, avec et sans IA, tous les écrans ; clavier ; aucune erreur dans la console.

## Limites, statistiques et message d'accueil de l'assistant (09/11)
- **Limite stricte par visiteur** : le limiteur de Cloudflare (`LIMITER` dans `wrangler.jsonc`, 12 requêtes par minute et par
  visiteur), avec une limite locale de secours. **Plafond quotidien** facultatif (`DAILY_BUDGET`, 500 réponses d'IA par jour,
  à activer avec un petit stockage KV, voir `worker/README.md`) : une fois atteint, le site renvoie vers WhatsApp au lieu
  d'épuiser le quota gratuit.
- **Savoir ce que les visiteurs demandent, sans le stocker** : une ligne anonyme par requête dans les journaux Cloudflare (sujet
  approximatif : prix, dates, déplacements, contact, site web, vidéo… ; résultat : ok, réponse remplacée par le garde-fou, erreur).
  Jamais la question, la réponse, le nom, le numéro, l'adresse IP ni le navigateur (un test le vérifie). Si « prix », « dates »
  ou « déplacements » reviennent souvent, ajouter la réponse d'Egu à la FAQ du site. À voir avec Egu : une phrase de
  confidentialité (les messages sont traités par l'IA de Cloudflare).
- **Message d'accueil** (une fois par visite, après 20 s, seulement sur les pages Web et Contact, masqué après 15 s, avec
  une croix pour le fermer ; ne s'ouvre jamais tout seul) : sur Web, « Un projet de site web ? » ouvre l'assistant directement sur
  la demande de site ; sur Contact, « Besoin d'aide pour votre demande ? » l'ouvre au début. Il ne revient pas si le visiteur
  a déjà ouvert l'assistant. Testé avec une horloge simulée : 20 s, 15 s, une seule fois par visite, absent des autres pages.

## Intro d'accueil et vitrine des sites (09/11)
**Intro** (`Preloader.tsx`) : analysée image par image (vidéo, téléphone et ordinateur, processeur ralenti) puis refaite.
- Défauts trouvés : cercle jaune qui laissait un anneau noir autour de la pastille, mots (bulles) qui apparaissaient sur le
  fond crème avant la fin du remplissage jaune, « egc » blanc illisible sur le jaune et posé sur le « s », 1,5 s à regarder le
  mot terminé, 4,3 à 4,7 s au total, jaune animé en largeur/hauteur (recalcul de la mise en page à chaque image).
- **Début : plus de photo** (elle n'avait pas de sens pour le visiteur et il fallait la télécharger). À la place, un
  **viseur d'appareil photo** : coins qui se verrouillent, grille des tiers, point « REC », lecture « f/2.8 · 1/125 · ISO 400 »
  (la même que sur l'accueil), carré de mise au point qui se cale puis s'allume en jaune ; l'**obturateur** s'ouvre alors en iris
  jaune depuis ce point. Tout le viseur est en CSS (aucune image), donc visible tout de suite, même avant le JavaScript.
- Durée : 3,6 à 3,8 s (au lieu de 4,3 à 4,7 s). Le mot se construit une fois l'écran jaune ; « egc » reprend la disposition du logo.
- **Sécurités** : si les scripts ne se chargent pas, le voile disparaît tout seul (animation CSS à 7 s) ; sans JavaScript il n'apparaît
  pas ; plafond de 9 s côté script ; bouton « Passer l'intro » (maintenant en haut au centre) et touche Échap ; la visite suivante dans
  le même onglet garde le simple fondu de 0,4 s. Testé : scripts bloqués, JavaScript coupé, stockage bloqué, saut au clavier.

**Page Web** : l'ancienne pile de captures à plat est remplacée par une **vitrine** (`SiteShowcase.tsx`) : un ordinateur portable
argenté (cadre noir, webcam, charnière, socle, encoche) et un téléphone (cadre titane, île dynamique), dessinés en CSS
(`ui/device-mockups.tsx`), qui présentent les 17 sites l'un après l'autre, avec une pastille « Site livré » ou « Maquette »,
nom, secteur, flèches, pause, balayage tactile, flèches du clavier, barre de progression et lueur jaune de la marque. Chaque
carte de projet est aussi sur son ordinateur avec son téléphone. Corrigés en cours de route : débordement horizontal de la
section (maintenant `overflow-clip`) et colonne qui s'élargissait selon le nom du site (grille `minmax(0, 1fr)`).
Vérifié : largeur stable pour les 17 sites à 320, 390, 768 et 1440 px.

## Audit approfondi et corrections (09/11)
Rapport complet : `docs/AUDIT.md` (méthode, 24 constats corrigés, constats ouverts avec preuves, plan).
- Un agent a parcouru tout le site (6 largeurs, FR/EN, animations activées ou non) : 21 constats, dont 2 « élevés ». Tous les vrais
  défauts sont corrigés (plantage de ScrollTrigger au changement d'animations sur Travaux, formulaire de contact, légendes de la
  galerie en anglais, titres et descriptions de chaque page, boutons flottants, cibles tactiles de 44 px, etc.).
- Trouvé en vérifiant : les animations d'apparition cachaient les blocs avec `visibility: hidden`, donc le seul `<h1>` de Films et
  Travaux n'existait pas pour un lecteur d'écran avant le défilement. Elles n'utilisent plus que l'opacité (axe : 0 violation sur
  48 vues).
- Régression de performance que j'avais introduite sur Travaux (temps de blocage 60 à 300-440 ms) : les 82 déclencheurs d'apparition
  sont maintenant créés par lots de 8 par image. Mesuré avant/après sur la même machine.
- Nouveau : `npm run smoke` (toutes les pages, 3 tailles, FR et EN), `npm run test:worker` (22 tests), Dependabot, `engines`.
- **Ouvert, à décider avec Egu** : « 17 sites conçus » alors que 14 sont des maquettes ; confidentialité de l'assistant IA ; domaine
  personnel derrière Cloudflare (cache, en-têtes de sécurité, `robots.txt` utile) ; poids des vidéos dans le dépôt (145 Mo).


## Hero vivant, trois couleurs et WhatsApp guidé (09/11)

- **Prisme du hero** : il puise chaque jour dans toute la galerie (photos, affiches, films, sites), dans un ordre différent d'un jour à l'autre.
- **Images entières** : plus de recadrage ni de zoom. Chaque image s'affiche dans ses proportions d'origine, sur un fond flou de la même image.
- **Forme du prisme** : il prend la forme de l'image de face (haut pour un film 9:16, large pour un paysage) dans une boîte fixe, donc rien ne bouge autour. Les stickers suivent son contour.
- **Tous les films jouent** :
  - une boucle de 6 s sans son pour chacun des films (19, puis 20 avec le film du SII) (`public/films/loop`), à ses proportions, 854 px sur le grand côté ;
  - la face Vidéo reste 6,4 s, le temps de jouer la boucle en entier ;
  - film-2585 (fichier abîmé) : boucle prise à 40 s.
- **Couleurs** : le site se limite au crème (#f3ecdc), au noir encre (#0e0e0e) et au jaune du logo (#ffc400). Stickers, lueur du hero et motifs des faces ont été repris dans ces trois couleurs. Seul le rond vert de WhatsApp reste, pour qu'on reconnaisse le bouton.
- **WhatsApp guidé** :
  - le bouton WhatsApp (téléphone et ordinateur) ouvre d'abord l'assistant ;
  - les boutons WhatsApp de la bande d'appel et de la page Web font de même (la page Web arrive directement sur « Site web ») ;
  - le message envoyé à Egu contient tout : service, type, date, lieu, détails, nom ;
  - le pied de page garde le numéro comme simple coordonnée.

## Salon International de l'Investissement 2026 (09/11)
- **Design** (`design.ts`, n° 43 à 46) : kakémono du thème (1020 × 2400), « Merci pour votre participation », mur des partenaires et bandeau des partenaires (2000 px de large, pour que les logos restent lisibles). Ils sont rangés avec les autres visuels du SII.
- **Films** : film d'invitation du SII 2026 (`films/sii-invitation.mp4`, source 4K de 29 s ramenée à 1280 × 692 avec le son, 7,7 Mo), avec son affiche et sa boucle de 6 s pour le prisme du hero.

## Nouvelle intro : les quatre métiers (09/11)
- **Une seule séquence d'environ 3,5 s**, dans un même cadre au centre, chaque métier avec son langage visuel (CSS et GSAP seulement, aucune image à télécharger) :
  - **Photo** : viseur (coins, tiers, mise au point qui se verrouille en jaune, « f/2.8 · 1/125 · ISO 400 »), puis l'obturateur se ferme ;
  - **Vidéo** : il s'ouvre sur une pellicule noire qui défile, REC, timecode qui tourne, barre de lecture jaune ;
  - **Design** : plan de travail quadrillé, repères, une affiche qui se construit, sélection avec poignées, « 1080 × 1350 », curseur ;
  - **Web** : fenêtre de navigateur, « egcstudio » tapé dans la barre d'adresse, une page qui se met en place.
- Sous le cadre, le nom du métier (FR/EN, repris de `crafts` dans `dict.ts`) et « 01 / 04 · Je photographie ». En bas, une barre en quatre segments suit la progression.
- **Fin** : les quatre segments montent en quatre panneaux jaunes (un par métier, comme les faces du prisme), le logo « egc studio. » s'écrit dessus, puis les panneaux se lèvent l'un après l'autre et le prisme du hero monte.
- Inchangé : une fois par visite, fondu rapide ensuite, bouton « Passer l'intro » (même avant le JavaScript), Échap, limite de temps, filet de sécurité CSS, mode doux (image finale puis fondu).

## Assistant : plusieurs services dans une même demande (09/11)

- **Le problème** : un client qui voulait photo + vidéo + design pour le même événement ne pouvait choisir qu'un service, et toutes les catégories recevaient les mêmes questions.
- **Choix des services** : les tuiles Photo, Vidéo, Design graphique et Site web se cochent (une ou plusieurs), puis « Continuer ». « Poser une question » reste une entrée à part. Un bouton qui ouvre l'assistant sur un service (page Web) le coche d'avance ; on peut en ajouter d'autres.
- **Questions communes, posées une seule fois** : le projet (mariage, anniversaire, église, entreprise, produits… : les choix suivent les services cochés), la date (ou « pour quand » pour un design ou un site seuls), le lieu et le nombre de personnes (seulement avec photo ou vidéo), le nom.
- **Questions par service** (choix rapides, texte libre possible, « Passer » sur les questions facultatives) :
  - Photo : ce qu'il faut couvrir (cérémonie, réception, portraits, produits…), la livraison (sélection retouchée, album, tirages) ;
  - Vidéo : le format (film complet, clip des temps forts, reels, drone), la durée ;
  - Design graphique : les supports (affiche, logo, posts, kakémono, invitation, carte de visite) avec nombre et usage en texte libre, et si les textes et le logo existent déjà ;
  - Site web : le type de site, ce qui est déjà prêt (domaine, logo, textes, site actuel), les pages ou fonctions et le lien du site actuel.
- **Progression** : la barre compte les vraies questions de la demande (7 pour une photo seule, 11 pour photo + vidéo + design, 5 pour un site seul).
- **Message WhatsApp et récapitulatif** : regroupés par service (« Services : Photo, Vidéo, Design graphique », puis un bloc par service, puis les infos pratiques : date, lieu, personnes, nom), en texte simple avec des puces.
- **Jamais d'argent** : aucune question de budget, de prix ou de zone de déplacement ; Egu les traite dans son devis.
- **IA (« Décrire mon projet en une phrase »)** : `worker/brief.mjs` renvoie maintenant une liste de services et des détails par service, toujours vérifiés contre les mots du visiteur ; l'assistant ne pose ensuite que les questions manquantes. Tests du Worker : 24 (`npm run test:worker`).
