# Repasse avant publication — 5 octobre 2026

Demande explicite : « fais une repasse complète et pousse en ligne ». La publication du travail complet sur la branche `main` est autorisée. Les mentions de livraison exclusivement locale dans les comptes rendus précédents décrivent l’état antérieur.

## Périmètre revu

Diff depuis `595a2cd` : sélection des révisions et SM2, distracteurs validés et repli vers le rappel libre, suivi quotidien, corrections contextualisées, formats de séances courtes et jeu de mots croisés mobile. Les identifiants du vocabulaire et les profils existants sont conservés.

Une nouvelle revue indépendante a contrôlé l’ensemble du code. Deux défauts ont été reproduits et corrigés :

- Le QCM de séance courte utilisait toujours la première position pour la bonne réponse. La position est désormais tirée au démarrage de l’exercice et reste stable pendant la réponse. Le test vérifie deux tirages distincts et un nouveau rendu.
- Le Service Worker avalait les échecs de téléchargement des dépendances nécessaires, puis remplaçait le cache complet par un cache incomplet. L’installation doit désormais charger tous les assets avant de demander l’activation. Une installation incomplète échoue et laisse l’ancien worker actif. Le nettoyage épargne aussi les caches des autres applications du même domaine.

Cache de publication : `atelier-vocab-v9-release`.

## Contrôles

Les nouveaux tests ont échoué avant les corrections, puis réussi. Suite complète : **50 tests réussis**, compilations JSX réussies. Contrôle navigateur de la séance courte : la bonne réponse peut être la quatrième ; choisir la première affiche correctement l’erreur et son explication. Les fixtures de cette séance résolvent maintenant les assets depuis la racine du dépôt.

Les scénarios mobile des mots croisés ont été rejoués à 393×852 : lancement, cases, progression du focus, définition et boutons visibles. Les contrôles précédents couvrent aussi 393×500, correction, reprise et fin de grille. Aucun test sur un iPhone physique n’a été effectué.

La branche distante `main` est toujours sur la base `595a2cd`. Elle est non protégée. L’historique de GitHub Actions confirme que GitHub Pages publie cette branche. Un envoi à `main` en avance rapide conserve l’historique et déclenche la publication habituelle. La simulation d’envoi a réussi ; aucun envoi forcé n’est nécessaire.

Après envoi : attendre le succès de « pages build and deployment » pour le commit envoyé, vérifier les fichiers publics et ouvrir l’application publiée. L’adresse vérifiée avant publication est `https://nicolasbretagnepro-max.github.io/atelier-vocab/`.

L’état final du déploiement et son lien sont rapportés dans le chat après contrôle. Les patchs locaux sont réexportés ; les profils de test et captures ignorés par Git ne sont pas publiés.
