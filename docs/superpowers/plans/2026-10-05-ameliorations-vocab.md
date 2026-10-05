# Lots d'amélioration Atelier Vocab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intégrer les sept améliorations d'apprentissage et d'engagement dans cinq lots fonctionnels, après vérification des corrections existantes.

**Architecture:** Conserver l'application React dans index.html pour les premiers lots. Intégrer les fonctions d'engagement comme fonctions pures et composants dédiés, puis faire passer les formats de la séance courte par le moteur SRS existant. Le corpus validé utilise un fichier local versionné avec cache de secours ; aucune réécriture des données distantes n'est requise.

**Tech Stack:** React 18, JavaScript, localStorage, PWA/service worker, tests Node, Babel pour la vérification JSX.

**Spec:** [Cadrage des améliorations](../specs/2026-10-05-ameliorations-vocab-design.md).

## Global Constraints

- Conserver les identifiants des mots et les profils existants.
- Respecter les échéances du moteur SRS, quel que soit le format.
- Conserver le repli vers la saisie libre lorsque les distracteurs validés sont insuffisants.
- Ne pas publier de distracteurs non validés pour remplir un QCM.
- Ne pas modifier les Gists distants pendant l'implémentation locale.
- Un lot doit fonctionner et être vérifiable indépendamment avant le suivant.
- Ne pas imposer une refonte technique pour intégrer les fonctionnalités.
- Préparer la publication après les validations ; la publication n'est pas incluse dans la demande de création des lots.

## Fichiers et responsabilités

- Modifier index.html : modèle de progression, accueil, feedback et sessions.
- Modifier sw.js : version du cache et nouvelles données locales du lot 5.
- Réutiliser engagement-examples.jsx : exemples déjà préparés, à adapter avant intégration.
- Conserver tests/learning.test.cjs : seize régressions du moteur.
- Adapter tests/engagement.test.cjs : tester le code intégré plutôt que les seuls exemples.
- Modifier tests/compile.cjs et tests/make-ui-fixture.cjs : compilation et scénarios navigateur.
- Créer tests/short-session.test.cjs : composition et progression de la séance courte.
- Créer tests/qcm-review-data.test.cjs : validation de la couche éditoriale.
- Créer tools/audit-vocab.cjs : rapport déterministe, sans appel externe.
- Créer data/qcm-reviewed.json : validations éditoriales exactes et versionnées.

## Ordre et dépendances

0 → 1 → 2 → 3 → 4 → 5.

Le lot 1 peut techniquement être livré sans le lot 2, et le lot 5 sans le lot 4. Une exécution séquentielle est recommandée car les lots partagent index.html et la sauvegarde des profils. Ce plan ne demande pas de nouvelles conversations ni de délégation.

## Review Focus

- Profil ancien ou partiellement importé : pas de remise à zéro ni de compteur inventé ; lots 0 et 1.
- Application ouverte pendant minuit ou une absence : objectif et flamme actualisés selon le jour local ; lot 1.
- Petit corpus, file vide et erreurs répétées : séance terminable sans élimination, boucle ni récompense fictive ; lots 2 et 3.
- Absence de contexte ou mot visible dans une phrase à trou : choisir un autre format sans pénaliser l'utilisateur ; lots 2 et 4.
- Données éditoriales devenues obsolètes ou réseau indisponible : invalider les choix concernés et utiliser le cache ou la saisie libre ; lot 5.

---

### Lot 0 Vérifier et intégrer le socle corrigé

**État :** lots 0 à 5 intégrés sur la branche locale `codex/learning-improvements` ; publication non effectuée.

**Files:** index.html, sw.js, atelier-vocab-corrections.patch, tests/learning.test.cjs, tests/compile.cjs.

**Interfaces:** conserver gradeWord(state,id,rating,mode,customXp), scheduleReview(progress,rating,now), candidates(state,words,mode,n,excludeIds).

- [ ] Vérifier le dépôt cible et sa révision ; appliquer le patch dans un clone complet en conservant les icônes, sans écraser de travail existant.
- [ ] Exécuter `node tests/learning.test.cjs` ; attendu : seize tests passent.
- [ ] Exécuter `node tests/compile.cjs` avec Babel de test disponible ; attendu : compilation JSX réussie.
- [ ] Tester dans le navigateur une ancienne progression, un mot dû, une erreur, un succès et un QCM sans distracteurs validés.
- [ ] Préparer un changement Git limité aux correctifs et tests, sans publier l'application.

**Critère de sortie :** aucune régression et base complète prête pour les lots fonctionnels.

### Lot 1 Objectif quotidien et flamme fiable

**Files:** index.html : gradeWord, DEFAULT_META, Dashboard, App ; tests/engagement.test.cjs.

