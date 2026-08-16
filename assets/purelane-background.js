if (!customElements.get('purelane-background')) {
  customElements.define('purelane-background', class PurelaneBackground extends HTMLElement {
    connectedCallback() {
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.parallaxEnabled = this.dataset.parallax !== 'false';
      this.scenes = Array.from(this.querySelectorAll('.scene'));
      this.layers = Array.from(this.querySelectorAll('.wl'));
      this.mouseX = 0;
      this.mouseY = 0;
      this.currentScene = 0;
      this.onFrameRequest = () => {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => this.renderFrame());
      };
      this.onPointerMove = (event) => {
        this.mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        this.mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
        this.onFrameRequest();
      };
      window.addEventListener('scroll', this.onFrameRequest, { passive: true });
      window.addEventListener('resize', this.onFrameRequest);
      if (!this.reduceMotion && this.parallaxEnabled && window.matchMedia('(min-width: 1024px)').matches) {
        window.addEventListener('mousemove', this.onPointerMove, { passive: true });
      }
      this.renderFrame();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onFrameRequest);
      window.removeEventListener('resize', this.onFrameRequest);
      window.removeEventListener('mousemove', this.onPointerMove);
      if (this.frame) cancelAnimationFrame(this.frame);
    }

    renderFrame() {
      this.frame = null;
      const scrollY = window.scrollY || window.pageYOffset;
      const focus = scrollY + window.innerHeight * 0.5;
      let sceneNumber = 1;
      document.querySelectorAll('[data-scene]').forEach((zone) => {
        const zoneTop = zone.getBoundingClientRect().top + scrollY;
        if (zoneTop <= focus) sceneNumber = Number(zone.dataset.scene) || sceneNumber;
      });
      if (sceneNumber !== this.currentScene) {
        this.currentScene = sceneNumber;
        this.scenes.forEach((scene, index) => scene.classList.toggle('on', index + 1 === sceneNumber));
        this.dataset.d = String(sceneNumber);
      }
      if (!this.reduceMotion && this.parallaxEnabled) {
        const depths = [0.05, 0.09, 0.03, 0.02];
        this.layers.forEach((layer, index) => {
          const depth = depths[index] || 0.05;
          layer.style.setProperty('--px', `${(this.mouseX * depth * 130).toFixed(1)}px`);
          layer.style.setProperty('--py', `${(-scrollY * depth + this.mouseY * depth * 90).toFixed(1)}px`);
        });
      }
    }
  });
}
