"""Build the published copy of the site: public files only, root links moved under the hosting folder.

Usage: python3 scripts/build_pages.py <output dir> [base path]
The base path is the folder the site is served from, e.g. /Key4Nova-siteweb on GitHub Pages; empty on its own domain.
"""
from pathlib import Path
import re, shutil, sys
root = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve()
base = (sys.argv[2] if len(sys.argv) > 2 else '').rstrip('/')
public = ['assets', 'styles.css', 'refinements.css', 'site.js', 'navigation.js', 'job-feed.js', 'apply-form.js']
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)
for name in public:
    (shutil.copytree if (root/name).is_dir() else shutil.copy2)(root/name, out/name)
pages = 0
# 404.html: GitHub Pages shows it for any missing address (and redirects the old site's ones).
for path in [*sorted(root.rglob('index.html')), root/'404.html']:
    rel = path.relative_to(root)
    if out in path.parents or any(part.startswith(('.', '_')) for part in rel.parts):
        continue
    html = path.read_text(encoding='utf-8')
    # Root links (/styles.css, /offres/) start from the hosting folder; protocol-relative //… stays as is.
    html = re.sub(r'((?:href|src)=")/(?!/)', lambda m: m[1] + base + '/', html)
    (out/rel).parent.mkdir(parents=True, exist_ok=True)
    (out/rel).write_text(html, encoding='utf-8')
    pages += 1
print(f'Built {pages} pages under "{base or "/"}" → {out}')