**Interfaces:**
- recordDailyPractice(meta,id,now=new Date()) → meta avec practiceDays.
- dailyGoalStatus(meta,goal=5,now=new Date()) → {count,goal,completed}.
- visibleDailyStreak(meta,now=new Date()) → entier.
- DailyGoal({meta,goal=5,now}) → composant.
- Un jour local change au passage de minuit et au retour au premier plan ; l'état est recalculé sans recharger l'application.

- [ ] Écrire des tests : deux réponses au même ID comptent pour un ; cinq IDs donnent completed=true ; une erreur compte ; un ancien profil commence à zéro ; après deux jours sans interaction la flamme affichée vaut zéro.
- [ ] Exécuter `node tests/engagement.test.cjs` et confirmer l'échec sur les nouveaux comportements avant leur intégration.
- [ ] Intégrer les fonctions et enregistrer practiceDays sur toutes les branches de gradeWord, y compris discover ; conserver les données lors de loadProgress, import/export et saveProgress.
- [ ] Ajouter DailyGoal à l'accueil et corriger les affichages de flamme ; vérifier le changement de jour, les dates locales et le retour au premier plan.
- [ ] Relancer les tests du moteur, de l'engagement et la compilation ; préparer un commit `feat: add daily word goal and accurate streak`.

**Critère de sortie :** objectif visible et persistant, cinq mots distincts, absence de doublons et compteur quotidien cohérent.

### Lot 2 Erreurs utiles et apprentissage sans élimination

**Files:** index.html : StepChoice, ReviewQuizChoice, StepContext, StepProd, SafeRecallFallback, DailyTab, QuizSession, QuizTabNew, NuanceQuiz, FigureRoutine, FigurePractice ; tests/engagement.test.cjs ; tests/make-ui-fixture.cjs.

**Interfaces:**
- learningFeedbackContent(word,chosen=null) → {definition,example,memoryTip,etymology,difference}.
- LearningFeedback({word,chosen=null}) → composant partageant le contenu.
- Les reprises conservent insertRetryItem(list,index,item,retryRef,scope).

- [ ] Écrire des tests : exemple absent ne crée pas de texte inventé ; différence absente reste masquée ; erreur numéro quatre laisse une prochaine question ; les reprises ne dépassent pas deux par mot.
- [ ] Exécuter les tests pour reproduire les comportements manquants.
- [ ] Intégrer LearningFeedback dans les corrections et conserver le contenu contextuel dans le repli saisie libre ; différence uniquement issue des confusions explicitement renseignées.
- [ ] Retirer les décréments, compteurs de vies et écrans d'élimination dans les sessions d'apprentissage ; conserver les erreurs, statistiques SRS et reprises bornées.
- [ ] Tester succès et échecs au clavier et sur mobile, relancer les régressions et compiler ; préparer un commit `feat: explain mistakes without ending learning sessions`.

**Critère de sortie :** une erreur permet d'apprendre puis de poursuivre ; aucun écran bloquant après trois erreurs.

### Lot 3 Séance courte accessible depuis l'accueil

**Files:** index.html : Dashboard, App, nouvelle ShortSession ; tests/short-session.test.cjs ; tests/make-ui-fixture.cjs.

**Interfaces:**
- buildShortSession(state,words,now=new Date()) → Word[] ; au plus cinq mots dont au plus deux nouveaux.
- ShortSession({words,state,setState,onMilestone,onBack}) → composant.
- getNextDueAt(state,words) → ISO date ou null.
- La file Word[] est fixée au démarrage ; le choix du format appartient au lot 4.

- [ ] Écrire des tests : dix mots dus donnent cinq mots et zéro nouveauté ; trois dus donnent trois dus plus deux nouveaux ; zéro dû donne au plus deux nouveaux ; les IDs restent uniques ; une file vide n'accorde pas de bonus.
- [ ] Exécuter `node tests/short-session.test.cjs` et confirmer les échecs.
- [ ] Ajouter le bouton « Cinq mots aujourd'hui », la file figée et la progression en mots distincts ; utiliser le rappel par saisie comme format initial en attendant le lot 4.
- [ ] Gérer découverte avant évaluation, fin, retour, reprise et file vide ; la séance courte reste indépendante du verrou de routine complète.
- [ ] Vérifier un corpus de zéro, un et deux mots dans le navigateur, exécuter les tests et compiler ; préparer un commit `feat: add a five word daily session`.

**Critère de sortie :** une session courte démarrable avec un seul mot, sans réintroduction de mots futurs pour remplir la file.

### Lot 4 Formats variés selon la progression

**Files:** index.html : ShortSession, StepProd, StepContext, StepChoice et adaptation de flashcard ; tests/short-session.test.cjs.

