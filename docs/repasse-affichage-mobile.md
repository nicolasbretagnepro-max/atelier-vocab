# Repasse de l’interface — 6 octobre 2026

## Défauts reproduits et corrigés

- La progression native apparaissait comme un trait sombre, même à zéro. Les objectifs et séances utilisent désormais un indicateur accessible avec une piste grise et un remplissage proportionnel borné.
- Les recherches, filtres, sources et import JSON utilisaient des polices de 13 à 14 px. Ces champs passent à 16 px ; les lettres des mots croisés restent à 20 px.
- La grille des modes sur l’accueil imposait deux colonnes en style inline et annulait le passage sur une colonne mobile. Cette surcharge est retirée.
- Les petits boutons ont désormais une hauteur minimale de 44 px sur mobile.
- À 320 px, les sept onglets débordaient de la page. Ils passent sur deux rangées sous 360 px.
- Le bouton « Commencer la grille » occupait une seule des trois colonnes du pied de page. Il occupe désormais toute la largeur pendant la découverte.
- Les statistiques pouvaient afficher une ancienne flamme après un jour manqué, contrairement à l’en-tête. Les deux utilisent désormais le même calcul.
- L’explication du statut fragile mentionne les difficultés récentes, conformément au calcul actuel.
- Les dépendances et le cache PWA passent ensemble en v15.

## Vérifications

- 98 tests et trois compilations JSX passent ; aucun changement du corpus ou de ses identifiants.
- Navigateur : accueil, découverte de la routine, recherche d’un mot ajouté, révision, quiz, figures, statistiques, fenêtre des sources et mots croisés inspectés.
- 393 × 852 : progression à 1/2 mesurée à 50 %, modes sur une colonne, champs de recherche et filtres à 16 px, pas de débordement horizontal constaté.
- 320 × 568 : onglets sur deux rangées, largeur de document inférieure ou égale à la largeur de fenêtre.
- Mots croisés : génération réussie, bouton de découverte sur toute la largeur, lettre saisie suivie du déplacement automatique du focus. À 393 × 430, définition et commandes restent dans la fenêtre.
- Revue indépendante du diff : aucun défaut critique ou important identifié.

La réduction de hauteur teste la disposition lorsque l’espace disponible diminue. Elle ne remplace pas un essai du clavier natif Safari sur un iPhone physique. L’audit ne garantit pas l’absence de tout défaut sur tous les profils ou toutes les données importées.

Commande de reproduction : `node tests/run.cjs`.
