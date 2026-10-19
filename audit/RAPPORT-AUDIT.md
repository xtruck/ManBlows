# Audit du site public — Institut Loukou Kouadio Michel (Institut LKM, ILKM), Yopougon

| | |
|---|---|
| **Site examiné** | https://www.institutlkm.ci/ |
| **Contrôles** | 19/10/2026 à 17:20, 17:22 et 18:07 UTC |
| **Réalisé par** | RealSpill — audit indépendant, sans contact avec l'institut ni accès administrateur |
| **Statut** | ⚠️ **AUDIT INCOMPLET** : le site n'a pas pu être affiché lors des trois contrôles. |

> Ce rapport ne conclut **pas** que le site est abandonné : l'indisponibilité peut venir d'un nom de
> domaine expiré ou en cours de renouvellement, d'une configuration DNS modifiée ou d'une migration.
> Seul le titulaire du domaine peut en établir la cause.
>
> Orthographe : les sources publiques écrivent « Loukou Kouadio Michel » (sigle LKM) ; la demande initiale
> mentionnait « Loucou ». À confirmer avec l'institut.

## 1. Disponibilité — observations

| # | Adresse | Résultat | Preuve |
|---|---|---|---|
| D1 | `www.institutlkm.ci` | **Aucune résolution DNS** | `getent ahosts` vide à 17:22 et 18:07 ; service de récupération distinct : `getaddrinfo ENOTFOUND www.institutlkm.ci` ; `evidence/journal-controles.md` |
| D2 | `institutlkm.ci` (sans www) | **Aucune résolution DNS** | `curl: Could not resolve host: institutlkm.ci` ; `getent` vide |
| D3 | Pages indexées | Les moteurs de recherche référencent encore des pages du site : `/a-propos-de-linstitut-lkm-dabidjan-yopougon/`, `/institut-lkm-de-yopougon-ce-quil-faut-savoir/`, `/contacts/`, `/references/` | Résultats de recherche du 19/10/2026 (indexation ancienne, environ 1 500 à 2 500 jours selon le moteur) |

**Conséquence confirmée** : un futur étudiant qui clique sur un résultat Google vers le site de l'institut
obtient une erreur « site introuvable ». À terme, ces pages risquent d'être retirées de l'index.

## 2. Axes non évaluables (site inaccessible)

Présentation de l'institut sur le site · catalogue des filières en ligne · conditions d'admission ·
informations pratiques · demandes de renseignements · fonctionnement des formulaires publics ·
expérience mobile · performances · accessibilité · référencement on-page.

➡️ À auditer dès la remise en ligne, ou sur une copie fournie par l'institut.

## 3. Cohérence des informations publiques (sources tierces et index)

Aucune de ces informations n'a été confirmée par l'institut. Elles ne sont **pas** reprises comme vraies
dans la maquette, seulement comme « source publique · à confirmer ».

| Sujet | Ce que montrent les sources | Cohérence |
|---|---|---|
| Localisation | Yopougon Ananeraie, route de Dabou (repères : centre de formation SODECI, Manutention Africaine, arrêt de bus 34 après le CHU de Yopougon) | ✅ convergent |
| BTS | Pages indexées du site : 5 BTS (Informatique de développement d'applications, Logistique, Finance comptabilité et gestion d'entreprises, Assistanat de direction, Ressources humaines et communication) ; un annuaire ajoute la **Gestion commerciale** | ⚠️ 5 ou 6 filières selon la source |
| Secteurs | Une autre page du site annonce **10 secteurs d'activité** (finance, immobilier, logistique, gestion commerciale, assistanat, RH & communication, informatique, marketing & publicité, carrières juridiques, comptabilité & gestion) | ⚠️ plus large que la liste des BTS |
| Niveaux | BTS (bac+2), Licence professionnelle (bac+3) ; certains annuaires citent aussi master, ingénierie, primaire et secondaire | ⚠️ périmètre à confirmer |
| Téléphones | Numéros différents selon les pages et annuaires | ⚠️ à unifier |
| Fiche annuaire « Le Grand Frère » | Titre « Institut LKM » mais adresse de page faisant référence à un autre établissement (« ISTCI Yopougon ») | ⚠️ fiche tierce incohérente, à faire corriger |
| Presse | Une recherche fait remonter un article de janvier 2020 relayant un différend avec des parents d'élèves | Contexte d'image ; ce rapport ne se prononce pas sur ces faits |