**Interfaces:**
- chooseLearningFormat(word,progress,words) → 'flashcard' | 'qcm' | 'typing' | 'cloze'.
- validClozePrompt(word) → string ou null.
- Chaque question consomme onAnswer(rating,mode) ; rating ∈ again,hard,good,easy et mode ∈ recog,context,prod.
- Figer le format d'une question jusqu'à sa réponse.

- [ ] Écrire les tests de choix : découverte/relearning vers flashcard ; répétition 0 avec au moins deux distracteurs validés vers QCM ; répétition 1 vers saisie ; répétition 2 et cloze valide vers phrase à trou ; contexte absent ou réponse dévoilée vers saisie.
- [ ] Exécuter les tests pour confirmer l'échec avant intégration.
- [ ] Intégrer les formats à ShortSession avec un seul passage initial par mot et une autoévaluation explicite des flashcards.
- [ ] Faire passer toutes les réponses par gradeWord sans doubler l'évaluation SRS ni compter le retournement d'une carte comme une réussite ; maintenir les reprises bornées.
- [ ] Tester chaque format au clavier et sur mobile, vérifier l'échéance après entraînement anticipé, compiler et préparer un commit `feat: vary short session learning formats`.

**Critère de sortie :** variation des formats sans cinq passages imposés sur le même mot et sans changement prématuré du calendrier.

### Lot 5 Corpus contrôlé et couverture des QCM

**Files:** tools/audit-vocab.cjs, data/qcm-reviewed.json, index.html : chargement/buildWord/cache, sw.js, tests/qcm-review-data.test.cjs.

**Interfaces:**
- CLI : `node tools/audit-vocab.cjs <corpus.json> <review-data.json>` ; JSON en sortie avec total, qcmReady, staleReviews, duplicateDefinitions, missingExamples et leakingPrompts.
- review-data.json : {version:1,entries:[{word,qcm_definition,qcm_distractors,qcm_context_distractors}]}.
- getQcmReviewRecord(word,reviewData) → données compatibles ou null ; validation des définitions exactes et des phrases exactes.
- Les embeddings et la génération assistée produisent uniquement des brouillons.

- [ ] Écrire des tests : définition modifiée invalide la paire ; phrase modifiée invalide le contexte ; moins de deux distracteurs valides déclenche le repli ; deux distracteurs équivalents ne sont pas présentés ensemble ; cache absent ne bloque pas l'apprentissage.
- [ ] Exécuter `node tests/qcm-review-data.test.cjs` et confirmer les échecs.
- [ ] Créer l'audit local, un fichier de validations initiales et son chargement avec cache ; conserver les identifiants et l'import/export existants ; inclure les données nécessaires dans le cache PWA.
- [ ] Auditer le corpus réellement chargé, valider d'abord les mots utilisés dans les séances courtes puis étendre progressivement ; produire un rapport de couverture chiffrée sans annoncer une validation exhaustive non réalisée.
- [ ] Ajouter une étape de présélection sémantique seulement si utile : utiliser preScreenDistractorVectors comme brouillon, calibrer le seuil sur des paires françaises et conserver la validation éditoriale.
- [ ] Tester hors ligne, modification d'une définition et repli clavier ; compiler et préparer un commit `feat: load reviewed quiz data and audit vocabulary quality`.

**Critère de sortie :** les QCM disponibles ont des choix contrôlés ; la couverture et les données manquantes sont explicites. La génération externe éventuelle nécessite un choix de fournisseur et d'hébergement avant son ajout.

## Validation finale et livraison

- [ ] Exécuter les tests SRS/QCM, engagement, séance courte et données éditoriales ; tous passent.
- [ ] Compiler tout le JSX et vérifier absence de doublons de fonctions intégrées depuis engagement-examples.jsx.
- [ ] Tester accueil → séance courte → erreur → explication → suite → bilan.
- [ ] Tester une séance sur mobile, navigation clavier, objectif quotidien, flamme et ancien profil importé.
- [ ] Tester la PWA hors ligne après mise en cache et son renouvellement lors de la mise à jour.
- [ ] Comparer le résultat au cadrage, préparer le patch ou la branche et communiquer la couverture des données.
- [ ] Préparer les instructions de publication ; publier seulement dans le cadre d'une demande correspondante.

## Statut

Lots 0 à 5 implémentés et vérifiés. Voir [le bilan de livraison](../../livraison-ameliorations.md) et [le journal](../../execution-progress.md). Les cases ci-dessus conservent le détail du plan initial ; le journal décrit les validations effectivement exécutées. Vérification hors ligne automatisée avec réseau simulé ; réouverture hors ligne sur l’hébergement cible à effectuer après publication. Aucun nouveau chat utilisateur créé.

