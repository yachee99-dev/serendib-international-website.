# Serendib V11 staging redesign

## Diagnosis and changes

V10 had a more expressive opening but repeated the same full-width image and caption pattern across all four collections. The fixed enquiry bar also competed with the brand experience and previously obstructed form controls. The brief builder had already moved off the homepage, and that separation is preserved.

The revised homepage uses a South Asian origin statement with Serendib clearly identified as a sourcing partner in Sri Lanka. The collection varies its composition across full-width spice photography, a coconut split layout, a reversed dark tea feature, and a framed coir section. A botanical green origin section explains the business's coordinating role. The closing invitation uses a tea image, and practical sourcing tools remain on their own pages.

All 19 pages share the contact navigation and visual stylesheet. The compact fixed header changes from transparent to dark on scroll. The mobile menu includes a visible enquiry action. Product stories, the footer and appropriate body sections link into enquiries. The floating enquiry bar has been removed. The existing Concierge is retained as a compact assistance button. Added 404.html, social image metadata and reduced-motion rules. Mobile does not use image parallax or the desktop mask reveal.

The current work was implemented directly in the existing static HTML/CSS/JavaScript project. The Cloudflare Pages handler and original business policies remain.

## Images

The four existing V10 images were retained. They are original ImageGen product references at 1536 × 1024 px, with 960 px variants, intrinsic dimensions and responsive crops. Their generation prompts and provenance are in MEDIA_PROMPTS.txt and V10_REVIEW.md. No reference-site images or code were reused.

These product visuals are suitable for design review. They do not document actual Serendib suppliers or operations. To replace them with authentic business evidence, obtain these assets with written commercial publication permission:

- A close photograph of an actual Ceylon cinnamon sample and the supplier's approved packing.
- A real person conducting sample evaluation, photographed at an approved setting, with their permission.
- An approved producer photograph of cinnamon preparation or tea handling, with permission for the premises and any recognizable people.
- A real coir block, its label and sample test details from the supplier under evaluation.
- A named Serendib contact portrait approved for publication.

The design can accept these at the existing story image positions without adding fake supplier evidence. Until they exist, the site uses product-type visuals and commercial explanations.

## Form destination

The structured enquiry generates a reviewable email draft addressed to info@serendibinternational.com. The visitor sends it in their mail app. Online submission remains disabled. A guarded, server-validated Cloudflare handler is included, with D1, Turnstile and sender settings requiring deployment. No claim is made that an online enquiry has been delivered to Zoho. Configuration and existing deployment instructions are retained.

## Verification on this revision

- Chrome tested 19 pages at 360, 390, 768, 1024, 1440 and 1920 CSS pixels. All 114 settled layout checks passed without horizontal overflow. The responsive frame's load event was awaited so initial unstyled content was not recorded as a layout result.
- Four product chapter enquiries retained their product, progressed through the form, rejected invalid email and generated a draft to the company inbox.
- The mobile menu displayed its enquiry action and returned focus to the menu button after Escape.
- Desktop, mobile and coconut section screenshots were captured and inspected. Files are in qa/screenshots/v11.
- All 18 original catalogue names, descriptions and form lists matched V9. All 19 pages retain contact links. 673 local file and fragment references passed.
- Seven local handler test results passed with simulated mail and challenge services. Staging remains unindexed and the live submission flags are disabled.

Standalone Safari/Firefox, physical device checks, screen-reader review, deployed Core Web Vitals and actual email delivery remain unverified. The origin photography above still needs business evidence and permission. No paid services, production deployment or public domain changes were made.
