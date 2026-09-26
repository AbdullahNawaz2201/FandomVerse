

(function () {
  'use strict';

  
  var fvMangaVideoData = [
    {
      id: 'fv-manga-video-1',
      title: 'Chainsaw Man — Manga "Big Hit" Trailer',
      description: 'VIZ Media\u2019s official trailer marking Chainsaw Man\u2019s breakout manga success, voiced by the anime\u2019s cast.',
      videoId: '_FZ35bttTkU', 
      thumbnail: 'assets/images/manga/trailers/chainsaw-man-big-hit-trailer.jpg'
    },
    {
      id: 'fv-manga-video-2',
      title: 'Chainsaw Man — Volume 12 Trailer',
      description: 'A special trailer marking the release of Chainsaw Man Part 2, Volume 12, from publisher VIZ Media.',
      videoId: 'C6Vc_G4kNq4', 
      thumbnail: 'assets/images/manga/trailers/chainsaw-man-volume-12-trailer.jpg'
    },
    {
      id: 'fv-manga-video-3',
      title: 'Jujutsu Kaisen — Culling Game Arc Announcement',
      description: 'The official teaser announcing the anime adaptation of Jujutsu Kaisen\u2019s Culling Game arc.',
      videoId: 'ACFg5XX9XQw' 
    }
  ];

  function fvMangaThumbnailFor(video) {
    if (video.thumbnail) {
      return video.thumbnail;
    }
    if (video.videoId) {
      return 'https://img.youtube.com/vi/' + video.videoId + '/hqdefault.jpg';
    }
    return 'assets/images/manga/video-placeholder.jpg';
  }

  var fvMangaPrefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fvMangaInitSmoothScroll() {
    var links = document.querySelectorAll('[data-fv-manga-scroll]');
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var targetSelector = link.getAttribute('data-fv-manga-scroll');
        var target = targetSelector ? document.querySelector(targetSelector) : null;
        if (!target) { return; }
        event.preventDefault();
        target.scrollIntoView({
          behavior: fvMangaPrefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });
  }

  function fvMangaInitScrollReveal() {
    var revealEls = document.querySelectorAll('.fv-manga-reveal');
    if (!revealEls.length) { return; }

    if (fvMangaPrefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      revealEls.forEach(function (el) { el.classList.add('fv-manga-in-view'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('fv-manga-in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  }
  function fvMangaBuildVideoCard(video) {
    var card = document.createElement('article');
    card.className = 'fv-manga-video-card fv-manga-video-card--tilt';

    var thumbWrap = document.createElement('div');
    thumbWrap.className = 'fv-manga-video-card__thumb';

    var img = document.createElement('img');
    img.src = fvMangaThumbnailFor(video);
    img.alt = video.title + ' thumbnail';
    img.loading = 'lazy';
    img.onerror = function () { img.style.display = 'none'; };
    thumbWrap.appendChild(img);

    var shine = document.createElement('span');
    shine.className = 'fv-manga-video-card__shine';
    shine.setAttribute('aria-hidden', 'true');
    thumbWrap.appendChild(shine);

    var edge = document.createElement('span');
    edge.className = 'fv-manga-video-card__edge';
    edge.setAttribute('aria-hidden', 'true');
    thumbWrap.appendChild(edge);

    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'fv-manga-video-card__play';
    playBtn.setAttribute('aria-label', 'Play ' + video.title);
    playBtn.innerHTML =
      '<span class="fv-manga-video-card__play-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 6 L18 12 L9 18 Z" fill="currentColor"/></svg>' +
      '</span>';
    playBtn.addEventListener('click', function () { fvMangaOpenModal(video); });
    thumbWrap.appendChild(playBtn);

    var body = document.createElement('div');
    body.className = 'fv-manga-video-card__body';

    var title = document.createElement('h3');
    title.className = 'fv-manga-video-card__title';
    title.textContent = video.title;

    var desc = document.createElement('p');
    desc.className = 'fv-manga-video-card__desc';
    desc.textContent = video.description;

    var watchBtn = document.createElement('button');
    watchBtn.type = 'button';
    watchBtn.className = 'fv-manga-video-card__watch';
    watchBtn.textContent = 'Watch Video';
    watchBtn.addEventListener('click', function () { fvMangaOpenModal(video); });

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(watchBtn);

    card.appendChild(thumbWrap);
    card.appendChild(body);

    return card;
  }

  function fvMangaRenderVideoGrid() {
    var grid = document.getElementById('fv-manga-video-grid');
    if (!grid) { return; }
    fvMangaVideoData.forEach(function (video) {
      grid.appendChild(fvMangaBuildVideoCard(video));
    });
  }

  var fvMangaLastFocusedEl = null;

  function fvMangaOpenModal(video) {
    var modal = document.getElementById('fv-manga-modal');
    var frame = document.getElementById('fv-manga-modal-frame');
    var titleEl = document.getElementById('fv-manga-modal-title');
    var ytLink = document.getElementById('fv-manga-modal-yt');
    if (!modal || !frame || !titleEl || !ytLink) { return; }

    fvMangaLastFocusedEl = document.activeElement;

    titleEl.textContent = video.title;
    frame.innerHTML = '';

    if (video.videoId) {
      var iframe = document.createElement('iframe');
      iframe.src = 'https://youtu.be/j9sSzNmB5po?si=7AI7qlrcOSWk5UIg' + video.videoId + '?autoplay=1&rel=0';
      iframe.title = video.title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);

      ytLink.href = 'https://www.youtube.com/watch?v=' + video.videoId;
      ytLink.removeAttribute('aria-disabled');
      ytLink.style.display = '';
    } else {
      var placeholder = document.createElement('p');
      placeholder.className = 'fv-manga-modal__placeholder';
      placeholder.textContent = 'Video preview coming soon. Check back for the official trailer.';
      frame.appendChild(placeholder);

      ytLink.removeAttribute('href');
      ytLink.setAttribute('aria-disabled', 'true');
      ytLink.style.display = 'none';
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    var closeBtn = document.getElementById('fv-manga-modal-close');
    if (closeBtn) { closeBtn.focus(); }
  }

  function fvMangaCloseModal() {
    var modal = document.getElementById('fv-manga-modal');
    var frame = document.getElementById('fv-manga-modal-frame');
    if (!modal || !frame) { return; }

    modal.hidden = true;
    frame.innerHTML = ''; 
    document.body.style.overflow = '';

    if (fvMangaLastFocusedEl && typeof fvMangaLastFocusedEl.focus === 'function') {
      fvMangaLastFocusedEl.focus();
    }
  }

  function fvMangaInitModal() {
    var modal = document.getElementById('fv-manga-modal');
    var backdrop = document.getElementById('fv-manga-modal-backdrop');
    var closeBtn = document.getElementById('fv-manga-modal-close');
    if (!modal) { return; }

    if (closeBtn) { closeBtn.addEventListener('click', fvMangaCloseModal); }
    if (backdrop) { backdrop.addEventListener('click', fvMangaCloseModal); }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) {
        fvMangaCloseModal();
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
  function fvMangaInitTiltEffect() {
    if (fvMangaPrefersReducedMotion) { return; }
    var isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer) { return; }

    var cards = document.querySelectorAll('.fv-manga-video-card--tilt');
    cards.forEach(function (card) {
      var maxTilt = 10;

      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width;
        var py = (event.clientY - rect.top) / rect.height;
        var rotateY = (px - 0.5) * (maxTilt * 2);
        var rotateX = (0.5 - py) * (maxTilt * 2);

        card.style.transform =
          'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' +
          rotateY.toFixed(2) + 'deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)';

        var shine = card.querySelector('.fv-manga-video-card__shine');
        if (shine) {
          shine.style.background =
            'radial-gradient(circle at ' + (px * 100).toFixed(0) + '% ' +
            (py * 100).toFixed(0) + '%, rgba(255,255,255,0.35), transparent 55%)';
          shine.style.opacity = '1';
        }
      });

      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
        var shine = card.querySelector('.fv-manga-video-card__shine');
        if (shine) { shine.style.opacity = '0'; }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fvMangaInitSmoothScroll();
    fvMangaInitScrollReveal();
    fvMangaRenderVideoGrid();
    fvMangaInitModal();
    fvMangaInitTiltEffect();
  });
})();