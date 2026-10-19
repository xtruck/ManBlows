# Proposition RealSpill — Institut LKM (Loukou Kouadio Michel), Yopougon

Travail **indépendant** : aucun contact avec l'institut, aucune modification du site existant, rien de
publié. Ce dépôt doit rester **privé**.

- [`audit/RAPPORT-AUDIT.md`](audit/RAPPORT-AUDIT.md) — audit (**incomplet** : le domaine `institutlkm.ci`
  ne se résolvait plus lors des trois contrôles du 19/10/2026), cohérence des informations publiques,
  problèmes priorisés et recommandations.
- [`maquette/`](maquette/) — maquette indépendante (Next.js + TypeScript + Tailwind CSS) : accueil,
  catalogue filtrable, fiche détaillée par filière, admissions, actualités, contact. Sans portail
  étudiant, sans paiement, sans collecte de pièces.
- [`maquette/INFOS-A-OBTENIR.md`](maquette/INFOS-A-OBTENIR.md) — tout ce qui doit être confirmé par l'institut.

```bash
cd maquette && npm install && npm run dev   # http://localhost:3000
```
