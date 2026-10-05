# Routine quotidienne guidée

## Besoin validé dans la conversation

Apprendre les mots français inconnus rencontrés dans des livres et journaux, puis pouvoir les retrouver et les utiliser. La routine doit durer 5 à 10 minutes maximum, présenter les mots avant de les interroger, faire revenir quotidiennement les mots en acquisition et introduire progressivement des nouveautés. Conserver les cinq repères Découverte → Association → Contexte → Rappel actif → Boss et les modes complémentaires.

Deux nouveautés par jour par défaut, réglables à une ou trois. Groupe actif cible de dix mots, sans attendre que tout le groupe réussisse pour renouveler ses membres. Les mots difficiles restent accompagnés. Les mots stabilisés passent aux révisions espacées. L'utilisateur a demandé de préparer les lots puis de les exécuter dans cette session ; conserver cette autorisation sans nouvelles validations intermédiaires.

## Approche

Un moteur pur et léger `learning-engine.js` fournit les états d'acquisition, les preuves par jour et les sélections. L'application React existante reste l'interface. Pas de migration de framework ni de service payant. La répétition espacée SM-2 existante reste celle de la consolidation : les réponses guidées et les répétitions du même jour ne doivent pas augmenter les intervalles.

## États et progression

Chaque progression conserve les champs existants et ajoute `learning` : phase active/consolidated, date de démarrage/dernière rencontre, jours de compréhension, de rappel aidé, de rappel autonome et de contexte, dernière difficulté. Une aide ou une réponse révélée ne constitue pas une preuve de rappel autonome. Deux rappels autonomes sur deux jours distincts, après au moins deux jours de compréhension et un contexte compris, permettent le passage en consolidation. Ce seuil est un choix de produit à ajuster, pas une garantie de maîtrise parfaite.

Les anciennes progressions sont conservées. Les répétitions espacées déjà avancées restent consolidées ; les mots vus récemment ou en réapprentissage reprennent une acquisition accompagnée. Une erreur réelle en consolidation réactive le mot ; les erreurs d'une même journée effacent la preuve autonome de ce jour. Les profils exportés/importés conservent les nouveaux champs.

## Sélection quotidienne et durée

Chaque mot actif sélectionné apparaît au moins une fois. Priorité aux actifs non rencontrés aujourd'hui et aux actifs les moins récemment servis si un ancien profil dépasse dix. Ajouter jusqu'à deux nouveaux mots dans les places disponibles et jusqu'à quatre anciennes révisions dues. Ne jamais recycler un mot futur consolidé pour remplir la routine. Un corpus réduit produit une séance réduite.

Budget de 24 rencontres, plus deux retours maximum sur les difficultés ; un seul retour par mot dans toute la séance, après d'autres questions. Découverte pour chaque nouveauté, association/compréhension accompagnée pour les actifs débutants, contexte avec sens et lettres pour les mots appropriés, rappel adapté pour les actifs plus avancés et les anciennes révisions, Boss de deux ou trois questions adapté aux aides initiales. Toutes les étapes ne concernent pas tous les mots. Le nombre de questions et le bilan sont visibles ; l'utilisateur peut arrêter et revenir aux autres modes sans perdre ses réponses.

## Exercices

Découverte : mot, définition et exemple complet visibles immédiatement. QCM seulement quand les distracteurs sont validés pour le sens exact. Sinon exercice guidé avec lettres partielles ; ne jamais remplacer un QCM indisponible par un rappel écrit difficile sans avertissement ni aide.

Contexte : préciser qu'on retrouve le mot étudié, afficher son sens et un indice orthographique. Aligner la phrase à trou avec l'exemple complet pour extraire la forme attendue ; accepter cette forme (exultent) et le lemme (exulter). Un trou dont la source ne peut être alignée devient un rappel guidé de définition. Pas de conjugaison inventée. Une proposition ambiguë peut être passée sans pénalité.

Rappel : aides selon les preuves des jours précédents, bouton Indice disponible et réponse consultable. Réponse incorrecte : mot, définition, exemple complet, éventuelle astuce fournie par la source, puis bouton Continuer. Pas de disparition automatique de la correction.

## Mobile et modes complémentaires

Inputs >=16px, boutons confortables, pas de focus clavier imposé à chaque écran, mise en page vérifiée à 393×852. Réglage 1/2/3 nouveautés sur l'accueil, enregistré dans le profil. Les réponses des autres modes alimentent le même suivi lorsqu'elles constituent une preuve appropriée ; les modes de jeu ne valent pas rappel autonome.

Mots croisés : ratio 70/30 préféré, pas une condition bloquante. Les mots en acquisition et les mots récemment étudiés servent de supports. Si aucune grille compacte n'existe, proposer explicitement une grille découverte issue de cinq mots du corpus, dont les fiches peuvent être consultées avant le jeu ; elle ne modifie pas la maîtrise. Garder 5–8 mots et la limite de onze cases. Les indices/révélations n'accordent pas de succès autonome.

## Données et publication

Le corpus principal est actuellement un JSON distant GitHub Gist. Conserver son chargement automatique, ses IDs stables, ses exemples et la protection contre les QCM dont les métadonnées deviennent périmées. Les nouveaux mots n'ont besoin d'aucune métadonnée QCM pour entrer dans une découverte guidée. La version du service worker et tous ses assets doivent être actualisés ensemble.

## Validation

Tests de progression sur plusieurs jours, aides, oubli, anciens profils et import/export ; sélection avec dix actifs, retard, petit corpus et nouvelles entrées ; passage de la découverte au Boss sans QCM validé ; Exulter/exultent ; choix QCM sûrs inchangés ; grilles sans mots strictement maîtrisés ; cache hors ligne. Parcours réel mobile avec correction lisible et Boss accessible. Exécution séquentielle, revue indépendante finale, puis intégration/publication sous l'autorisation déjà donnée dans cette conversation.
