
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  function tagHeroBackgrounds() {
    var selectors = [
      ".fv-anime-hero__bg",
      ".fv-gaming-hero__bg",
      ".fv-movies-hero__img",
      ".fv-hero3d__bg",
      ".fv-hero3d__tile",
      "#hero-canvas",
      "#hero-video"
    ];
    var nodes = document.querySelectorAll(selectors.join(","));
    nodes.forEach(function (el) {
      el.setAttribute("data-fv3d", "1");
      var scope = el.closest("section, .hero, #fv-movies-hero");
      if (scope) scope.setAttribute("data-fv3d-scope", "1");
    });
    return nodes;
  }

  function initParallax(nodes) {
    if (reduceMotion || isCoarsePointer || !nodes.length) return;

    
    var scopes = [];
    nodes.forEach(function (el) {
      var scope = el.closest("section, .hero, #fv-movies-hero") || el.parentElement;
      if (scope && scopes.indexOf(scope) === -1) scopes.push(scope);
    });
    if (!scopes.length) return;

    scopes.forEach(function (s) {
      s.style.transformStyle = "preserve-3d";
      s.style.willChange = "transform";
      s.style.transition = "transform 0.35s ease-out";
    });

    var rafId = null;
    var mouseX = 0.5, mouseY = 0.5;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
      if (!rafId) rafId = requestAnimationFrame(applyTilt);
    });

    function applyTilt() {
      rafId = null;
      scopes.forEach(function (scope) {
        var rect = scope.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return; 
        var rotateY = (mouseX - 0.5) * 6;   
        var rotateX = (0.5 - mouseY) * 4;   
        scope.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
      });
    }
  }

  function initReveal() {
    var reveals = document.querySelectorAll(
      ".fv-anime-hero__inner, .fv-gaming-hero__inner, .fv-movies-hero__inner, .fv-hero3d__inner, .hero-content, .fv-fx-reveal"
    );
    reveals.forEach(function (el) {
      el.classList.add("fv-fx-reveal");
      requestAnimationFrame(function () {
        setTimeout(function () { el.classList.add("is-in"); }, 60);
      });
    });
  }

  function enrichPagefxMark(overlay) {
    var mark = overlay.querySelector(".fv-pagefx__mark");
    if (!mark || mark.querySelector(".fv-pagefx__ring")) return;

    var halo = document.createElement("span");
    halo.className = "fv-pagefx__halo";
    mark.insertBefore(halo, mark.firstChild);

    var ring1 = document.createElement("span");
    ring1.className = "fv-pagefx__ring";
    mark.insertBefore(ring1, mark.firstChild.nextSibling);

    var ring2 = document.createElement("span");
    ring2.className = "fv-pagefx__ring fv-pagefx__ring--2";
    mark.insertBefore(ring2, ring1.nextSibling);

    for (var i = 0; i < 10; i++) {
      var p = document.createElement("span");
      p.className = "fv-pagefx__particle";
      var angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.3;
      var dist = 55 + Math.random() * 35;
      p.style.setProperty("--fv-px", (Math.cos(angle) * dist).toFixed(0) + "px");
      p.style.setProperty("--fv-py", (Math.sin(angle) * dist).toFixed(0) + "px");
      p.style.setProperty("--fv-pd", (Math.random() * 2.2).toFixed(2) + "s");
      mark.appendChild(p);
    }
  }

  function initPageTransition() {
    var overlay = document.getElementById("fv-pagefx");
    if (!overlay) return;

    if (reduceMotion) {
      overlay.style.display = "none";
      return;
    }

    enrichPagefxMark(overlay);

    requestAnimationFrame(function () {
      setTimeout(function () {
        overlay.classList.add("is-opening");
        setTimeout(function () { overlay.classList.add("is-open"); }, 800);
      }, 40);
    });

    window.addEventListener("pageshow", function (e) {
      if (e.persisted) {
        overlay.classList.remove("is-closing");
        overlay.classList.add("is-open", "is-opening");
      }
    });

    var navigating = false;

    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (!link) return;

      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (link.target && link.target !== "" && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var url;
      try { url = new URL(href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return; // same-page anchor

      if (navigating) { e.preventDefault(); return; }
      navigating = true;
      e.preventDefault();

      overlay.classList.remove("is-open");
      overlay.classList.remove("is-opening");
      overlay.classList.add("is-closing");

      setTimeout(function () {
        window.location.href = url.href;
      }, 620);
    });
  }

  function initScrollbar() {
    if (document.getElementById("fv-scrollbar")) return;
    var bar = document.createElement("div");
    bar.id = "fv-scrollbar";
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = (doc.scrollHeight || 0) - (doc.clientHeight || window.innerHeight);
      var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var heroNodes = tagHeroBackgrounds();
    initParallax(heroNodes);
    initReveal();
    initPageTransition();
    initScrollbar();
  });
})();
