
function fvAnimeInitScroll() {
  document.querySelectorAll('[data-fv-anime-scroll]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var targetSel = el.getAttribute('data-fv-anime-scroll');
      var target = targetSel && document.querySelector(targetSel);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------- Trailer modal ---------- */
function fvAnimeOpenTrailerModal(card) {
  var modal = document.getElementById('fv-anime-modal');
  var title = document.getElementById('fv-anime-modal-title');
  var desc = document.getElementById('fv-anime-modal-desc');
  var media = document.getElementById('fv-anime-modal-media');
  var link = document.getElementById('fv-anime-modal-link');
  var closeBtn = document.getElementById('fv-anime-modal-close');
  var videoId = card.dataset.videoId;
  if (!modal || !title || !desc || !media || !videoId) return;

  var safeTitle = card.dataset.title || 'Trailer';
  title.textContent = safeTitle;
  desc.textContent = card.dataset.desc || '';

  var iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0';
  iframe.title = safeTitle;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  media.innerHTML = '';
  media.appendChild(iframe);

  if (link) link.href = 'https://www.youtube.com/watch?v=' + videoId;

  modal.hidden = false;
  document.body.classList.add('fv-anime-modal-open');
  if (closeBtn) closeBtn.focus();
}

function fvAnimeCloseTrailerModal() {
  var modal = document.getElementById('fv-anime-modal');
  var media = document.getElementById('fv-anime-modal-media');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  if (media) media.innerHTML = ''; 
  document.body.classList.remove('fv-anime-modal-open');
}

function fvAnimeInitTrailers() {
  document.querySelectorAll('[data-fv-anime-trailer]').forEach(function (card) {
    var trigger = card.querySelector('.fv-anime-trailer-card__play') || card;
    trigger.addEventListener('click', function () {
      fvAnimeOpenTrailerModal(card);
    });
  });

  var closeBtn = document.getElementById('fv-anime-modal-close');
  var backdrop = document.getElementById('fv-anime-modal-backdrop');
  if (closeBtn) closeBtn.addEventListener('click', fvAnimeCloseTrailerModal);
  if (backdrop) backdrop.addEventListener('click', fvAnimeCloseTrailerModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fvAnimeCloseTrailerModal();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  fvAnimeInitScroll();
  fvAnimeInitTrailers();
});