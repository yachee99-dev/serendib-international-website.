# Serendib V10 staging review

## Experience and contact

The opening uses an original full-width cinnamon image, layered typography and a concise statement of Serendib's service. Four product chapters connect imagery to the relevant buying considerations. Original Bulletproof artwork, fonts, code and copy were not reused. The design takes inspiration from its use of scale, image-led pacing and restrained navigation.

Every page includes a persistent enquiry and email control. The enquiry page uses a sticky contact header and its form instead of a duplicate floating control. Product chapter links prefill the selected product and route. Category page contact links preserve their category. The existing catalogue, discovery tool, sample routes, Concierge, structured email drafts and guarded online handler are retained.

## Imagery and provenance

Four original ImageGen images were created for this build. Each source is 1536 × 1024 px, replacing the small image-sheet crops in the featured chapters. The site serves 960 and 1536 px WebP versions with declared dimensions and responsive sources. Below-fold chapters use lazy loading. Subjects are product types, and the images make no claim to show actual supplier lots, workers or Serendib premises. Generated imagery is identified in the existing privacy information. Prompts are recorded in MEDIA_PROMPTS.txt. Current source records should accompany the public release review.

- Cinnamon quills and peppercorns on dark stone.
- Fresh coconut and cream on pale stone.
- Dry loose-leaf tea and amber tea on a dark surface.
- Cocopeat block, loose substrate and husk chips.

The existing catalogue imagery and local font licence files are retained from V9. No third-party stock imagery was added.

## Actual verification

- Chrome tested 18 pages at 320, 390, 768, 1024 and 1920 CSS px using responsive frames. All 90 width checks passed without horizontal overflow.
- All four chapter enquiry links prefilled the expected product, passed through requirements and contact, and produced an email draft addressed to info@serendibinternational.com using synthetic data.
- Persistent contact preserved the spices category. Mobile keyboard navigation opened, closed and restored focus correctly.
- Testing found pointer progression problems when smooth programmatic scrolling and floating controls interacted with the form. The form uses normal scrolling and a sticky header. The four enquiry flows then passed using pointer clicks.
- All 18 catalogue names, descriptions and format lists matched the current V9 source. 605 local references passed. Seven handler tests passed with simulated Turnstile and mail delivery.
- Desktop, mobile and coconut chapter captures are in qa/screenshots. No new public domain deployment or DNS changes were made.

## Remaining checks

Protected Cloudflare staging and actual Zoho receipt still require account access and deployed service configuration. Safari, Firefox, physical device testing, assistive technology coverage and hosted Core Web Vitals remain unverified. All online submission flags and staging indexing restrictions remain in place. The preserved deployment instructions cover the next steps.
