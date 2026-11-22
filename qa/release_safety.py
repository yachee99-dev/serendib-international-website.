"""Fail closed if a staging source tree unexpectedly enables public indexing or live enquiries."""
from pathlib import Path
from lxml import html
root=Path(__file__).resolve().parent.parent
site=root/'site'
assert 'liveEnquiries: false' in (site/'config.js').read_text(), 'Live-enquiry flag must remain off on staging'
assert 'turnstileSiteKey: \'\'' in (site/'config.js').read_text(), 'Staging public key should not be preconfigured'
assert 'X-Robots-Tag: noindex, nofollow' in (site/'_headers').read_text(), 'Staging X-Robots-Tag missing'
assert 'Disallow: /' in (site/'robots.txt').read_text(), 'Staging robots.txt must disallow crawlers'
for page in site.glob('*.html'):
    doc=html.parse(str(page))
    assert doc.xpath('//meta[@name="robots" and contains(@content,"noindex")]'), page.name
assert not list(site.rglob('*.env')) and not list(root.glob('.dev.vars*')), 'Do not commit secrets'
print(f"STAGING SAFETY PASS: {len(list(site.glob('*.html')))} pages remain noindex and online forms remain disabled")
