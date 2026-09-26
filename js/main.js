

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const colors = ['#ff3b5c', '#39ff88', '#b06bff', '#ffcc33'];
  let particles = [];
  let width, height;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const glow = { x: 0.7, y: 0.3, targetX: 0.7, targetY: 0.3 };
  window.addEventListener('mousemove', e => {
    glow.targetX = e.clientX / window.innerWidth;
    glow.targetY = e.clientY / window.innerHeight;
  });

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    const count = Math.floor((width * height) / 22000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.5 + 1,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.2
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    if (!prefersReducedMotion) {
      glow.x += (glow.targetX - glow.x) * 0.04;
      glow.y += (glow.targetY - glow.y) * 0.04;
    }

    const grad = ctx.createRadialGradient(
      width * glow.x, height * glow.y, 0,
      width * glow.x, height * glow.y, width * 0.65
    );
    grad.addColorStop(0, 'rgba(176,107,255,0.14)');
    grad.addColorStop(1, 'rgba(14,14,22,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      if (!prefersReducedMotion) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;
      }
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}

function initMagneticButton() {
  const btn = document.querySelector('.btn-primary');
  if (!btn) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35 - 3}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
}

function initNavPill() {
  const nav = document.getElementById('main-nav');
  const pill = document.getElementById('nav-pill');
  const mobileLinks = document.querySelectorAll('.mobile-nav a');
  if (!nav || !pill) return;
  const links = nav.querySelectorAll('a');

  function moveTo(el) {
    pill.style.left = el.offsetLeft + 'px';
    pill.style.width = el.offsetWidth + 'px';
  }

  function setActiveFromPath() {
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    let matched = null;

    links.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const isMatch = href === path || (path === 'index.html' && href === 'index.html');
      link.classList.toggle('is-active', isMatch);
      if (isMatch) matched = link;
    });

    mobileLinks.forEach(link => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      link.classList.toggle('is-active', href === path);
    });

    nav.classList.toggle('has-active', !!matched);
    if (matched) moveTo(matched);
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveTo(link));
  });

  nav.addEventListener('mouseleave', () => {
    const active = nav.querySelector('a.is-active');
    if (active) moveTo(active);
  });

  window.addEventListener('resize', () => {
    const active = nav.querySelector('a.is-active');
    if (active) moveTo(active);
  });

  setActiveFromPath();
}

function initHeaderSpotlight() {
  const header = document.getElementById('site-header');
  if (!header) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  header.addEventListener('mousemove', e => {
    const rect = header.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    header.style.setProperty('--spot-x', x + '%');
  });
}

function initScrollHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }, { passive: true });
}

function initSearchToggle() {
  const box = document.getElementById('search-box');
  const toggle = document.getElementById('search-toggle');
  const input = document.getElementById('search-input');
  if (!box || !toggle || !input) return;

  toggle.addEventListener('click', () => {
    const isOpen = box.classList.toggle('is-open');
    if (isOpen) input.focus();
  });

  document.addEventListener('click', e => {
    if (!box.contains(e.target)) box.classList.remove('is-open');
  });
}

function initMenuToggle() {
  const btn = document.getElementById('menu-toggle');
  const overlay = document.getElementById('mobile-nav');
  if (!btn || !overlay) return;

  btn.addEventListener('click', () => {
    const isOpen = overlay.classList.toggle('is-open');
    btn.classList.toggle('is-active', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      overlay.classList.remove('is-open');
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
}

function initStoreAddToCart() {
  const cartCountEl = document.getElementById('cart-count');
  if (!cartCountEl) return;
  let count = parseInt(cartCountEl.textContent, 10) || 0;

  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      count += 1;
      cartCountEl.textContent = count;
      btn.classList.add('is-added');
      const original = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('is-added');
      }, 1200);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // initHeroCanvas();
  initMenuToggle();
  initMagneticButton();
  initNavPill();
  initScrollHeader();
  initSearchToggle();
  initHeaderSpotlight();
  initStoreAddToCart();

  const page = (document.body.dataset.page || '').toLowerCase();
  if (page === 'home') initTrendingCards();
  if (page === 'anime') initAnimeCards();
  if (page === 'gaming') initGameCards();
  if (page === 'movies') initMovieCards();
});


