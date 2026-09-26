
function fvGamingInitScroll() {
  document.querySelectorAll('[data-fv-gaming-scroll]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var targetSel = el.getAttribute('data-fv-gaming-scroll');
      var target = targetSel && document.querySelector(targetSel);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function fvGamingOpenTrailerModal(card) {
  var modal = document.getElementById('fv-gaming-modal');
  var title = document.getElementById('fv-gaming-modal-title');
  var desc = document.getElementById('fv-gaming-modal-desc');
  var media = document.getElementById('fv-gaming-modal-media');
  var closeBtn = document.getElementById('fv-gaming-modal-close');
  if (!modal || !title || !desc) return;

  title.textContent = card.dataset.title || 'Trailer';
  desc.textContent = card.dataset.desc || '';
  if (media) {
    media.style.setProperty('--fvg-accent', card.dataset.accent || '#00ff88');
  }

  modal.hidden = false;
  document.body.classList.add('fv-gaming-modal-open');
  if (closeBtn) closeBtn.focus();
}

function fvGamingCloseTrailerModal() {
  var modal = document.getElementById('fv-gaming-modal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('fv-gaming-modal-open');
}

function fvGamingInitTrailers() {
  document.querySelectorAll('[data-fv-gaming-trailer]').forEach(function (card) {
    var trigger = card.querySelector('.fv-gaming-trailer-card__play') || card;
    trigger.addEventListener('click', function () {
      fvGamingOpenTrailerModal(card);
    });
  });

  var closeBtn = document.getElementById('fv-gaming-modal-close');
  var backdrop = document.getElementById('fv-gaming-modal-backdrop');
  if (closeBtn) closeBtn.addEventListener('click', fvGamingCloseTrailerModal);
  if (backdrop) backdrop.addEventListener('click', fvGamingCloseTrailerModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fvGamingCloseTrailerModal();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  fvGamingInitScroll();
  fvGamingInitTrailers();
});