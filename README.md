# Proposition RealSpill — Espace Kignon (Yopougon Maroc, Abidjan)

Travail **indépendant**, sans contact avec l'établissement ni accès administrateur. Rien n'est publié ;
ce dépôt doit rester **privé**.

- [`audit/RAPPORT-AUDIT.md`](audit/RAPPORT-AUDIT.md) — audit exploratoire (**incomplet** : le site
  `www.espacekignon.com` était inaccessible lors des contrôles du 19/10/2026), problèmes priorisés,
  cohérence des informations publiques, recommandations. Preuves dans `audit/evidence/`.
- [`maquette/`](maquette/) — proposition de nouvelle interface (Next.js + TypeScript + Tailwind CSS) :
  accueil, menu, galerie, location de salle, réservation, contact, page de transparence.
- [`maquette/INFOS-A-OBTENIR.md`](maquette/INFOS-A-OBTENIR.md) — éléments à valider avec l'établissement.

```bash
cd maquette && npm install && npm run dev   # http://localhost:3000
```
