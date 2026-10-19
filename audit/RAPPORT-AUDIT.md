# Audit exploratoire — site public d'Espace Kignon (Yopougon Maroc, Abidjan)

| | |
|---|---|
| **Site examiné** | https://www.espacekignon.com/ |
| **Dates des contrôles** | 19/10/2026, 17:19 UTC et 17:55 UTC (deux séries identiques) |
| **Réalisé par** | RealSpill — audit indépendant, sans accès administrateur ni contact avec l'établissement |
| **Statut** | ⚠️ **AUDIT INCOMPLET** : le site n'a pas pu être affiché. Seuls la disponibilité et la cohérence des informations publiques ont pu être évaluées. |

> Ce rapport ne conclut **pas** que le site est abandonné. L'indisponibilité peut venir d'un nom de domaine
> mal configuré, d'un hébergement expiré ou en migration, ou d'une panne temporaire. Seul le propriétaire
> du domaine peut en établir la cause.

## 1. Disponibilité du site — observations

| # | Adresse testée | Résultat observé | Preuve |
|---|---|---|---|
| D1 | `https://www.espacekignon.com/` | **Le nom `www.espacekignon.com` ne se résout pas** (aucune adresse IP). | Échec DNS depuis deux réseaux indépendants : le conteneur d'audit (`getent ahosts` vide, `curl: Could not resolve host` en HTTP) et un service de récupération web distinct (`getaddrinfo ENOTFOUND www.espacekignon.com`). Journal `evidence/journal-controles.md`. |
| D2 | `https://espacekignon.com/` (sans www) | Le domaine pointe vers `45.94.36.34`, mais le serveur présente un **certificat émis pour un autre nom** (`CN=de-free.fxccc.cc`). Les navigateurs affichent une alerte de sécurité. | `curl -v` : « SSL: no alternative certificate subject name matches target host name 'espacekignon.com' ». |
| D3 | `http://espacekignon.com/` | **HTTP 503 Service Unavailable** : « upstream connect error or disconnect/reset before headers… remote connection failure ». | Réponse brute dans `evidence/journal-controles.md`. |
| D4 | Archives (Wayback Machine) | Non consultables depuis l'environnement d'audit (HTTP 429 puis accès refusé). | — |

**Conséquence :** aujourd'hui, un client qui tape l'adresse du site ne voit **aucune page** : soit une
erreur « site introuvable », soit une alerte de sécurité, soit une erreur 503.

## 2. Points de l'audit non évaluables (site inaccessible)

Qualité de la page d'accueil · présentation du menu et des spécialités · qualité des photos ·
navigation mobile · vitesse de chargement · liens de contact et de réservation · référencement
on-page (titres, métadonnées, données structurées) · accessibilité.

➡️ Ces points devront être audités **dès que le site sera de nouveau en ligne**, ou à partir d'une
copie fournie par l'établissement.

## 3. Cohérence des informations publiques (sources tierces)

Recherche du 19/10/2026. Ces informations n'ont **pas** été confirmées par l'établissement.

| Information | Ce que disent les sources | Cohérent ? |
|---|---|---|
| Type d'établissement | Resto-bar-lounge, spécialités ivoiriennes, terrasse en plein air (baab.ci) ; « Bar & Lounge » (sikaplaces.com) | ✅ globalement |
| Adresse | Yopougon Maroc, carrefour Anador (baab.ci, sikaplaces.com) | ✅ |
| Téléphones | Deux numéros publiés sur le compte TikTok de l'établissement « pour toutes informations » | ⚠️ à confirmer (non repris dans la maquette) |
| Horaires | baab.ci : **fermé le lundi, 16h – minuit** les autres jours · sikaplaces.com : **12h – 23h tous les jours** | ❌ **contradictoires** |
| Budget | 4 000 – 14 000 FCFA, moyenne 7 000 FCFA (sikaplaces.com) | Non vérifiable |
| Avis | Note Google 3,8/5 sur 212 avis, relayée par sikaplaces.com ; un article ancien évoque plus de 30 min d'attente un samedi soir | Information de contexte |
| Événements | Location de salle pour événements (publications TikTok) | ⚠️ à confirmer |

