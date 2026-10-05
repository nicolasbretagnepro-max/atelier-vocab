# Mots croisés Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Exécution continue autorisée par l'utilisateur.

**Goal:** Ajouter une brique de mots croisés pédagogique depuis l'accueil, lisible sur iPhone 15.

**Architecture:** Moteur JavaScript indépendant partagé avec un Worker ; composant React séparé ; adaptation des données et raccordement à App dans index.html. Aucun backend ni dépendance supplémentaire.

**Tech Stack:** React 18, JavaScript, Worker, CSS, localStorage existant, Node et Babel pour les tests.

**Spec:** [Cadrage](../specs/2026-10-05-mots-croises-design.md).

## Global Constraints

- Cinq à huit mots ; sept visés, grille 11×11 maximum, quotas arrondis 70/30.
- Calendrier respecté ; une note maximum par mot ; aucune note pour les appuis maîtrisés ou mots entièrement fournis.
- Carte lisible sous la grille, inputs 20 px, clavier et focus cohérents.
- Pas de nouvelle bibliothèque, de changement des profils ou de publication.

## Review Focus

- Profil sans mots dus ou maîtrisés : pas de mélange inventé ; explication et retour à la révision.
- Corpus incompatible avec les intersections : arrêt borné, grille de cinq mots minimum ou message.
- Saisie rapide, collage et intersections verrouillées : lettres et focus cohérents, notes uniques.
- Clavier iOS ou fermeture pendant génération : carte visible, annulation, aucun résultat tardif.
- Hors ligne et ancienne PWA : assets complets et nouvelle version de cache.

## Lot 1 — Moteur et sélection

Files : crossword-engine.js, tests/crossword.test.cjs.

- [x] Écrire puis exécuter les tests rouges : normalisation, pools/quotas, grille connexe et compacte, placements illégaux, budget.
- [x] Implémenter sélection, recherche bornée et modèle de grille.
- [x] Tester ; enregistrer le lot.

## Lot 2 — Saisie et interface mobile

Files : crossword-engine.js (état de jeu), crossword-ui.jsx, crossword.css, tests/crossword.test.cjs, tests/compile.cjs.

- [x] Tests rouges : saisie, retour arrière, collage, intersections, vérification unique, révélation, mots entièrement fournis.
- [x] Implémenter transitions pures et composant : focus, sélection, carte, validation, fermeture/reprise et bilan.
- [x] Compiler et vérifier les transitions ; enregistrer le lot.

## Lot 3 — Accueil, Worker, progression et PWA

Files : index.html, crossword-worker.js, sw.js, tests/app-helper.cjs, tests/crossword-integration.test.cjs, tests/sw.test.cjs.

- [x] Tests rouges de raccordement : sélection selon progression réelle, ancien profil, mots futurs exclus, SRS/XP, Worker et cache.
- [x] Adapter les données, charger le moteur/composant, ajouter la carte d'accueil, génération asynchrone, erreurs et annulation.
- [x] Évaluer via le moteur existant, uniquement pour les mots dus encore admissibles ; ne pas reprendre une réussite déjà notée.
- [x] Renouveler le cache et exécuter les tests ; enregistrer le lot.

## Lot 4 — Validation et livraison

Files : tests/make-crossword-fixture.cjs, docs/livraison-mots-croises.md, journal.

- [x] Suite complète et compilation.
- [x] Scénarios navigateur : mobile, sélection/entrée, erreur/correction, reprise, absence de grille, viewport réduit.
- [x] Revue indépendante du nouveau travail ; corriger les défauts importants avec régressions.
- [x] Bilan, instructions et patch ; conserver la branche locale sans publier.
