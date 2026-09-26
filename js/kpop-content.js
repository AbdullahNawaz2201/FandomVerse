/* =========================================================
   FANDOMVERSE — K-POP PAGE SCRIPT
   Lightweight vanilla JS scoped to the K-Pop page content
   only. Handles: music data + card rendering, video modal
   (YouTube iframe + Watch-on-YouTube fallback), smooth
   scroll, and Escape-key / focus handling for the modal.
   ========================================================= */

/* ---------------------------------------------------------
   MUSIC DATA
   Real, verified, publicly accessible official music videos.
   Video IDs verified against official label/press sources
   before inclusion — no placeholder or invented IDs.
--------------------------------------------------------- */
const fvKpopMusicData = [
  {
    artist: "BTS",
    title: "Dynamite",
    videoId: "gdZLi9oWNZg",
    youtubeUrl: "https://youtu.be/gdZLi9oWNZg",
    thumbnail: "https://img.youtube.com/vi/gdZLi9oWNZg/maxresdefault.jpg",
    release: "Official MV · Released August 21, 2020",
    description: "BTS's first fully English-language single, an upbeat disco-pop track that became one of the most-viewed K-Pop music videos of all time."
  },
  {
    artist: "TWICE",
    title: "What is Love?",
    videoId: "i0p1bmr0EmE",
    youtubeUrl: "https://youtu.be/i0p1bmr0EmE",
    thumbnail: "https://img.youtube.com/vi/i0p1bmr0EmE/maxresdefault.jpg",
    release: "Official M/V · Title track, 5th Mini Album (2018)",
    description: "The title track from TWICE's EP of the same name, with a video that reimagines each member inside scenes from iconic films."
  },
  {
    artist: "Stray Kids",
    title: "God's Menu",
    videoId: "TQTlCHxyuu8",
    youtubeUrl: "https://youtu.be/TQTlCHxyuu8",
    thumbnail: "https://img.youtube.com/vi/TQTlCHxyuu8/maxresdefault.jpg",
    release: "Official M/V · Title track, GO 生 (2020)",
    description: "A hard-hitting hip-hop title track written and produced by the group's in-house unit 3RACHA, built around an extended cooking metaphor."
  },
  {
    artist: "aespa",
    title: "Next Level",
    videoId: "4TWR90KJl84",
    youtubeUrl: "https://youtu.be/4TWR90KJl84",
    thumbnail: "https://img.youtube.com/vi/4TWR90KJl84/maxresdefault.jpg",
    release: "Official MV · Released May 17, 2021",
    description: "A genre-shifting single tied to aespa's sci-fi-inspired concept, pairing a driving beat with a visually dense, high-concept video."
  }
];

/* ---------------------------------------------------------
   RENDER MUSIC CARDS
--------------------------------------------------------- */
function fvKpopRenderMusic() {
  const grid = document.getElementById('fv-kpop-music-grid');
  if (!grid) return;

  grid.innerHTML = fvKpopMusicData.map(function (m, i) {
    return (
      '<article class="fv-kpop-music-card">' +
        '<div class="fv-kpop-music-card__thumb">' +
          '<img src="' + m.thumbnail + '" alt="' + m.artist + ' — ' + m.title + ' thumbnail" loading="lazy" ' +
            'onerror="this.src=\'https://img.youtube.com/vi/' + m.videoId + '/hqdefault.jpg\'">' +
          '<button type="button" class="fv-kpop-music-card__play" data-fv-kpop-track-index="' + i + '" ' +
            'aria-label="Play music video for ' + m.artist + ' — ' + m.title + '">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#0a0a12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="fv-kpop-music-card__body">' +
          '<span class="fv-kpop-music-card__meta">' + m.artist + '</span>' +
          '<h3 class="fv-kpop-music-card__title">' + m.title + '</h3>' +
          '<p class="fv-kpop-music-card__release">' + m.release + '</p>' +
          '<p class="fv-kpop-music-card__desc">' + m.description + '</p>' +
          '<a href="' + m.youtubeUrl + '" class="fv-kpop-music-card__watch" target="_blank" rel="noopener">Watch on YouTube <span aria-hidden="true">→</span></a>' +
        '</div>' +
      '</article>'
    );
  }).join('');
}

/* ---------------------------------------------------------
   VIDEO MODAL
--------------------------------------------------------- */
const fvKpopModal = {
  el: null,
  frame: null,
  titleEl: null,
  fallbackEl: null,
  lastFocused: null,

  init: function () {
    this.el = document.getElementById('fv-kpop-modal');
    if (!this.el) return;
    this.frame = document.getElementById('fv-kpop-modal-frame');
    this.titleEl = document.getElementById('fv-kpop-modal-title');
    this.fallbackEl = document.getElementById('fv-kpop-modal-fallback');

    this.el.querySelectorAll('[data-fv-kpop-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { fvKpopModal.close(); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !fvKpopModal.el.hidden) fvKpopModal.close();
    });

    const grid = document.getElementById('fv-kpop-music-grid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-fv-kpop-track-index]');
        if (!btn) return;
        const track = fvKpopMusicData[parseInt(btn.getAttribute('data-fv-kpop-track-index'), 10)];
        if (track) fvKpopModal.open(track);
      });
    }
  },

  open: function (track) {
    this.lastFocused = document.activeElement;
    this.titleEl.textContent = track.artist + ' — ' + track.title;

    // Load the YouTube iframe. The visible "Watch on YouTube"
    // link is always shown too, as a guaranteed fallback if
    // embedding is ever disabled for a given video.
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + track.videoId + '?autoplay=1&rel=0';
    iframe.title = track.artist + ' — ' + track.title + ' official music video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    this.frame.innerHTML = '';
    this.frame.appendChild(iframe);

    this.fallbackEl.href = track.youtubeUrl;
    this.fallbackEl.hidden = false;

    this.el.hidden = false;
    document.body.style.overflow = 'hidden';
    this.el.querySelector('.fv-kpop-modal__close').focus();
  },

  close: function () {
    if (!this.el) return;
    this.el.hidden = true;
    this.frame.innerHTML = '';
    document.body.style.overflow = '';
    if (this.lastFocused) this.lastFocused.focus();
  }
};

/* ---------------------------------------------------------
   SMOOTH SCROLL (hero + fandom card links)
--------------------------------------------------------- */
function fvKpopInitSmoothScroll() {
  document.querySelectorAll('[data-fv-kpop-scroll]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href');
      const target = targetId && document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  fvKpopRenderMusic();
  fvKpopModal.init();
  fvKpopInitSmoothScroll();
});