# Inspiration : preloader EGC Studio

Recherche faite une seule fois (octobre 2026). À réutiliser, ne pas refaire.
Limite : YouTube n'est pas lisible par les outils de Claude (page JavaScript) ; les liens
vidéo peuvent être collés à la main si on veut s'en inspirer.

## Références trouvées
- Aperture Folio (template Framer) : preloader à diaphragme géométrique + transitions fluides, pour photographes.
- Lens pre-loader (composant Framer) : l'écran de chargement suit le vrai chargement des assets.
- Page Preloader (Framer) : option « montrer une seule fois par session ».
- Awwwards, galerie « pre-loader » : références GSAP / CSS / WebGL (Anton Tvinenko, T-KO portfolio).
- dev.to « Polaroid camera with CSS gradients only » : réalisme par empilement de dégradés.

## Techniques de réalisme retenues
- Empiler plusieurs dégradés par surface : le premier listé est au-dessus.
- Mettre une teinte plus sombre au-dessus d'un dégradé pour la profondeur.
- Verre de la lentille : reflet en demi-lune blanc adouci + petits reflets à faible opacité,
  plus un fond radial presque noir (#5B5758 → #302C2D → #131112).
- Boutons : fine ombre sombre dehors + liseré blanc intérieur (relief).
- Cuir : motif de grain (pattern/bruit SVG), pas un dégradé.

## Idées pour la séquence (effort : F faible, M moyen, E élevé)
- F : la bague de mise au point tourne avec la progression, ses crans défilent.
- F : posemètre (échelle -2..+2) dont l'aiguille se cale quand tout est prêt.
- F : compteur de vues « 001 » et mention ISO / vitesse sur l'écran arrière.
- F : reflet spéculaire qui balaie le métal du boîtier pendant le chargement.
- M : inclinaison 3D légère de l'appareil selon la souris / le téléphone.
- M : lamelles du diaphragme avec ombre portée entre chaque lamelle.
- M : reflets violet/vert des traitements de lentille qui bougent.
- E : vrai rendu 3D (le modèle GLB existe déjà dans la page d'accueil).