const MOVIES = [
  {
    id: 'superman', title: 'Superman', year: 2025, studio: 'DC', genre: 'Superhero',
    director: 'James Gunn', cast: ['David Corenswet', 'Rachel Brosnahan', 'Nicholas Hoult'],
    tagline: 'Hope flies first.',
    description: 'A fresh, hopeful take on the Man of Steel as he balances his Kryptonian heritage with a very human sense of justice in Metropolis.',
    tier: 'legendary', price: 34.99, motif: 'ring', c1: '#3b6bff', c2: '#ff3b5c'
  },
  {
    id: 'fantastic-four', title: 'The Fantastic Four: First Steps', year: 2025, studio: 'Marvel', genre: 'Superhero',
    director: 'Matt Shakman', cast: ['Pedro Pascal', 'Vanessa Kirby', 'Joseph Quinn', 'Ebon Moss-Bachrach'],
    tagline: 'Family is the first power.',
    description: "Marvel's first family finally suits up, blending retro-futurist style with a story about protecting each other against a cosmic threat.",
    tier: 'rare', price: 24.99, motif: 'diamond', c1: '#33ccff', c2: '#c7d2fe'
  },
  {
    id: 'thunderbolts', title: 'Thunderbolts*', year: 2025, studio: 'Marvel', genre: 'Anti-Hero Team',
    director: 'Jake Schreier', cast: ['Florence Pugh', 'Sebastian Stan', 'Harrison Ford'],
    tagline: 'Nobody said they were the good guys.',
    description: 'A crew of morally grey operatives gets forced onto the same team, and figuring out how to trust each other becomes the real mission.',
    tier: 'rare', price: 24.99, motif: 'bolt', c1: '#8a8fa3', c2: '#b06bff'
  },
  {
    id: 'cap-brave-new-world', title: 'Captain America: Brave New World', year: 2025, studio: 'Marvel', genre: 'Superhero',
    director: 'Julius Onah', cast: ['Anthony Mackie', 'Harrison Ford'],
    tagline: 'The shield finds a new hand.',
    description: 'The new Captain America steps fully into the role, navigating a political powder keg that threatens to spiral into global conflict.',
    tier: 'rare', price: 24.99, motif: 'circuit', c1: '#2a4d9e', c2: '#c2273b'
  },
  {
    id: 'blade', title: 'Blade', year: 2025, studio: 'Marvel', genre: 'Vampire Hunter',
    director: 'Yann Demange', cast: ['Mahershala Ali'],
    tagline: 'The night has a new hunter.',
    description: 'A moodier, horror-tinged entry as the daywalker takes on a growing vampire threat lurking beneath the modern world.',
    tier: 'legendary', price: 34.99, motif: 'fang', c1: '#1a1a1a', c2: '#c2273b'
  },
  {
    id: 'toxic-avenger', title: 'The Toxic Avenger', year: 2025, studio: 'Legendary', genre: 'Superhero Comedy',
    director: 'Macon Blair', cast: ['Peter Dinklage'],
    tagline: 'Ugly never looked so heroic.',
    description: 'A gleefully gross reboot of the cult classic, following an unlikely janitor turned monstrous vigilante cleaning up a corrupt town.',
    tier: 'standard', price: 14.99, motif: 'drip', c1: '#7CFF3B', c2: '#7a1fb0'
  },
  {
    id: 'dog-man', title: 'Dog Man', year: 2025, studio: 'DreamWorks', genre: 'Family Superhero',
    director: 'Peter Hastings', cast: ['Animated Ensemble'],
    tagline: 'Part dog. Part man. All hero.',
    description: 'A half-dog, half-cop hybrid stumbles his way through crime-fighting chaos in this goofy, kid-friendly comic-book adaptation.',
    tier: 'standard', price: 14.99, motif: 'paw', c1: '#ffcc33', c2: '#3b82f6'
  },
  {
    id: 'supergirl', title: 'Supergirl: Woman of Tomorrow', year: 2026, studio: 'DC', genre: 'Superhero',
    director: 'Craig Gillespie', cast: ['Milly Alcock', 'Matthias Schoenaerts'],
    tagline: "Krypton's fury has a new face.",
    description: "The Girl of Steel heads across the galaxy on a revenge-tinted road trip that tests how much of Krypton's rage she wants to carry.",
    tier: 'legendary', price: 34.99, motif: 'swirl', c1: '#3b82f6', c2: '#ffd23b'
  },
  {
    id: 'avengers-doomsday', title: 'Avengers: Doomsday', year: 2026, studio: 'Marvel', genre: 'Team-Up',
    director: 'Destin Daniel Cretton', cast: ['Ensemble Cast'],
    tagline: 'Every era collides.',
    description: 'A sprawling multiversal team-up that pulls together heroes old and new to face a threat none of them could handle alone.',
    tier: 'legendary', price: 34.99, motif: 'crack', c1: '#c2273b', c2: '#ffd23b'
  },
  {
    id: 'spiderman-4', title: 'Spider-Man 4', year: 2026, studio: 'Marvel', genre: 'Superhero',
    director: 'Destin Daniel Cretton', cast: ['Tom Holland', 'Zendaya'],
    tagline: 'Still swinging, still growing up.',
    description: 'Peter Parker keeps learning that great power comes with an ever-growing pile of responsibility, personal and otherwise.',
    tier: 'rare', price: 24.99, motif: 'threads', c1: '#c2273b', c2: '#1f3bb0'
  },
  {
    id: 'clayface', title: 'Clayface', year: 2026, studio: 'DC', genre: 'Horror Thriller',
    director: 'Mike Flanagan', cast: ['Tom Rhys Harries'],
    tagline: "Some shapes shouldn't shift.",
    description: "A shapeshifting Batman villain gets his own unsettling origin story, leaning hard into body-horror tragedy instead of typical spectacle.",
    tier: 'rare', price: 24.99, motif: 'drip', c1: '#8a5a2b', c2: '#3a2a1a'
  },
  {
    id: 'batman-2', title: 'The Batman: Part II', year: 2026, studio: 'DC', genre: 'Detective Noir',
    director: 'Matt Reeves', cast: ['Robert Pattinson', 'Zoë Kravitz'],
    tagline: "Gotham's shadows run deeper.",
    description: "The brooding detective returns for a rain-soaked sequel, digging into a conspiracy that reaches further into Gotham's rot than before.",
    tier: 'legendary', price: 34.99, motif: 'hood', c1: '#111827', c2: '#ffcc33'
  },
  {
    id: 'wonder-woman', title: 'Wonder Woman', year: 2027, studio: 'DC', genre: 'Superhero',
    director: 'James Gunn', cast: ['Cast TBA'],
    tagline: 'Truth cuts deeper than steel.',
    description: "A ground-up reintroduction of the Amazon princess as she steps out of Themyscira into a world that badly needs her sense of justice.",
    tier: 'legendary', price: 34.99, motif: 'ring', c1: '#c2273b', c2: '#ffd23b',
    img: 'assets/images/movies/wonder-woman.jpg'
  },
  {
    id: 'ghost-rider', title: 'Ghost Rider', year: 2027, studio: 'Marvel', genre: 'Supernatural',
    director: 'TBA', cast: ['Cast TBA'],
    tagline: 'The road to vengeance burns bright.',
    description: 'A darker, horror-leaning reboot of the flaming Spirit of Vengeance, dealing out hellfire justice to those who deserve it.',
    tier: 'rare', price: 24.99, motif: 'crack', c1: '#ff6a00', c2: '#1a1a1a'
  },
  {
    id: 'static-shock', title: 'Static Shock', year: 2027, studio: 'DC · Milestone', genre: 'Teen Superhero',
    director: 'TBA', cast: ['Cast TBA'],
    tagline: 'Charged up and ready.',
    description: 'A live-action take on the Milestone Comics favorite, following a teenager learning to control his newfound electromagnetic powers.',
    tier: 'standard', price: 14.99, motif: 'bolt', c1: '#33ccff', c2: '#ffd23b'
  }
];

