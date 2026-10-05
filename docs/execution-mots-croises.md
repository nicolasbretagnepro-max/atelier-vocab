# Journal — plan: docs/superpowers/plans/2026-10-05-mots-croises.md

Ruling: créer les documents et développer dans ce tour, conformément à « prépare des lots et développe » et à la conception déjà présentée. Pas de nouvelle boucle d'approbation ; coût si l'intention diffère : modifications locales réversibles.

Ruling: réutiliser le clone dédié et la branche codex/learning-improvements propres contenant les lots précédents. Pas de nouveau checkout ni modification de main ; coût : les deux fonctionnalités sont regroupées sur la même branche locale.

Ruling: journal Markdown et commandes Windows plutôt que les scripts POSIX du skill. Coût : suivi manuel.

Prévol : moteur → Worker et composant, grille {entries,cells,rows,cols} ; composant → App, résultat {id,role,rating} ; adaptation des données → moteur, candidats déjà classés selon les règles existantes. Interfaces décrites dans les tests.

Base du nouveau travail : 17dbe24 (bilan des lots précédents).
Lot 1 : moteur indépendant, sélection 70/30 arrondie, grille connexe 11×11 maximum et recherche bornée. Cinq tests rouges puis verts ; grille de test produite en moins de 50 ms sur le runtime local (pas une mesure iPhone).
