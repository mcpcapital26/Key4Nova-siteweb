# Key4Nova — site corporate multilingue

Site statique restauré depuis la présentation HTML fournie par le propriétaire : 18 pages en français, anglais et néerlandais, 21 ressources graphiques d’origine. Aucune dépendance de production. Publication automatique sur GitHub Pages à chaque push sur `main` (voir « Publication »).

## Aperçu

Ouvrir `preview.html` directement dans un navigateur : toutes les pages, les images, les langues et les filtres sont inclus. Ce fichier est destiné à la relecture, pas au référencement.

Pour parcourir les vraies URL localement, à la racine du dépôt :

```sh
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000. L’hébergement final doit servir les fichiers `index.html` des dossiers, ainsi que les ressources à la racine. Ne pas publier le dossier `scripts/` ni l’aperçu autonome en production.

## Publication

`.github/workflows/pages.yml` publie le site sur GitHub Pages à chaque push sur `main` (réglage requis : Settings → Pages → Build and deployment → Source : GitHub Actions). GitHub Pages sert le dépôt dans un sous-dossier (`https://mcpcapital26.github.io/Key4Nova-siteweb/`) alors que les pages pointent vers la racine (`/styles.css`, `/offres/`) : `scripts/build_pages.py` ajoute ce sous-dossier aux liens et ne publie que les fichiers publics (ni `scripts/`, ni `qa/`, ni `preview.html`, ni ce README). Les fichiers sources ne changent pas. Avec un domaine personnalisé, le sous-dossier est vide et les liens restent tels quels.

Ouvrir un `index.html` directement depuis le disque ne fonctionne pas, pour la même raison : utiliser le serveur local ci-dessus ou `preview.html`.

## Organisation

- `index.html`, `entreprises/`, `offres/`, `flex/`, `insights/`, `a-propos/` : pages françaises.
- `en/`, `nl/` : pages équivalentes anglaises et néerlandaises.
- `assets/` : logo, photos et illustrations extraits sans modification.
- `styles.css` : styles de la présentation d’origine.
- `refinements.css` : finitions communes et adaptations responsive.
- `site.js` : menu mobile et filtres d’offres d’origine.
- `navigation.js` : fermeture des menus, Échap, gestion du focus et libellés traduits.
- `job-feed.js` : offres en direct depuis le CRM Key4Nova sur les pages carrières (voir ci-dessous).
- `apply-form.js` : formulaire de candidature des pages carrières (voir ci-dessous).

## Offres d’emploi

Les pages `/offres/`, `/nl/vacatures/` et `/en/careers/` chargent dans le navigateur les offres qu’un recruteur a publiées dans le CRM (vue Supabase `public_job_offers`, offres ouvertes uniquement, les plus récentes d’abord). Aucun redéploiement n’est nécessaire pour qu’une nouvelle offre apparaisse. Le client n’est jamais affiché (« Via Key4Nova »).

« Postuler » et « Candidature spontanée » ouvrent un formulaire (nom, e-mail, téléphone, CV PDF ou Word .docx de 5 Mo au plus, remarque, consentement). Il est envoyé à la fonction Supabase `website-application` (dépôt du CRM, `supabase/functions/`), qui revérifie tout, enregistre la candidature dans le CRM et prévient le recruteur du poste par Outlook. Les contrôles du navigateur ne servent qu’au confort du candidat. Si l’envoi échoue, le formulaire propose l’e-mail ; sans JavaScript, les liens restent des `mailto:` vers info@key4nova.com.

Sans offre publiée, si le flux est injoignable ou si JavaScript est désactivé, la page affiche son message statique « aucune offre pour le moment » avec un lien de candidature spontanée.

La clé `sb_publishable_…` de `job-feed.js` est publique par conception et ne lit que ce flux. Ne jamais ajouter au dépôt une autre clé Supabase (`sb_secret_…`, `service_role`), une URL de base de données ou un mot de passe. Le contenu du flux est affiché avec `textContent`, jamais `innerHTML`.

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
- Aucun système de candidature serveur n’est inclus : les candidatures aux offres du CRM passent par e-mail.
- Liens externes, destinataires des e-mails et politique de confidentialité sur le site d’origine.
- Domaine final pour ajouter des URL canoniques et des `hreflang` absolus. Les équivalences actuelles utilisent les chemins du site.
- Mesures de performance et d’accessibilité sur l’hébergement final.

Aucune publication sans autorisation du propriétaire.

Les captures avant/après et les résultats effectivement exécutés sont dans `qa/`. Le test navigateur optionnel utilise Playwright installé hors du projet : `PLAYWRIGHT_MODULE=/chemin/vers/playwright node scripts/browser-check.cjs` (serveur local sur le port 8000).
