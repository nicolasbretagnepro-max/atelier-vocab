# Cadrage des améliorations Atelier Vocab

Date : 5 octobre 2026.

La demande consiste à préparer des lots pour intégrer les sept améliorations discutées. Ce cadrage reprend les choix présentés dans le chat ; il ne constitue pas une nouvelle implémentation. Les correctifs SRS et QCM existent localement. Les exemples d'engagement ne sont pas encore intégrés à l'application.

## Résultat attendu

Permettre une pratique quotidienne courte, variée et utile, avec des erreurs expliquées et des QCM fiables, sans perdre la progression existante.

## Règles communes

- Conserver les identifiants des mots et les profils existants.
- Respecter les échéances du moteur SRS, quel que soit le format.
- Conserver le repli vers la saisie libre lorsque les distracteurs validés sont insuffisants.
- Ne pas publier de distracteurs non validés pour remplir un QCM.
- Ne pas modifier les Gists distants pendant l'implémentation locale.
- Un lot doit fonctionner et être vérifiable indépendamment avant le suivant.
- Ne pas imposer une refonte technique pour intégrer les fonctionnalités.
- Préparer la publication après les validations ; la publication n'est pas incluse dans la demande de création des lots.

## Lots et décisions de conception

### Lot 0 Socle corrigé

Vérifier et intégrer le patch SRS/QCM dans un véritable clone du dépôt. Préserver les icônes originales, le manifest et les profils. Ce lot fournit la base des améliorations suivantes. Le dossier de travail actuel contient une copie des sources et des fichiers non suivis, pas un clone complet du dépôt distant.

### Lot 1 Objectif quotidien et flamme

Afficher un objectif de cinq mots distincts travaillés dans la journée locale. Les erreurs et les réponses passées puis corrigées comptent lorsqu'elles sont enregistrées ; retourner une carte sans évaluation ne compte pas. Un mot répété ne compte qu'une fois. Vocabulaire et figures partagent le même objectif ; leurs identifiants sont déjà distincts. La flamme reste liée à au moins une interaction évaluée, sans obligation de réussite. Ne pas attribuer de nouveaux XP pour l'objectif : éviter un second système de bonus.

Actualiser la flamme après une absence, au retour au premier plan et au changement de jour. Conserver l'historique lors des imports et exports. Stocker les identifiants travaillés des trente derniers jours dans meta.practiceDays.

### Lot 2 Correction pédagogique et apprentissage sans élimination

Présenter le mot attendu, la définition, un exemple existant, une astuce et une différence explicitement documentée avec le mot choisi. Masquer les sections sans contenu. Ne pas inventer une explication de nuance depuis une simple proximité automatique.

Supprimer l'arrêt après trois erreurs dans la routine, la révision, les quiz libres et les figures. Conserver la notation SRS et les reprises bornées existantes, avec un plafond de deux reprises par mot. Une erreur n'interrompt pas la séance et ne produit pas une boucle infinie.

### Lot 3 Séance courte

Ajouter un accès direct à une séance de cinq mots maximum : échéances d'abord, puis au plus deux nouveautés. Figer la file au démarrage ; les changements de progression ne la reconstruisent pas. Un mot figure une seule fois dans la file initiale. Une nouvelle carte est découverte puis évaluée une fois ; plusieurs écrans d'exposition ne doivent pas être annoncés comme plusieurs mots.

La routine complète reste accessible. La séance courte n'est pas bloquée par le marqueur de routine complète terminée. Sans mot disponible, afficher une prochaine échéance ou un accès à l'entraînement libre, sans bonus fictif. Ne pas promettre une durée fixe non mesurée.

### Lot 4 Diversité sans répétition excessive

Choisir un format principal par mot dans la séance courte. Les prochains jours peuvent proposer un autre format selon la progression : flashcard pour découverte ou reconstruction, QCM validé en début de consolidation, saisie puis phrase à trou exploitable. Une phrase à trou doit réellement masquer le mot et ne pas révéler la réponse ailleurs dans l'écran.

Tous les formats utilisent gradeWord et scheduleReview. Les flashcards sont une autoévaluation ; révéler une définition ne vaut pas réussite. Les reprises après erreur sont distinctes du passage initial et restent bornées.

### Lot 5 Corpus et validation des QCM

Créer un outil local d'audit et une couche de données éditoriales versionnée, distincte des Gists. Repérer les définitions identiques, les candidats proches, les phrases qui dévoilent la réponse et les mots sans exemple exploitable. Valider des distracteurs en enregistrant les définitions exactes de la réponse et des candidats. Les questions de contexte nécessitent une validation de leur phrase exacte.

Intégrer ces données dans buildWord avant la génération des questions. Une modification de définition ou de phrase invalide la validation concernée. Afficher dans le rapport d'audit la couverture réellement validée ; ne pas déclarer le corpus entier contrôlé si seule une partie l'est.

La génération assistée et les embeddings sont une seconde étape du lot. Ils produisent des brouillons soumis à validation et n'autorisent jamais directement un distracteur. Si un fournisseur externe est choisi, l'appel se fait côté serveur et les clés restent hors du navigateur. Aucun fournisseur, coût ni hébergement supplémentaire n'est choisi par ce plan.

## Critères de sortie

Chaque lot conserve les tests SRS/QCM, ajoute des tests ciblés sur son comportement et passe une vérification navigateur. La validation finale couvre mobile, import/export, changement de jour, fonctionnement hors ligne après mise en cache et mise à jour de la PWA.

