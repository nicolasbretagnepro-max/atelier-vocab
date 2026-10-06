> Historique : cette livraison a été remplacée par la [routine classique du 6 octobre 2026](livraison-routine-classique.md).

# Livraison — routine quotidienne guidée

Cette livraison remplace les passages des anciennes notes qui proposaient une saisie sans aide lorsqu’un QCM n’avait pas de distracteurs validés. Le point d’entrée sur l’accueil est **Ma routine du jour**.

## Les cinq lots

1. **Suivi de l’apprentissage** : preuves par jour de compréhension, contexte, rappel accompagné et rappel autonome ; les profils précédents, leurs identifiants et dates de révision sont conservés. Une réponse aidée ne prolonge pas la répétition espacée et ne devient pas un rappel autonome.
2. **Sélection quotidienne** : deux nouveautés par défaut, réglables de une à trois ; jusqu’à dix mots en acquisition qui reviennent chaque jour, plus quatre anciennes révisions dues. Chaque mot sort individuellement de l’acquisition. Un ancien profil dépassant dix actifs les reprend à tour de rôle, en priorité ceux vus le moins récemment.
3. **Exercices accessibles** : découverte avec mot, sens et exemple complet, puis association, contexte, rappel et Boss adaptés au mot. Une étape vide est passée ; un débutant n’a pas de rappel autonome imposé. Sans QCM validé, les lettres partielles et la définition accompagnent la saisie. Une correction reste visible jusqu’au clic sur Continuer.
4. **Rythme et bilan** : réglage enregistré dans le profil, progression globale, distinction entre rappels accompagnés et autonomes, liste des mots repris demain. Tous les autres modes restent accessibles.
5. **Mots croisés et mobile** : les mots récemment étudiés ou en acquisition peuvent servir d’appui. Le ratio 70/30 est préféré quand une grille peut le respecter ; des replis ont un budget réservé. La recherche privilégie cinq mots et reste limitée à onze cases par dimension. Les mots nouveaux sont présentés dans des fiches avant le jeu ; celui-ci ne les transforme pas en mots maîtrisés.

## D’un jour à l’autre

Une nouveauté est expliquée avant d’être interrogée. Ses exercices restent accompagnés le premier jour. Les preuves des journées précédentes permettent ensuite de réduire les indices. Deux jours de compréhension, un contexte réussi et deux rappels autonomes sur des journées distinctes permettent le passage en consolidation. Il s’agit d’un seuil initial de produit, pas d’une garantie de maîtrise parfaite.

Un mot en acquisition revient même si son ancienne échéance SM-2 est future. Une fois consolidé, il revient selon son échéance ; un oubli le remet en acquisition. Les nouveautés ralentissent quand les dix places sont occupées, puis reprennent dès qu’une place se libère. Le quota de nouveautés tient aussi compte d’une routine interrompue puis rouverte le même jour.

Le format vise **5 à 10 minutes**, avec au maximum 24 rencontres et deux reprises supplémentaires, une par mot. Ce plafond contrôle la charge ; il ne coupe pas une explication au bout de dix minutes. Le temps réel dépend du rythme de lecture et de saisie.

## Contexte et corpus

Le contexte utilise l’exemple réel et sa phrase à trou alignés exactement. « Exultent » et le mot de base « Exulter » sont acceptés. Quand un premier exemple ne s’aligne pas, l’autre exemple réel est essayé ; si aucun ne convient, l’exercice reste une définition guidée et ne crée aucune preuve de compréhension en contexte. Les formes irrégulières présentes pour « seoir » ont été contrôlées dans le [Dictionnaire de l’Académie française](https://www.dictionnaire-academie.fr/article/A9S1259).

La source principale reste le **JSON GitHub Gist configuré dans l’application**. Son chargement automatique et le secours local restent actifs. Les nouveaux mots n’ont pas besoin de distracteurs éditorialement validés pour être appris dans la routine. Les choix QCM restent soumis à leur validation liée aux définitions exactes ; les 772 mots du corpus contrôlé n’ont pas tous un QCM validé.

## Vérification avant publication

- **83 tests passent**, compilation de tout le JSX comprise : preuves sur plusieurs jours, profils historiques/import/export, quotas, reprise d’une séance, guidage, conjugaisons, Boss, autres modes, intersections et service worker hors ligne.
- Corpus local issu de la source réelle : **772 mots**, chacun possède au moins un contexte alignable ; un profil vierge produit une grille découverte de **cinq mots, 10 × 8 cases**.
- Navigateur au format **393 × 852** : découverte → association → « exultent » en contexte → Boss → bilan mentionnant Exulter demain ; grille découverte d’un profil vierge et passage automatique à la case suivante.
- Champs de routine à **18 px**, cases de grille à **20 px**, sans débordement horizontal dans les vues contrôlées. Le clavier Safari sur un iPhone physique reste à confirmer sur l’appareil.
- Revue indépendante suivie de correctifs et de tests de régression : aides des modes complémentaires, migration d’anciens profils, faux contexte, budgets du générateur et rappel autonome en séance courte.

Le cache PWA devient `atelier-vocab-v12-guided-learning` et inclut `learning-engine.js`. Les cinq URLs de modules et de style sont versionnées de façon identique dans la page, le worker et le précache, pour empêcher une ancienne interface de répondre à une nouvelle page lors de la première réouverture. La publication doit conserver ces fichiers ensemble ; la vérification publique compare neuf assets aux octets du commit déployé.

Pour exécuter les contrôles : `node tests/run.cjs` depuis le dépôt, après `tests/bootstrap.ps1` si le compilateur de tests n’est pas encore présent.

## Publication vérifiée

Les cinq lots sont intégrés à `main`. Le code final `f3761fb` a été déployé avec succès par GitHub Pages (exécution 37333619723). Les neuf assets publics, y compris leurs URLs versionnées, sont identiques aux fichiers de ce commit. Le site charge 772 mots et 94 figures depuis ses sources configurées.
