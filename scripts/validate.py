"""Check the restored multilingual static site and its internal references."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from html.parser import HTMLParser
root = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self, text):
  super().__init__(); self.links=[]; self.images=[]; self.ids=set(); self.h1=0; self.lang=None; self.alternates={}; self.title=False; self.description=False; self.current=0; self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if tag=='html':self.lang=a.get('lang')
  if tag=='h1':self.h1+=1
  if tag=='title':self.title=True
  if tag=='meta' and a.get('name')=='description':self.description=bool(a.get('content'))
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag=='img':self.images.append(a);self.links.append(a.get('src',''))
  if tag in ['script','link']:
   link=a.get('src') or a.get('href')
   if link:self.links.append(link)
  if tag=='link' and 'hreflang' in a:self.alternates[a['hreflang']]=a.get('href')
pages={}
for p in root.rglob('index.html'):
 route='/' + p.parent.relative_to(root).as_posix().strip('.')
 route=route.rstrip('/')+'/' if route!='/' else route
 pages[route]=Page(p.read_text())
errors=[]
for route,p in pages.items():
 expected='en' if route.startswith('/en/') else 'nl' if route.startswith('/nl/') else 'fr'
 for good,msg in [(p.lang==expected,'HTML language'),(p.h1==1,'single H1'),(p.title,'title'),(p.description,'description'),(set(p.alternates)=={'fr','en','nl','x-default'},'hreflang')]:
  if not good:errors.append(f'{route}: {msg}')
 for img in p.images:
  if 'alt' not in img:errors.append(f'{route}: missing image alt')
 for href in p.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:continue
  target=unquote(u.path) or route
  if target.startswith('/'):
   file=root/target.lstrip('/')
   if target.endswith('/'):file=file/'index.html'
   if not file.exists():errors.append(f'{route}: broken resource {href}')
  if u.fragment and target in pages and u.fragment not in pages[target].ids:errors.append(f'{route}: missing anchor {href}')
 for lang,target in p.alternates.items():
  if target not in pages:errors.append(f'{route}: unavailable alternate {target}')
  elif lang!='x-default' and pages[target].lang!=lang:errors.append(f'{route}: wrong alternate language')
assert len(pages)==21, len(pages)
if errors:
 print('\n'.join(errors));raise SystemExit(1)
print(f'PASS: {len(pages)} pages; internal links, anchors, resources, headings, metadata, image alternatives and language equivalents.')