Sources : [institutlkm.ci (page indexée « À propos »)](https://www.institutlkm.ci/a-propos-de-linstitut-lkm-dabidjan-yopougon/) ·
[institutlkm.ci (page indexée « Contacts »)](https://www.institutlkm.ci/contacts/) ·
[upesup.ci](https://upesup.ci/affiche_ecole.php?id=INSTITUT+LKM) ·
[pratik-ci.com](https://pratik-ci.com/details/institut-lkm) ·
[legrandfrere.africa](https://legrandfrere.africa/etablissement/institut-superieur-de-technologie-de-cote-divoire-yopougon-istci-yopougon/) ·
[abidjan.net](https://civ.abidjan.net/vivre/etablissements-scolaires/abidjan/enseignement-superieur/prive/693-insitut-lkm) ·
[business.abidjan.net (biographie du fondateur)](https://business.abidjan.net/qui/19-biographie/950-loukou-kouadio-michel)

## 4. Problèmes identifiés

| # | Page | Problème observé | Preuve | Solution technique | Intérêt commercial | Priorité |
|---|---|---|---|---|---|---|
| P1 | Tout le site | Le domaine `institutlkm.ci` ne se résout plus (avec ou sans `www`) | D1, D2 : trois contrôles, deux réseaux | Vérifier le renouvellement du `.ci` auprès du registraire, restaurer les enregistrements DNS, remettre le site en ligne avec HTTPS | Les candidats qui cherchent l'institut retrouvent un site ; fin des visites perdues pendant la période d'inscription | **Critique** |
| P2 | Pages indexées | Les liens Google mènent à une erreur | D3 | Remise en ligne en conservant les mêmes adresses, ou redirections 301 vers les nouvelles pages ; sitemap soumis à Google Search Console | Préserve le référencement accumulé depuis des années | **Critique** |
| P3 | Catalogue | Liste des filières différente selon les sources (5 BTS, 6 BTS, 10 secteurs) | §3 | Catalogue unique, structuré (filière, niveau, durée, diplôme, conditions), publié sur le site et repris dans les annuaires | Les candidats comparent en ligne : une offre claire rassure | **Haute** |
| P4 | Contact | Numéros de téléphone différents selon les sources | §3 | Coordonnées uniques sur le site, en données structurées, et formulaire de renseignements | Moins d'appels perdus, demandes traçables | **Haute** |
| P5 | Annuaires | Fiche tierce mélangeant l'institut avec un autre établissement | §3 | Demander la correction de la fiche, lien vers le site officiel | Image et référencement | **Moyenne** |
| P6 | Réputation en ligne | Peu de contenu récent face à des résultats anciens | Indexation de plus de 4 ans, article de 2020 | Rubrique actualités régulière (rentrées, partenariats, diplômés) | Une présence récente et maîtrisée améliore la confiance | **Moyenne** |
| P7 | Non évaluable | Formulaires, mobile, performances, accessibilité | §2 | Audit complémentaire après remise en ligne | — | À planifier |

## 5. Recommandations priorisées

1. **Immédiat** : rétablir le domaine et le DNS (accès registraire requis), puis HTTPS et redirections.
2. **Court terme** : remettre en ligne un site centré sur les futurs étudiants (catalogue, fiches filières,
   admissions, demande de renseignements) : voir la maquette indépendante dans [`../maquette/`](../maquette/).
3. **Court terme** : unifier filières et coordonnées sur le site, la fiche Google et les annuaires.
4. **Moyen terme** : publication régulière d'actualités ; surveillance de disponibilité et rappel de
   renouvellement du domaine.

## 6. Conclusion

L'opportunité est **réelle** : le site officiel est introuvable alors que l'institut reste recherché et
référencé. La proposition peut porter sur la remise en ligne (domaine, hébergement, HTTPS) et un nouveau site
orienté candidats. À ne pas affirmer au prospect : que le site ou l'institut sont abandonnés.
