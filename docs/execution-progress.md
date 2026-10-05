# Exécution des lots Atelier Vocab

Plan : docs/superpowers/plans/2026-10-05-ameliorations-vocab.md

Ruling: utiliser le clone dédié repository sur la branche codex/learning-improvements, sans worktree supplémentaire ; le dossier initial est une copie non suivie et cette branche isole le travail. Coût si mauvais choix : une copie locale supplémentaire, sans changement du dépôt distant.

Ruling: conserver un journal Markdown et exécuter directement les tests sous Windows plutôt que les scripts shell Superpowers, qui supposent POSIX. Coût : suivi manuel des étapes.

Prévol : les lots 1 et 3 partagent meta.practiceDays ; les lots 2 et 4 partagent LearningFeedback ; les lots 4 et 5 partagent smartDistractors. Garder ces interfaces stables.

Lot 0 : clone complet et icônes conservées ; seize régressions et compilation JSX passent.