const TIER_LABEL = { legendary: 'LEGENDARY', rare: 'RARE', standard: 'STANDARD' };
let flippedCard = null;
const ANIME = [
  {
    id: 'naruto', title: 'Naruto', tagline: 'ナルト', studio: 'Studio Pierrot',
    genre: 'Action, Adventure · Studio Pierrot',
    description: 'A young ninja carrying a sealed fox spirit fights for recognition in his village while chasing his dream of becoming Hokage.',
    castLabel: 'Characters:', cast: ['Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno'],
    tier: 'rare', price: 19.99, c1: '#ff7a3d', c2: '#c9331f',
    art: { type: 'image', src: 'assets/images/anime/NARUTO.jpg' }
  },
  {
    id: 'boruto', title: 'Boruto', tagline: 'ボルト', studio: 'Studio Pierrot',
    genre: 'Action, Shonen · Studio Pierrot',
    description: 'The next generation of ninja steps out of their parents’ shadow, balancing new technology with old-school shinobi training.',
    castLabel: 'Characters:', cast: ['Boruto Uzumaki', 'Sarada Uchiha', 'Mitsuki'],
    tier: 'standard', price: 9.99, c1: '#33ccff', c2: '#ff9d3b',
    art: { type: 'image', src: 'assets/images/anime/boruto.svg' }
  },
  {
    id: 'attack-on-titan', title: 'Attack on Titan', tagline: '進撃の巨人', studio: 'MAPPA / WIT Studio',
    genre: 'Dark Fantasy, Drama · MAPPA / WIT Studio',
    description: 'Humanity’s last cities hide behind massive walls, fighting for survival against man-eating Titans and the secrets buried in their own history.',
    castLabel: 'Characters:', cast: ['Eren Yeager', 'Mikasa Ackerman', 'Armin Arlert'],
    tier: 'legendary', price: 29.99, c1: '#8a8fa3', c2: '#c2273b',
    art: { type: 'image', src: 'assets/images/anime/attack-on-titan.svg' }
  },
  {
    id: 'dragon-ball-z', title: 'Dragon Ball Z', tagline: 'ドラゴンボールZ', studio: 'Toei Animation',
    genre: 'Action, Sci-Fi · Toei Animation',
    description: 'Earth’s strongest warriors train relentlessly to defend the planet from an escalating parade of galactic threats.',
    castLabel: 'Characters:', cast: ['Goku', 'Vegeta', 'Gohan'],
    tier: 'legendary', price: 24.99, c1: '#ff9d00', c2: '#1f3bb0',
    art: { type: 'image', src: 'assets/images/anime/dragon-ball-z.svg' }
  },
  {
    id: 'one-piece', title: 'One Piece', tagline: 'ワンピース', studio: 'Toei Animation',
    genre: 'Adventure, Comedy · Toei Animation',
    description: 'A rubber-bodied pirate captain sails the Grand Line with his ragtag crew, chasing the ultimate treasure and his dream of becoming Pirate King.',
    castLabel: 'Characters:', cast: ['Monkey D. Luffy', 'Roronoa Zoro', 'Nami'],
    tier: 'legendary', price: 29.99, c1: '#3b82f6', c2: '#c2273b',
    art: { type: 'image', src: 'assets/images/anime/one-piece.svg' }
  }
];


