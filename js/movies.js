
const fvMoviesTrailerData = [
  {
    title: "Avengers: Doomsday",
    videoId: "irVNGjRFZGk",
    youtubeUrl: "https://www.youtube.com/watch?v=irVNGjRFZGk",
    thumbnail: "https://img.youtube.com/vi/irVNGjRFZGk/maxresdefault.jpg",
    category: "Marvel Entertainment",
    trailerType: "Official Trailer",
    description: "Heroes from three universes collide to face Doctor Doom in Marvel Studios' next ensemble epic."
  },
  {
    title: "The Mandalorian and Grogu",
    videoId: "_pa1KLXuW0Y",
    youtubeUrl: "https://www.youtube.com/watch?v=_pa1KLXuW0Y",
    thumbnail: "https://img.youtube.com/vi/_pa1KLXuW0Y/maxresdefault.jpg",
    category: "Star Wars",
    trailerType: "Official Trailer",
    description: "Din Djarin and his apprentice Grogu embark on a new Star Wars adventure on the big screen."
  },
  {
    title: "Zootopia 2",
    videoId: "Ej9rHY0Bhd8",
    youtubeUrl: "https://www.youtube.com/watch?v=Ej9rHY0Bhd8",
    thumbnail: "https://img.youtube.com/vi/Ej9rHY0Bhd8/maxresdefault.jpg",
    category: "Walt Disney Animation Studios",
    trailerType: "Official Teaser",
    description: "Detectives Judy Hopps and Nick Wilde chase their biggest mystery yet in Walt Disney Animation's sequel."
  }
];

function fvMoviesPosterFallback(title, mood) {
  const el = document.createElement('div');
  el.className = 'fv-movies-fallback';
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', title + ' poster placeholder');
  el.textContent = title;
  return el;
}

function fvMoviesCharFallback(name) {
  const el = document.createElement('div');
  el.className = 'fv-movies-fallback';
  const initials = name.split(' ').map(function (w) { return w[0]; }).join('');
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', name + ' portrait placeholder');
  el.textContent = initials;
  return el;
}
function fvMoviesRenderTrailers() {
  const grid = document.getElementById('fv-movies-trailer-grid');
  if (!grid) return;

  grid.innerHTML = fvMoviesTrailerData.map(function (t, i) {
    return (
      '<article class="fv-movies-trailer-card">' +
        '<div class="fv-movies-trailer-card__thumb">' +
          '<img src="' + t.thumbnail + '" alt="' + t.title + ' thumbnail" loading="lazy" ' +
            'onerror="this.src=\'https://img.youtube.com/vi/' + t.videoId + '/hqdefault.jpg\'">' +
          '<button type="button" class="fv-movies-trailer-card__play" data-fv-trailer-index="' + i + '" ' +
            'aria-label="Play trailer for ' + t.title + '">' +
            '<span aria-hidden="true">' +
              '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#0a0a12"/></svg>' +
            '</span>' +
          '</button>' +
        '</div>' +
        '<div class="fv-movies-trailer-card__body">' +
          '<span class="fv-movies-trailer-card__type">' + t.trailerType + ' &middot; ' + t.category + '</span>' +
          '<h3 class="fv-movies-trailer-card__title">' + t.title + '</h3>' +
          '<p class="fv-movies-trailer-card__desc">' + t.description + '</p>' +
        '</div>' +
      '</article>'
    );
  }).join('');
}

const fvMoviesModal = {
  el: null,
  frame: null,
  titleEl: null,
  fallbackEl: null,
  lastFocused: null,

  init: function () {
    this.el = document.getElementById('fv-movies-modal');
    if (!this.el) return;
    this.frame = document.getElementById('fv-movies-modal-frame');
    this.titleEl = document.getElementById('fv-movies-modal-title');
    this.fallbackEl = document.getElementById('fv-movies-modal-fallback');

    this.el.querySelectorAll('[data-fv-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { fvMoviesModal.close(); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !fvMoviesModal.el.hidden) fvMoviesModal.close();
    });

    const grid = document.getElementById('fv-movies-trailer-grid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-fv-trailer-index]');
        if (!btn) return;
        const trailer = fvMoviesTrailerData[parseInt(btn.getAttribute('data-fv-trailer-index'), 10)];
        if (trailer) fvMoviesModal.open(trailer);
      });
    }
  },

  open: function (trailer) {
    this.lastFocused = document.activeElement;
    this.titleEl.textContent = trailer.title + ' — ' + trailer.trailerType;

    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + trailer.videoId + '?autoplay=1&rel=0';
    iframe.title = trailer.title + ' trailer';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    this.frame.innerHTML = '';
    this.frame.appendChild(iframe);

    this.fallbackEl.href = trailer.youtubeUrl;
    this.fallbackEl.hidden = false;

    this.el.hidden = false;
    document.body.style.overflow = 'hidden';
    this.el.querySelector('.fv-movies-modal__close').focus();
  },

  close: function () {
    if (!this.el) return;
    this.el.hidden = true;
    this.frame.innerHTML = '';
    document.body.style.overflow = '';
    if (this.lastFocused) this.lastFocused.focus();
  }
};

function fvMoviesInitSmoothScroll() {
  document.querySelectorAll('[data-fv-scroll]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href');
      const target = targetId && document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function fvMoviesInitCardButtons() {
  document.querySelectorAll('[data-fv-movie]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const title = btn.getAttribute('data-fv-movie');
      window.location.href = 'movies.html#' + encodeURIComponent(title.replace(/\s+/g, '-').toLowerCase());
    });
  });

  document.querySelectorAll('[data-fv-char]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const name = btn.getAttribute('data-fv-char');
      window.location.href = 'characters.html#' + encodeURIComponent(name.replace(/\s+/g, '-').toLowerCase());
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  fvMoviesRenderTrailers();
  fvMoviesModal.init();
  fvMoviesInitSmoothScroll();
  fvMoviesInitCardButtons();
});