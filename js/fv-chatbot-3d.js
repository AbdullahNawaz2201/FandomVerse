/* FandomVerse — chatbot premium 3D polish: cursor tilt + ambient particles */
(function () {
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function addTilt(el, xVar, yVar, strength) {
    if (!el) return;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty(xVar, clamp(px * strength, -strength, strength) + 'deg');
      el.style.setProperty(yVar, clamp(-py * strength, -strength, strength) + 'deg');
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty(xVar, '0deg');
      el.style.setProperty(yVar, '0deg');
    });
  }

  function addParticles(container, count) {
    if (!container) return;
    const layer = document.createElement('div');
    layer.className = 'fvc-particles';
    layer.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      const size = 3 + Math.random() * 4;
      p.style.setProperty('--s', size + 'px');
      p.style.setProperty('--x', Math.random() * 100 + '%');
      p.style.setProperty('--d', 7 + Math.random() * 8 + 's');
      p.style.setProperty('--delay', -(Math.random() * 12) + 's');
      p.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
      layer.appendChild(p);
    }
    container.prepend(layer);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    addTilt(document.querySelector('.fvc-launcher'), '--fvc-tiltX', '--fvc-tiltY', 10);
    addTilt(document.querySelector('.fvc-panel__inner'), '--fvc-ptiltX', '--fvc-ptiltY', 2.5);
    addParticles(document.querySelector('.fvc-panel__inner'), 14);
  });
})();
