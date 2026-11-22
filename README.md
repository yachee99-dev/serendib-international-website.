# Serendib International V11

Review V11_REVIEW.md for the current redesign, image needs, form destination and genuine QA results. Open site/index.html for a local review, or run python qa/serve.py for the header-aware local preview. The supporting V9/V10 notes are inherited history. Source uses static HTML/CSS/JavaScript, with the guarded Pages Function in functions/.

## Open staging locally

Extract the archive and run `python qa/serve.py`, then visit `http://127.0.0.1:8765/`. The local server serves static pages and sends the header config. It does not run Cloudflare Functions. Review of the buyer routes and email-draft mode needs no credentials.

- Static checks: `python qa/static.py [path-to-v7.2.zip]` (requires lxml).
- Enquiry handler with SQLite and mocked services: `node --test qa/enquiry.test.mjs` (Node 24).
- With Playwright and Chromium installed: `python qa/browser.py http://127.0.0.1:8765` (set Chromium executable as applicable). This produces desktop/mobile-sized screenshots. The test covers draft mode. Run real-browser reduced-motion, accessibility and mobile checks on the hosted staging URL as well.

## SEO release copy

After public release approval, run `python qa/prepare_public.py <new-output-folder> --release-approved` to generate a separate indexable copy with canonicals and a sitemap. Verify the canonical host and routes against the final Cloudflare configuration.

## Cloudflare preview

1. Commit the reviewed release to a private GitHub or GitLab repository. Create an isolated, access-controlled Cloudflare Pages project. Set `site` as the output directory, use no build command and run from the repository root so Pages can deploy `functions/`. Protect preview access and verify from a signed-out session. Leave the business domain and production records alone. If using Wrangler Direct Upload, run `wrangler pages deploy site --project-name <staging-project> --branch <preview-branch>` from this root. Dashboard drag-and-drop does not deploy the Function.
2. Set up a separate staging D1 database. Apply `migrations/0001_enquiries.sql` and bind the database as `ENQUIRIES` in the preview environment. Create a Turnstile widget limited to the chosen preview hostname. Use staging-specific bindings and secrets. Stage only synthetic contact data while testing.
3. The implementation uses Resend for outbound notification only. Verify a dedicated sending subdomain and use its approved sender address. Preserve Zoho mail routing and avoid altering the root MX records. Verify current free-tier terms before setup. Provide `TURNSTILE_SECRET` and `RESEND_API_KEY` as private server secrets, and configure `RFQ_FROM` and the exact `RFQ_HOSTNAME` as server variables. Leave the public and server enable flags off until deployment prechecks, privacy review and operational ownership are in place.
4. For a controlled synthetic test on private staging, set `RFQ_ENABLED=true` and set `liveEnquiries:true` with the public widget key in that preview build's `site/config.js`. Check the paused state again after tests if launch checks are still outstanding. Use a synthetic brief and verify the reference in D1, the message in Zoho (including spam), and that Reply targets the test buyer. Provider acceptance alone is insufficient. Test a failed delivery and reconciliation with the queue.
5. Record the tested commit and deployment URL. Keep the previous tested commit and preview available. Roll back a preview by redeploying the prior commit. Rehearse production rollback separately using Cloudflare's supported production deployment history. Handle schema changes as forward-compatible migrations.

[Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) · [Preview access](https://developers.cloudflare.com/pages/configuration/preview-deployments/) · [Pages Functions](https://developers.cloudflare.com/pages/functions/get-started/) · [Resend sending domains](https://resend.com/docs/dashboard/domains/introduction)

## Review queue

The D1 table is private. Give the sourcing desk owner least-privilege internal access before activation. Use an authenticated D1 console or approved internal workflow for status updates. The mail provider’s idempotency window is 24 hours. The handler only attempts notification retries within 23 hours of record creation. Review pending records daily and manually reconcile them with Zoho before contacting the buyer.

```sql
SELECT id, route, owner, status, notification, created_at
FROM enquiries
WHERE status <> 'closed'
ORDER BY (notification = 'pending') DESC, created_at;
```
