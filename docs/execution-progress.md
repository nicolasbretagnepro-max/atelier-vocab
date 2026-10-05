# Exécution des lots Atelier Vocab

Plan : docs/superpowers/plans/2026-10-05-ameliorations-vocab.md

Ruling: utiliser le clone dédié repository sur la branche codex/learning-improvements, sans worktree supplémentaire ; le dossier initial est une copie non suivie et cette branche isole le travail. Coût si mauvais choix : une copie locale supplémentaire, sans changement du dépôt distant.

Ruling: conserver un journal Markdown et exécuter directement les tests sous Windows plutôt que les scripts shell Superpowers, qui supposent POSIX. Coût : suivi manuel des étapes.

Prévol : les lots 1 et 3 partagent meta.practiceDays ; les lots 2 et 4 partagent LearningFeedback ; les lots 4 et 5 partagent smartDistractors. Garder ces interfaces stables.

Lot 0 : clone complet et icônes conservées ; seize régressions et compilation JSX passent.
Lot 1 : objectif et flamme intégrés ; cinq tests de fonctionnalité et seize régressions passent. Les clés lastDay legacy sont lues, puis écrites en date locale ISO.
Lot 2 : corrections partagées avec exemple réel, astuce et différence explicite ; suppression de toutes les vies et des écrans éliminatoires. Trois tests passent et le JSX compile. Vérification navigateur finale prévue.
Lot 3 : file figée, cinq mots maximum et deux nouveautés maximum ; priorité aux échéances, bilan et file vide. Deux tests de sélection et compilation passent.
Lot 4 : flashcard autoévaluée, QCM contrôlé, saisie et phrase à trou selon progression ; retournement sans notation, entraînement libre sans XP. Trois tests de séance passent et compilation réussie.
Lot 5 : couche locale versionnée et cache de secours, audit déterministe, 35 QCM contrôlés sur 772 mots du corpus chargé ; aucune paire obsolète, aucun doublon exact ni exemple manquant détecté. Pas de génération externe : coût évité et validation éditoriale conservée.
Revue indépendante : quatre problèmes corrigés (ancien calcul de flamme, référence résiduelle aux vies, phrase à trou instable, contexte validé différent du contexte affiché). Ajout de régressions composant et intégration. Routine figures : passage automatique des étapes vides corrigé aussi.
