# Serendib V9 development checkpoint — 16 November 2026

## Confirmed

- The uploaded V9 ZIP was extracted and inspected: 18 HTML pages, source JavaScript, one shared CSS, licensed local fonts, and local product illustrations.
- Staging remains `noindex,nofollow` in each HTML page and in Cloudflare `_headers`; `robots.txt` disallows the staging site.
- Public client configuration has `liveEnquiries: false`. The Cloudflare Pages enquiry handler itself also refuses to work unless the server-side `RFQ_ENABLED=true` and required bindings and secrets are present.
- Product catalogue contains 18 records. `python qa/static.py` passed 562 local file/fragment references.
- `node --test qa/enquiry.test.mjs` passed all seven reported tests with mocked Turnstile, mocked Resend and in-memory SQLite. Real D1 and live email delivery are **not** tested.
- `python qa/release_safety.py` passed.
- Browser rendered four priority pages at 390 and 1440 px from inline HTML/asset source. No horizontal overflow or JavaScript page errors were reported. Fonts loaded in this simulation. The offline test cannot prove hosted asset loading or server headers; some lazy/dynamically swapped images are not fully testable through this isolated method.
- The comprehensive preexisting `qa/browser.py` **could not complete** because Chromium navigation to the local HTTP server was blocked by the sandbox administrator. Do not count the full 18-page browser QA as verified on this run.
- No attempt was made to log in to Cloudflare, modify DNS, deploy or send real emails.

## Development delivered

- `Serendib_V9_Developer_Source.zip`: source tree for a **private Git repository**, including Cloudflare Pages Function source, D1 migration, build/check scripts, and a GitHub Actions QA workflow.
- `Serendib_V9_Static_Preview.zip`: the 18-page site only, suitable for a manual static **preview** upload; no server functions are bundled.
- `DEPLOY_TO_CLOUDFLARE.md`: step-by-step Git-linked staging setup and guarded next steps for online RFQs.

## Outstanding gates before public domain launch

1. Private Git-based Pages deployment and Access verification, including main `project.pages.dev` access rather than previews only.
2. Full real-browser QA on hosted staging, keyboard and screen-reader spot tests, Firefox/Safari, devices and performance.
3. Product, claim and media-rights approval.
4. Staging D1, Turnstile and a verified outbound sender, followed by actual delivered synthetic RFQs in Zoho.
5. Legal/privacy review and retention policy for stored buyer enquiries.
6. Founder approval to connect `serendibinternational.com`, enable SEO indexing, and activate the live intake.