const TRENDING_META = {
  anime:   { label: 'Anime',    type: 'Series',  href: 'anime.html',   accent: '#ff3b5c', glow: 'rgba(255, 59, 92, 0.35)' },
  gaming:  { label: 'Gaming',   type: 'Game',    href: 'gaming.html',  accent: '#00ff88', glow: 'rgba(0, 255, 136, 0.35)' },
  movies:  { label: 'Movies',   type: 'Movie',   href: 'movies.html',  accent: '#ffcc00', glow: 'rgba(255, 204, 0, 0.35)' },
  tvshows: { label: 'TV Shows', type: 'Series',  href: 'tvshows.html', accent: '#b06bff', glow: 'rgba(176, 107, 255, 0.35)' },
  kpop:    { label: 'K-Pop',    type: 'Music',   href: 'kpop.html',    accent: '#ff3b9d', glow: 'rgba(255, 59, 157, 0.35)' },
  comics:  { label: 'Comics',   type: 'Issue',   href: 'comics.html',  accent: '#00d2ff', glow: 'rgba(0, 210, 255, 0.35)' },
  manga:   { label: 'Manga',    type: 'Chapter', href: 'manga.html',   accent: '#ff7a3d', glow: 'rgba(255, 122, 61, 0.35)' }
};

const TRENDING_FALLBACK = [
  { category: 'tvshows', id: 'shadow-realm', title: 'Shadow Realm', desc: 'A detective drama where every case bleeds into a parallel world only she can see.', meta: 'New season', img: 'assets/images/tvshows/shadow-realm.jpg' },
  { category: 'kpop',    id: 'nova-wave',    title: 'NOVA — "Wave"', desc: 'The comeback single everyone is streaming this week, with a full choreo breakdown.', meta: 'Comeback', img: 'assets/images/kpop/nova-wave.jpg' },
  { category: 'comics',  id: 'ironclad-1',   title: 'Ironclad #1',   desc: 'A brand-new indie hero suits up in this surprise breakout issue of the month.', meta: 'Issue #1', img: 'assets/images/comics/ironclad-1.jpg' },
  { category: 'manga',   id: 'silent-fang',  title: 'Silent Fang',   desc: 'A wandering swordsman chapter drops with a twist fans have theorized about for months.', meta: 'Ch. 142', img: 'assets/images/manga/story-cyberpunk-chase.jpg' }
];

function placeholderImg(c1, c2, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="#0c0c14"/>
      <rect width="400" height="260" fill="url(#g)" opacity="0.55"/>
      <text x="50%" y="53%" text-anchor="middle" font-family="sans-serif" font-size="20"
        font-weight="700" fill="rgba(255,255,255,0.85)">${label}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function buildTrendingItems() {
  const items = [];

  if (typeof ANIME !== 'undefined' && ANIME.length) {
    const a = ANIME[0];
    items.push({ category: 'anime', id: a.id, title: a.title, desc: a.description, meta: a.studio, img: a.art && a.art.src });
  }
  if (typeof GAMES !== 'undefined' && GAMES.length) {
    const g = GAMES[0];
    items.push({ category: 'gaming', id: g.id, title: g.title, desc: g.description, meta: g.studio, img: g.art && g.art.src });
  }
  if (typeof MOVIES !== 'undefined' && MOVIES.length) {
    const m = MOVIES.slice().sort((a, b) => (b.year || 0) - (a.year || 0))[0];
    items.push({ category: 'movies', id: m.id, title: m.title, desc: m.description, meta: m.studio, img: m.img || (m.art && m.art.src), c1: m.c1, c2: m.c2 });
  }

  TRENDING_FALLBACK.forEach(item => {
    if (items.length < 6) items.push(item);
  });

  return items.slice(0, 6);
}

function trendingCardTemplate(item) {
  const meta = TRENDING_META[item.category] || TRENDING_META.anime;
  const img = item.img || placeholderImg(item.c1 || meta.accent, item.c2 || '#0c0c14', meta.label);

  return `
    <a href="${meta.href}" class="trending-card" style="--card-accent:${meta.accent}; --card-glow:${meta.glow};" data-id="${item.id}">
      <div class="trending-card__media">
        <img class="trending-card__img" src="${img}" alt="${escapeHtml(item.title)}" loading="lazy"
          onerror="this.onerror=null;this.src='${placeholderImg(item.c1 || meta.accent, item.c2 || '#0c0c14', meta.label)}';">
        <div class="trending-card__badges">
          <span class="badge-cat">${meta.label}</span>
          <span class="badge-type">${meta.type}</span>
        </div>
        <button class="trending-card__bookmark" type="button" aria-label="Save ${escapeHtml(item.title)}">♡</button>
      </div>
      <div class="trending-card__body">
        <div>
          <h3 class="trending-card__title">${escapeHtml(item.title)}</h3>
          <p class="trending-card__desc">${escapeHtml(item.desc || '')}</p>
        </div>
        <div class="trending-card__footer">
          <span class="trending-card__meta">${escapeHtml(item.meta || '')}</span>
          <span class="trending-card__action">View <span class="arrow" aria-hidden="true">→</span></span>
        </div>
      </div>
    </a>
  `;
}

function initTrendingCards() {
  const grid = document.getElementById('trending-grid');
  if (!grid) return;

  const items = buildTrendingItems();

  if (!items.length) {
    grid.innerHTML = `<div class="trending-error">Nothing trending right now — check back soon!</div>`;
    return;
  }

  grid.innerHTML = items.map(trendingCardTemplate).join('');

  grid.querySelectorAll('.trending-card__bookmark').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle('is-saved');
      btn.textContent = btn.classList.contains('is-saved') ? '♥' : '♡';
    });
  });
}

