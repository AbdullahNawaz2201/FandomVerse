/* =========================================================
   FANDOMVERSE — COMICS PAGE SCRIPT
   Prefix: fv-comics-
   No frameworks. Scoped to elements on comics.html that carry
   the fv-comics- prefix. Wires the trailer cards to the video
   modal (YouTube iframe + Watch-on-YouTube fallback), plus
   smooth scroll and Escape-key / focus handling for the modal.
   ========================================================= */

(function () {
  'use strict';

  function fvComicsOpenModal(videoId, title) {
    var modal = document.getElementById('fv-comics-modal');
    var media = document.getElementById('fv-comics-modal-media');
    var titleEl = document.getElementById('fv-comics-modal-title');
    var ytLink = document.getElementById('fv-comics-modal-fallback');
    if (!modal || !media || !titleEl || !ytLink) { return; }

    titleEl.textContent = title || '';

    media.innerHTML = '';
    if (videoId) {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1&rel=0';
      iframe.title = title || 'Trailer';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      media.appendChild(iframe);
      ytLink.href = 'https://youtu.be/' + encodeURIComponent(videoId);
      ytLink.hidden = false;
    } else {
      var placeholder = document.createElement('div');
      placeholder.className = 'fv-comics-modal__placeholder';
      placeholder.textContent = 'Trailer coming soon.';
      media.appendChild(placeholder);
      ytLink.hidden = true;
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    var closeBtn = document.getElementById('fv-comics-modal-close');
    if (closeBtn) { closeBtn.focus(); }
  }

  function fvComicsCloseModal() {
    var modal = document.getElementById('fv-comics-modal');
    var media = document.getElementById('fv-comics-modal-media');
    if (!modal || !media) { return; }
    media.innerHTML = '';
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function fvComicsInitModal() {
    var modal = document.getElementById('fv-comics-modal');
    var backdrop = document.getElementById('fv-comics-modal-backdrop');
    var closeBtn = document.getElementById('fv-comics-modal-close');
    if (!modal) { return; }

    if (closeBtn) { closeBtn.addEventListener('click', fvComicsCloseModal); }
    if (backdrop) { backdrop.addEventListener('click', fvComicsCloseModal); }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) {
        fvComicsCloseModal();
      }
    });

    modal.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || modal.hidden) { return; }
      var focusable = modal.querySelectorAll(
        'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) { return; }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function fvComicsInitTrailerButtons() {
    var buttons = document.querySelectorAll('.fv-comics-trailer-card__play');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var videoId = btn.getAttribute('data-fv-comics-video') || '';
        var title = btn.getAttribute('data-fv-comics-title') || '';
        fvComicsOpenModal(videoId, title);
      });
    });
  }

  function fvComicsInitSmoothScroll() {
    var links = document.querySelectorAll('[data-fv-comics-scroll]');
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var targetSel = link.getAttribute('data-fv-comics-scroll');
        var target = targetSel ? document.querySelector(targetSel) : null;
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fvComicsInitModal();
    fvComicsInitTrailerButtons();
    fvComicsInitSmoothScroll();
  });
})();
