# Serendib International V9 · Trading-house staging review

## Before and after

| V8.1 | V9 |
|---|---|
| The first screen invited buyers to configure a brief. The company and its service appeared around and below it. | The first screen presents Serendib as a trading partner, introduces the category range and gives buyers a contact path. |
| Buyers saw a small product image in the selector and more products below the process. | A full-scale still life carries the opening. The trade relationship leads into an asymmetrical portfolio with a Ceylon spice feature and separate coconut, tea and coir views. |
| Seven historical stylesheets were loaded on every page. | One stylesheet defines the shared header, footer, collection pages, editorial type, forms and Concierge. Three local font files load without an external font dependency. |
| The buyer-role selector lived on the homepage. | The selector lives on `discover.html`. Direct enquiries, product-specific RFQs, sample and private-label paths, and Concierge remain available. |

Compare the actual browser captures in `qa/screenshots/`. See [STRATEGY.md](STRATEGY.md) for benchmarks and the three concepts considered.

## Claims, evidence and assets

Serendib Products Pvt Ltd, its trading brand, its active company inbox, the team's experience and the independent sourcing role are carried over from supplied materials. The site attributes the track record to the team and describes the actual coordination service. All 18 existing catalogue records retain their names, descriptions and forms. No supplier, stock, accreditation, facility or client claims were added.

Start with one supplier-backed proof set for Ceylon cinnamon, when available. Obtain a dated specification, photographs of the actual sample and its packaging with written reuse permission, what the sample costs and covers, and any lot-specific document or testing evidence the supplier can share. Obtain a named sourcing contact approved for publication. Keep product and market qualifications attached to the relevant evidence.

| Assets | Basis and use |
|---|---|
| `trading-house-still-life*.webp` | Original ImageGen still life created for V9 from a prompt describing Ceylon cinnamon, peppercorns, coconut and loose tea on dark stone in editorial side light. Converted to 720 and 1440 px WebP. Homepage only. [OpenAI output terms](https://openai.com/en-GB/policies/row-terms-of-use/). Product-type visual. |
| Existing `assets/products/*.webp` | Original V7.4 ImageGen catalogue outputs and derivatives, retained as illustrative product photography. No external stock or third-party supplier imagery included. |
| `assets/fonts/*.woff` | Subsets from distro-supplied Open Sans and Noto Serif. Apache and OFL licence information included beside the files. |

## Verification and handoff

- Chrome rendered all 18 pages in responsive frames at 320, 390, 768, 1024 and 1920 px. Initial review flagged private-label packaging mockups at 320 px. Replaced them with a photograph of a tea format and confirmed that the page's scroll width matched its viewport. Desktop and mobile headline breaks were refined after screenshot review.
- Browser font-loading probe reported House Sans regular and semibold and House Serif regular loaded. Catalogue filter, four enquiry flows to the correct mailto draft, required fields and invalid email, keyboard menu and focus return, and the Concierge category handoff passed in Chrome using synthetic data.
- 18 HTML pages, 562 file/fragment references and all 18 original product records checked. Seven Node enquiry tests passed with a simulated challenge and mail provider. A separate SEO release copy generated 18 canonical URLs.
- No public deployment, no DNS changes, and no real email sent. Local staging preview was used for QA. Protected Cloudflare deployment needs account access. Live Zoho receipt, standalone Safari/Firefox, physical devices, and hosted performance remain unverified. The direct form is still gated. See [README.md](README.md) for preview and release operations.