const GAMES = [
  {
    id: 'fantasy-sports', title: 'Fantasy Sports League', tagline: 'Arena Showdown', studio: 'Arcadia Interactive',
    genre: 'Sports, Fantasy · Arcadia Interactive',
    description: 'Elemental champions battle across a floating arena, hurling blazing energy orbs in a fast-paced sport built for spectacle.',
    castLabel: 'Features:', cast: ['4v4 Arena Matches', 'Custom Champion Loadouts', 'Seasonal Tournaments'],
    tier: 'rare', price: 24.99, c1: '#ffcc33', c2: '#c2273b',
    art: { type: 'image', src: 'assets/images/gaming/fantasy-sports.jpg' }
  },
  {
    id: 'survival-horror', title: 'Survival Horror', tagline: 'The Last Lighthouse', studio: 'Pale Fog Studios',
    genre: 'Horror, Survival · Pale Fog Studios',
    description: 'A lone keeper defends a storm-battered lighthouse against a rising tide of nightmares drawn in by a crimson glow on the horizon.',
    castLabel: 'Features:', cast: ['Atmospheric Exploration', 'Resource Scavenging', 'Permadeath Mode'],
    tier: 'legendary', price: 29.99, c1: '#3ba9a0', c2: '#c2273b',
    art: { type: 'image', src: 'assets/images/gaming/survival-horror.jpg' }
  },
  {
    id: 'cozy-farming', title: 'Cozy Farming', tagline: 'Sunlit Harvest', studio: 'Meadowlight Games',
    genre: 'Simulation, Cozy · Meadowlight Games',
    description: 'A cheerful little robot tends a windmill farm at sunrise, growing crops and befriending the animals of a peaceful valley.',
    castLabel: 'Features:', cast: ['Farm Customization', 'Seasonal Crops', 'Relaxed, No-Fail Play'],
    tier: 'standard', price: 14.99, c1: '#7CFF3B', c2: '#ffcc33',
    art: { type: 'image', src: 'assets/images/gaming/cozy-farming.jpg' }
  },
  {
    id: 'western-action', title: 'Western Action', tagline: 'Ironclad Frontier', studio: 'Dustline Games',
    genre: 'Action, Western · Dustline Games',
    description: 'A masked gunslinger rides a mechanical steed across a sun-scorched frontier town built from scavenged steel and old-world grit.',
    castLabel: 'Features:', cast: ['Open-World Frontier', 'Quickdraw Combat', 'Bounty Hunting'],
    tier: 'rare', price: 24.99, c1: '#c2732b', c2: '#3a2a1a',
    art: { type: 'image', src: 'assets/images/gaming/western-action.jpg' }
  },
  {
    id: 'underwater-exploration', title: 'Underwater Exploration', tagline: 'Sunken Meridian', studio: 'Deepline Studios',
    genre: 'Adventure, Exploration · Deepline Studios',
    description: 'A submersible drifts through the glowing ruins of a drowned civilization, uncovering secrets guarded by bioluminescent life.',
    castLabel: 'Features:', cast: ['Deep-Sea Submersible', 'Ancient Ruins to Explore', 'Marine Life Encyclopedia'],
    tier: 'rare', price: 24.99, c1: '#33ccff', c2: '#7a1fb0',
    art: { type: 'image', src: 'assets/images/gaming/underwater-exploration.jpg' }
  },
  {
    id: 'space-colony', title: 'Space Colony', tagline: 'Orbital Frontier', studio: 'Nova Frontier Co.',
    genre: 'Strategy, Sci-Fi · Nova Frontier Co.',
    description: 'Build and manage a sprawling ring-shaped space station, balancing resources and diplomacy as your colony expands across the stars.',
    castLabel: 'Features:', cast: ['Base-Building', 'Resource Management', 'Fleet Command'],
    tier: 'standard', price: 19.99, c1: '#8a8fa3', c2: '#3b82f6',
    art: { type: 'image', src: 'assets/images/gaming/space-colony.jpg' }
  },
  {
    id: 'cyberpunk-action', title: 'Cyberpunk Action', tagline: 'Neon Uprising', studio: 'Circuit Break Studios',
    genre: 'Action, Cyberpunk · Circuit Break Studios',
    description: 'A blade-wielding rebel faces down an army of holographic enforcers in a rain-soaked megacity ruled by a faceless AI council.',
    castLabel: 'Features:', cast: ['Melee & Hacking Combat', 'Branching City Districts', 'Cybernetic Upgrades'],
    tier: 'legendary', price: 29.99, c1: '#b06bff', c2: '#33ccff',
    art: { type: 'image', src: 'assets/images/gaming/cyberpunk-action.jpg' }
  },
  {
    id: 'futuristic-racing', title: 'Futuristic Racing', tagline: 'Hyperlane Circuit', studio: 'Velocity Works',
    genre: 'Racing, Sci-Fi · Velocity Works',
    description: 'Anti-gravity racers scream through neon-lit skyways at breakneck speed, drafting off rivals to unleash a final overdrive boost.',
    castLabel: 'Features:', cast: ['Anti-Gravity Racing', 'Online Circuits', 'Vehicle Customization'],
    tier: 'rare', price: 19.99, c1: '#ff3b9d', c2: '#33ccff',
    art: { type: 'image', src: 'assets/images/gaming/futuristic-racing.jpg' }
  },
  {
    id: 'fantasy-adventure', title: 'Fantasy Adventure', tagline: 'Ruins of Everbloom', studio: 'Everbloom Games',
    genre: 'RPG, Adventure · Everbloom Games',
    description: 'A lone archer crosses an overgrown ancient bridge at dawn, tracking a legend buried somewhere in the ruins of a forgotten kingdom.',
    castLabel: 'Features:', cast: ['Open-World RPG', 'Skill Tree Progression', 'Ancient Ruin Dungeons'],
    tier: 'legendary', price: 29.99, c1: '#7CFF3B', c2: '#ffcc33',
    art: { type: 'image', src: 'assets/images/gaming/fantasy-adventure.jpg' }
  },
  {
    id: 'alien-frontier', title: 'Alien Frontier', tagline: 'Beyond the Rift', studio: 'Farlight Studios',
    genre: 'Sci-Fi, Exploration · Farlight Studios',
    description: 'A lone explorer treks across a crystalline alien world beneath three rising moons, scanning ruins no one has ever seen.',
    castLabel: 'Features:', cast: ['Planetary Exploration', 'Crafting & Survival', 'Alien Biome Scanning'],
    tier: 'standard', price: 14.99, c1: '#b06bff', c2: '#3b6bff',
    art: { type: 'image', src: 'assets/images/gaming/alien-frontier.jpg' }
  }
];

