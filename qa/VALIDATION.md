# Validation locale — 27 octobre 2026

## Contrôles exécutés

- `python3 scripts/validate.py` : 18 pages, liens et ancres internes, ressources locales, métadonnées, H1 unique, langues HTML et correspondances hreflang — réussi.
- `node --check site.js` et `node --check navigation.js` — réussis.
- Chromium via Playwright : les 18 pages à 320, 375, 768, 1024 et 1440 px — 90 contrôles, aucun débordement horizontal détecté après correction du CTA néerlandais sur Insights, aucune erreur JavaScript remontée.
- Ouverture des menus mobiles, ouverture du sélecteur et fermeture par Échap sur chaque route aux quatre largeurs mobiles/tablettes — réussies.
- Filtres : requête sans résultat, message vide, réinitialisation des huit annonces présentes dans chacune des trois langues — réussis.
- Navigation de la page services française vers son équivalent anglais — réussie.
- Sélecteur de langues : ouverture avec Entrée, fermeture avec Échap, fermeture au clic extérieur — réussis.
- Navigation mobile visible avec JavaScript désactivé — réussie.
- Animation des références désactivée avec préférence de mouvement réduit — vérifié.
- Chargement de l’aperçu HTML autonome depuis une URL `file://` — réussi.
- Captures de l’accueil desktop et mobile, images chargées, inspectées visuellement. Capture desktop de la présentation d’origine disponible pour comparaison du premier écran (la présentation utilise un iframe de hauteur fixe).

Résultats automatisés : `browser-results.json` et `additional-results.json`.

## Limites

Les tests de largeur ne constituent pas une preuve exhaustive d’absence de chevauchement ni une validation sur de vrais appareils. Pas d’audit WCAG complet, de test lecteur d’écran, de Lighthouse ni de mesure des Core Web Vitals en production. Les liens externes, la disponibilité des annonces, les traductions et les références commerciales doivent être validés humainement. La page À propos conserve un portrait externe de la source ; sa disponibilité dépend du site tiers.

Aucun service backend de candidature n’a été fourni. Les CTA de contact restent des liens e-mail et les offres renvoient aux annonces d’origine. Aucun poste ni contenu commercial n’a été ajouté.

Le dépôt local contenait seulement un README : les pages sont donc des fichiers restaurés et ajoutés, pas un remplacement d’un site existant dans Git. Aucun commit, envoi GitHub ou déploiement effectué.

## Ajustement des interactions

Survol des boutons : élévation de 3 px, transitions douces et léger mouvement des flèches. Mouvement désactivé avec `prefers-reduced-motion`. Vérification Chromium ciblée : élévation mesurée et désactivation en mouvement réduit, réussies. Les captures précédentes montrent les états au repos.

## Bandeau clients actualisé

Défilement continu rétabli avec pause au survol et bouton pause/reprise accessible. Ajout des huit clients demandés ; retrait de Fides Petfood, Eurima et NedZink. Vérification Chromium des listes FR/EN/NL, du mouvement, de la pause/reprise et de l’affichage sans mouvement à 320 px : réussie. Les captures antérieures ne représentent pas ce bandeau actualisé.

## Finitions du premier écran et du bandeau clients

Serrure existante renforcée et agrandie, proportions et espacements du hero affinés sur les trois langues. Logos et noms harmonisés ; défilement à vitesse constante calculée selon la largeur du groupe. Les 90 vérifications de largeur et de navigation ont été réexécutées avec succès ; tests ciblés des clients et boutons réussis. Captures ordinateur et mobile actualisées.