Sources : [baab.ci](https://baab.ci/etablissements_baab/espace-kignon/) ·
[sikaplaces.com](https://www.sikaplaces.com/restaurants/espace-kignon-youpougon-maroc-yopougon-abidjan/2861) ·
[TikTok (recherche publique)](https://www.tiktok.com/discover/kignon-restaurant-yopougon-maroc) ·
[afroepicurienwebzine.com](https://www.afroepicurienwebzine.com/563-2/) ·
[tripinafrica.com](https://www.tripinafrica.com/restaurants/abidjan/espace-kignon)

## 4. Problèmes identifiés

| # | Page concernée | Problème réellement observé | Preuve / observation | Solution technique proposée | Intérêt commercial | Priorité |
|---|---|---|---|---|---|---|
| P1 | Toutes (domaine `www`) | Le sous-domaine `www` n'existe pas dans le DNS | D1 : échec de résolution depuis deux réseaux indépendants | Recréer l'enregistrement DNS `www` (CNAME ou A) chez le registraire ; rediriger `www` ↔ domaine nu en 301 | Le site redevient joignable à l'adresse communiquée ; aucun client perdu sur une page d'erreur | **Critique** |
| P2 | Toutes (domaine nu) | Certificat HTTPS d'un autre site (`de-free.fxccc.cc`) | D2 : erreur de correspondance du certificat | Vérifier à qui appartient le serveur `45.94.36.34` ; héberger le site chez un prestataire fiable avec certificat Let's Encrypt automatique | Supprime l'alerte « connexion non sécurisée » qui fait fuir les visiteurs ; protège la réputation de la marque | **Critique** |
| P3 | Toutes | Erreur 503 en HTTP | D3 : « upstream connect error » | Redéployer le site (ou un site neuf) sur un hébergement supervisé, avec alerte de disponibilité | Site disponible en permanence ; surveillance incluse dans un contrat de maintenance | **Critique** |
| P4 | Informations publiques | Horaires contradictoires entre annuaires | §3 : 16h–minuit (fermé lundi) vs 12h–23h tous les jours | Publier les horaires officiels sur le site (et en données structurées `openingHours`), puis corriger les fiches Google et annuaires | Évite les déplacements inutiles et les avis négatifs ; meilleure visibilité locale | **Haute** |
| P5 | Informations publiques | Pas de canal unique et vérifié pour réserver ou louer la salle | Numéros diffusés via TikTok ; aucune page officielle consultable | Formulaires de réservation et de location de salle + bouton WhatsApp Business sur le site | Transforme l'audience TikTok en demandes concrètes, traçables | **Haute** |
| P6 | Référencement local | Le site ne peut pas soutenir la fiche Google (3,8/5, 212 avis) | Site inaccessible ; aucune page de référence | Site rapide avec JSON-LD `Restaurant`, sitemap, liens vers les réseaux officiels, lien depuis la fiche Google | Meilleur positionnement sur « restaurant Yopougon », « lounge Yopougon » | **Moyenne** |
| P7 | Non évaluable | Contenu, photos, mobile, vitesse, accessibilité | Site inaccessible (§2) | Audit complémentaire quand le site sera en ligne | — | À planifier |

## 5. Recommandations priorisées

1. **Immédiat (accès au domaine requis)** : rétablir le DNS `www`, mettre en place un hébergement avec
   certificat valide et une redirection unique vers l'adresse officielle.
2. **Court terme** : remettre en ligne un site léger et à jour (accueil, menu, galerie, réservation,
   location de salle, contact) : voir la maquette indépendante dans [`../maquette/`](../maquette/).
3. **Court terme** : unifier horaires et numéros sur le site, la fiche Google et les annuaires.
4. **Moyen terme** : surveillance de disponibilité et renouvellement automatique du domaine et du certificat.
5. **Après remise en ligne** : compléter cet audit (performances mobiles, accessibilité, SEO on-page).

## 6. Conclusion

L'opportunité commerciale est **réelle et urgente** : l'adresse du site ne mène aujourd'hui à aucune page
utilisable, alors que l'établissement a une audience active (212 avis Google, présence TikTok). Une
proposition « remise en ligne + nouveau site + maintenance » est pertinente, à condition que l'établissement
confirme être toujours propriétaire du domaine `espacekignon.com`.

**À ne pas affirmer au prospect** : que le site est abandonné, ou que le serveur actuel lui appartient. Ces
deux points sont inconnus.