let animeCart = [];
let gameCart = [];
let movieCart = [];

function catalogCards(gridId, data, cart, cartIds) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = data.map((m, i) => collectorCardTemplate(m, i)).join('');

  grid.querySelectorAll('.movie-card').forEach(card => {
    initTilt(card);
    initFlip(card);
    initCardAddToCart(card, cart, cartIds);
  });

  initCartBar(grid.closest('section'), cartIds);
  initRevealOnScroll(grid);
}

function initMovieCards() {
  catalogCards('movie-grid', MOVIES, movieCart, {
    bar: 'movie-cart-bar', count: 'movie-cart-count', total: 'movie-cart-total'
  });
}

function initAnimeCards() {
  catalogCards('anime-grid', ANIME, animeCart, {
    bar: 'anime-cart-bar', count: 'anime-cart-count', total: 'anime-cart-total'
  });
}

function initGameCards() {
  catalogCards('game-grid', GAMES, gameCart, {
    bar: 'game-cart-bar', count: 'game-cart-count', total: 'game-cart-total'
  });
}

function collectorCardTemplate(m, i) {
  const sweepDelay = ((i % 6) * 0.7).toFixed(2);
  const genreLine = m.genre + (m.year ? ' · ' + m.year : '');
  const artHtml = (m.art && m.art.type === 'image')
    ? `<div class="movie-card__art" style="background-image:url('${m.art.src}');background-size:cover;background-position:center;"></div>`
    : heroArt(m);

  return `
    <div class="movie-card" data-id="${m.id}" data-price="${m.price}" data-title="${escapeHtml(m.title)}" style="--card-glow:${m.c1};--card-glow-2:${m.c2};--sweep-delay:${sweepDelay}s">
      <div class="movie-card__inner">

        <div class="movie-card__face movie-card__front">
          <div class="movie-card__art-wrap">
            ${artHtml}
            <div class="movie-card__badges">
              <span class="movie-card__tier">${TIER_LABEL[m.tier] || 'STANDARD'}</span>
              <span class="movie-card__studio">${escapeHtml(m.studio)}</span>
            </div>
          </div>
          <div class="movie-card__front-body">
            <div>
              <div class="movie-card__title">${escapeHtml(m.title)}</div>
              <div class="movie-card__tagline">${escapeHtml(m.tagline)}</div>
            </div>
            <div class="movie-card__hint">TAP TO FLIP</div>
          </div>
        </div>

        <div class="movie-card__face movie-card__back">
          <div>
            <div class="movie-card__genre">${escapeHtml(genreLine)}</div>
            <h3>${escapeHtml(m.title)}</h3>
            <p class="movie-card__desc">${escapeHtml(m.description)}</p>
            <div class="movie-card__cast"><b>${escapeHtml(m.castLabel || 'Cast:')}</b> ${escapeHtml(m.cast.join(', '))}</div>
          </div>
          <div class="movie-card__footer">
            <span class="movie-card__price">$${m.price.toFixed(2)}</span>
            <button class="movie-card__add" type="button">Add to cart</button>
          </div>
        </div>

      </div>
    </div>
  `;
}

