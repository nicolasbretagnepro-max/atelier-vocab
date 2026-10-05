# Journal — plan: docs/superpowers/plans/2026-10-05-mots-croises.md

Ruling: créer les documents et développer dans ce tour, conformément à « prépare des lots et développe » et à la conception déjà présentée. Pas de nouvelle boucle d'approbation ; coût si l'intention diffère : modifications locales réversibles.

Ruling: réutiliser le clone dédié et la branche codex/learning-improvements propres contenant les lots précédents. Pas de nouveau checkout ni modification de main ; coût : les deux fonctionnalités sont regroupées sur la même branche locale.

Ruling: journal Markdown et commandes Windows plutôt que les scripts POSIX du skill. Coût : suivi manuel.

Prévol : moteur → Worker et composant, grille {entries,cells,rows,cols} ; composant → App, résultat {id,role,rating} ; adaptation des données → moteur, candidats déjà classés selon les règles existantes. Interfaces décrites dans les tests.

Base du nouveau travail : 17dbe24 (bilan des lots précédents).
Lot 1 : moteur indépendant, sélection 70/30 arrondie, grille connexe 11×11 maximum et recherche bornée. Cinq tests rouges puis verts ; grille de test produite en moins de 50 ms sur le runtime local (pas une mesure iPhone).
Lot 2 : transitions pures pour frappe, collage, effacement, intersections verrouillées et note unique ; composant et CSS mobiles séparés. Neuf tests moteur passent, JSX du composant compilé. Contrôle navigateur prévu au lot 4.
Lot 3 : brique sur accueil, Worker annulable, génération avec état attente/indisponible, fermeture/reprise et contrôle des notes via le SRS existant. Mots futurs, appuis et indices obsolètes exclus des notes. Cache v8 incluant les quatre assets du jeu. Suite complète : 46 tests passent et JSX compile.
Lot 4 : revue indépendante complète. Régression rouge puis verte sur ligatures et révélation des mots entièrement fournis ; boutons 44 px. Contrôle réel App + Worker en navigateur : erreur/correction, réussite, appui maîtrisé sans note, fermeture/reprise, intersections, fin et nouvelle grille, profil vide. Le profil de test utilise désormais de vraies dates de maîtrise et son aller-retour par le stockage est testé. Case basse initialement masquée après réduction du viewport : correction par défilement après resize, confirmée en navigateur. Carte à 8 px sous la grille et aucun débordement horizontal. Dimensions 393×852 et 393×500, captures locales. Suite finale 48 tests et compilations réussies ; Safari iPhone physique non vérifié.

Ruling de clôture : la demande couvre le développement local ; la livraison conserve donc la branche et le clone, sans déclencher une opération d’intégration ou de publication non demandée. Les patchs permettent une intégration ultérieure. Coût : le site distant n’affiche pas encore le jeu.
