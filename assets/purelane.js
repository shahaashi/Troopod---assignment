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
