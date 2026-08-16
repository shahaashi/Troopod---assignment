if (!customElements.get('purelane-hero')) {
  customElements.define(
    'purelane-hero',
    class PurelaneHero extends HTMLElement {
      connectedCallback() {
        this.slides = Array.from(this.querySelectorAll('[data-purelane-slide]'));
        this.dots = Array.from(this.querySelectorAll('[data-purelane-dot]'));
        this.toggleButton = this.querySelector('[data-purelane-toggle]');
        this.userPaused = false;
        this.currentIndex = Math.max(
          0,
          this.slides.findIndex((slide) => slide.getAttribute('aria-hidden') === 'false')
        );
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.onDotClick = this.onDotClick.bind(this);
        this.onToggleClick = () => {
          this.userPaused = !this.userPaused;
          this.toggleButton?.setAttribute('aria-pressed', String(this.userPaused));
          this.toggleButton?.setAttribute('aria-label', this.userPaused ? 'Play offer rotation' : 'Pause offer rotation');
          this.userPaused ? this.stop() : this.start();
        };
        this.onMouseEnter = () => this.stop();
        this.onMouseLeave = () => this.start();
        this.onVisibilityChange = () => (document.hidden ? this.stop() : this.start());
        this.onBlockSelect = (event) => {
          const slide = event.target.closest('[data-purelane-slide]');
          if (!slide || !this.contains(slide)) return;
          this.stop();
          this.show(this.slides.indexOf(slide));
        };
        this.onBlockDeselect = () => this.start();

        this.dots.forEach((dot) => dot.addEventListener('click', this.onDotClick));
        this.toggleButton?.addEventListener('click', this.onToggleClick);
        this.addEventListener('mouseenter', this.onMouseEnter);
        this.addEventListener('mouseleave', this.onMouseLeave);
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        this.addEventListener('shopify:block:select', this.onBlockSelect);
        this.addEventListener('shopify:block:deselect', this.onBlockDeselect);

        if ('IntersectionObserver' in window) {
          this.observer = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? this.start() : this.stop()),
            { threshold: 0.25 }
          );
          this.observer.observe(this);
        } else {
          this.start();
        }
      }

      disconnectedCallback() {
        this.stop();
        this.observer?.disconnect();
        this.dots?.forEach((dot) => dot.removeEventListener('click', this.onDotClick));
        this.toggleButton?.removeEventListener('click', this.onToggleClick);
        this.removeEventListener('mouseenter', this.onMouseEnter);
        this.removeEventListener('mouseleave', this.onMouseLeave);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
        this.removeEventListener('shopify:block:select', this.onBlockSelect);
        this.removeEventListener('shopify:block:deselect', this.onBlockDeselect);
      }

      onDotClick(event) {
        const index = this.dots.indexOf(event.currentTarget);
        this.show(index);
        this.stop();
        this.start();
      }

      show(index) {
        if (!this.slides.length) return;
        this.currentIndex = (index + this.slides.length) % this.slides.length;
        this.slides.forEach((slide, slideIndex) => {
          const active = slideIndex === this.currentIndex;
          slide.setAttribute('aria-hidden', String(!active));
          slide.querySelectorAll('a, button, input, select, textarea').forEach((element) => {
            element.tabIndex = active ? 0 : -1;
          });
        });
        this.dots.forEach((dot, dotIndex) => {
          dot.setAttribute('aria-current', String(dotIndex === this.currentIndex));
        });
      }

      start() {
        if (this.reduceMotion || this.userPaused || this.slides.length < 2 || this.timer || document.hidden) return;
        const delay = Number(this.dataset.autoplaySpeed) || 4500;
        this.timer = window.setInterval(() => this.show(this.currentIndex + 1), delay);
      }

      stop() {
        window.clearInterval(this.timer);
        this.timer = null;
      }
    }
  );
}
