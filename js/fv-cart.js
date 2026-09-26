
(function () {
  "use strict";

  var STORAGE_KEY = "fv_cart_v1";
  var MAX_QTY = 99;
  var MIN_QTY = 1;

  var cartItems = loadCart();

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (i) {
        return i && typeof i.id === "string" && i.id.length > 0;
      }).map(function (i) {
        return {
          id: i.id,
          title: typeof i.title === "string" && i.title.trim() ? i.title.trim() : "Item",
          price: isFiniteNumber(i.price) ? Math.max(0, i.price) : 0,
          img: typeof i.img === "string" ? i.img : "",
          qty: clampQty(i.qty)
        };
      });
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems)); } catch (e) { /* storage unavailable */ }
  }

  function isFiniteNumber(n) { return typeof n === "number" && isFinite(n); }
  function clampQty(q) {
    q = Math.round(Number(q));
    if (!isFinite(q) || q < MIN_QTY) return MIN_QTY;
    if (q > MAX_QTY) return MAX_QTY;
    return q;
  }

  function findItem(id) {
    for (var i = 0; i < cartItems.length; i++) if (cartItems[i].id === id) return cartItems[i];
    return null;
  }

  function addItem(product) {
    if (!product || !product.id) return;
    var existing = findItem(product.id);
    if (existing) {
      var was = existing.qty;
      existing.qty = clampQty(existing.qty + 1);
      saveCart();
      renderList();
      renderBadge(true);
      if (existing.qty === was) {
        showToast("Max quantity (" + MAX_QTY + ") reached for " + existing.title, "warn");
      } else {
        showToast("Quantity updated — " + existing.title, "success");
      }
    } else {
      cartItems.push({
        id: String(product.id),
        title: (product.title || "Item").trim() || "Item",
        price: isFiniteNumber(product.price) ? Math.max(0, product.price) : 0,
        img: product.img || "",
        qty: 1
      });
      saveCart();
      renderList();
      renderBadge(true);
      showToast("Added to cart — " + (product.title || "Item"), "success");
    }
  }

  function setQty(id, qty) {
    var item = findItem(id);
    if (!item) return;
    qty = Math.round(Number(qty));
    if (!isFinite(qty) || qty < MIN_QTY) { removeItem(id, true); return; }
    item.qty = clampQty(qty);
    saveCart();
    renderList();
    renderBadge(false);
  }

  function removeItem(id, silent) {
    var item = findItem(id);
    cartItems = cartItems.filter(function (i) { return i.id !== id; });
    saveCart();
    renderList();
    renderBadge(false);
    if (item) showToast("Removed — " + item.title, "info");
  }

  function clearCart() {
    if (!cartItems.length) return;
    cartItems = [];
    saveCart();
    renderList();
    renderBadge(false);
    showToast("Cart cleared", "info");
  }

  function totalCount() { return cartItems.reduce(function (s, i) { return s + i.qty; }, 0); }
  function totalPrice() { return cartItems.reduce(function (s, i) { return s + i.qty * i.price; }, 0); }

  function bgUrlFromVar(el, prop) {
    if (!el) return "";
    var computed = window.getComputedStyle(el).backgroundImage || "";
    var m = /url\((['"]?)(.*?)\1\)/.exec(computed);
    if (m && m[2]) return m[2];
    var val = el.style.getPropertyValue(prop) || "";
    var m2 = /url\((['"]?)(.*?)\1\)/.exec(val);
    return m2 ? m2[2] : "";
  }
  function bgUrlFromBackgroundImage(el) {
    if (!el) return "";
    var val = el.style.backgroundImage || "";
    var m = /url\((['"]?)(.*?)\1\)/.exec(val);
    return m ? m[2] : "";
  }
  function parsePrice(text) {
    if (!text) return 0;
    var m = String(text).replace(/,/g, "").match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }

  function extractProduct(btn) {
    var movieCard = btn.closest(".movie-card");
    if (movieCard) {
      var art = movieCard.querySelector(".movie-card__art");
      return {
        id: movieCard.dataset.id || movieCard.dataset.title || ("mc-" + Math.random().toString(36).slice(2)),
        title: movieCard.dataset.title || "Item",
        price: parseFloat(movieCard.dataset.price) || 0,
        img: bgUrlFromBackgroundImage(art)
      };
    }

    var storeCard = btn.closest(".anime-card--store");
    if (storeCard) {
      var titleEl = storeCard.querySelector(".anime-card__title");
      var priceEl = storeCard.querySelector(".anime-card__price");
      var posterEl = storeCard.querySelector(".anime-card__poster");
      var title = titleEl ? titleEl.textContent.trim() : "Item";
      return {
        id: "shop-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: title,
        price: parsePrice(priceEl ? priceEl.textContent : ""),
        img: bgUrlFromVar(posterEl, "--card-img")
      };
    }

    var merchCard = btn.closest(".fv-merch-card");
    if (merchCard) {
      var nameEl = merchCard.querySelector(".fv-merch-card__name");
      var priceEl2 = merchCard.querySelector(".fv-merch-card__price");
      var imgEl = merchCard.querySelector(".fv-merch-card__img");
      return {
        id: merchCard.dataset.id || btn.getAttribute("data-add-id") || ("merch-" + Math.random().toString(36).slice(2)),
        title: nameEl ? nameEl.textContent.trim() : "Item",
        price: parsePrice(priceEl2 ? priceEl2.textContent : ""),
        img: imgEl ? imgEl.getAttribute("src") : ""
      };
    }

    var card = btn.closest("article, .card, li, div");
    var title2 = "Item";
    var priceVal = 0;
    if (card) {
      var h = card.querySelector("h1, h2, h3, h4, [class*='title'], [class*='name']");
      if (h) title2 = h.textContent.trim() || title2;
      var p = card.querySelector("[class*='price']");
      if (p) priceVal = parsePrice(p.textContent);
    }
    return {
      id: "item-" + title2.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 6),
      title: title2,
      price: priceVal,
      img: ""
    };
  }

  var toggleBtn, badgeEl, panelEl, listEl, emptyEl, footEl, subtotalEl, checkoutBtn, clearBtn, toastHost;
  var isOpen = false;

  function buildUI() {
    toggleBtn = document.getElementById("cart-toggle");
    badgeEl = document.getElementById("cart-count");
    if (!toggleBtn) return;

    panelEl = document.createElement("div");
    panelEl.className = "fv-cart__panel";
    panelEl.id = "fv-cart-panel";
    panelEl.setAttribute("role", "dialog");
    panelEl.setAttribute("aria-modal", "false");
    panelEl.setAttribute("aria-label", "Shopping cart");
    panelEl.innerHTML =
      '<div class="fv-cart__glow" aria-hidden="true"></div>' +
      '<header class="fv-cart__head">' +
        '<span class="fv-cart__title">' +
          '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="21" r="1.3" fill="currentColor"/><circle cx="18" cy="21" r="1.3" fill="currentColor"/></svg>' +
          "Your Cart" +
        "</span>" +
        '<button type="button" class="fv-cart__close" id="fv-cart-close" aria-label="Close cart">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
        "</button>" +
      "</header>" +
      '<div class="fv-cart__list" id="fv-cart-list"></div>' +
      '<div class="fv-cart__empty" id="fv-cart-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.8h8.2a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="21" r="1.3" fill="currentColor"/><circle cx="18" cy="21" r="1.3" fill="currentColor"/></svg>' +
        "<p>Your cart is empty</p><span>Add something fandom-worthy \u2726</span>" +
      "</div>" +
      '<footer class="fv-cart__foot" id="fv-cart-foot">' +
        '<div class="fv-cart__subtotal"><span>Subtotal</span><strong id="fv-cart-subtotal">$0.00</strong></div>' +
        '<button type="button" class="fv-cart__clear" id="fv-cart-clear">Clear</button>' +
        '<button type="button" class="fv-cart__checkout" id="fv-cart-checkout">Secure Checkout</button>' +
      "</footer>";
    document.body.appendChild(panelEl);

    toastHost = document.createElement("div");
    toastHost.className = "fv-cart__toast-host";
    toastHost.setAttribute("aria-live", "polite");
    document.body.appendChild(toastHost);

    listEl = panelEl.querySelector("#fv-cart-list");
    emptyEl = panelEl.querySelector("#fv-cart-empty");
    footEl = panelEl.querySelector("#fv-cart-foot");
    subtotalEl = panelEl.querySelector("#fv-cart-subtotal");
    checkoutBtn = panelEl.querySelector("#fv-cart-checkout");
    clearBtn = panelEl.querySelector("#fv-cart-clear");

    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      isOpen ? closePanel() : openPanel();
    });
    panelEl.querySelector("#fv-cart-close").addEventListener("click", closePanel);
    document.addEventListener("click", function (e) {
      if (isOpen && !panelEl.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
        closePanel();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen) closePanel();
    });
    window.addEventListener("resize", function () { if (isOpen) positionPanel(); });
    window.addEventListener("scroll", function () { if (isOpen) positionPanel(); }, true);

    clearBtn.addEventListener("click", function () {
      if (!cartItems.length) { flagInvalid(clearBtn); return; }
      clearCart();
    });

    checkoutBtn.addEventListener("click", function () {
      if (!cartItems.length) {
        flagInvalid(checkoutBtn);
        showToast("Your cart is empty \u2014 add something before checkout", "warn");
        return;
      }
      var count = totalCount();
      var total = totalPrice();
      showToast("Order placed \u2014 " + count + " item" + (count === 1 ? "" : "s") + " \u00b7 $" + total.toFixed(2), "success");
      clearCart();
      closePanel();
    });

    renderList();
    renderBadge(false);
  }

  function flagInvalid(el) {
    el.classList.remove("fv-cart-shake");
    void el.offsetWidth;
    el.classList.add("fv-cart-shake");
    setTimeout(function () { el.classList.remove("fv-cart-shake"); }, 420);
  }

  function positionPanel() {
    if (!toggleBtn || !panelEl) return;
    if (window.innerWidth <= 480) return; 
    var rect = toggleBtn.getBoundingClientRect();
    var panelWidth = panelEl.offsetWidth || 380;
    var right = Math.max(8, window.innerWidth - rect.right);
    if (window.innerWidth - right - panelWidth < 8) right = Math.max(8, window.innerWidth - panelWidth - 8);
    panelEl.style.right = right + "px";
    panelEl.style.left = "auto";
    panelEl.style.top = (rect.bottom + 10) + "px";
  }

  function openPanel() {
    isOpen = true;
    panelEl.classList.add("is-open");
    toggleBtn.setAttribute("aria-expanded", "true");
    positionPanel();
  }
  function closePanel() {
    isOpen = false;
    panelEl.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  function renderBadge(pulse) {
    if (!badgeEl) return;
    badgeEl.textContent = totalCount();
    if (pulse) {
      badgeEl.classList.remove("fv-cart-pulse");
      void badgeEl.offsetWidth;
      badgeEl.classList.add("fv-cart-pulse");
    }
  }

  function itemRow(item) {
    var row = document.createElement("div");
    row.className = "fv-cart__item";
    row.innerHTML =
      '<div class="fv-cart__thumb" style="background-image:url(\'' + (item.img || "").replace(/'/g, "\\'") + '\')"></div>' +
      '<div class="fv-cart__info">' +
        '<div class="fv-cart__name"></div>' +
        '<div class="fv-cart__price"></div>' +
      "</div>" +
      '<div class="fv-cart__stepper">' +
        '<button type="button" class="fv-cart__step-btn" data-action="dec" aria-label="Decrease quantity">\u2212</button>' +
        '<span class="fv-cart__qty"></span>' +
        '<button type="button" class="fv-cart__step-btn" data-action="inc" aria-label="Increase quantity">+</button>' +
      "</div>" +
      '<button type="button" class="fv-cart__remove" aria-label="Remove item"><svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 13a1 1 0 001 1h6a1 1 0 001-1l1-13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';

    row.querySelector(".fv-cart__name").textContent = item.title;
    row.querySelector(".fv-cart__price").textContent = item.price > 0 ? "$" + item.price.toFixed(2) : "Included";
    row.querySelector(".fv-cart__qty").textContent = item.qty;

    row.querySelector('[data-action="dec"]').addEventListener("click", function () { setQty(item.id, item.qty - 1); });
    row.querySelector('[data-action="inc"]').addEventListener("click", function () { setQty(item.id, item.qty + 1); });
    row.querySelector(".fv-cart__remove").addEventListener("click", function () { removeItem(item.id); });

    return row;
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = "";
    if (!cartItems.length) {
      emptyEl.style.display = "flex";
      listEl.style.display = "none";
      footEl.querySelector("#fv-cart-subtotal").textContent = "$0.00";
      checkoutBtn.disabled = true;
      clearBtn.disabled = true;
      return;
    }
    emptyEl.style.display = "none";
    listEl.style.display = "flex";
    checkoutBtn.disabled = false;
    clearBtn.disabled = false;
    cartItems.forEach(function (item) { listEl.appendChild(itemRow(item)); });
    subtotalEl.textContent = "$" + totalPrice().toFixed(2);
    if (isOpen) positionPanel();
  }

  var ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none"><path d="M10.3 3.8a2 2 0 013.4 0l8 14A2 2 0 0120 21H4a2 2 0 01-1.7-3.2l8-14z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 9v5M12 17h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
  };
  function showToast(message, kind) {
    if (!toastHost) return;
    var t = document.createElement("div");
    t.className = "fv-cart__toast fv-cart__toast--" + (kind || "info");
    t.innerHTML = (ICONS[kind] || ICONS.info) + "<span></span>";
    t.querySelector("span").textContent = message;
    toastHost.appendChild(t);
    setTimeout(function () {
      t.classList.add("is-leaving");
      setTimeout(function () { t.remove(); }, 300);
    }, 2600);
  }

  function initDelegatedAddToCart() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".buy-btn, .movie-card__add, .fv-merch-card__add");
      if (!btn) return;
      var product = extractProduct(btn);
      addItem(product);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildUI();
    initDelegatedAddToCart();
  });
})();
