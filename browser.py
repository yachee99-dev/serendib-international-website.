"""Run against a local or authenticated staging HTTP URL with Playwright."""
import sys
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1].rstrip('/') + '/'
folder = Path(__file__).resolve().parent
site = folder.parent / 'site'
errors = []
screenshots = folder / 'screenshots'
screenshots.mkdir(exist_ok=True)
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    context = browser.new_context(reduced_motion='reduce')
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.on('response', lambda response: errors.append(f'{response.status} {response.url}') if response.status >= 400 else None)
    paths = {}
    pages = sorted(p.name for p in site.glob('*.html'))
    links = set()
    checked = 0
    for name in pages:
        for width in [320,390,430,768,1024,1440,1920]:
            page.set_viewport_size({'width': width, 'height': 900})
            response = page.goto(base + name, wait_until='networkidle')
            assert response.ok, name
            headers = response.headers
            assert 'noindex' in headers['x-robots-tag'], name
            assert headers['x-frame-options'] == 'DENY' and "frame-ancestors 'none'" in headers['content-security-policy']
            assert page.locator('h1').count() == 1, name
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (name, width)
            assert page.locator('main').is_visible(), (name,width)
            if width == 1440:
                paths[name] = set(page.locator('[id]').evaluate_all('(xs) => xs.map(x => x.id)'))
                links.update((name, href) for href in page.locator('a[href]').evaluate_all("(xs) => xs.map(x => x.getAttribute('href'))"))
            checked += 1
            if (name,width) in [('index.html',1440),('index.html',390),('buy-horticulture.html',1440),('growing.html',390),('contact.html',390)]:
                page.screenshot(path=str(screenshots/f'{name[:-5]}-{width}.png'), full_page=True)
    for name, href in links:
        url = urlsplit(urljoin(base + name, href))
        if url.scheme != 'http' or url.netloc != urlsplit(base).netloc:
            continue
        target = url.path.lstrip('/') or 'index.html'
        assert (site / target).exists(), (name, href)
        if url.fragment:
            assert unquote(url.fragment) in paths[target], (name, href)
    print(f'{checked} HTTP layout and header checks, {len(links)} page/link pairs checked')

    page.set_viewport_size({'width':390,'height':844})
    page.goto(base)
    expect(page.locator('video')).to_have_count(0)
    expect(page.locator('#sourcing-desk')).to_have_count(0)
    page.goto(base + 'discover.html')
    assert page.locator('#desk-product-image').evaluate('(img) => img.complete && img.naturalWidth > 0')
    page.locator('.desk-modes').get_by_text('Horticulture', exact=True).click()
    page.locator('#desk-product').select_option('coir-grow-bags')
    expect(page.locator('#desk-question')).to_contain_text('hydrated dimensions')
    expect(page.locator('#desk-quote')).to_contain_text('substrate')
    page.locator('#v7-menu-button').focus()
    page.keyboard.press('Enter')
    expect(page.locator('#v7-menu-close')).to_be_focused()
    page.keyboard.press('Shift+Tab')
    assert page.evaluate("Boolean(document.activeElement.closest('#v7-screen-menu'))")
    page.keyboard.press('Escape')
    expect(page.locator('#v7-menu-button')).to_be_focused()

    page.goto(base + 'products.html#growing')
    expect(page.locator('.catalogue-card:visible')).to_have_count(4)
    page.locator('.catalogue-card:visible .catalogue-enquiry').first.click()
    expect(page.locator('#buyer-request-type')).to_have_value('horticulture')
    expect(page.locator('#buyer-product')).to_have_value('Compressed cocopeat blocks')

    for route, query, spec_label in [('bulk','bulk','Grade, cut or specification'),
        ('private-label','private-label','Product specification or intended use'),
        ('horticulture','horticulture','Crop, blend, treatment and technical targets'),
        ('sample','sample','Grade and evaluation criteria')]:
        if route != 'sample':
            page.goto(base + 'buy-' + route + '.html')
            page.locator('main .trade-button').click()
        else:
            page.goto(base + 'contact.html?type=' + query)
        expect(page.locator('#buyer-request-type')).to_have_value(route)
        expect(page.locator('#spec-label')).to_have_text(spec_label)
        expect(page.locator('#live-enquiry')).to_be_hidden()
        next_action = page.locator('#desk-next')
        next_action.click()
        expect(page.locator('[data-panel=requirements]')).to_be_visible()
        for field, value in [('product','Test product'),('market','Singapore'),('volume','500 kg'),
            ('spec','Test grade or application'),('format','Test packaging')]:
            page.locator('#buyer-' + field).fill(value)
        next_action.click()
        expect(page.locator('[data-panel=contact]')).to_be_visible()
        for field, value in [('name','QA Buyer'),('company','QA Example'),('email','invalid')]:
            page.locator('#buyer-' + field).fill(value)
        next_action.click()
        expect(page.locator('[data-panel=contact]')).to_be_visible()
        page.locator('#buyer-email').fill('qa@example.com')
        next_action.click()
        expect(page.locator('#draft-text')).to_be_focused()
        href = unquote(page.locator('#email-draft').get_attribute('href'))
        assert href.startswith('mailto:info@serendibinternational.com?') and '500 kg' in href and 'Singapore' in href
        page.locator('#desk-back').click()
        expect(page.locator('#buyer-company')).to_have_value('QA Example')
    page.locator('#v7-chat-trigger').click()
    page.locator('#v7-chat-input').fill('Price of cocopeat for qa@example.com?')
    page.locator('#v7-chat-input').press('Enter')
    link = page.get_by_role('link', name='Review a sourcing brief')
    expect(link).to_have_attribute('href','contact.html?from=assistant&type=horticulture&category=growing')
    link.click()
    expect(page.locator('#buyer-product')).to_have_value('')
    print('Passed product and route selection, keyboard navigation, category filter, four RFQ draft routes, required fields, stale draft handling and private assistant handoff')
    assert not errors, errors
    print('No browser page, console or HTTP errors')
