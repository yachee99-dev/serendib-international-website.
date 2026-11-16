"""Build a separate indexable copy after the public release has been approved."""
import argparse
from pathlib import Path
import re
from shutil import copytree
from xml.etree.ElementTree import Element, SubElement, ElementTree

DOMAIN = 'https://serendibinternational.com'
ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('output', type=Path, help='A new output directory')
parser.add_argument('--release-approved', action='store_true', required=True)
args = parser.parse_args()
destination = args.output.resolve()
if destination.is_relative_to(ROOT / 'site') or destination.exists():
    parser.error('Choose a new directory outside the staging site.')

copytree(ROOT / 'site', destination)
sitemap = Element('urlset', xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
for page in sorted(destination.glob('*.html')):
    # Cloudflare Pages canonicalizes .html paths to extensionless paths.
    path = '/' if page.stem == 'index' else '/' + page.stem
    url = DOMAIN + path
    text = page.read_text()
    text = re.sub(r'<meta\s+content="noindex,nofollow"\s+name="robots"\s*/?>', '', text)
    text = text.replace('</head>', f'<link rel="canonical" href="{url}"><meta property="og:url" content="{url}"></head>')
    page.write_text(text)
    SubElement(SubElement(sitemap, 'url'), 'loc').text = url

headers = destination / '_headers'
headers.write_text('\n'.join(line for line in headers.read_text().splitlines() if 'X-Robots-Tag:' not in line) + '\n')
(destination / 'robots.txt').write_text(f'User-agent: *\nDisallow: /api/\nSitemap: {DOMAIN}/sitemap.xml\n')
ElementTree(sitemap).write(destination / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
print(f'Wrote {len(sitemap)} canonical URLs to a separate release candidate.')