function heroArt(m) {
  const { id, motif, c1, c2 } = m;
  const gid = `grad-${id}`;
  const glowId = `glow-${id}`;
  const grainId = `grain-${id}`;
  const vigId = `vig-${id}`;
  let shape = '';

  switch (motif) {
    case 'ring':
      shape = `<circle cx="150" cy="95" r="55" fill="none" stroke="url(#${gid})" stroke-width="10" opacity="0.9"/>
                <circle cx="150" cy="95" r="80" fill="none" stroke="url(#${gid})" stroke-width="2" opacity="0.35"/>
                <path d="M150 38 L161 95 L150 152 L139 95 Z" fill="url(#${gid})"/>`;
      break;
    case 'diamond':
      shape = `<polygon points="150,28 212,95 150,162 88,95" fill="url(#${gid})"/>
                <polygon points="150,54 186,95 150,136 114,95" fill="#05050a" opacity="0.55"/>`;
      break;
    case 'bolt':
      shape = `<path d="M172 28 L108 102 L145 102 L122 167 L197 84 L154 84 Z" fill="url(#${gid})"/>`;
      break;
    case 'circuit':
      shape = `<circle cx="150" cy="95" r="46" fill="none" stroke="url(#${gid})" stroke-width="8"/>
                <line x1="150" y1="28" x2="150" y2="60" stroke="url(#${gid})" stroke-width="6"/>
                <line x1="150" y1="130" x2="150" y2="162" stroke="url(#${gid})" stroke-width="6"/>
                <line x1="82" y1="95" x2="115" y2="95" stroke="url(#${gid})" stroke-width="6"/>
                <line x1="185" y1="95" x2="218" y2="95" stroke="url(#${gid})" stroke-width="6"/>
                <circle cx="150" cy="95" r="14" fill="url(#${gid})"/>`;
      break;
    case 'fang':
      shape = `<path d="M118 36 Q96 100 130 168 Q150 118 150 92 Q150 118 170 168 Q204 100 182 36 Q150 68 118 36Z" fill="url(#${gid})"/>`;
      break;
    case 'drip':
      shape = `<path d="M150 26 Q116 82 128 114 Q134 140 150 140 Q166 140 172 114 Q184 82 150 26Z" fill="url(#${gid})"/>
                <path d="M106 68 Q89 106 100 128 Q106 144 117 133 Q123 111 112 90Z" fill="url(#${gid})" opacity="0.65"/>
                <path d="M194 68 Q211 106 200 128 Q194 144 183 133 Q177 111 188 90Z" fill="url(#${gid})" opacity="0.65"/>`;
      break;
    case 'paw':
      shape = `<ellipse cx="150" cy="116" rx="40" ry="32" fill="url(#${gid})"/>
                <circle cx="112" cy="68" r="16" fill="url(#${gid})" opacity="0.9"/>
                <circle cx="150" cy="52" r="17" fill="url(#${gid})" opacity="0.9"/>
                <circle cx="188" cy="68" r="16" fill="url(#${gid})" opacity="0.9"/>`;
      break;
    case 'swirl':
      shape = `<path d="M150 95 m-62,0 a62,62 0 1,1 124,0 a46,46 0 1,1 -92,0 a30,30 0 1,1 60,0 a14,14 0 1,1 -28,0"
                fill="none" stroke="url(#${gid})" stroke-width="7" opacity="0.9"/>`;
      break;
    case 'crack':
      shape = `<circle cx="150" cy="95" r="68" fill="url(#${gid})" opacity="0.5"/>
                <path d="M150 26 L133 90 L166 101 L116 168 M150 26 L178 96 L144 107 L189 162"
                fill="none" stroke="#05050a" stroke-width="4" opacity="0.85"/>`;
      break;
    case 'threads':
      shape = `<line x1="234" y1="6" x2="86" y2="184" stroke="url(#${gid})" stroke-width="3" opacity="0.6"/>
                <line x1="254" y1="38" x2="118" y2="184" stroke="url(#${gid})" stroke-width="3" opacity="0.5"/>
                <line x1="212" y1="6" x2="56" y2="152" stroke="url(#${gid})" stroke-width="3" opacity="0.5"/>
                <circle cx="150" cy="95" r="32" fill="url(#${gid})"/>`;
      break;
    case 'hood':
      shape = `<path d="M150 32 C106 32 84 70 84 112 C84 144 100 166 100 166 L200 166 C200 166 216 144 216 112 C216 70 194 32 150 32 Z" fill="url(#${gid})" opacity="0.95"/>
                <path d="M120 110 C120 110 135 125 150 125 C165 125 180 110 180 110" fill="none" stroke="#05050a" stroke-width="5" opacity="0.8"/>`;
      break;
    default:
      shape = `<circle cx="150" cy="95" r="45" fill="url(#${gid})"/>`;
  }

  return `
    <svg class="movie-card__art" viewBox="0 0 300 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(m.title)} Cover Art">
      <defs>
        <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}" />
          <stop offset="100%" stop-color="${c2}" />
        </linearGradient>
        <radialGradient id="${glowId}" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stop-color="${c1}" stop-opacity="0.35"/>
          <stop offset="50%" stop-color="${c2}" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#05050a" stop-opacity="0.95"/>
        </radialGradient>
        <radialGradient id="${vigId}" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#05050a" stop-opacity="0.8"/>
        </radialGradient>
        <filter id="${grainId}">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0"/>
        </filter>
      </defs>

      <rect width="300" height="190" fill="#090a10"/>
      <rect width="300" height="190" fill="url(#${glowId})"/>
      <polygon points="150,-20 60,200 240,200" fill="url(#${gid})" opacity="0.08"/>

      <g transform="translate(0,0)">
        ${shape}
      </g>

      <rect width="300" height="190" fill="url(#${vigId})"/>
      <rect width="300" height="190" filter="url(#${grainId})" style="mix-blend-mode: overlay;"/>
    </svg>
  `;
}

