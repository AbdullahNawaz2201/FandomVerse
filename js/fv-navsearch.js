

(function () {
  const CONFIGS = {
    anime:   { grid: '.fv-anime-char-grid',  card: '.fv-anime-char-card',
               title: 'h3', desc: '.fv-anime-char-card__desc',
               tagSel: '.fv-anime-char-card__series', tagLabel: 'Series' },

    gaming:  { grid: '.fv-gaming-grid',      card: '.fv-gaming-card',
               title: '.fv-gaming-card__title', desc: '.fv-gaming-card__desc',
               tagSel: '.fv-gaming-card__genre', tagLabel: 'Genre' },

    movies:  { grid: '#fv-movies-grid',      card: '.fv-movies-card',
               title: '.fv-movies-card__title', desc: '.fv-movies-card__desc',
               tagSel: '.fv-movies-card__genre', tagLabel: 'Genre', splitTags: true,
               ratingSel: '.fv-movies-card__score' },

    tvshows: { grid: '#fv-tvshows-grid',     card: '.fv-movies-card',
               title: '.fv-movies-card__title', desc: '.fv-movies-card__desc',
               tagSel: '.fv-movies-card__genre', tagLabel: 'Genre', splitTags: true,
               ratingSel: '.fv-movies-card__score' },

    kpop:    { grid: '.fv-kpop-artist-grid', card: '.fv-kpop-artist-card',
               title: '.fv-kpop-artist-card__name', desc: '.fv-kpop-artist-card__desc',
               tagSel: '.fv-kpop-artist-card__tags span', tagLabel: 'Genre', multiTagNodes: true },

    comics:  { grid: '.fv-comics-grid',      card: '.fv-comics-card',
               title: '.fv-comics-card__title', desc: '.fv-comics-card__desc',
               tagSel: '.fv-comics-card__genre', tagLabel: 'Genre', splitTags: true },

    manga:   { grid: '.fv-manga-grid',       card: '.fv-manga-card',
               title: '.fv-manga-card__title', desc: '.fv-manga-card__desc',
               tagSel: '.fv-manga-card__genre', tagLabel: 'Genre', splitTags: true },

    shop:    { grid: '.anime-grid--store',   card: '.anime-card',
               title: '.anime-card__title', desc: '.anime-card__desc',
               tagSel: '.anime-card__tags .tag', tagLabel: 'Category', multiTagNodes: true,
               priceSel: '.anime-card__price', ratingSel: '.anime-card__rating' },
  };

  function text(el, sel) {
    if (!sel) return '';
    const t = el.querySelector(sel);
    return t ? t.textContent.trim() : '';
  }

  function firstNumber(str) {
    const m = (str || '').match(/[\d.]+/);
    return m ? parseFloat(m[0]) : NaN;
  }

  function buildTags(card, cfg) {
    if (!cfg.tagSel) return [];
    if (cfg.multiTagNodes) {
      return Array.from(card.querySelectorAll(cfg.tagSel))
        .map(n => n.textContent.trim())
        .filter(Boolean);
    }
    const raw = text(card, cfg.tagSel);
    if (!raw) return [];
    if (cfg.splitTags) {
      return raw.split(/·|,|\u00b7/).map(s => s.trim()).filter(Boolean);
    }
    return [raw];
  }

  const NAV_EMOJI = {
    'anime.html': '🍥', 'gaming.html': '🎮', 'movies.html': '🎬',
    'tvshows.html': '📺', 'kpop.html': '🎤', 'comics.html': '💥',
    'manga.html': '📖', 'shop.html': '🛍️',
  };
  function setupSearchValidation(box, input) {
    let onChange = () => {};
    if (!input) return { setOnChange: (fn) => { onChange = fn; } };

    const MAX_LEN = 60;
    input.setAttribute('maxlength', String(MAX_LEN));

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'sf-search-clear';
    clearBtn.id = 'sf-search-clear';
    clearBtn.setAttribute('aria-label', 'Clear search');
    clearBtn.innerHTML = '×';
    input.insertAdjacentElement('afterend', clearBtn);

    const hint = document.createElement('div');
    hint.className = 'sf-search-hint';
    hint.id = 'sf-search-hint';
    hint.setAttribute('aria-live', 'polite');
    box.appendChild(hint);

    function sanitize(v) {
      return v.replace(/[<>{}$`]/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, '');
    }

    let debounceTimer;
    function handleInput() {
      const clean = sanitize(input.value);
      if (clean !== input.value) input.value = clean;

      const trimmed = input.value.trim();
      clearBtn.classList.toggle('is-visible', input.value.length > 0);
      box.classList.toggle('has-value', input.value.length > 0);

      hint.textContent = '';
      hint.classList.remove('is-error');
      box.classList.remove('sf-shake');

      if (trimmed.length === 1) {
        hint.textContent = 'Type at least 2 characters…';
      } else if (trimmed.length > 0 && !/[a-z0-9]/i.test(trimmed)) {
        hint.textContent = 'Try letters or numbers for better results';
        hint.classList.add('is-error');
        void box.offsetWidth;
        box.classList.add('sf-shake');
      } else if (trimmed.length >= MAX_LEN) {
        hint.textContent = 'Keep it under ' + MAX_LEN + ' characters';
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => onChange(trimmed), 180);
    }

    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && input.value) { e.stopPropagation(); clearBtn.click(); }
    });
    clearBtn.addEventListener('click', () => {
      input.value = '';
      hint.textContent = '';
      hint.classList.remove('is-error');
      clearBtn.classList.remove('is-visible');
      box.classList.remove('has-value');
      input.focus({ preventScroll: true });
      onChange('');
    });

    return { setOnChange: (fn) => { onChange = fn; } };
  }

  function initEngine() {
    const page = (document.body.dataset.page || '').toLowerCase();
    const box = document.getElementById('search-box');
    const input = document.getElementById('search-input');
    const toggle = document.getElementById('search-filter-toggle');
    const panel = document.getElementById('sf-panel');
    const sortWrap = document.getElementById('sf-sort');
    const sortRow = document.getElementById('sf-sort-row');
    const chipsWrap = document.getElementById('sf-chips');
    const clearBtn = document.getElementById('sf-clear');
    const countEl = document.getElementById('sf-count');
    if (!box || !toggle || !panel) return;

    const searchValidation = setupSearchValidation(box, input);

    /* ---- panel open/close ---- */
    function closePanel() {
      panel.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function openPanel() {
      panel.classList.add('is-open');
      toggle.classList.add('is-active');
      toggle.setAttribute('aria-expanded', 'true');
    }
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.contains('is-open') ? closePanel() : openPanel();
      if (!panel.classList.contains('is-open')) return;
      box.classList.add('is-open');
      if (input) input.focus({ preventScroll: true });
    });
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        closePanel();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
    });

    const cfg = CONFIGS[page];
    const grid = cfg ? document.querySelector(cfg.grid) : null;

    if (!cfg || !grid) {
      if (sortRow) sortRow.style.display = 'none';
      const navLinks = Array.from(document.querySelectorAll('#main-nav a'))
        .filter(a => a.getAttribute('href') !== 'index.html' && !/contact|about/i.test(a.getAttribute('href') || ''));
      navLinks.forEach(link => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        const emoji = NAV_EMOJI[href];
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'sf-chip sf-chip--nav';
        chip.textContent = (emoji ? emoji + ' ' : '') + link.textContent.trim();
        chip.addEventListener('click', () => { window.location.href = link.getAttribute('href'); });
        chipsWrap.appendChild(chip);
      });
      if (countEl) countEl.textContent = 'Browse a fandom';
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }
    const cards = Array.from(grid.querySelectorAll(cfg.card));
    const originalOrder = cards.slice();
    const meta = cards.map(card => {
      const title = text(card, cfg.title) || card.textContent.trim().slice(0, 40);
      const desc = text(card, cfg.desc);
      const tags = buildTags(card, cfg);
      const price = cfg.priceSel ? firstNumber(text(card, cfg.priceSel)) : NaN;
      const rating = cfg.ratingSel ? firstNumber(text(card, cfg.ratingSel)) : NaN;
      return { card, title, desc, tags, price, rating };
    });

    const sortOptions = [{ id: 'default', label: 'Featured' },
      { id: 'az', label: 'Name A–Z' }, { id: 'za', label: 'Name Z–A' }];
    if (meta.some(m => !isNaN(m.rating))) sortOptions.push({ id: 'rating', label: 'Top rated' });
    if (meta.some(m => !isNaN(m.price))) {
      sortOptions.push({ id: 'price-low', label: 'Price: Low to High' });
      sortOptions.push({ id: 'price-high', label: 'Price: High to Low' });
    }
    let activeSort = 'default';
    sortOptions.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sf-sort__btn' + (i === 0 ? ' is-active' : '');
      btn.textContent = opt.label;
      btn.dataset.sort = opt.id;
      btn.addEventListener('click', () => {
        activeSort = opt.id;
        sortWrap.querySelectorAll('.sf-sort__btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        applyAll();
      });
      sortWrap.appendChild(btn);
    });

    const uniqueTags = Array.from(new Set(meta.flatMap(m => m.tags))).sort();
    const activeTags = new Set();
    uniqueTags.slice(0, 24).forEach(tagName => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'sf-chip';
      chip.textContent = tagName;
      chip.addEventListener('click', () => {
        if (activeTags.has(tagName)) { activeTags.delete(tagName); chip.classList.remove('is-active'); }
        else { activeTags.add(tagName); chip.classList.add('is-active'); }
        toggle.classList.toggle('has-active', activeTags.size > 0);
        applyAll();
      });
      chipsWrap.appendChild(chip);
    });
    if (!uniqueTags.length) {
      const row = chipsWrap.closest('.sf-panel__row');
      if (row) row.style.display = 'none';
    }

    function applyAll() {
      const q = (input && input.value ? input.value : '').trim().toLowerCase();

      let visible = meta.filter(m => {
        const matchesQuery = !q || m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q)
          || m.tags.some(t => t.toLowerCase().includes(q));
        const matchesTags = activeTags.size === 0 || m.tags.some(t => activeTags.has(t));
        return matchesQuery && matchesTags;
      });

      if (activeSort === 'az') visible.sort((a, b) => a.title.localeCompare(b.title));
      else if (activeSort === 'za') visible.sort((a, b) => b.title.localeCompare(a.title));
      else if (activeSort === 'rating') visible.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (activeSort === 'price-low') visible.sort((a, b) => (a.price || 0) - (b.price || 0));
      else if (activeSort === 'price-high') visible.sort((a, b) => (b.price || 0) - (a.price || 0));
      else visible = originalOrder.map(c => meta.find(m => m.card === c)).filter(m => visible.includes(m));

      cards.forEach(c => { c.style.display = 'none'; });
      let existingEmpty = grid.querySelector('.sf-no-results');
      if (existingEmpty) existingEmpty.remove();

      visible.forEach(m => {
        m.card.style.display = '';
        grid.appendChild(m.card);
        m.card.classList.remove('sf-revealed');
        void m.card.offsetWidth;
        m.card.classList.add('sf-revealed');
      });

      if (!visible.length) {
        const empty = document.createElement('div');
        empty.className = 'sf-no-results';
        empty.innerHTML = '<strong>No matches found</strong>Try a different search term or clear your filters.';
        grid.appendChild(empty);
      }

      if (countEl) countEl.textContent = visible.length + (visible.length === 1 ? ' result' : ' results');
    }

    searchValidation.setOnChange(applyAll);
    if (clearBtn) clearBtn.addEventListener('click', () => {
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      activeTags.clear();
      chipsWrap.querySelectorAll('.sf-chip').forEach(c => c.classList.remove('is-active'));
      toggle.classList.remove('has-active');
      activeSort = 'default';
      sortWrap.querySelectorAll('.sf-sort__btn').forEach((b, i) => b.classList.toggle('is-active', i === 0));
      applyAll();
    });

    applyAll();
  }

  document.addEventListener('DOMContentLoaded', initEngine);
})();
