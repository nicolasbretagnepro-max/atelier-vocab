# Routine classique — 6 octobre 2026

## Besoin et périmètre

Retrouver le parcours Découverte → Association → Contexte → Rappel actif → Boss, avec les premières rencontres accessibles et une séance visant 5 à 10 minutes. Les 780 mots du Gist, les identifiants, la progression et les autres modes (dont les mots croisés) sont conservés. Le retour porte sur l’expérience de la routine ; les bugs de la version historique ne sont pas réintroduits.

## Lots réalisés

1. **Parcours accessible** : aucune saisie imposée aux deux premiers niveaux. Découverte du mot, définition et exemple complet ; association par choix ; contexte accompagné d’une définition qui précise le sens recherché. Rappel et Boss restent accessibles par choix. Après deux jours distincts de compréhension, le rappel propose « Avec un indice » ou « Sans indice » avant la saisie. Les lettres affichées ne diminuent pas automatiquement après quelques répétitions dans la même séance.
2. **QCM** : 109 groupes explicites de sens distincts ; 309 fiches utilisables sur le corpus actuel de 780 mots. Aucun remplissage automatique pour atteindre quatre réponses. La validation exige les définitions actuelles exactes, puis un contrôle de ressemblance entre toutes les options. Les 471 autres mots utilisent une carte avec exemple, autoévaluation du sens et rappel facultatif avec indice. Ils restent dans la routine. Aucun QCM de phrase à trou n’est déclaré validé automatiquement. Le signalement d’un QCM dans la routine le désactive localement et passe la question sans erreur, réussite, XP ni modification d’échéance. Un signalement n’est pas une acceptation d’une seconde bonne réponse.
3. **Rotation** : dix mots distincts au maximum, quota de nouveautés conservé (1 à 3, défaut 2), jusqu’à trois révisions consolidées dues, puis actifs les moins récemment vus. Les anciens échecs ne dominent plus la sélection ni le statut : les derniers résultats sont pris en compte. Sans nouveauté, deux mots ouvrent la découverte comme rappel. Les files représentent au plus 24 rencontres initiales, plus deux reprises après erreurs. Les actifs au-delà de la capacité tournent les jours suivants ; il n’est pas promis de revoir tous les actifs dès demain.
4. **Vérifications et publication** : tests de profils historiques, échéances SM-2, quota journalier, rotation, neutralité, formes conjuguées, cinq étapes jusqu’au Boss, autres modes, mots croisés et cache PWA. Modules et worker versionnés ensemble (v14).

## Limites explicites de la validation éditoriale

Le contrôle mécanique porte sur les 780 mots. La sélection éditoriale publiée porte sur 309 mots, et non sur tout le corpus. Des synonymes ou définitions équivalentes ne sont jamais ajoutés comme distracteurs pour augmenter la difficulté. Un score lexical ne constitue pas une garantie sémantique. Les groupes sont consultables dans `data/qcm-editorial-groups.json`, avec les définitions et distinctions dans `data/qcm-reviewed.json`. Les choix trop arbitraires ou trop proches identifiés lors de la revue ont été retirés. Les mots importés ou modifiés continuent de fonctionner même lorsque leurs anciens QCM ne correspondent plus aux définitions.

Une carte consultée ou une compréhension autoévaluée ne devient jamais une preuve de rappel autonome. La consolidation exige une compréhension et deux rappels sans aide sur des jours différents. Les exemples restent proposés, mais leur absence dans un import ne bloque pas indéfiniment une consolidation obtenue par ces preuves. Le statut « maîtrisé » conserve ses exigences longitudinales.

## Reproduction

- Tests et compilation : `node tests/run.cjs`.
- Reconstituer les choix à partir du corpus : `node tools/create-classic-review.cjs corpus.json`.
- Audit de compatibilité : `node tools/audit-vocab.cjs corpus.json data/qcm-reviewed.json`.
- Source distante inchangée : Gist `caf58ca177791bd21d8df3b700115c56`, 780 mots au contrôle du 6 octobre.

## État de vérification

- 96 tests passent et les trois compilations JSX passent.
- Audit : 780 mots, 309 QCM disponibles, aucune définition de choix obsolète.
- Navigateur : chargement des 780 mots ; découverte avec exemple complet ; association Asséner avec Louvoyer et Instiller ; absence de champ de saisie à ces premières étapes.
- Format 393 × 852 : aucun élément du contenu ne déborde horizontalement. Le clavier iOS sur un appareil physique reste à vérifier par l’utilisateur.
