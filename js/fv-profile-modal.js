
(function () {
  "use strict";

  var PAGE_LABELS = {
    anime: "Anime", gaming: "Gaming", movies: "Movies",
    tvshows: "TV Shows", kpop: "K-Pop", comics: "Comics",
    manga: "Manga", shop: "Shop"
  };

  var CARD_SELECTOR = [
    ".fv-anime-char-card",
    ".fv-gaming-char-card",
    ".fv-movies-char-card",
    ".fv-comics-char-card",
    ".fv-manga-char-card"
  ].join(",");

  var TRIGGER_SELECTOR = [
    ".fv-anime-char-card__cta",
    ".fv-gaming-char-card__cta",
    ".fv-movies-char-card__btn",
    ".fv-comics-char-card__cta",
    ".fv-manga-char-card__cta"
  ].join(",");

  var STORAGE_KEY = "fvProfileSession";

  function readCardData(card, pageLabel) {
    var name, series, bio, traits, img, accent, glow;

    if (card.classList.contains("fv-movies-char-card")) {
      name = (card.querySelector(".fv-movies-char-card__name") || {}).textContent || "";
      series = (card.querySelector(".fv-movies-char-card__movie") || {}).textContent || "";
      bio = series ? "Featured character appearing in " + series.trim() + "." : "Profile details coming soon.";
      traits = Array.prototype.map.call(card.querySelectorAll(".fv-movies-char-card__traits li"), function (n) { return n.textContent.trim(); });
      var img1 = card.querySelector("img");
      img = img1 ? img1.src : "";
      accent = "#ff3b5c"; glow = "rgba(255,59,92,.4)";
    } else {
      name = (card.querySelector("h3") || {}).textContent || "";
      var seriesEl = card.querySelector('[class$="__series"]');
      series = seriesEl ? seriesEl.textContent : "";
      var descEl = card.querySelector('[class$="__desc"]');
      bio = descEl ? descEl.textContent : "Profile details coming soon.";
      traits = Array.prototype.map.call(card.querySelectorAll('[class$="__traits"] span'), function (n) { return n.textContent.trim(); });
      var img2 = card.querySelector("img");
      img = img2 ? img2.src : "";
      accent = card.style.getPropertyValue("--fva-accent") || card.style.getPropertyValue("--fvg-accent") ||
               card.style.getPropertyValue("--fvc-accent") || card.style.getPropertyValue("--fvm-accent") || "#b06bff";
      glow = card.style.getPropertyValue("--fva-glow") || card.style.getPropertyValue("--fvg-glow") ||
             card.style.getPropertyValue("--fvc-glow") || card.style.getPropertyValue("--fvm-glow") || "rgba(176,107,255,.4)";
    }

    return {
      name: name.trim(), series: (series || "").trim(), bio: (bio || "").trim(),
      traits: traits, img: img, accent: accent.trim(), glow: glow.trim(), category: pageLabel
    };
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest ? e.target.closest(TRIGGER_SELECTOR) : null;
    if (!trigger) return;

    var clickedCard = trigger.closest(CARD_SELECTOR);
    if (!clickedCard) return;
    e.preventDefault();

    var pageKey = document.body.getAttribute("data-page") || "";
    var pageLabel = PAGE_LABELS[pageKey] || "Fandom";

    var allCards = Array.prototype.slice.call(document.querySelectorAll(CARD_SELECTOR));
    var profiles = allCards.map(function (card) { return readCardData(card, pageLabel); });
    var index = allCards.indexOf(clickedCard);
    if (index < 0) index = 0;

    var session = { pageKey: pageKey, pageLabel: pageLabel, index: index, profiles: profiles };
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch (err) { /* storage unavailable */ }

    window.location.href = "character.html";
  });
})();
