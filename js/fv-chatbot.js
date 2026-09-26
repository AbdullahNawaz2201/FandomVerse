/* =========================================================
   FANDOMVERSE — PREMIUM 3D CHAT WIDGET LOGIC
   Heavy client-side validation + keyword concierge bot.
   ========================================================= */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    var root = document.getElementById("fvc-root");
    if (!root) return;

    var launcher = document.getElementById("fvc-launcher");
    var panel = document.getElementById("fvc-panel");
    var closeBtn = document.getElementById("fvc-close");
    var gateForm = document.getElementById("fvc-gate");
    var chatView = document.getElementById("fvc-chat");
    var messages = document.getElementById("fvc-messages");
    var quick = document.getElementById("fvc-quick");
    var msgForm = document.getElementById("fvc-form");
    var input = document.getElementById("fvc-input");
    var count = document.getElementById("fvc-count");
    var sendBtn = document.getElementById("fvc-send");
    var badge = document.getElementById("fvc-badge");

    var nameInput = document.getElementById("fvc-name");
    var emailInput = document.getElementById("fvc-email");
    var fandomInput = document.getElementById("fvc-fandom");
    var nameField = document.getElementById("fvc-name-field");
    var emailField = document.getElementById("fvc-email-field");
    var fandomField = document.getElementById("fvc-fandom-field");

    /* ---------------- custom premium dropdown (fandom picker) ---------------- */
    var fvcSelect = document.getElementById("fvc-select");
    var fvcSelectBtn = document.getElementById("fvc-fandom-btn");
    var fvcSelectLabel = document.getElementById("fvc-fandom-label");
    var fvcSelectMenu = document.getElementById("fvc-fandom-menu");
    var fvcSelectOptions = fvcSelectMenu ? Array.prototype.slice.call(fvcSelectMenu.querySelectorAll("li")) : [];

    function closeFandomMenu() {
      if (!fvcSelect) return;
      fvcSelect.classList.remove("is-open");
      fvcSelectBtn.setAttribute("aria-expanded", "false");
    }
    function openFandomMenu() {
      if (!fvcSelect) return;
      fvcSelect.classList.add("is-open");
      fvcSelectBtn.setAttribute("aria-expanded", "true");
    }

    if (fvcSelectBtn) {
      fvcSelectBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        fvcSelect.classList.contains("is-open") ? closeFandomMenu() : openFandomMenu();
      });

      fvcSelectOptions.forEach(function (li) {
        li.addEventListener("click", function () {
          fvcSelectOptions.forEach(function (o) { o.classList.remove("is-selected"); });
          li.classList.add("is-selected");
          var labelEl = li.querySelector(".fvc-opt__label");
          fvcSelectLabel.textContent = (labelEl ? labelEl.textContent : li.textContent).trim();
          fandomInput.value = li.getAttribute("data-value");
          fandomInput.dataset.touched = "1";
          fvcSelect.classList.add("has-value");
          closeFandomMenu();
          fandomInput.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });

      document.addEventListener("click", function (e) {
        if (fvcSelect && !fvcSelect.contains(e.target)) closeFandomMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeFandomMenu();
      });
    }

    var STORAGE_KEY = "fvc_profile_v1";
    var HISTORY_KEY = "fvc_history_v1";

    /* ---------------- open / close (3D flip) ---------------- */
    function openPanel() {
      root.classList.add("is-open");
      launcher.setAttribute("aria-expanded", "true");
      panel.setAttribute("aria-hidden", "false");
      badge.style.display = "none";
      var profile = loadProfile();
      if (profile) {
        showChat(profile, false);
      } else {
        nameInput.focus();
      }
    }

    function closePanel() {
      root.classList.remove("is-open");
      launcher.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
    }

    launcher.addEventListener("click", function () {
      root.classList.contains("is-open") ? closePanel() : openPanel();
    });
    closeBtn.addEventListener("click", closePanel);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) closePanel();
    });

    /* ---------------- heavy validation helpers ---------------- */
    var NAME_RE = /^[A-Za-z][A-Za-z\s.'-]{1,59}$/;
    var EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    var DISPOSABLE_DOMAINS = ["mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com", "trashmail.com"];

    function setFieldState(fieldEl, state /* 'valid' | 'invalid' | 'neutral' */) {
      fieldEl.classList.remove("is-valid", "is-invalid");
      if (state === "valid") fieldEl.classList.add("is-valid");
      if (state === "invalid") fieldEl.classList.add("is-invalid");
    }

    function validateName(showState) {
      var val = nameInput.value.trim();
      var ok = NAME_RE.test(val) && val.replace(/[^A-Za-z]/g, "").length >= 2;
      if (showState) setFieldState(nameField, val === "" ? "neutral" : ok ? "valid" : "invalid");
      return ok;
    }

    function validateEmail(showState) {
      var val = emailInput.value.trim();
      var okFormat = EMAIL_RE.test(val) && val.length <= 120;
      var domain = val.split("@")[1] ? val.split("@")[1].toLowerCase() : "";
      var disposable = DISPOSABLE_DOMAINS.indexOf(domain) !== -1;
      var ok = okFormat && !disposable;
      if (showState) {
        setFieldState(emailField, val === "" ? "neutral" : ok ? "valid" : "invalid");
        var errSpan = document.querySelector("#fvc-email-error span");
        if (disposable && errSpan) errSpan.textContent = "Please use a permanent email address (no disposable domains).";
        else if (errSpan) errSpan.textContent = "Enter a valid email address (e.g. name@domain.com).";
      }
      return ok;
    }

    function validateFandom(showState) {
      var ok = fandomInput.value !== "";
      if (showState) setFieldState(fandomField, ok ? "valid" : (fandomInput.dataset.touched ? "invalid" : "neutral"));
      return ok;
    }

    nameInput.addEventListener("input", function () { validateName(true); });
    nameInput.addEventListener("blur", function () { validateName(true); });
    emailInput.addEventListener("input", function () { validateEmail(true); });
    emailInput.addEventListener("blur", function () { validateEmail(true); });
    fandomInput.addEventListener("change", function () {
      fandomInput.dataset.touched = "1";
      validateFandom(true);
    });

    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      fandomInput.dataset.touched = "1";
      var okName = validateName(true);
      var okEmail = validateEmail(true);
      var okFandom = validateFandom(true);

      if (!okName || !okEmail || !okFandom) {
        var firstInvalid = !okName ? nameInput : !okEmail ? emailInput : fvcSelectBtn;
        firstInvalid.focus();
        return;
      }

      var profile = {
        name: capitalize(nameInput.value.trim()),
        email: emailInput.value.trim(),
        fandom: fandomInput.value
      };
      saveProfile(profile);
      showChat(profile, true);
    });

    function capitalize(str) {
      return str.replace(/\s+/g, " ").split(" ").map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(" ");
    }

    function saveProfile(p) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (err) { /* storage unavailable */ }
    }
    function loadProfile() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) { return null; }
    }

    /* ---------------- chat view ---------------- */
    function showChat(profile, isFresh) {
      gateForm.hidden = true;
      chatView.hidden = false;

      var history = loadHistory();
      if (history.length) {
        history.forEach(function (m) { renderMessage(m.role, m.text, false); });
        scrollToBottom();
      } else {
        var greetText = "Hey " + profile.name.split(" ")[0] + "! 👋 Welcome to FandomVerse. I'm your concierge — ask me about " +
          fandomLabel(profile.fandom) + ", releases, or anything else on the site.";
        pushMessage("bot", greetText);
        renderQuickReplies(quickRepliesFor(profile.fandom));
      }
    }

    function fandomLabel(key) {
      var map = { anime: "Anime", movies: "Movies", gaming: "Gaming", kpop: "K-Pop", manga: "Manga", comics: "Comics", tvshows: "TV Shows", shop: "the Merch Shop" };
      return map[key] || "FandomVerse";
    }

    function loadHistory() {
      try {
        var raw = sessionStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (err) { return []; }
    }
    function saveHistoryEntry(role, text) {
      try {
        var h = loadHistory();
        h.push({ role: role, text: text, t: Date.now() });
        if (h.length > 40) h = h.slice(h.length - 40);
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(h));
      } catch (err) { /* ignore */ }
    }

    function pushMessage(role, text) {
      renderMessage(role, text, true);
      saveHistoryEntry(role, text);
      scrollToBottom();
    }

    function renderMessage(role, text, animate) {
      var wrap = document.createElement("div");
      wrap.className = "fvc-msg " + (role === "bot" ? "fvc-msg--bot" : "fvc-msg--user");
      if (!animate) wrap.style.animation = "none";

      var avatar = "";
      if (role === "bot") {
        avatar =
          '<span class="fvc-msg__avatar"><svg viewBox="0 0 64 64" aria-hidden="true">' +
          '<path fill="url(#fvcMarkGrad)" d="M18 6 L47 6 C49.8 6 51 8.6 48.8 10.7 L33 23.5 L45.5 23.5 C48.3 23.5 49.5 26.1 47.3 28.2 L24.5 47.5 C22.5 49.2 20 47.6 20.6 45.1 L24.5 29 L15.8 29 C13.2 29 12 26.6 14 24.6 L18 6 Z"/>' +
          '</svg></span>';
      }

      var bubble = document.createElement("div");
      bubble.className = "fvc-msg__bubble";
      bubble.textContent = text;

      wrap.innerHTML = avatar;
      wrap.appendChild(bubble);
      messages.appendChild(wrap);
    }

    function showTyping() {
      var t = document.createElement("div");
      t.className = "fvc-typing";
      t.id = "fvc-typing-indicator";
      t.innerHTML =
        '<span class="fvc-msg__avatar"><svg viewBox="0 0 64 64" aria-hidden="true">' +
        '<path fill="url(#fvcMarkGrad)" d="M18 6 L47 6 C49.8 6 51 8.6 48.8 10.7 L33 23.5 L45.5 23.5 C48.3 23.5 49.5 26.1 47.3 28.2 L24.5 47.5 C22.5 49.2 20 47.6 20.6 45.1 L24.5 29 L15.8 29 C13.2 29 12 26.6 14 24.6 L18 6 Z"/>' +
        '</svg></span><span class="fvc-typing__bubble"><span></span><span></span><span></span></span>';
      messages.appendChild(t);
      scrollToBottom();
    }
    function hideTyping() {
      var t = document.getElementById("fvc-typing-indicator");
      if (t) t.remove();
    }

    function scrollToBottom() {
      requestAnimationFrame(function () { messages.scrollTop = messages.scrollHeight; });
    }

    function renderQuickReplies(list) {
      quick.innerHTML = "";
      list.forEach(function (label) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = label;
        btn.addEventListener("click", function () {
          quick.innerHTML = "";
          submitUserText(label);
        });
        quick.appendChild(btn);
      });
    }

    function quickRepliesFor(fandom) {
      var base = ["What's new?", "Show me merch", "Contact support"];
      var map = {
        anime: ["Top anime picks", "Popular characters"].concat(base),
        movies: ["Latest movie posters", "Marvel vs DC"].concat(base),
        gaming: ["Trending games"].concat(base),
        kpop: ["Top K-Pop groups"].concat(base),
        manga: ["Best manga this month"].concat(base),
        comics: ["Featured comics"].concat(base),
        tvshows: ["Binge-worthy shows"].concat(base),
        shop: ["Bestselling merch"].concat(base)
      };
      return map[fandom] || base;
    }

    /* ---------------- input validation + character count ---------------- */
    function autosize() {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 90) + "px";
    }

    function validateMessage() {
      var raw = input.value;
      var trimmed = raw.trim();
      count.textContent = raw.length + "/500";

      var tooLong = raw.length > 500;
      var onlyWhitespace = raw.length > 0 && trimmed.length === 0;
      var spammy = /(.)\1{9,}/.test(trimmed); // 10+ repeated identical chars
      var valid = trimmed.length >= 1 && trimmed.length <= 500 && !onlyWhitespace && !spammy && !tooLong;

      msgForm.classList.toggle("is-invalid", raw.length > 0 && !valid);
      sendBtn.disabled = !valid;
      return valid;
    }

    input.addEventListener("input", function () { autosize(); validateMessage(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) msgForm.requestSubmit();
      }
    });

    msgForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateMessage()) return;
      var text = input.value.trim();
      submitUserText(text);
      input.value = "";
      autosize();
      validateMessage();
    });

    function submitUserText(text) {
      pushMessage("user", text);
      showTyping();
      var delay = 650 + Math.random() * 550;
      setTimeout(function () {
        hideTyping();
        var reply = getBotReply(text);
        pushMessage("bot", reply);
      }, delay);
    }

    /* ---------------- keyword concierge bot ---------------- */
    function getBotReply(rawText) {
      var t = rawText.toLowerCase();

      var rules = [
        { k: ["anime", "hunter x hunter", "killua", "rimuru", "naruto"], r: "Our Anime hub has fresh key art, ratings and a Popular Characters wall — check it out on the Anime page from the main menu." },
        { k: ["movie", "avengers", "spider-man", "spiderman", "suicide squad", "avatar"], r: "The Movies section is stacked — Avengers, Spider-Man: No Way Home, Suicide Squad and Avatar posters are all freshly updated." },
        { k: ["game", "gaming", "pubg"], r: "Head to Gaming for our featured titles and character spotlights — new entries drop regularly." },
        { k: ["kpop", "k-pop", "idol"], r: "K-Pop page has group profiles and stage highlights — Stray Kids, TWICE, ITZY and more." },
        { k: ["manga"], r: "Manga picks are curated weekly — slice-of-life, mecha, fantasy, you name it." },
        { k: ["comic"], r: "Comics section has featured heroes and issue highlights waiting for you." },
        { k: ["tv show", "tvshow", "tv-show", "series"], r: "Binge-worthy picks live on the TV Shows page — updated with new arrivals." },
        { k: ["shop", "merch", "buy", "price", "order"], r: "The Shop has official merch — apparel, collectibles and more. I can point you to bestsellers if you'd like." },
        { k: ["contact", "support", "help", "human", "agent"], r: "You can reach our team anytime via the Contact page, or just keep chatting with me — I'm here 24/7." },
        { k: ["premium", "pro", "subscription"], r: "This concierge chat is part of FandomVerse Premium — expect faster replies and personalized picks based on what you love." },
        { k: ["hello", "hi", "hey", "salam", "assalam"], r: "Hey there! 👋 What are you in the mood for today — anime, movies, gaming or something else?" },
        { k: ["thanks", "thank you", "shukriya"], r: "Anytime! Let me know if there's anything else you want to explore on FandomVerse. ✦" },
        { k: ["bye", "goodbye", "khuda hafiz"], r: "Take care! I'll be right here in the corner whenever you need me again. 👋" }
      ];

      for (var i = 0; i < rules.length; i++) {
        for (var j = 0; j < rules[i].k.length; j++) {
          if (t.indexOf(rules[i].k[j]) !== -1) return rules[i].r;
        }
      }

      var fallback = [
        "Got it — I've noted that. Want me to point you toward Anime, Movies, Gaming, K-Pop, Manga, Comics or the Shop?",
        "Interesting! I can help you find content across FandomVerse — just tell me which fandom you're curious about.",
        "I'm still learning that one, but I can definitely help you explore FandomVerse's sections in the meantime."
      ];
      return fallback[Math.floor(Math.random() * fallback.length)];
    }
  }
})();
