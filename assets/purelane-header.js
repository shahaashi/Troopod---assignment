if (!customElements.get('purelane-site-header')) {
  customElements.define('purelane-site-header', class PurelaneSiteHeader extends HTMLElement {
    connectedCallback() {
      this.header = this.querySelector('[data-pl-site-header]');
      this.onScroll = () => {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
          this.header?.classList.toggle('is-compact', window.scrollY > 90);
          this.frame = null;
        });
      };
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.onScroll();
    }
    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      if (this.frame) cancelAnimationFrame(this.frame);
    }
  });
}
