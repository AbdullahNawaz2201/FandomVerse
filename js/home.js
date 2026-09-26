

const FV_ARTICLES = [
  {
    id: 1,
    title: "The Evolution of Modern Anime",
    category: "Anime",
    type: "Article",
    description: "Explore how anime storytelling, visual styles, and global fandom culture have evolved over the years.",
    date: "September 1, 2026",
    image: "assets/images/articles/anime.jpg",
    link: "#",
    featured: true
  },
  {
    id: 2,
    title: "How Gaming Communities Shape Modern Fandom",
    category: "Gaming",
    type: "Article",
    description: "Discover how players, creators and communities have transformed gaming into a global culture.",
    date: "September 5, 2026",
    image: "assets/images/articles/gaming.jpg",
    link: "#"
  },
  {
    id: 3,
    title: "The Art of Building a Cinematic Universe",
    category: "Movies",
    type: "Article",
    description: "Explore how interconnected stories create immersive worlds that keep audiences coming back.",
    date: "September 10, 2026",
    image: "assets/images/articles/movies.jpg",
    link: "#"
  },
  {
    id: 4,
    title: "The Global Rise of K-Pop Fandom",
    category: "K-Pop",
    type: "Article",
    description: "Discover how music, performance and online communities have helped K-Pop reach audiences worldwide.",
    date: "September 15, 2026",
    image: "assets/images/articles/kpop.jpg",
    link: "#"
  }
];

const FV_CATEGORY_ACCENTS = {
  anime:   { accent: "#ff3b5c", glow: "rgba(255, 59, 92, 0.35)" },
  gaming:  { accent: "#00ff88", glow: "rgba(0, 255, 136, 0.35)" },
  movies:  { accent: "#ffcc00", glow: "rgba(255, 204, 0, 0.35)" },
  tvshows: { accent: "#b06bff", glow: "rgba(176, 107, 255, 0.35)" },
  kpop:    { accent: "#ff3b9d", glow: "rgba(255, 59, 157, 0.35)" },
  comics:  { accent: "#00d2ff", glow: "rgba(0, 210, 255, 0.35)" },
  manga:   { accent: "#ff7a3d", glow: "rgba(255, 122, 61, 0.35)" }
};

const FV_BOOKMARK_KEY = "fandomverseBookmarks";

function fvEscapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fvPlaceholderImage(accent, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#0b0b12"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#0b0b12"/>
      <rect width="600" height="400" fill="url(#g)" opacity="0.5"/>
      <text x="50%" y="53%" text-anchor="middle" font-family="sans-serif" font-size="26"
        font-weight="700" fill="rgba(255,255,255,0.85)">${label}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function fvGetBookmarks() {
  try {
    const raw = localStorage.getItem(FV_BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("FandomVerse: could not read bookmarks", err);
    return [];
  }
}

function fvSaveBookmarks(ids) {
  try {
    localStorage.setItem(FV_BOOKMARK_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn("FandomVerse: could not save bookmarks", err);
  }
}

function fvToggleBookmark(id) {
  const ids = fvGetBookmarks();
  const idx = ids.indexOf(id);
  if (idx === -1) {
    ids.push(id);
  } else {
    ids.splice(idx, 1);
  }
  fvSaveBookmarks(ids);
  return ids.includes(id);
}

function fvArticleCardTemplate(article, bookmarks) {
  const catKey = article.category.toLowerCase().replace(/[^a-z]/g, "");
  const meta = FV_CATEGORY_ACCENTS[catKey] || FV_CATEGORY_ACCENTS.anime;
  const isFeatured = !!article.featured;
  const isSaved = bookmarks.includes(article.id);
  const placeholder = fvPlaceholderImage(meta.accent, article.category);

  return `
    <article class="fv-article-card${isFeatured ? " fv-article-card--featured" : ""}"
      style="--fv-card-accent:${meta.accent}; --fv-card-glow:${meta.glow};"
      data-id="${article.id}">

      <a href="${article.link}" class="fv-article-card__hit" aria-label="Read ${fvEscapeHtml(article.title)}"></a>

      <div class="fv-article-card__media">
        <img
          class="fv-article-card__img"
          src="${article.image}"
          alt="${fvEscapeHtml(article.title)} cover image"
          loading="lazy"
          onerror="this.onerror=null;this.src='${placeholder}';"
        >
        <div class="fv-article-card__overlay" aria-hidden="true"></div>
        <div class="fv-article-card__badges">
          <span class="fv-article-card__badge-cat">${fvEscapeHtml(article.category)}</span>
          <span class="fv-article-card__badge-type">${fvEscapeHtml(article.type || "Article")}</span>
        </div>
        <button
          type="button"
          class="fv-article-card__bookmark"
          aria-pressed="${isSaved}"
          aria-label="${isSaved ? "Remove bookmark for" : "Bookmark"} ${fvEscapeHtml(article.title)}"
          data-id="${article.id}"
        >${isSaved ? "♥" : "♡"}</button>
      </div>

      <div class="fv-article-card__body">
        <div>
          <h3 class="fv-article-card__title">${fvEscapeHtml(article.title)}</h3>
          <p class="fv-article-card__desc">${fvEscapeHtml(article.description)}</p>
        </div>
        <div class="fv-article-card__footer">
          <span class="fv-article-card__date">${fvEscapeHtml(article.date)}</span>
          <a href="${article.link}" class="fv-article-card__link" style="position:relative; z-index:2;">
            Read Article <span class="fv-article-card__arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

function fvRenderArticles() {
  const grid = document.getElementById("fv-articles-grid");
  if (!grid) return;

  if (!FV_ARTICLES.length) {
    grid.innerHTML = `<p class="fv-articles__loading">No articles yet — check back soon.</p>`;
    return;
  }

  const bookmarks = fvGetBookmarks();

  const featured = FV_ARTICLES.find(a => a.featured) || FV_ARTICLES[0];
  const rest = FV_ARTICLES.filter(a => a.id !== featured.id).slice(0, 3);
  const ordered = [featured, ...rest];

  grid.innerHTML = ordered.map(a => fvArticleCardTemplate(a, bookmarks)).join("");

  grid.querySelectorAll(".fv-article-card__bookmark").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const nowSaved = fvToggleBookmark(id);
      btn.setAttribute("aria-pressed", String(nowSaved));
      btn.textContent = nowSaved ? "♥" : "♡";
      const article = FV_ARTICLES.find(a => a.id === id);
      const label = article ? article.title : "article";
      btn.setAttribute("aria-label", `${nowSaved ? "Remove bookmark for" : "Bookmark"} ${label}`);
    });
  });
}

document.addEventListener("DOMContentLoaded", fvRenderArticles);


const FVT_CATEGORY_META = {
  Anime:    { accent: "#ff3b5c", glow: "rgba(255, 59, 92, 0.35)" },
  Gaming:   { accent: "#00ff88", glow: "rgba(0, 255, 136, 0.35)" },
  Movies:   { accent: "#ffcc00", glow: "rgba(255, 204, 0, 0.35)" },
  "TV Shows": { accent: "#b06bff", glow: "rgba(176, 107, 255, 0.35)" },
  "K-Pop":  { accent: "#ff3b9d", glow: "rgba(255, 59, 157, 0.35)" },
  Comics:   { accent: "#00d2ff", glow: "rgba(0, 210, 255, 0.35)" },
  Manga:    { accent: "#ff7a3d", glow: "rgba(255, 122, 61, 0.35)" }
};

const fvTrailerData = [
  {
    id: 1,
    title: "Grand Theft Auto VI — Trailer 1",
    category: "Gaming",
    status: "Coming Soon",
    description: "Rockstar Games returns to Vice City with Jason and Lucia in the biggest evolution of the Grand Theft Auto series yet.",
    videoUrl: "https://www.youtube.com/watch?v=eOrb93UZfPU",
    duration: "1:31",
    releaseDate: "2026-11-19",
    views: 250000000,
    featured: true
  },
  {
    id: 2,
    title: "Superman — Official Trailer",
    category: "Movies",
    status: "Featured",
    description: "James Gunn reintroduces the Man of Steel as he balances his Kryptonian heritage with a very human sense of justice.",
    videoUrl: "https://www.youtube.com/watch?v=pngEIbGpozw",
    duration: "2:32",
    releaseDate: "2025-07-11",
    views: 32000000
  },
  {
    id: 3,
    title: "The Fantastic Four: First Steps — Official Trailer",
    category: "Movies",
    status: "New",
    description: "Marvel's First Family suits up in a retro-futuristic world to defend Earth from Galactus and the Silver Surfer.",
    videoUrl: "https://www.youtube.com/watch?v=pAsmrKyMqaA",
    duration: "2:24",
    releaseDate: "2025-07-25",
    views: 18500000
  },
  {
    id: 4,
    title: "Demon Slayer: Kimetsu no Yaiba — Infinity Castle",
    category: "Anime",
    status: "Featured",
    description: "Tanjiro and the Demon Slayer Corps enter the Infinity Castle for the franchise's climactic final battle against Muzan.",
    videoUrl: "https://www.youtube.com/watch?v=wyiZWYMilgk",
    duration: "1:58",
    releaseDate: "2025-09-12",
    views: 21000000
  },
  {
    id: 5,
    title: "Stranger Things 5 — Official Trailer",
    category: "TV Shows",
    status: "Featured",
    description: "Hawkins braces for its final battle against Vecna as the Duffer Brothers close out the epic series.",
    videoUrl: "https://www.youtube.com/watch?v=PssKpzB0Ah0",
    duration: "2:41",
    releaseDate: "2025-11-26",
    views: 45000000
  },
  {
    id: 6,
    title: "BLACKPINK — 'GO' M/V",
    category: "K-Pop",
    status: "New",
    description: "BLACKPINK's explosive lead single from their EP 'Deadline,' marking their first full-group comeback in years.",
    videoUrl: "https://www.youtube.com/watch?v=2GJfWMYCWY0",
    duration: "3:15",
    releaseDate: "2026-02-27",
    views: 60000000
  },
  {
    id: 7,
    title: "Invincible Season 4 — Official Trailer",
    category: "Comics",
    status: "Featured",
    description: "Based on Robert Kirkman's acclaimed comic series, Mark Grayson faces the start of the Viltrumite War.",
    videoUrl: "https://www.youtube.com/watch?v=FLh9BRFPGw4",
    duration: "2:12",
    releaseDate: "2026-03-18",
    views: 9800000
  },
  {
    id: 8,
    title: "ONE PIECE: Season 2 — Official Trailer",
    category: "Manga",
    status: "New",
    description: "Netflix's live-action adaptation of Eiichiro Oda's manga sends the Straw Hats into the perilous Grand Line.",
    videoUrl: "https://www.youtube.com/watch?v=S-XxKVxZ2fU",
    duration: "2:05",
    releaseDate: "2026-03-10",
    views: 15200000
  }
];

const FVT_BOOKMARK_KEY = "fandomverseBookmarks";
const FVT_BOOKMARK_PREFIX = "trailer-";

let fvtActiveCategory = "all";
let fvtActiveStatus = "all";
let fvtActiveSort = "featured";

function fvtEscapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fvtGetYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
    return u.searchParams.get("v");
  } catch (err) {
    return null;
  }
}

function fvtThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function fvtFormatViews(n) {
  if (!n) return "";
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M views";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K views";
  return n + " views";
}

function fvtFormatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function fvtGetBookmarks() {
  try {
    const raw = localStorage.getItem(FVT_BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("FandomVerse: could not read bookmarks", err);
    return [];
  }
}

function fvtSaveBookmarks(ids) {
  try {
    localStorage.setItem(FVT_BOOKMARK_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn("FandomVerse: could not save bookmarks", err);
  }
}

function fvtToggleBookmark(id) {
  const key = FVT_BOOKMARK_PREFIX + id;
  const ids = fvtGetBookmarks();
  const idx = ids.indexOf(key);
  if (idx === -1) {
    ids.push(key);
  } else {
    ids.splice(idx, 1);
  }
  fvtSaveBookmarks(ids);
  return ids.includes(key);
}

function fvtIsBookmarked(id, bookmarks) {
  return bookmarks.includes(FVT_BOOKMARK_PREFIX + id);
}

function fvtGetVisibleTrailers() {
  let list = fvTrailerData.filter(t => {
    const catMatch = fvtActiveCategory === "all" || t.category === fvtActiveCategory;
    const statusMatch = fvtActiveStatus === "all" || t.status === fvtActiveStatus;
    return catMatch && statusMatch;
  });

  switch (fvtActiveSort) {
    case "newest":
      list = list.slice().sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      break;
    case "az":
      list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "views":
      list = list.slice().sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case "featured":
    default:
      list = list.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  return list;
}

/* ---------- Rendering ---------- */
function fvtCardTemplate(trailer, bookmarks) {
  const meta = FVT_CATEGORY_META[trailer.category] || FVT_CATEGORY_META.Anime;
  const videoId = fvtGetYouTubeId(trailer.videoUrl);
  const thumb = videoId ? fvtThumbnailUrl(videoId) : "";
  const isSaved = fvtIsBookmarked(trailer.id, bookmarks);
  const isFeatured = !!trailer.featured;

  return `
    <article class="fv-trailers-card${isFeatured ? " fv-trailers-card--featured" : ""}"
      style="--fvt-card-accent:${meta.accent}; --fvt-card-glow:${meta.glow};"
      data-id="${trailer.id}">

      <div class="fv-trailers-card__media">
        <button type="button" class="fv-trailers-card__hit" data-play-id="${trailer.id}"
          aria-label="Play trailer: ${fvtEscapeHtml(trailer.title)}"></button>
        <img class="fv-trailers-card__thumb" src="${thumb}" alt="${fvtEscapeHtml(trailer.title)} thumbnail" loading="lazy">
        <div class="fv-trailers-card__overlay" aria-hidden="true"></div>
        <div class="fv-trailers-card__badges">
          <span class="fv-trailers-badge-cat">${fvtEscapeHtml(trailer.category)}</span>
          <span class="fv-trailers-badge-status">${fvtEscapeHtml(trailer.status)}</span>
        </div>
        <button type="button" class="fv-trailers-bookmark" data-bookmark-id="${trailer.id}"
          aria-pressed="${isSaved}"
          aria-label="${isSaved ? "Remove bookmark for" : "Bookmark"} ${fvtEscapeHtml(trailer.title)}"
          style="z-index:3;">${isSaved ? "♥" : "♡"}</button>
        <span class="fv-trailers-play" aria-hidden="true"></span>
        <span class="fv-trailers-card__duration">${fvtEscapeHtml(trailer.duration)}</span>
      </div>

      <div class="fv-trailers-card__body">
        <h3 class="fv-trailers-card__title">${fvtEscapeHtml(trailer.title)}</h3>
        <p class="fv-trailers-card__desc">${fvtEscapeHtml(trailer.description)}</p>
        <div class="fv-trailers-card__meta">
          <span>${fvtEscapeHtml(trailer.duration)}</span>
          <span>${fvtFormatDate(trailer.releaseDate)}</span>
          ${trailer.views ? `<span>${fvtFormatViews(trailer.views)}</span>` : ""}
        </div>
      </div>
    </article>
  `;
}

function fvtRenderTrailers() {
  const grid = document.getElementById("fv-trailers-grid");
  if (!grid) return;

  const items = fvtGetVisibleTrailers();
  const bookmarks = fvtGetBookmarks();

  if (!items.length) {
    grid.innerHTML = `<p class="fv-trailers-empty">No trailers match those filters yet.</p>`;
    return;
  }

  grid.innerHTML = items.map(t => fvtCardTemplate(t, bookmarks)).join("");

  grid.querySelectorAll("[data-play-id]").forEach(btn => {
    btn.addEventListener("click", () => fvtOpenModal(Number(btn.dataset.playId)));
  });

  grid.querySelectorAll("[data-bookmark-id]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = Number(btn.dataset.bookmarkId);
      const nowSaved = fvtToggleBookmark(id);
      btn.setAttribute("aria-pressed", String(nowSaved));
      btn.textContent = nowSaved ? "♥" : "♡";
    });
  });
}

function fvtOpenModal(id) {
  const trailer = fvTrailerData.find(t => t.id === id);
  if (!trailer) return;

  const modal = document.getElementById("fv-trailers-modal");
  const player = document.getElementById("fv-trailers-modal-player");
  const titleEl = document.getElementById("fv-trailers-modal-title");
  const descEl = document.getElementById("fv-trailers-modal-desc");
  const catEl = document.getElementById("fv-trailers-modal-category");
  const ytLink = document.getElementById("fv-trailers-modal-ytlink");

  const videoId = fvtGetYouTubeId(trailer.videoUrl);

  titleEl.textContent = trailer.title;
  descEl.textContent = trailer.description;
  catEl.textContent = trailer.category;
  ytLink.href = trailer.videoUrl;

  player.innerHTML = videoId
    ? `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
         title="${fvtEscapeHtml(trailer.title)}"
         allow="autoplay; encrypted-media; picture-in-picture"
         allowfullscreen></iframe>`
    : "";

  modal.hidden = false;
  document.body.classList.add("fv-trailers-modal-open");
  document.getElementById("fv-trailers-modal-close").focus();
}

function fvtCloseModal() {
  const modal = document.getElementById("fv-trailers-modal");
  const player = document.getElementById("fv-trailers-modal-player");
  if (modal.hidden) return;

  player.innerHTML = ""; 
  modal.hidden = true;
  document.body.classList.remove("fv-trailers-modal-open");
}

function fvtInitControls() {
  document.querySelectorAll('.fv-trailers-chip[data-filter-type="category"]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('.fv-trailers-chip[data-filter-type="category"]')
        .forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      fvtActiveCategory = btn.dataset.value;
      fvtRenderTrailers();
    });
  });

  document.querySelectorAll('.fv-trailers-chip[data-filter-type="status"]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('.fv-trailers-chip[data-filter-type="status"]')
        .forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      fvtActiveStatus = btn.dataset.value;
      fvtRenderTrailers();
    });
  });

  const sortSelect = document.getElementById("fv-trailers-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      fvtActiveSort = sortSelect.value;
      fvtRenderTrailers();
    });
  }

  document.getElementById("fv-trailers-modal-close").addEventListener("click", fvtCloseModal);
  document.getElementById("fv-trailers-modal-backdrop").addEventListener("click", fvtCloseModal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") fvtCloseModal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fvtInitControls();
  fvtRenderTrailers();
});

const FVC_CATEGORY_META = {
  Anime:      { accent: "#ff3b5c", glow: "rgba(255, 59, 92, 0.35)" },
  Gaming:     { accent: "#00ff88", glow: "rgba(0, 255, 136, 0.35)" },
  Movies:     { accent: "#ffcc00", glow: "rgba(255, 204, 0, 0.35)" },
  "TV Shows": { accent: "#b06bff", glow: "rgba(176, 107, 255, 0.35)" },
  "K-Pop":    { accent: "#ff3b9d", glow: "rgba(255, 59, 157, 0.35)" },
  Comics:     { accent: "#00d2ff", glow: "rgba(0, 210, 255, 0.35)" },
  Manga:      { accent: "#ff7a3d", glow: "rgba(255, 122, 61, 0.35)" }
};

const fvCharacterData = [
  {
    id: 1,
    name: "Aiko Ren",
    category: "Anime",
    series: "Neon Horizon",
    image: "assets/images/characters/aiko-ren.jpg",
    biography: "A fearless explorer navigating the boundary between humanity and artificial intelligence, Aiko pilots a sentient mech she rebuilt from salvaged parts, searching for the sister she lost to the Neon Horizon uprising.",
    traits: ["Brave", "Curious", "Strategic"],
    featured: true
  },
  {
    id: 2,
    name: "Kai Mercer",
    category: "Gaming",
    series: "Realmfall",
    image: "assets/images/characters/kai-mercer.jpg",
    biography: "A veteran squad leader in the war-torn realms of Realmfall, Kai commands his team through impossible odds with a mix of battlefield instinct and unshakable resolve.",
    traits: ["Fearless", "Tactical", "Competitive"]
  },
  {
    id: 3,
    name: "Maya Sterling",
    category: "Movies",
    series: "Beyond Tomorrow",
    image: "assets/images/characters/maya-sterling.jpg",
    biography: "A brilliant physicist thrust into a race against time, Maya must outsmart a collapsing timeline to save the world of Beyond Tomorrow before it unravels completely.",
    traits: ["Determined", "Intelligent", "Fearless"]
  },
  {
    id: 4,
    name: "Ethan Vale",
    category: "TV Shows",
    series: "The Last Signal",
    image: "assets/images/characters/ethan-vale.jpg",
    biography: "The last communications officer aboard a dying space station, Ethan pieces together fragmented transmissions that may be humanity's only warning of what's coming.",
    traits: ["Analytical", "Calm", "Resourceful"]
  },
  {
    id: 5,
    name: "Luna Park",
    category: "K-Pop",
    series: "Neon Stage",
    image: "assets/images/characters/luna-park.jpg",
    biography: "The charismatic center of the idol group Neon Stage, Luna turns every performance into a spectacle, channeling years of quiet discipline into electric, unforgettable stage presence.",
    traits: ["Creative", "Energetic", "Charismatic"]
  },
  {
    id: 6,
    name: "Nova Knight",
    category: "Comics",
    series: "Guardians of Tomorrow",
    image: "assets/images/characters/nova-knight.jpg",
    biography: "Wielding light itself as a weapon, Nova Knight stands as the first line of defense for the Guardians of Tomorrow, sworn to protect a city that doesn't always trust her.",
    traits: ["Courageous", "Powerful", "Loyal"]
  },
  {
    id: 7,
    name: "Ren Akira",
    category: "Manga",
    series: "Moonlit Warriors",
    image: "assets/images/characters/ren-akira.jpg",
    biography: "A masterless swordsman bound by a code only he remembers, Ren wanders the moonlit provinces of a fractured empire, seeking the truth behind his clan's disappearance.",
    traits: ["Disciplined", "Mysterious", "Determined"]
  },
  {
    id: 8,
    name: "Zane Cross",
    category: "Gaming",
    series: "Digital Horizon",
    image: "assets/images/characters/zane-cross.jpg",
    biography: "A rogue data-runner in the sprawling virtual world of Digital Horizon, Zane hacks through firewalls and factions alike, always one step ahead of the system trying to erase him.",
    traits: ["Adventurous", "Clever", "Persistent"]
  }
];

const FVC_BOOKMARK_KEY = "fandomverseBookmarks";
const FVC_BOOKMARK_PREFIX = "character-";

let fvcActiveCategory = "all";
let fvcFeaturedId = fvCharacterData.find(c => c.featured)?.id || fvCharacterData[0].id;

function fvcEscapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fvcPlaceholderImg(accent, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#0c0c14"/>
        </linearGradient>
      </defs>
      <rect width="500" height="600" fill="#0c0c14"/>
      <rect width="500" height="600" fill="url(#g)" opacity="0.5"/>
      <text x="50%" y="52%" text-anchor="middle" font-family="sans-serif" font-size="28"
        font-weight="700" fill="rgba(255,255,255,0.85)">${label}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function fvcGetBookmarks() {
  try {
    const raw = localStorage.getItem(FVC_BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("FandomVerse: could not read bookmarks", err);
    return [];
  }
}

function fvcSaveBookmarks(ids) {
  try {
    localStorage.setItem(FVC_BOOKMARK_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn("FandomVerse: could not save bookmarks", err);
  }
}

function fvcToggleBookmark(id) {
  const key = FVC_BOOKMARK_PREFIX + id;
  const ids = fvcGetBookmarks();
  const idx = ids.indexOf(key);
  if (idx === -1) {
    ids.push(key);
  } else {
    ids.splice(idx, 1);
  }
  fvcSaveBookmarks(ids);
  return ids.includes(key);
}

function fvcIsBookmarked(id, bookmarks) {
  return bookmarks.includes(FVC_BOOKMARK_PREFIX + id);
}

/* ---------- Filtering ---------- */
function fvcGetFilteredCharacters() {
  if (fvcActiveCategory === "all") return fvCharacterData;
  return fvCharacterData.filter(c => c.category === fvcActiveCategory);
}

function fvcEnsureValidFeatured(list) {
  const stillValid = list.some(c => c.id === fvcFeaturedId);
  if (!stillValid) {
    const preferred = list.find(c => c.featured) || list[0];
    fvcFeaturedId = preferred ? preferred.id : null;
  }
}

/* ---------- Templates ---------- */
function fvcFeaturedTemplate(character, bookmarks) {
  const meta = FVC_CATEGORY_META[character.category] || FVC_CATEGORY_META.Anime;
  const isSaved = fvcIsBookmarked(character.id, bookmarks);
  const placeholder = fvcPlaceholderImg(meta.accent, character.name);

  return `
    <div class="fv-characters-featured" style="--fvc-card-accent:${meta.accent}; --fvc-card-glow:${meta.glow};">
      <img class="fv-characters-featured__img" id="fv-characters-featured-img"
        src="${character.image}" alt="${fvcEscapeHtml(character.name)}"
        onerror="this.onerror=null;this.src='${placeholder}';">
      <div class="fv-characters-featured__overlay" aria-hidden="true"></div>

      <button type="button" class="fv-characters-featured__bookmark" id="fv-characters-featured-bookmark"
        data-bookmark-id="${character.id}"
        aria-pressed="${isSaved}"
        aria-label="${isSaved ? "Remove bookmark for" : "Bookmark"} ${fvcEscapeHtml(character.name)}"
      >${isSaved ? "♥" : "♡"}</button>

      <div class="fv-characters-featured__content">
        <span class="fv-characters-featured__cat">${fvcEscapeHtml(character.category)}</span>
        <p class="fv-characters-featured__series">${fvcEscapeHtml(character.series)}</p>
        <h3 class="fv-characters-featured__name">${fvcEscapeHtml(character.name).toUpperCase()}</h3>
        <p class="fv-characters-featured__bio">${fvcEscapeHtml(character.biography)}</p>
        <div class="fv-characters-featured__traits">
          ${character.traits.map(t => `<span class="fv-characters-trait">${fvcEscapeHtml(t)}</span>`).join("")}
        </div>
        <button type="button" class="fv-characters-featured__cta" id="fv-characters-view-profile"
          data-profile-id="${character.id}">View Profile</button>
      </div>
    </div>
  `;
}

function fvcCardTemplate(character, bookmarks) {
  const meta = FVC_CATEGORY_META[character.category] || FVC_CATEGORY_META.Anime;
  const isSaved = fvcIsBookmarked(character.id, bookmarks);
  const placeholder = fvcPlaceholderImg(meta.accent, character.name);

  return `
    <div class="fv-characters-card" style="--fvc-card-accent:${meta.accent}; --fvc-card-glow:${meta.glow};"
      data-switch-id="${character.id}" tabindex="0" role="button"
      aria-label="Make ${fvcEscapeHtml(character.name)} the featured character">
      <div class="fv-characters-card__media">
        <img class="fv-characters-card__img" src="${character.image}" alt="${fvcEscapeHtml(character.name)}"
          loading="lazy" onerror="this.onerror=null;this.src='${placeholder}';">
      </div>
      <div class="fv-characters-card__info">
        <span class="fv-characters-card__cat">${fvcEscapeHtml(character.category)}</span>
        <h4 class="fv-characters-card__name">${fvcEscapeHtml(character.name)}</h4>
        <p class="fv-characters-card__series">${fvcEscapeHtml(character.series)}</p>
        <div class="fv-characters-card__traits">
          ${character.traits.slice(0, 2).map(t => `<span>${fvcEscapeHtml(t)}</span>`).join("")}
        </div>
      </div>
      <button type="button" class="fv-characters-card__bookmark" data-bookmark-id="${character.id}"
        aria-pressed="${isSaved}"
        aria-label="${isSaved ? "Remove bookmark for" : "Bookmark"} ${fvcEscapeHtml(character.name)}"
      >${isSaved ? "♥" : "♡"}</button>
    </div>
  `;
}

/* ---------- Rendering ---------- */
function fvcRender() {
  const layout = document.getElementById("fv-characters-layout");
  if (!layout) return;

  const list = fvcGetFilteredCharacters();

  if (!list.length) {
    layout.innerHTML = `<p class="fv-characters-empty">No characters found in this category yet.</p>`;
    return;
  }

  fvcEnsureValidFeatured(list);
  const bookmarks = fvcGetBookmarks();
  const featured = list.find(c => c.id === fvcFeaturedId) || list[0];
  const smallList = list.filter(c => c.id !== featured.id);

  layout.innerHTML = `
    ${fvcFeaturedTemplate(featured, bookmarks)}
    <div class="fv-characters-list">
      ${smallList.map(c => fvcCardTemplate(c, bookmarks)).join("")}
    </div>
  `;

  fvcWireDynamicEvents();
}

function fvcWireDynamicEvents() {
  const featuredBookmark = document.getElementById("fv-characters-featured-bookmark");
  if (featuredBookmark) {
    featuredBookmark.addEventListener("click", () => {
      const id = Number(featuredBookmark.dataset.bookmarkId);
      const nowSaved = fvcToggleBookmark(id);
      featuredBookmark.setAttribute("aria-pressed", String(nowSaved));
      featuredBookmark.textContent = nowSaved ? "♥" : "♡";
    });
  }

  // View Profile -> modal
  const viewProfileBtn = document.getElementById("fv-characters-view-profile");
  if (viewProfileBtn) {
    viewProfileBtn.addEventListener("click", () => {
      fvcOpenModal(Number(viewProfileBtn.dataset.profileId));
    });
  }

  document.querySelectorAll(".fv-characters-card[data-switch-id]").forEach(card => {
    const switchToFeatured = () => {
      fvcFeaturedId = Number(card.dataset.switchId);
      fvcRender();
    };
    card.addEventListener("click", switchToFeatured);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        switchToFeatured();
      }
    });
  });

  document.querySelectorAll(".fv-characters-card__bookmark[data-bookmark-id]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = Number(btn.dataset.bookmarkId);
      const nowSaved = fvcToggleBookmark(id);
      btn.setAttribute("aria-pressed", String(nowSaved));
      btn.textContent = nowSaved ? "♥" : "♡";
    });
  });
}

/* ---------- Modal ---------- */
function fvcOpenModal(id) {
  const character = fvCharacterData.find(c => c.id === id);
  if (!character) return;

  const meta = FVC_CATEGORY_META[character.category] || FVC_CATEGORY_META.Anime;
  const placeholder = fvcPlaceholderImg(meta.accent, character.name);
  const bookmarks = fvcGetBookmarks();
  const isSaved = fvcIsBookmarked(character.id, bookmarks);

  const modal = document.getElementById("fv-characters-modal");
  const img = document.getElementById("fv-characters-modal-img");
  const cat = document.getElementById("fv-characters-modal-category");
  const name = document.getElementById("fv-characters-modal-name");
  const series = document.getElementById("fv-characters-modal-series");
  const bio = document.getElementById("fv-characters-modal-bio");
  const traits = document.getElementById("fv-characters-modal-traits");
  const bookmarkBtn = document.getElementById("fv-characters-modal-bookmark");
  const bookmarkIcon = document.getElementById("fv-characters-modal-bookmark-icon");

  img.src = character.image;
  img.alt = character.name;
  img.onerror = () => { img.onerror = null; img.src = placeholder; };

  cat.textContent = character.category;
  name.textContent = character.name;
  series.textContent = character.series;
  bio.textContent = character.biography;
  traits.innerHTML = character.traits.map(t => `<span class="fv-characters-trait">${fvcEscapeHtml(t)}</span>`).join("");

  bookmarkIcon.textContent = isSaved ? "♥" : "♡";
  bookmarkBtn.classList.toggle("is-saved", isSaved);
  bookmarkBtn.dataset.bookmarkId = character.id;
  bookmarkBtn.onclick = () => {
    const nowSaved = fvcToggleBookmark(character.id);
    bookmarkIcon.textContent = nowSaved ? "♥" : "♡";
    bookmarkBtn.classList.toggle("is-saved", nowSaved);
    fvcRender(); 
  };

  modal.hidden = false;
  document.body.classList.add("fv-characters-modal-open");
  document.getElementById("fv-characters-modal-close").focus();
}

function fvcCloseModal() {
  const modal = document.getElementById("fv-characters-modal");
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("fv-characters-modal-open");
}

function fvcInitControls() {
  document.querySelectorAll(".fv-characters-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".fv-characters-chip").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      fvcActiveCategory = btn.dataset.category;
      fvcRender();
    });
  });

  document.getElementById("fv-characters-modal-close").addEventListener("click", fvcCloseModal);
  document.getElementById("fv-characters-modal-backdrop").addEventListener("click", fvcCloseModal);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") fvcCloseModal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fvcInitControls();
  fvcRender();
});


const FVM_CATEGORY_META = {
  Anime:      { accent: "#ff3b5c", glow: "rgba(255, 59, 92, 0.35)" },
  Gaming:     { accent: "#00ff88", glow: "rgba(0, 255, 136, 0.35)" },
  Movies:     { accent: "#ffcc00", glow: "rgba(255, 204, 0, 0.35)" },
  "TV Shows": { accent: "#b06bff", glow: "rgba(176, 107, 255, 0.35)" },
  "K-Pop":    { accent: "#ff3b9d", glow: "rgba(255, 59, 157, 0.35)" },
  Comics:     { accent: "#00d2ff", glow: "rgba(0, 210, 255, 0.35)" },
  Manga:      { accent: "#ff7a3d", glow: "rgba(255, 122, 61, 0.35)" }
};

const fvMerchData = [
  {
    id: 1,
    name: "Neon Horizon Collector Pin",
    category: "Anime",
    priceLabel: "$8 – $12",
    priceValue: 8,
    description: "A sleek collectible enamel pin inspired by the futuristic Neon Horizon universe.",
    image: "assets/images/merchandise/neon-horizon-pin.jpg",
    featured: true
  },
  {
    id: 2,
    name: "Realmfall Adventure Hoodie",
    category: "Gaming",
    priceLabel: "$35 – $50",
    priceValue: 35,
    description: "A premium fantasy-inspired hoodie featuring an original Realmfall emblem.",
    image: "assets/images/merchandise/realmfall-hoodie.jpg"
  },
  {
    id: 3,
    name: "Beyond Tomorrow Poster",
    category: "Movies",
    priceLabel: "$12 – $20",
    priceValue: 12,
    description: "A cinematic wall poster featuring an original futuristic cosmic design.",
    image: "assets/images/merchandise/beyond-tomorrow-poster.jpg"
  },
  {
    id: 4,
    name: "Last Signal Journal",
    category: "TV Shows",
    priceLabel: "$10 – $16",
    priceValue: 10,
    description: "A mysterious investigation journal inspired by The Last Signal universe.",
    image: "assets/images/merchandise/last-signal-journal.jpg"
  },
  {
    id: 5,
    name: "Neon Stage Light Stick",
    category: "K-Pop",
    priceLabel: "$25 – $40",
    priceValue: 25,
    description: "A fictional concert light stick designed for the Neon Stage fandom.",
    image: "assets/images/merchandise/neon-stage-lightstick.jpg"
  },
  {
    id: 6,
    name: "Nova Knight Emblem",
    category: "Comics",
    priceLabel: "$15 – $22",
    priceValue: 15,
    description: "A premium fictional superhero-inspired collectible emblem.",
    image: "assets/images/merchandise/nova-knight-emblem.jpg"
  },
  {
    id: 7,
    name: "Moonlit Warriors Art Book",
    category: "Manga",
    priceLabel: "$18 – $28",
    priceValue: 18,
    description: "An original concept-art collection inspired by the Moonlit Warriors universe.",
    image: "assets/images/merchandise/moonlit-warriors-artbook.jpg"
  },
  {
    id: 8,
    name: "Digital Horizon Tech Mug",
    category: "Gaming",
    priceLabel: "$14 – $20",
    priceValue: 14,
    description: "A futuristic mug featuring an original Digital Horizon circuit design.",
    image: "assets/images/merchandise/digital-horizon-mug.jpg"
  }
];

const FVM_BOOKMARK_KEY = "fandomverseBookmarks";
const FVM_BOOKMARK_PREFIX = "merch-";
const FVM_CART_KEY = "fandomverseCart";

let fvmActiveCategory = "all";
let fvmActiveSort = "featured";
let fvmToastTimer = null;

function fvmEscapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fvmPlaceholderImg(accent, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="#0c0c14"/>
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="#0c0c14"/>
      <rect width="500" height="500" fill="url(#g)" opacity="0.5"/>
      <text x="50%" y="52%" text-anchor="middle" font-family="sans-serif" font-size="24"
        font-weight="700" fill="rgba(255,255,255,0.85)">${label}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function fvmGetBookmarks() {
  try {
    const raw = localStorage.getItem(FVM_BOOKMARK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("FandomVerse: could not read bookmarks", err);
    return [];
  }
}

function fvmSaveBookmarks(ids) {
  try {
    localStorage.setItem(FVM_BOOKMARK_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn("FandomVerse: could not save bookmarks", err);
  }
}

function fvmToggleBookmark(id) {
  const key = FVM_BOOKMARK_PREFIX + id;
  const ids = fvmGetBookmarks();
  const idx = ids.indexOf(key);
  if (idx === -1) {
    ids.push(key);
  } else {
    ids.splice(idx, 1);
  }
  fvmSaveBookmarks(ids);
  return ids.includes(key);
}

function fvmIsBookmarked(id, bookmarks) {
  return bookmarks.includes(FVM_BOOKMARK_PREFIX + id);
}

function fvmGetCart() {
  try {
    const raw = localStorage.getItem(FVM_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("FandomVerse: could not read cart", err);
    return [];
  }
}

function fvmSaveCart(cart) {
  try {
    localStorage.setItem(FVM_CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn("FandomVerse: could not save cart", err);
  }
}

function fvmAddToCart(productId, qty) {
  const cart = fvmGetCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  fvmSaveCart(cart);
  fvmUpdateCartCount();
  fvmRenderCartDrawer();
}

function fvmSetCartQty(productId, qty) {
  let cart = fvmGetCart();
  if (qty <= 0) {
    cart = cart.filter(item => item.id !== productId);
  } else {
    const item = cart.find(i => i.id === productId);
    if (item) item.qty = qty;
  }
  fvmSaveCart(cart);
  fvmUpdateCartCount();
  fvmRenderCartDrawer();
}

function fvmRemoveFromCart(productId) {
  const cart = fvmGetCart().filter(item => item.id !== productId);
  fvmSaveCart(cart);
  fvmUpdateCartCount();
  fvmRenderCartDrawer();
}

function fvmCartTotalItems() {
  return fvmGetCart().reduce((sum, item) => sum + item.qty, 0);
}

function fvmCartTotalPrice() {
  const cart = fvmGetCart();
  return cart.reduce((sum, item) => {
    const product = fvMerchData.find(p => p.id === item.id);
    return sum + (product ? product.priceValue * item.qty : 0);
  }, 0);
}

function fvmUpdateCartCount() {
  const countEl = document.getElementById("fv-merch-cart-count");
  if (countEl) countEl.textContent = fvmCartTotalItems();
}

/* ---------- Toast ---------- */
function fvmShowToast(message) {
  const toast = document.getElementById("fv-merch-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(fvmToastTimer);
  fvmToastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function fvmGetVisibleProducts() {
  let list = fvMerchData.filter(p => fvmActiveCategory === "all" || p.category === fvmActiveCategory);

  switch (fvmActiveSort) {
    case "az":
      list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price-low":
      list = list.slice().sort((a, b) => a.priceValue - b.priceValue);
      break;
    case "price-high":
      list = list.slice().sort((a, b) => b.priceValue - a.priceValue);
      break;
    case "featured":
    default:
      list = list.slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  return list;
}

function fvmCardTemplate(product, bookmarks) {
  const meta = FVM_CATEGORY_META[product.category] || FVM_CATEGORY_META.Anime;
  const isSaved = fvmIsBookmarked(product.id, bookmarks);
  const placeholder = fvmPlaceholderImg(meta.accent, product.name);

  return `
    <article class="fv-merch-card" style="--fvm-card-accent:${meta.accent}; --fvm-card-glow:${meta.glow};" data-id="${product.id}">
      <div class="fv-merch-card__media">
        <img class="fv-merch-card__img" src="${product.image}" alt="${fvmEscapeHtml(product.name)}"
          loading="lazy" onerror="this.onerror=null;this.src='${placeholder}';">
        <span class="fv-merch-card__badge">${fvmEscapeHtml(product.category)}</span>
        <button type="button" class="fv-merch-bookmark" data-bookmark-id="${product.id}"
          aria-pressed="${isSaved}"
          aria-label="${isSaved ? "Remove from wishlist:" : "Add to wishlist:"} ${fvmEscapeHtml(product.name)}"
        >${isSaved ? "♥" : "♡"}</button>
        <button type="button" class="fv-merch-quickview" data-quickview-id="${product.id}">Quick View</button>
      </div>
      <div class="fv-merch-card__body">
        <h3 class="fv-merch-card__name">${fvmEscapeHtml(product.name)}</h3>
        <p class="fv-merch-card__desc">${fvmEscapeHtml(product.description)}</p>
        <p class="fv-merch-card__price">${fvmEscapeHtml(product.priceLabel)}</p>
        <button type="button" class="fv-merch-card__add" data-add-id="${product.id}">Add to Cart</button>
      </div>
    </article>
  `;
}

function fvmRenderGrid() {
  const grid = document.getElementById("fv-merch-grid");
  if (!grid) return;

  const items = fvmGetVisibleProducts();
  const bookmarks = fvmGetBookmarks();

  if (!items.length) {
    grid.innerHTML = `<p class="fv-merch-empty">No merchandise found in this category yet.</p>`;
    return;
  }

  grid.innerHTML = items.map(p => fvmCardTemplate(p, bookmarks)).join("");

  grid.querySelectorAll("[data-add-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.addId);
      fvmAddToCart(id, 1);
      const product = fvMerchData.find(p => p.id === id);
      fvmShowToast(`Added "${product ? product.name : "item"}" to your cart!`);
    });
  });

  grid.querySelectorAll("[data-quickview-id]").forEach(btn => {
    btn.addEventListener("click", () => fvmOpenQuickView(Number(btn.dataset.quickviewId)));
  });

  grid.querySelectorAll("[data-bookmark-id]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = Number(btn.dataset.bookmarkId);
      const nowSaved = fvmToggleBookmark(id);
      btn.setAttribute("aria-pressed", String(nowSaved));
      btn.textContent = nowSaved ? "♥" : "♡";
    });
  });
}

/* ---------- Quick View Modal ---------- */
let fvmModalQty = 1;
let fvmModalProductId = null;

function fvmOpenQuickView(id) {
  const product = fvMerchData.find(p => p.id === id);
  if (!product) return;

  fvmModalProductId = id;
  fvmModalQty = 1;

  const meta = FVM_CATEGORY_META[product.category] || FVM_CATEGORY_META.Anime;
  const placeholder = fvmPlaceholderImg(meta.accent, product.name);
  const bookmarks = fvmGetBookmarks();
  const isSaved = fvmIsBookmarked(id, bookmarks);

  document.getElementById("fv-merch-modal-img").src = product.image;
  document.getElementById("fv-merch-modal-img").alt = product.name;
  document.getElementById("fv-merch-modal-img").onerror = function () {
    this.onerror = null;
    this.src = placeholder;
  };
  document.getElementById("fv-merch-modal-category").textContent = product.category;
  document.getElementById("fv-merch-modal-name").textContent = product.name;
  document.getElementById("fv-merch-modal-desc").textContent = product.description;
  document.getElementById("fv-merch-modal-price").textContent = product.priceLabel;
  document.getElementById("fv-merch-modal-qty-value").textContent = fvmModalQty;

  const bookmarkBtn = document.getElementById("fv-merch-modal-bookmark");
  bookmarkBtn.textContent = isSaved ? "♥" : "♡";
  bookmarkBtn.classList.toggle("is-saved", isSaved);

  const modal = document.getElementById("fv-merch-modal");
  modal.hidden = false;
  document.body.classList.add("fv-merch-modal-open");
  document.getElementById("fv-merch-modal-close").focus();
}

function fvmCloseQuickView() {
  const modal = document.getElementById("fv-merch-modal");
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("fv-merch-modal-open");
}

/* ---------- Cart Drawer ---------- */
function fvmCartItemTemplate(cartItem) {
  const product = fvMerchData.find(p => p.id === cartItem.id);
  if (!product) return "";
  const meta = FVM_CATEGORY_META[product.category] || FVM_CATEGORY_META.Anime;
  const placeholder = fvmPlaceholderImg(meta.accent, product.name);
  const lineTotal = (product.priceValue * cartItem.qty).toFixed(2);

  return `
    <div class="fv-merch-cart-item">
      <img class="fv-merch-cart-item__img" src="${product.image}" alt="${fvmEscapeHtml(product.name)}"
        onerror="this.onerror=null;this.src='${placeholder}';">
      <div class="fv-merch-cart-item__info">
        <p class="fv-merch-cart-item__name">${fvmEscapeHtml(product.name)}</p>
        <div class="fv-merch-cart-item__controls">
          <button type="button" class="fv-merch-cart-item__qty-btn" data-cart-dec="${product.id}" aria-label="Decrease quantity">−</button>
          <span>${cartItem.qty}</span>
          <button type="button" class="fv-merch-cart-item__qty-btn" data-cart-inc="${product.id}" aria-label="Increase quantity">+</button>
          <span class="fv-merch-cart-item__price">$${lineTotal}</span>
        </div>
        <button type="button" class="fv-merch-cart-item__remove" data-cart-remove="${product.id}">Remove</button>
      </div>
    </div>
  `;
}

function fvmRenderCartDrawer() {
  const itemsEl = document.getElementById("fv-merch-cart-items");
  const totalEl = document.getElementById("fv-merch-cart-total");
  if (!itemsEl || !totalEl) return;

  const cart = fvmGetCart();

  itemsEl.innerHTML = cart.length
    ? cart.map(fvmCartItemTemplate).join("")
    : `<p class="fv-merch-empty">Your cart is empty.</p>`;

  totalEl.textContent = `$${fvmCartTotalPrice().toFixed(2)}`;

  itemsEl.querySelectorAll("[data-cart-inc]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.cartInc);
      const item = fvmGetCart().find(i => i.id === id);
      fvmSetCartQty(id, (item ? item.qty : 0) + 1);
    });
  });

  itemsEl.querySelectorAll("[data-cart-dec]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.cartDec);
      const item = fvmGetCart().find(i => i.id === id);
      fvmSetCartQty(id, (item ? item.qty : 0) - 1);
    });
  });

  itemsEl.querySelectorAll("[data-cart-remove]").forEach(btn => {
    btn.addEventListener("click", () => fvmRemoveFromCart(Number(btn.dataset.cartRemove)));
  });
}

function fvmOpenCartDrawer() {
  fvmRenderCartDrawer();
  const drawer = document.getElementById("fv-merch-cart-drawer");
  drawer.hidden = false;
  document.body.classList.add("fv-merch-modal-open");
}

function fvmCloseCartDrawer() {
  const drawer = document.getElementById("fv-merch-cart-drawer");
  if (drawer.hidden) return;
  drawer.hidden = true;
  document.body.classList.remove("fv-merch-modal-open");
}

function fvmInitControls() {
  document.querySelectorAll(".fv-merch-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".fv-merch-chip").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      fvmActiveCategory = btn.dataset.category;
      fvmRenderGrid();
    });
  });

  const sortSelect = document.getElementById("fv-merch-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      fvmActiveSort = sortSelect.value;
      fvmRenderGrid();
    });
  }

  // Quick View modal controls
  document.getElementById("fv-merch-modal-close").addEventListener("click", fvmCloseQuickView);
  document.getElementById("fv-merch-modal-backdrop").addEventListener("click", fvmCloseQuickView);

  document.getElementById("fv-merch-modal-qty-inc").addEventListener("click", () => {
    fvmModalQty += 1;
    document.getElementById("fv-merch-modal-qty-value").textContent = fvmModalQty;
  });

  document.getElementById("fv-merch-modal-qty-dec").addEventListener("click", () => {
    fvmModalQty = Math.max(1, fvmModalQty - 1);
    document.getElementById("fv-merch-modal-qty-value").textContent = fvmModalQty;
  });

  document.getElementById("fv-merch-modal-add").addEventListener("click", () => {
    if (fvmModalProductId === null) return;
    fvmAddToCart(fvmModalProductId, fvmModalQty);
    const product = fvMerchData.find(p => p.id === fvmModalProductId);
    fvmShowToast(`Added "${product ? product.name : "item"}" to your cart!`);
    fvmCloseQuickView();
  });

  document.getElementById("fv-merch-modal-bookmark").addEventListener("click", () => {
    if (fvmModalProductId === null) return;
    const nowSaved = fvmToggleBookmark(fvmModalProductId);
    const btn = document.getElementById("fv-merch-modal-bookmark");
    btn.textContent = nowSaved ? "♥" : "♡";
    btn.classList.toggle("is-saved", nowSaved);
    fvmRenderGrid();
  });

  // Cart drawer controls
  document.getElementById("fv-merch-cart-indicator").addEventListener("click", fvmOpenCartDrawer);
  document.getElementById("fv-merch-cart-close").addEventListener("click", fvmCloseCartDrawer);
  document.getElementById("fv-merch-cart-backdrop").addEventListener("click", fvmCloseCartDrawer);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      fvmCloseQuickView();
      fvmCloseCartDrawer();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fvmInitControls();
  fvmRenderGrid();
  fvmUpdateCartCount();
});
