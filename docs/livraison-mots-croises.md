# Livraison — mots croisés mobiles

Les quatre lots sont développés dans le clone local, sur `codex/learning-improvements`. La nouvelle carte « Mots croisés » est accessible depuis l’accueil. Aucune publication ni modification du dépôt distant n’a été effectuée.

## Lots livrés

| Lot | Résultat | Fichiers principaux |
| --- | --- | --- |
| 1 — Sélection et intersections | Sept mots visés, repli à six puis cinq, quota arrondi 70/30, grille connexe de 11×11 maximum, calcul borné | `crossword-engine.js` |
| 2 — Interface mobile | Mot surligné, définition 18 px immédiatement sous la grille, lettres 20 px, focus automatique, effacement, collage, accents et ligatures, validation par mot | `crossword-ui.jsx`, `crossword.css` |
| 3 — Intégration | Accueil, Worker annulable, reprise après fermeture, calendrier SRS et progression quotidienne existants, cache PWA actualisé | `index.html`, `crossword-worker.js`, `sw.js` |
| 4 — Vérification et livraison | Régressions, revue indépendante, scénario navigateur et profil local reproductible | `tests/`, ce document |

## Règles pédagogiques

La sélection utilise les données actuelles du profil. Les mots dus aujourd’hui sont prioritaires, avec classement par fragilité et taux de réussite historique. Le taux historique n’est pas une probabilité de rétention calculée. Les appuis viennent uniquement du statut « Maîtrisé » existant. Les mots nouveaux ou les mots fragiles programmés pour plus tard ne servent pas à remplir la grille.

Le quota est arrondi selon le nombre placé : sept mots donnent cinq dus et deux maîtrisés ; six donnent quatre et deux ; cinq donnent quatre et un. Le moteur autorise jusqu’à huit mots, mais l’interface en demande sept au maximum. Les réponses de trois à onze lettres normalisées sont admissibles. Les définitions contenant le mot et les doublons sont exclus. La recherche essaie aussi des alternatives dans chaque catégorie, sans garantir de trouver toute grille théoriquement possible.

Si le profil n’a pas assez de mots dus ou maîtrisés compatibles, ou si les intersections échouent, le jeu explique pourquoi et propose de faire une révision. Aucun petit profil n’est artificiellement déclaré maîtrisé pour ouvrir le jeu.

« Vérifier » note seulement un mot complet. La première réussite donne `good` en mode `context`, car les croisements aident le rappel. Un premier échec ou une révélation donne `again`. Corriger ensuite le même mot ne génère pas une nouvelle note ni des XP supplémentaires. Les appuis maîtrisés et les mots entièrement fournis par des intersections validées restent sans note. L’adaptateur contrôle également que le mot est encore dû et que sa définition correspond à la grille.

La grille se conserve après fermeture et réouverture pendant la même utilisation de la page. Un rechargement perd la grille en cours ; les notes déjà enregistrées restent persistantes. « Nouvelle grille » refait la sélection à partir de la progression courante. Il n’existe pas de récompense automatique après une session dans cette version.

## Vérifications effectuées

`node tests/run.cjs` : **48 tests passent**, compilation JSX de l’application, du composant et des exemples existants réussie.

Les tests couvrent les quotas, les profils insuffisants, les placements illégaux, les collisions, la connexité, les budgets, la saisie, le collage, le verrouillage des intersections, les notes uniques, les définitions devenues obsolètes, les anciens profils, la sérialisation de la maîtrise, le Worker et les assets du cache PWA.

Scénarios réalisés dans le navigateur avec le véritable composant App et le Worker : lancement depuis l’accueil, mot incomplet sans note, passage à la case suivante, retour arrière, erreur puis correction sans nouvelle note, réussite, appui maîtrisé sans note, changement d’orientation par un second appui sur une intersection, fermeture/reprise, révélation, fin de grille, grille suivante et profil sans progression redirigé vers les révisions.

Dimensions vérifiées : 393×852 et 393×500. Aucun débordement horizontal ; lettres 20 px, définitions 18 px et boutons d’au moins 44 px. À hauteur réduite, la case active et les commandes restent visibles ; seul le panneau de grille défile verticalement. Le contrôle tient compte d’un arrondi inférieur à un pixel des bordures.

La revue indépendante a conduit à corriger la saisie de `œ` et `æ`, qui doit remplir deux cases, et à agrandir le bouton de masquage du clavier. Le contrôle navigateur a conduit à rétablir la visibilité de la case active après réduction du viewport. La règle de non-évaluation des mots entièrement fournis s’applique aussi à « Révéler ».

**Limite de vérification :** navigateur de bureau à dimensions mobiles, sans iPhone physique. Le zoom au focus, l’ouverture et la fermeture du clavier Safari, le retour depuis l’arrière-plan et les marges de la PWA installée restent à vérifier sur l’iPhone 15. Le cache hors ligne a été testé par simulation du Service Worker ; le cycle de mise à jour d’une PWA déjà installée reste à vérifier sur l’appareil.

## Reproduire la vérification locale

Depuis la racine du dépôt :

```powershell
.\tests\bootstrap.ps1
node tests/run.cjs
node tests/make-crossword-fixture.cjs
$env:PORT='8767'
node tests/serve.cjs
```

Le bootstrap fournit Babel pour les tests s’il manque. Ouvrir `/crossword-fixture.html` sur le serveur local pour le profil de démonstration, ou `/crossword-fixture.html?empty` pour le profil vide. Ce fichier ignoré par Git désactive les chargements distants et l’installation du Service Worker ; il prépare uniquement le stockage de cette origine locale. Il ne faut pas publier ce fichier. Les captures `tests/crossword-mobile.png` et `tests/crossword-short.png` sont également des preuves locales ignorées par Git.

## Intégration ultérieure

Les trois premiers lots sont enregistrés séparément : `9b071df`, `21d1252`, `671e002`. Le dernier lot rassemble les corrections et la livraison. La base de cette fonctionnalité est `17dbe24`, qui contient les améliorations pédagogiques précédentes.

Le patch `atelier-vocab-mots-croises.patch`, placé dans le dossier parent du clone, contient cette fonctionnalité à partir de `17dbe24`. Le patch `atelier-vocab-ameliorations.patch` est réexporté avec l’ensemble du travail depuis la base initiale `595a2cd`. Choisir le patch correspondant à la base du dépôt destinataire ; ne pas appliquer les deux.

Pour publier ultérieurement, livrer ensemble `index.html`, `crossword-engine.js`, `crossword-worker.js`, `crossword-ui.jsx`, `crossword.css` et `sw.js`, ainsi que les assets existants. Une publication de `index.html` seul casserait le jeu. La PWA utilise le cache `atelier-vocab-v8-crossword`.