function initTilt(card) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  card.addEventListener('mousemove', e => {
    if (card.classList.contains('is-flipped')) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    if (!card.classList.contains('is-flipped')) {
      card.style.transform = '';
    }
  });
}

function initFlip(card) {
  card.addEventListener('click', e => {
    if (e.target.closest('.movie-card__add')) return;

    const isAlreadyFlipped = card.classList.contains('is-flipped');

    if (flippedCard && flippedCard !== card) {
      flippedCard.classList.remove('is-flipped');
      flippedCard.style.transform = '';
    }

    if (isAlreadyFlipped) {
      card.classList.remove('is-flipped');
      card.style.transform = '';
      flippedCard = null;
    } else {
      card.classList.add('is-flipped');
      card.style.transform = 'perspective(1000px) rotateY(180deg)';
      flippedCard = card;
    }
  });
}

function initCardAddToCart(card, cart, cartIds) {
  const addBtn = card.querySelector('.movie-card__add');
  if (!addBtn) return;

  addBtn.addEventListener('click', e => {
    e.stopPropagation();
    const id = card.dataset.id;
    const price = parseFloat(card.dataset.price) || 0;
    const title = card.dataset.title;

    cart.push({ id, price, title });
    updateCartUI(cart, cartIds);

    const originalText = addBtn.textContent;
    addBtn.textContent = 'Added ✓';
    addBtn.classList.add('is-added');
    
    setTimeout(() => {
      addBtn.textContent = originalText;
      addBtn.classList.remove('is-added');
    }, 1200);
  });
}

function updateCartUI(cart, cartIds) {
  const bar = document.getElementById(cartIds.bar);
  const countEl = document.getElementById(cartIds.count);
  const totalEl = document.getElementById(cartIds.total);

  if (!bar || !countEl || !totalEl) return;

  const totalItems = cart.length;
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  countEl.textContent = totalItems;
  totalEl.textContent = `$${totalPrice.toFixed(2)}`;

  if (totalItems > 0) {
    bar.classList.add('is-visible');
  } else {
    bar.classList.remove('is-visible');
  }
}

function initCartBar(section, cartIds) {
  if (!section) return;
  const bar = section.querySelector(`#${cartIds.bar}`);
  if (!bar) return;

  const checkoutBtn = bar.querySelector('.cart-bar__checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert('Thank you for your order! Processing your fandom collectibles...');
    });
  }
}

function initRevealOnScroll(container) {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  container.querySelectorAll('.movie-card').forEach(card => {
    observer.observe(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function fvFooterSetYear() {
  const yearEl = document.getElementById('fv-footer-year');
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
}

function fvFooterIsValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function fvFooterInitNewsletter() {
  const form = document.getElementById('fv-footer-newsletter-form');
  const input = document.getElementById('fv-footer-email');
  const msg = document.getElementById('fv-footer-newsletter-msg');
  const btn = document.getElementById('fv-footer-subscribe-btn');
  if (!form || !input || !msg) return;

  form.addEventListener('submit', function fvFooterHandleSubscribe(e) {
    e.preventDefault();

    const value = input.value || '';

    if (!value.trim() || !fvFooterIsValidEmail(value)) {
      msg.textContent = 'Please enter a valid email address.';
      msg.setAttribute('data-state', 'error');
      input.setAttribute('aria-invalid', 'true');
      return;
    }

    msg.textContent = "You're on the list! Welcome to FandomVerse.";
    msg.setAttribute('data-state', 'success');
    input.removeAttribute('aria-invalid');
    input.value = '';

    if (btn) {
      const originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Subscribed ✓';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }, 2200);
    }
  });
}

function fvFooterInitBackToTop() {
  const btn = document.getElementById('fv-footer-back-top');
  if (!btn) return;

  function fvFooterScrollToTop() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  btn.addEventListener('click', fvFooterScrollToTop);
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', function fvFooterInit() {
  fvFooterSetYear();
  fvFooterInitNewsletter();
  fvFooterInitBackToTop();
});
