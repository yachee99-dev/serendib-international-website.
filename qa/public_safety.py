"""Validate the Serendib public release candidate (no backend activation)."""
from pathlib import Path
from lxml import html
import xml.etree.ElementTree as ET
site=Path(__file__).resolve().parent.parent / 'site'
pages=list(site.glob('*.html'))
assert len(pages)==19, 'Expected 19 pages'
assert 'X-Robots-Tag: noindex' not in (site/'_headers').read_text()
assert 'Sitemap: https://serendibinternational.com/sitemap.xml' in (site/'robots.txt').read_text()
assert 'liveEnquiries: false' in (site/'config.js').read_text()
assert 'turnstileSiteKey: \'\'' in (site/'config.js').read_text()
urls=ET.parse(site/'sitemap.xml').getroot()
assert len(urls)==18
for page in pages:
  doc=html.parse(str(page))
  assert len(doc.xpath('//h1'))==1, page
  assert 'Rathnakara Place' in page.read_text(), page
  assert 'tel:+94760765178' in page.read_text(), page
  assert '43, Rathnakara' not in page.read_text(), page
  if page.name!='404.html':
    assert doc.xpath('//link[@rel="canonical"]'), page
    assert 'noindex,nofollow' not in page.read_text(), page
  else:
    assert 'noindex,nofollow' in page.read_text()
print('V11 PUBLIC RELEASE PASS:', len(pages),'pages,',len(urls),'indexable URLs, mailto-only form, no street number.')
