# Améliorations intégrées

La branche locale `codex/learning-improvements` contient les lots 0 à 5. Les changements ne sont pas publiés sur GitHub ni déployés.

## Ce qui change

0. **Révision et QCM** : les révisions respectent leur échéance, les réussites augmentent l'intervalle selon une adaptation SM-2 et les erreurs déclenchent une reprise. Une répétition anticipée ne repousse pas artificiellement l'échéance. Les distracteurs doivent disposer d'une validation liée aux définitions exactes ; un contrôle supplémentaire écarte les choix trop ressemblants entre eux. Sans deux distracteurs admissibles, le mot est demandé par saisie.
1. **Objectif et flamme** : cinq mots distincts travaillés dans la journée, erreurs comprises ; répéter un même mot n'augmente pas l'objectif. La flamme utilise le jour local, continue après une journée consécutive et disparaît après une interruption. Les dates des anciens profils restent lisibles.
2. **Corrections pédagogiques** : définition, exemple réel, astuce et origine lorsqu'ils existent. Une différence avec la réponse choisie est affichée uniquement si elle est renseignée. Les vies et écrans d'élimination sont retirés ; les reprises restent bornées.
3. **Séance courte** : bouton depuis l'accueil, cinq mots maximum, priorité aux mots dus, au maximum deux nouveaux. La file est fixée au départ et la séance se termine même en cas d'erreurs. Une file vide donne la prochaine échéance et propose un entraînement libre sans XP.
4. **Formats variés** : flashcard avec autoévaluation pour une découverte ou une reprise, QCM contrôlé au début, saisie puis phrase à trou quand le contexte convient. Retourner une carte ne valide pas une réussite. Le contexte reste stable pendant la saisie.
5. **Qualité du corpus** : validations locales versionnées, cache de secours, invalidation après changement de définition, audit reproductible et nouvelle version du cache PWA. Les Gists distants sont conservés.

## Couverture contrôlée

Audit du vocabulaire principal récupéré le 5 octobre 2026 : **772 mots**, **35 mots avec au moins deux distracteurs contrôlés**, **0 validation obsolète**, **0 groupe de définitions strictement identiques**, **0 exemple manquant**, **0 réponse directement dévoilée dans les prompts audités**.

Ces chiffres ne certifient pas l'absence de synonymes dans l'ensemble du corpus. Les 737 autres mots utilisent la saisie lorsque leurs choix ne sont pas validés. Le fichier initial ne valide aucun QCM contextuel ; ces exercices utilisent également le repli lorsque nécessaire. Les figures de style gardent leur corpus distinct.

Pour étendre la couverture, ajouter une entrée dans `data/qcm-reviewed.json` après lecture du sens du mot et des distracteurs. Conserver `qcm_definition`, `qcm_full_definition` et les définitions exactes des candidats. Pour un contexte, chaque candidat doit aussi contenir le champ `prompt` correspondant exactement à la phrase affichée. Les présélections automatiques ou embeddings ne constituent pas une validation éditoriale.

## Vérifications

34 tests automatisés passent, et tout le JSX compile. Les régressions couvrent le SRS, les anciens profils, la flamme, l'objectif, les ambiguïtés QCM, les formats, les reprises et la poursuite après une erreur. Le service worker est testé avec un réseau indisponible simulé, y compris le cache des validations et le renouvellement de version.

Le navigateur confirme le parcours accueil → séance courte → correction → suite, la fin après sept erreurs pour cinq mots distincts, un corpus d'un seul mot et la navigation clavier. Contrôle mobile à 390 px, sans débordement horizontal. Les scénarios de vérification sont générés séparément de l'application.

## Lancer et vérifier

Depuis le dossier `repository`, avec Node installé :

```powershell
# Une seule fois : compilateur de tests, version et empreinte vérifiées.
powershell -File tests/bootstrap.ps1
node tests/run.cjs

# Aperçu local : http://127.0.0.1:8766
node tests/serve.cjs

# Audit sur un export JSON de vocabulaire
node tools/audit-vocab.cjs corpus.json data/qcm-reviewed.json

# Scénarios navigateur : /tests/ui-fixture.html?scenario=errors|formats|tiny|empty
node tests/make-ui-fixture.cjs
```

## Publication

Relire le diff de la branche, puis la pousser et ouvrir une pull request vers `main`. Après validation, publier `index.html`, `sw.js` et `data/qcm-reviewed.json` ensemble en conservant les icônes et le manifeste. Le cache porte la version `atelier-vocab-v7-learning`. Vérifier sur l'hébergement cible une première ouverture connectée, puis une réouverture hors ligne ; le premier téléchargement des bibliothèques externes exige une connexion.

Choix d'exécution : clone complet isolé plutôt qu'une copie des seuls fichiers, journal Markdown adapté à Windows, et validations éditoriales locales sans fournisseur d'IA externe. La couverture peut être étendue sans changer le moteur ni les profils.
