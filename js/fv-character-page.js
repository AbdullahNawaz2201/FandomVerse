
(function () {
  "use strict";

  var STORAGE_KEY = "fvProfileSession";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function bookmarkKey(name) { return "fv-profile-bookmark:" + name; }

  function loadSession() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.profiles) || !data.profiles.length) return null;
      return data;
    } catch (err) { return null; }
  }

  function showEmptyState() {
    var hero = document.getElementById("fv-profile-hero");
    var relatedHead = document.querySelector("#fv-profile-related .fv-profile-section-head");
    var grid = document.getElementById("fv-profile-related-grid");
    var empty = document.getElementById("fv-profile-empty");
    if (hero) hero.hidden = true;
    if (relatedHead) relatedHead.hidden = true;
    if (grid) grid.hidden = true;
    if (empty) empty.hidden = false;
  }

  function init() {
    var session = loadSession();
    if (!session) { showEmptyState(); return; }

    var profiles = session.profiles;
    var currentIndex = Math.min(Math.max(session.index || 0, 0), profiles.length - 1);

    var els = {
      heroBg: document.getElementById("fv-profile-hero-bg"),
      backLabel: document.getElementById("fv-profile-back-label"),
      back: document.getElementById("fv-profile-back"),
      img: document.getElementById("fv-profile-img"),
      category: document.getElementById("fv-profile-category"),
      name: document.getElementById("fv-profile-name"),
      series: document.getElementById("fv-profile-series"),
      bio: document.getElementById("fv-profile-bio"),
      traits: document.getElementById("fv-profile-traits"),
      saveBtn: document.getElementById("fv-profile-save"),
      saveIcon: document.getElementById("fv-profile-save-icon"),
      explore: document.getElementById("fv-profile-explore"),
      relatedSub: document.getElementById("fv-profile-related-sub"),
      relatedGrid: document.getElementById("fv-profile-related-grid")
    };

    var pageHref = (session.pageKey || "") + ".html";

    function render(index) {
      currentIndex = index;
      var p = profiles[index];

      document.title = "FandomVerse — " + (p.name || "Profile");

      document.querySelector(".fv-profile-main").style.setProperty("--fvp-accent", p.accent || "#b06bff");
      document.querySelector(".fv-profile-main").style.setProperty("--fvp-glow", p.glow || "rgba(176,107,255,.4)");

      if (els.heroBg) els.heroBg.style.backgroundImage = p.img ? "url('" + p.img + "')" : "none";
      if (els.img) { els.img.src = p.img || ""; els.img.alt = p.name || ""; }
      if (els.category) els.category.textContent = p.category || session.pageLabel || "Fandom";
      if (els.name) els.name.textContent = p.name || "Unknown";
      if (els.series) els.series.textContent = p.series || "";
      if (els.series) els.series.hidden = !p.series;
      if (els.bio) els.bio.textContent = p.bio || "Profile details coming soon.";
      if (els.traits) {
        els.traits.innerHTML = (p.traits || []).map(function (t) {
          return "<span>" + esc(t) + "</span>";
        }).join("");
      }
      if (els.backLabel) els.backLabel.textContent = session.pageLabel || "FandomVerse";
      if (els.back) els.back.setAttribute("href", pageHref || "index.html");
      if (els.explore) {
        els.explore.setAttribute("href", pageHref || "index.html");
        els.explore.innerHTML = "Explore " + esc(session.pageLabel || "this Fandom") + ' <span aria-hidden="true">\u2192</span>';
      }
      if (els.relatedSub) els.relatedSub.textContent = "More " + (session.pageLabel || "") + " profiles to discover.";

      var saved = false;
      try { saved = localStorage.getItem(bookmarkKey(p.name)) === "1"; } catch (e) {}
      updateSaveButton(saved);
      if (els.saveBtn) {
        els.saveBtn.onclick = function () {
          var nowSaved = !els.saveBtn.classList.contains("is-saved");
          try { localStorage.setItem(bookmarkKey(p.name), nowSaved ? "1" : "0"); } catch (e) {}
          updateSaveButton(nowSaved);
        };
      }

      renderRelated(index);
      window.scrollTo({ top: 0, behavior: "smooth" });

      session.index = index;
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch (e) {}
    }

    function updateSaveButton(saved) {
      if (!els.saveBtn) return;
      els.saveBtn.classList.toggle("is-saved", saved);
      if (els.saveIcon) els.saveIcon.innerHTML = saved ? "&#9829;" : "&#9825;";
      els.saveBtn.lastChild.textContent = saved ? " Saved" : " Save Profile";
    }

    function renderRelated(activeIndex) {
      if (!els.relatedGrid) return;
      var others = profiles
        .map(function (p, i) { return { p: p, i: i }; })
        .filter(function (entry) { return entry.i !== activeIndex; });

      if (!others.length) {
        els.relatedGrid.innerHTML = "";
        document.getElementById("fv-profile-related").hidden = true;
        return;
      }

      els.relatedGrid.innerHTML = others.map(function (entry) {
        var p = entry.p;
        return (
          '<article class="fv-profile-mini-card" data-index="' + entry.i + '" style="--mfvp-accent:' + esc(p.accent || "#b06bff") + '">' +
            '<div class="fv-profile-mini-card__media"><img class="fv-profile-mini-card__img" src="' + esc(p.img || "") + '" alt="' + esc(p.name || "") + '" loading="lazy"></div>' +
            '<div class="fv-profile-mini-card__body">' +
              "<h3>" + esc(p.name || "Unknown") + "</h3>" +
              "<p>" + esc(p.series || session.pageLabel || "") + "</p>" +
              '<button type="button" class="fv-profile-mini-card__cta">View Profile</button>' +
            "</div>" +
          "</article>"
        );
      }).join("");

      Array.prototype.forEach.call(els.relatedGrid.querySelectorAll(".fv-profile-mini-card"), function (card) {
        card.addEventListener("click", function () {
          render(parseInt(card.getAttribute("data-index"), 10));
        });
      });
    }

    render(currentIndex);
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
