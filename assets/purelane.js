if (!customElements.get('purelane-section')) {
  customElements.define(
    'purelane-section',
    class PurelaneSection extends HTMLElement {
      connectedCallback() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.reveals = Array.from(this.querySelectorAll('[data-pl-reveal]'));

        if (this.reducedMotion.matches || !('IntersectionObserver' in window) || window.Shopify?.designMode) {
          this.showAll();
          return;
        }

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-visible');
              this.observer?.unobserve(entry.target);
            });
          },
          { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
        );
        this.reveals.forEach((element) => this.observer.observe(element));
      }

      disconnectedCallback() {
        this.observer?.disconnect();
      }

      showAll() {
        this.reveals.forEach((element) => element.classList.add('is-visible'));
      }
    },
  );
}

if (!window.__purelaneBundleCartBound) {
  window.__purelaneBundleCartBound = true;
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-bundle-add], [data-combo-add]');
    if (!button || button.disabled) return;

    const tier = button.closest('[data-bundle-tier], [data-combo-bundle]');
    const variants = Array.from(tier?.querySelectorAll('[data-bundle-variant]') || []);

    if (!tier || !variants.length || variants.some((item) => item.dataset.bundleAvailable !== 'true')) return;

    const properties = tier.matches('[data-combo-bundle]')
      ? { _bundle_id: tier.dataset.bundleId, _bundle_title: tier.dataset.bundleTitle }
      : { _bundle_tier: tier.dataset.bundleKey };

    const originalLabel = button.dataset.bundleLabel || button.textContent.trim();
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Adding...';

    try {
      const response = await fetch(window.routes?.cart_add_url || '/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          items: variants.map((item) => ({
            id: Number(item.dataset.bundleVariant),
            quantity: 1,
            properties: { ...properties },
          })),
        }),
      });

      if (!response.ok) throw new Error('Unable to add this bundle.');
      window.location.assign(window.routes?.cart_url || '/cart');
    } catch (error) {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.textContent = originalLabel;
      window.alert(error.message || 'Unable to add this bundle. Please try again.');
    }
  });
}
