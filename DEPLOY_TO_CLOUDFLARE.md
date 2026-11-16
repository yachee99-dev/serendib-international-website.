# Serendib V9 — development and Cloudflare staging

## Status

- **Do not publish the public domain yet.** `serendibinternational.com` stays untouched.
- `site/` contains the 18-page website, fonts, images, catalogue, draft enquiries and locally answered Concierge.
- `functions/api/enquiry.js` is a Cloudflare Pages Function for *future* direct enquiries. It fails closed when server variables are missing and the public `liveEnquiries` switch is false.
- The site is deliberately `noindex`, and `_headers` sets `X-Robots-Tag: noindex, nofollow`. No secret credentials are included.

## Recommended: private Git repository → Cloudflare Pages

1. Create a **private** GitHub repository, e.g. `serendib-international-website`. Upload all files **from this directory's root**, keeping `site/`, `functions/`, `migrations/`, `qa/`, and `.github/` as top-level directories. Do **not** upload just the `site/` contents to Git.
2. Sign into [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**. Authorize the private repository. Use a new project such as `serendib-v9-staging`.
3. Set **Framework preset** to `None`, **Build command** to blank, **Build output directory** to `site`, **Root directory** to repository root, and production branch to `main`. Confirm the source repository and settings before deploying.
4. Your staging site will be on a `*.pages.dev` hostname. **Do not add `serendibinternational.com` under Custom domains.** No changes to Zoho MX, SPF, DKIM, or DMARC are required.
5. **Protect staging with Cloudflare Access**. The Pages project's built-in 'Enable access policy' controls *preview deployments*, not the main project `project.pages.dev` address. To protect that primary address too, follow Cloudflare's 'Enable Access on your *.pages.dev domain' procedure and verify it from a signed-out browser session.
6. Inspect all pages, products, menu, enquiry draft, font loading, and chatbot. Run the QA scripts from the repository. Report the actual Pages URL and any live-browser failures.
7. Keep RFQ online sending disabled until a separate preview D1 database, Turnstile, approved email sender, server-side variables, privacy notice, live mail receipt and error-state tests are all configured. Do not put private API secrets in `site/config.js` or Git.

Official docs: [Pages Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) · [Pages preview Access](https://developers.cloudflare.com/pages/configuration/preview-deployments/) · [Pages Access known issues](https://developers.cloudflare.com/pages/platform/known-issues/).

## Alternate: dashboard static-only preview (no backend)

Upload the separately supplied `Serendib_V9_Static_Preview.zip` to **Workers & Pages → Create application → Pages → Direct Upload**. This includes only the `site/` files flattened into ZIP root, so the homepage is `index.html` at the ZIP root. This **cannot deploy the Pages Function** through dashboard drag-and-drop. It is suitable for viewing design and draft-email workflows only. A Direct Upload Pages project cannot later be switched to Git integration; create a new Git-integrated project for the full development pipeline.

Official docs: [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Future direct enquiries (NOT yet active)

- Cloudflare Pages Functions expects `functions/` at the repo root and `site/` as the output directory.
- Create a *preview-only* Cloudflare D1 database with the `migrations/0001_enquiries.sql` table. Bind it as `ENQUIRIES` in Preview settings.
- Set up a preview Turnstile widget for the exact Pages hostname (hostname check exists in backend), its public key in preview `site/config.js` and secret in server secrets only.
- The backend sends notifications to `info@serendibinternational.com` through Resend. Verify a **dedicated sending subdomain** such as `notify.serendibinternational.com` if this provider is chosen. Do not replace Zoho records on the root domain. Resend trial/free-tier availability and restrictions must be verified when configured.
- Configure `RFQ_HOSTNAME`, `RFQ_FROM`, `RESEND_API_KEY`, `TURNSTILE_SECRET`, and `RFQ_ENABLED` **for staging only**, then set `liveEnquiries: true` and the Turnstile public key in that **preview build only**.
- Use *synthetic data* for the first full live test. Verify: Function response; record in D1; delivered message in Zoho; correct Reply-To; duplicate submission behavior; invalid fields; honeypot; captcha; failed notification reconciliation.
- Production activation requires a reviewed privacy policy and data-retention/access-owner plan, not only successful mock tests.

## Release gate

1. Product, company and media claims have been reviewed.
2. Media-rights evidence for all assets is documented and acceptable.
3. Mobile and desktop visual/accessibility checks passed on actual hosted Pages.
4. DNS/email delivery has been tested, including real recipient inboxes.
5. Controlled online forms / fallback behavior validated.
6. Domain connection, indexable SEO build, release communications and rollback have explicit founder approval.

`qa/prepare_public.py` creates a **separate indexable copy** only after passing `--release-approved`. Do not modify the noindex staging tree in place.
