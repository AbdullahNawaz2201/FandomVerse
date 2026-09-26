(function () {
  function pad(n) { return String(n).padStart(2, '0'); }

  function tickClock() {
    const timeEl = document.getElementById('about-clock-time');
    const dateEl = document.getElementById('about-clock-date');
    if (!timeEl) return;
    const now = new Date();
    let h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    timeEl.innerHTML = pad(h) + '<span class="about-clock__colon">:</span>' +
      pad(now.getMinutes()) + '<span class="about-clock__colon">:</span>' +
      pad(now.getSeconds()) + ' <small style="font-size:.5em;opacity:.7;">' + ampm + '</small>';
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  }

  function animateCount(el, from, to, duration) {
    const start = performance.now();
    function step(ts) {
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounter() {
    const valueEl = document.getElementById('about-counter-value');
    if (!valueEl) return;
    let count = 0;
    try {
      count = parseInt(localStorage.getItem('fv_visit_count') || '0', 10) || 0;
      count += 1;
      localStorage.setItem('fv_visit_count', String(count));
    } catch (e) {
      count = 1;
    }
    animateCount(valueEl, 0, count, 900);
  }

  document.addEventListener('DOMContentLoaded', () => {
    tickClock();
    setInterval(tickClock, 1000);
    initCounter();
  });
})();
