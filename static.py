"""Audit links, fragments, media references and the optional V7.2 catalogue baseline."""
import sys
from pathlib import Path
from urllib.parse import urlsplit, unquote
from zipfile import ZipFile
from lxml import html

site = Path(__file__).resolve().parent.parent / 'site'
docs = {p.name: html.parse(str(p)) for p in site.glob('*.html')}
checked = 0
for name, doc in docs.items():
    assert len(doc.xpath('//h1')) == 1, name
    assert doc.xpath('//meta[@name="robots" and contains(@content,"noindex")]'), name
    ids = [x.get('id') for x in doc.xpath('//*[@id]')]
    assert len(ids) == len(set(ids)), name
    for element in doc.xpath('//*[@href or @src or @poster or @action]'):
        for attribute in ['href', 'src', 'poster', 'action']:
            value = element.get(attribute)
            if value is None:
                continue
            uri = urlsplit(value)
            if uri.scheme == 'mailto':
                continue
            assert not uri.scheme and not uri.netloc, (name, value)
            target = unquote(uri.path) or name
            if target == '/api/enquiry':
                continue
            assert (site / target).is_file(), (name, value)
            assert not uri.fragment or docs[target].xpath('//*[@id=$id]', id=unquote(uri.fragment)), (name, value)
            checked += 1
print(f'{len(docs)} pages and {checked} local file/fragment references passed')

def catalogue(tree):
    return [
        [item.text_content() for item in record.xpath('.//h3 | .//p | .//*[@class="catalogue-formats"]')]
        for record in tree.xpath('//article[@data-category]')
    ]

records = catalogue(docs['products.html'])
assert len(records) == 18
if len(sys.argv) > 1:
    with ZipFile(sys.argv[1]) as source:
        old = html.fromstring(source.read('products.html'))
    assert catalogue(old) == records
    print('All 18 original product names, descriptions and formats match')
