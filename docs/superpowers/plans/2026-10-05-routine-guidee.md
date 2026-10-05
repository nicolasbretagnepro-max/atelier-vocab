# Routine guidée — plan de développement

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Une routine de 5 à 10 minutes qui enseigne avant de tester, fait revenir les mots en acquisition et conserve le Boss.

**Architecture:** Moteur pur UMD pour les preuves et la sélection, intégré aux profils et au flux React existant. Exercices guidés sans dépendance aux métadonnées QCM, répétition espacée conservée pour la consolidation.

**Tech Stack:** JavaScript, React 18, Babel standalone, node:test, service worker.

**Spec:** `docs/superpowers/specs/2026-10-05-routine-guidee-design.md`

## Global Constraints

- Routine de 5 à 10 minutes maximum ; budget 24 rencontres plus deux retours maximum.
- Deux nouveautés par jour par défaut, réglables à une ou trois ; dix mots actifs cibles et quatre anciennes révisions dues maximum.
- Conserver IDs, anciennes progressions, sources automatiques et cinq repères jusqu'au Boss.
- Les réponses guidées ne comptent pas comme rappel autonome et n'allongent pas SM-2.
- Inputs >=16px ; grille de 5–8 mots, onze cases maximum par dimension.

## Review Focus

- Ancien profil avec beaucoup de mots faibles : rotation des actifs et session bornée.
- Erreur après un succès le même jour : ne pas garder une preuve autonome trompeuse.
- Absence de QCM validé pour un mot nouvellement importé : découverte et indices fonctionnent quand même.
- Exemple conjugué ou trou non alignable : accepter la forme source ou revenir à une définition guidée.
- Aucun mot maîtrisé et corpus peu intersectable : grille découverte clairement annoncée, jamais succès de maîtrise inventé.

### Lot 1 : preuves d'apprentissage et profils

**Files:** `learning-engine.js`, `index.html`, `tests/acquisition.test.cjs`, helpers de tests.

**Interfaces:** `AtelierLearning.normalize(progress, day)`, `record(progress,{kind,ok,assisted},day)`, `level(progress,day)` ; `gradeWord(...,customXp,evidence)` conserve la compatibilité des cinq arguments existants.

- [x] Tests RED : mêmes jours ne suffisent pas ; aide jamais autonome ; deux jours autonomes + sens/contexte consolident ; oubli réactive ; profile round-trip conserve les preuves et dates SM-2.
- [x] Implémenter le moteur et son intégration aux migrations/grading ; modes anciens conservés.
- [x] Vérifier tests ciblés puis `node tests/run.cjs` ; commit du lot.

### Lot 2 : composition de la routine

**Files:** `learning-engine.js`, `index.html`, `tests/acquisition.test.cjs`, `tests/learning.test.cjs`.

**Interfaces:** `selectDaily(words,state,options,day,now)` → `{discover,active,due,waiting}` ; `buildDailySession` → cinq files de mots et métadonnées de charge.

- [x] Tests RED : deux nouveautés par défaut ; retour quotidien malgré date SM-2 future des actifs ; chaque actif servi ; anciens profils bornés avec rotation ; futurs consolidés exclus ; corpus réduit ; nouveau mot sans QCM ; maximum 24 questions.
- [x] Composer les cinq files avec des difficultés propres à chaque mot ; plafonner Boss à trois et les retours à deux dans toute la routine.
- [x] Vérifier suite complète ; commit du lot.

### Lot 3 : apprentissage guidé et contexte juste

**Files:** `index.html`, `tests/component.test.cjs`, `tests/acquisition.test.cjs`.

**Interfaces:** `GuidedRecall({word,level,context,exampleIndex,onAnswer})` → réponse `{kind,ok,assisted}` ; `contextAnswer(word,index)` → `{prompt,answer}` ou null.

- [x] Tests RED : découverte révèle immédiatement le sens ; fallback aidé ; Exulter accepte exultent et exulter ; trou mal aligné exclu ; indice ne valide pas un rappel autonome ; correction attend un clic ; parcours complet atteint Boss sans QCM disponible.
- [x] Adapter DailyTab et le fallback commun ; conserver les filtres de distracteurs validés.
- [x] Vérifier suite et parcours mobile ; commit du lot.

### Lot 4 : réglages et bilan utiles

**Files:** `index.html`, `tests/acquisition.test.cjs`, `tests/component.test.cjs`.

**Interfaces:** préférences `learningSettings.newPerDay` stockées dans le profil ; Dashboard/DailyTab consomment le réglage.

- [x] Tests RED : réglage import/export ; limites 1–3 ; bilan distingue aide/rappel et indique les mots qui reviennent demain ; modes complémentaires restent accessibles.
- [x] Ajouter réglage accueil, compteur global et bilan ; réduire le bruit en début de routine.
- [x] Vérifier suite et lisibilité 393×852 ; commit du lot.

### Lot 5 : mots croisés, revue et livraison

**Files:** `crossword-engine.js`, `crossword-ui.jsx`, `index.html`, `sw.js`, tests crossword/SW, documentation livraison.

**Interfaces:** candidats rôles due/known/practice, quota préféré avec repli flexible ; grille découverte neutre si nécessaire.

- [x] Tests RED : grille sans maîtrisés ; supports actifs/récents ; grille découverte sur corpus initial ; aide sans preuve autonome ; corpus impossible expliqué ; assets PWA complets.
- [x] Implémenter les replis et ajuster les libellés ; versionner le cache.
- [x] Suite complète, compilation, parcours réel mobile novice et utilisateur avancé ; revue indépendante de toute la branche, corriger les constats importants.
- [x] Commits, intégration sans écraser les changements distants et publication sous l'autorisation déjà donnée ; vérifier les fichiers publics.
