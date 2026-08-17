# AI workflow notes

Notes on how AI was used to build this theme, what it got wrong, and what I would put in place before doing this repeatedly.

## What was delegated

The reference HTML was treated as the visual specification and decomposed into repeated primitives before implementation. Mechanical extraction and edge-case review were delegated. Shopify data modeling, Liquid boundaries, accessibility, lifecycle behavior, and performance decisions were reviewed manually.

Across the build, delegation split cleanly along one line: **finding and changing** versus **deciding**.

- Delegated: locating where prices are computed across the hero, combo, and bundle sections; checking which settings actually exist in each `{% schema %}`; mechanical Liquid and CSS edits; working out the knock-on geometry when a component changed size.
- Not delegated: which offer gets which discount, the Shopify admin configuration, and the visual target. The screenshot was the specification, not something the model was asked to invent.

The highest-value delegation was reading, not writing. The real defect in the hero was that the offer price was keyed to the block's *position* in the slider rather than to the products the merchant selected, so an "Any 2" offer moved into the first slot priced a single bottle. No amount of prompting about discount configuration would have surfaced that. It required someone to read [`sections/purelane-hero.liquid`](sections/purelane-hero.liquid) line by line.

## Where it failed

**Advice ran ahead of the code.** A detailed recommendation to enforce bundle pricing with a Shopify Discount Function proposed reading `_bundle_id` from every cart line and grouping on it. `_bundle_id` is emitted in exactly one place — [`assets/purelane.js`](assets/purelane.js) — on the bundle-tier path. The hero offers never set it. The guidance was plausible, specific, well-structured, and inapplicable to the section it was about.

**It described a store state nobody had verified.** The same guidance assumed the hero offers were configured. [`templates/index.json`](templates/index.json) had `discount_type: none` on all three offers and no products selected on two of them. The advice answered a question about a configuration that did not exist yet.

**Documentation drifted from schema.** The build notes described "an optional separate offer product" supplying the hero price and compare-at price. No such setting is in the section schema. Prose written earlier outlived the code it described, and nothing would have caught it except reading both.

**No render loop.** The Shopify CLI is not installed in this environment, so no change was verified in a browser. Every spacing value in the hero card restyle was derived from the geometry already in the stylesheet rather than observed. For a task whose entire specification was a screenshot, that is the weakest part of the process.

**Scope drifted toward advice.** The session settled into producing configuration guidance when the deliverable was working code, and needed an explicit redirect to get back to the theme files.

## What I would systematise for twenty of these

1. **Read before advising.** No configuration or architecture recommendation until the relevant Liquid and JS has actually been opened. The `_bundle_id` miss is the whole case for this rule.
2. **A render loop, treated as non-negotiable.** `shopify theme dev` running against a development store before any visual change lands, so "match this reference" is verified rather than reasoned about.
3. **Every displayed price names its enforcer.** Any surface that computes a price declares which Shopify discount backs it. The bundle tiers already do this through the `discount_checkout_ready` setting in [`sections/purelane-bundles.liquid`](sections/purelane-bundles.liquid), which disables the add button until the merchant confirms the matching discount exists. The hero has no equivalent, so a mismatch between homepage and checkout is silent. Either the same guard everywhere, or one configuration that both the storefront and the discount logic read.
4. **One source of discount truth.** Discount values currently live in three separate places in `templates/index.json` and again in Shopify admin. At twenty builds that is eighty independent opportunities to drift. A Shopify Function holding the rules, with the storefront reading the same configuration, removes the class of bug rather than the instance.
5. **Restyle the container, not just the component.** Before changing a component's box model, identify what is sized against it. The hero product padding was tuned to the offer card's old height, and nothing in the stylesheet marked that coupling — changing the card from a two-column grid to a stack silently pushed it over the product images.
6. **Assert documentation against schema.** Any setting named in prose should be checkable against the section's `{% schema %}`. Without that check, setup documentation rots exactly the way it did here.

The general lesson is that the model was reliable at operations with a verifiable answer in the repository and unreliable at anything requiring knowledge of state outside it — store configuration, rendered output, what the merchant had actually set up. The systematisation worth investing in is mostly about closing that gap: shorten the distance between a change and seeing it run, and keep the number of places a fact is written down as close to one as possible.
