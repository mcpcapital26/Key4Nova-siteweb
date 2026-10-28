"""Export all native pages into a single HTML preview, without deploying."""
from pathlib import Path
import base64, hashlib, json, re
root = Path(__file__).resolve().parents[1]
files = ['styles.css', 'refinements.css', 'site.js', 'navigation.js', 'job-feed.js', 'apply-form.js']
versions = {name: hashlib.sha256((root/name).read_bytes().replace(b'\r\n', b'\n')).hexdigest()[:12] for name in files}
pages = {}
not_found = (root/'404.html').read_text()
for name, version in versions.items():
    not_found = re.sub(r'((?:href|src)="/' + re.escape(name) + r')(?:\?[^" ]*)?"', lambda m: m[1] + '?v=' + version + '"', not_found)
(root/'404.html').write_text(not_found)
for path in sorted(root.rglob('index.html')):
    if any(part.startswith('.') for part in path.relative_to(root).parts):
        continue
    html = path.read_text()
    for name, version in versions.items():
        html = re.sub(r'((?:href|src)="/' + re.escape(name) + r')(?:\?[^" ]*)?"', lambda m: m[1] + '?v=' + version + '"', html)
    path.write_text(html)
    route = '/' + path.parent.relative_to(root).as_posix().strip('.')
    route = route.rstrip('/') + '/' if route != '/' else route
    html = re.sub(r'<link[^>]*href="/refinements.css[^>]*>', '', html)
    html = re.sub(r'<script[^>]*src="/navigation.js[^>]*></script>', '', html)
    html = re.sub(r'<script[^>]*src="/job-feed.js[^>]*></script>', '', html)
    html = re.sub(r'<script[^>]*src="/apply-form.js[^>]*></script>', '', html)
    html = re.sub(r'<link[^>]*href="/styles.css[^>]*>', '<link rel="stylesheet" href="/styles.css">', html)
    html = re.sub(r'<script[^>]*src="/site.js[^>]*></script>', '<script src="/site.js" defer></script>', html)
    pages[route] = html
mime = {'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'}
assets = {'/'+p.relative_to(root).as_posix(): 'data:'+mime[p.suffix]+';base64,'+base64.b64encode(p.read_bytes()).decode() for p in (root/'assets').iterdir()}
data = {'pages':pages,'assets':assets,'css':(root/'styles.css').read_text()+'\n'+(root/'refinements.css').read_text(),'js':(root/'site.js').read_text()+'\n'+(root/'navigation.js').read_text()+'\n'+(root/'job-feed.js').read_text()+'\n'+(root/'apply-form.js').read_text()}
payload = json.dumps(data, ensure_ascii=True).replace('<', '\\u003c')
(root/'preview.html').write_text((root/'scripts/preview-shell.html').read_text().replace('__SITE_DATA__',payload))
print(f'Exported {len(pages)} pages, {len(assets)} assets → preview.html')
