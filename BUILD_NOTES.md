# Purelane Shopify build notes

## Scope

The homepage template contains the five required sections in the reference order:

1. Hero
2. Reviews rail
3. Best-selling combos
4. Bundle tiers
5. Product grid

The implementation is built on Dawn 16 and does not modify Dawn's core product, cart, collection, or account templates.

## Store setup

Create at least eight products and assign the storefront collection selected in **Purelane product grid**. The product-grid cards deliberately handle sold-out products, products without featured media, and long titles.

For each hero offer, select one to three products. The offer price is the live Shopify total of the products selected on that offer, so a single-bottle offer takes one product, an “any 2” offer takes two, and an “any 3” offer takes three. Each offer also accepts an optional percentage or fixed rupee discount, which renders as a discounted price with the original total struck through and the saving beside it; leaving the discount type on **None** shows only the product total. The discount entered here is display only, so it must match the Shopify automatic discount created for the same products and quantity. For each combo or bundle tier, select the real Shopify product that represents the purchasable bundle.

Recommended product metafield definitions:

| Namespace and key | Type | Purpose |
| --- | --- | --- |
| `custom.badge` | Single line text | Optional product-card badge such as “Best seller” |
| `custom.bundle_quantity` | Integer | Optional bundle-tier quantity; falls back to the section block setting |
| `reviews.rating` or `custom.rating` | Rating | Product rating shown by product cards; the standard namespace takes priority |
| `reviews.rating_count` or `custom.rating_count` | Integer | Optional rating count shown by product cards |

Review-rail content is managed with section blocks because it is homepage presentation content. Product-specific ratings use Shopify's standard review metafields. If reviews need to be reused across multiple templates, migrate the review fields to a `customer_review` metaobject and connect the section settings as dynamic sources.

Set the theme typography to **Outfit** for headings and **Inter** for body copy. Those defaults are included in `settings_data.json`.

## Production changes from the prototype

- Replaced static product illustrations, names, prices, discount calculations, availability, and cart actions with Shopify product data.
- Replaced repeated card markup with shared product-media, product-card, and section-heading snippets.
- Kept promotional copy in section and block settings so marketing can edit it without Liquid changes.
- Replaced non-functional prototype buttons with product forms or product links.
- Added responsive image candidates, lazy loading below the fold, and an eager first hero image for LCP.
- Added real no-image and sold-out states, clamped long titles, keyboard focus styles, labelled regions, hidden inactive hero links, and reduced-motion behavior.
- Scoped animation setup to custom elements. Section replacement, block selection, and section reordering in the theme editor do not retain stale observers or timers.
- Removed the prototype's global mouse-parallax and large continuously animated background layers. They add main-thread and paint cost without contributing to the five assessed sections.

## QA checklist

- Test at 375, 390, 430, 768, 1024, 1280, and 1440 CSS pixels.
- Verify hero rotation pauses while hovered, while the tab is hidden, and when a hero block is selected in the editor.
- Verify all interactive controls with keyboard only and with reduced motion enabled.
- Verify combo add-to-cart with available and sold-out bundle variants.
- Verify product cards with no image, sold out state, long title, compare-at price, and missing rating metafields.
- Run Shopify Theme Check and Lighthouse against the connected development-store preview.

## With more time

I would run screenshot diffs against the authenticated development-store preview at every target width, tune the surrounding Dawn header/footer to the bonus reference UI, and connect reviews to the chosen review app or a reusable metaobject definition once the store's content model is confirmed.

## AI workflow notes

See [AI_WORKFLOW.md](AI_WORKFLOW.md) for what was delegated, where it failed, and what would be systematised at scale. The main failure mode to guard against is copying prototype values or animation code directly into production instead of first deciding which values belong to Shopify data, theme settings, or reusable snippets.
