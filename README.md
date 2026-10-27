# Key4Nova — site corporate multilingue

Site statique restauré depuis la présentation HTML fournie par le propriétaire : 18 pages en français, anglais et néerlandais, 21 ressources graphiques d’origine. Aucune dépendance de production, aucun déploiement automatique.

## Aperçu

Ouvrir `preview.html` directement dans un navigateur : toutes les pages, les images, les langues et les filtres sont inclus. Ce fichier est destiné à la relecture, pas au référencement.

Pour parcourir les vraies URL localement, à la racine du dépôt :

```sh
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000. L’hébergement final doit servir les fichiers `index.html` des dossiers, ainsi que les ressources à la racine. Ne pas publier le dossier `scripts/` ni l’aperçu autonome en production.

## Organisation

- `index.html`, `entreprises/`, `offres/`, `flex/`, `insights/`, `a-propos/` : pages françaises.
- `en/`, `nl/` : pages équivalentes anglaises et néerlandaises.
- `assets/` : logo, photos et illustrations extraits sans modification.
- `styles.css` : styles de la présentation d’origine.
- `refinements.css` : finitions communes et adaptations responsive.
- `site.js` : menu mobile et filtres d’offres d’origine.
- `navigation.js` : fermeture des menus, Échap, gestion du focus et libellés traduits.

## Vérification et export

```sh
python3 scripts/validate.py
node --check site.js
node --check navigation.js
python3 scripts/export_preview.py
```

L’export régénère `preview.html` et les empreintes de cache des CSS et JS dans les pages. Le validateur vérifie les 18 routes, les ressources et ancres internes, les titres, descriptions, H1, langues et alternatives linguistiques. Il ne remplace pas une inspection visuelle ni un audit WCAG.

## À valider avant publication

- Validation humaine du rendu sur appareils réels. Les 18 pages ont passé les contrôles Chromium de débordement aux largeurs 320, 375, 768, 1024 et 1440 px ; voir `qa/VALIDATION.md`.
- Relecture humaine des traductions et des contenus commerciaux.
- Les annonces sont les exemples présents dans la source : leur disponibilité doit être vérifiée sur les liens d’origine. Aucun système de candidature serveur n’est inclus dans le fichier fourni.
- Liens externes, destinataires des e-mails et politique de confidentialité sur le site d’origine.
- Domaine final pour ajouter des URL canoniques et des `hreflang` absolus. Les équivalences actuelles utilisent les chemins du site.
- Mesures de performance et d’accessibilité sur l’hébergement final.

Aucune publication sans autorisation du propriétaire.

Les captures avant/après et les résultats effectivement exécutés sont dans `qa/`. Le test navigateur optionnel utilise Playwright installé hors du projet : `PLAYWRIGHT_MODULE=/chemin/vers/playwright node scripts/browser-check.cjs` (serveur local sur le port 8000).
