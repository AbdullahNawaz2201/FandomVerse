
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function isCardToken(tok) {
    return /(^|-)card$/.test(tok) && tok.indexOf('__') === -1;
  }

  function findCards() {
    var all = document.querySelectorAll('[class*="card"]');
    var out = [];
    all.forEach(function (el) {
      var tokens = el.className && typeof el.className === 'string' ? el.className.split(/\s+/) : [];
      for (var i = 0; i < tokens.length; i++) {
        if (isCardToken(tokens[i])) { out.push(el); break; }
      }
    });
    return out;
  }

  function addSparkles(card, count) {
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'fv-spark';
      s.style.top = (8 + Math.random() * 80) + '%';
      s.style.left = (6 + Math.random() * 86) + '%';
      s.style.animationDelay = (Math.random() * 500) + 'ms';
      card.appendChild(s);
    }
  }

  function initCards() {
    var cards = findCards();
    cards.forEach(function (card) {
      if (card.dataset.fv3d) return;
      card.dataset.fv3d = '1';
      card.classList.add('fv3d-card', 'fv3d-reveal');

      var cs = getComputedStyle(card);
      if (cs.position === 'static') card.style.position = 'relative';

      var shine = document.createElement('span');
      shine.className = 'fv3d-shine';
      card.appendChild(shine);

      addSparkles(card, 4);

      if (!reduceMotion) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          var rx = (py - 0.5) * -10;
          var ry = (px - 0.5) * 12;
          card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-6px)';
          card.style.setProperty('--fv-mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--fv-my', (py * 100).toFixed(1) + '%');
        });
        card.addEventListener('pointerleave', function () {
          card.style.transform = '';
        });
      }

      revealObserver.observe(card);
    });
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('fv3d-in');
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
  function initButtons() {
    var sel = '.btn, .icon-btn, [class*="__cta"], [class*="__btn"], .fv-footer-button, [type="submit"]';
    document.querySelectorAll(sel).forEach(function (btn) {
      if (btn.dataset.fvglow) return;
      btn.dataset.fvglow = '1';
      btn.classList.add('fv-glow-btn');
      var cs = getComputedStyle(btn);
      if (cs.position === 'static') btn.style.position = 'relative';
      btn.addEventListener('click', function (e) {
        var r = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'fv-btn-ripple';
        var x = (e.clientX ? e.clientX - r.left : r.width / 2);
        var y = (e.clientY ? e.clientY - r.top : r.height / 2);
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 700);
      });
    });
  }

  function initHeroLogo() {
    var heroContent = document.querySelector('.hero .hero-content, .hero');
    var hero = document.querySelector('.hero');
    if (!hero || document.body.getAttribute('data-page') !== 'home') return;
    if (hero.querySelector('.fv-hero3dlogo')) return;

    var wrap = document.createElement('div');
    wrap.className = 'fv-hero3dlogo';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<span class="fv-hero3dlogo__ring"></span>' +
      '<span class="fv-hero3dlogo__ring fv-hero3dlogo__ring--2"></span>' +
      '<img class="fv-hero3dlogo__img" src="assets/images/fandomverse-logo.png" alt="">';

    for (var i = 0; i < 14; i++) {
      var p = document.createElement('span');
      p.className = 'fv-hero3dlogo__particle';
      var angle = Math.random() * Math.PI * 2;
      var dist = 60 + Math.random() * 70;
      p.style.setProperty('--fv-px', (Math.cos(angle) * dist).toFixed(0) + 'px');
      p.style.setProperty('--fv-py', (Math.sin(angle) * dist - 40).toFixed(0) + 'px');
      p.style.left = (30 + Math.random() * 40) + '%';
      p.style.top = (30 + Math.random() * 40) + '%';
      p.style.animationDuration = (2.6 + Math.random() * 3) + 's';
      p.style.animationDelay = (Math.random() * 3) + 's';
      wrap.appendChild(p);
    }

    hero.appendChild(wrap);

    if (!reduceMotion) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        wrap.style.transform = 'translate(' + (px * -18).toFixed(1) + 'px,' + (py * -14).toFixed(1) + 'px)';
      });
    }
  }

  function buildDreamscape() {
    var el = document.createElement('div');
    el.className = 'fv-dreamscape';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="fv-dreamscape__glow"></div>' +
      '<div class="fv-dreamscape__moon"></div>' +
      '<div class="fv-dreamscape__hill"></div>';
    for (var i = 0; i < 18; i++) {
      var p = document.createElement('span');
      p.className = 'fv-dreamscape__particle';
      p.style.left = (Math.random() * 100) + '%';
      p.style.bottom = (Math.random() * 20) + '%';
      p.style.animationDuration = (4 + Math.random() * 5) + 's';
      p.style.animationDelay = (Math.random() * 5) + 's';
      el.appendChild(p);
    }
    return el;
  }

  function initDreamscape() {
    var heroSection = document.querySelector('body > .hero, section.hero, section[class*="-hero"], section[id*="-hero"], section.fv-hero3d');
    var firstSection = document.querySelector('section');
    var target = firstSection || heroSection;
    if (!target || document.querySelector('.fv-dreamscape')) return;
    var dream = buildDreamscape();
    target.insertAdjacentElement('afterend', dream);

    if (!reduceMotion) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var r = dream.getBoundingClientRect();
          var vh = window.innerHeight || 800;
          var progress = 1 - Math.min(Math.max((r.top) / vh, -1), 1); // -1..2 roughly
          dream.style.setProperty('--fv-sy1', (progress * -18).toFixed(1) + 'px');
          dream.style.setProperty('--fv-sy2', (progress * 14).toFixed(1) + 'px');
          ticking = false;
        });
      }, { passive: true });
    }
  }

  function initLoginNav() {
    var actions = document.querySelector('.header-actions');
    if (actions && !actions.querySelector('.fv-login-btn')) {
      var a = document.createElement('a');
      a.href = 'login.html';
      a.className = 'icon-btn fv-login-btn';
      a.setAttribute('aria-label', 'Login or Sign up');
      a.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 20c1.4-3.8 4.6-6 8-6s6.6 2.2 8 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      var menuToggle = document.getElementById('menu-toggle');
      if (menuToggle) actions.insertBefore(a, menuToggle);
      else actions.appendChild(a);
    }
    var mobileNav = document.querySelector('#mobile-nav nav');
    if (mobileNav && !mobileNav.querySelector('.fv-login-mobile')) {
      var m = document.createElement('a');
      m.href = 'login.html';
      m.className = 'fv-login-mobile';
      m.textContent = 'Login / Sign Up';
      mobileNav.appendChild(m);
    }
  }

  ready(function () {
    initLoginNav();
    initHeroLogo();
    initDreamscape();
    initCards();
    initButtons();

    var mo = new MutationObserver(function () {
      initCards();
      initButtons();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  });
})();
