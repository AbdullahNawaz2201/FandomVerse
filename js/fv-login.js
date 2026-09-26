(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var stage = document.querySelector('.fv-login-stage');
    var seal = document.querySelector('.fv-login-seal');
    var panel = document.querySelector('.fv-login-panel');
    var striker = document.querySelector('.fv-login-char--striker');
    var impact = document.querySelector('.fv-login-impact');

    function unlockPanel() {
      if (seal) seal.classList.add('fv-seal-break');
      if (stage) {
        stage.classList.add('fv-shake');
        setTimeout(function () { stage.classList.remove('fv-shake'); }, 500);
      }
      if (impact) {
        impact.classList.add('fv-impact-go');
      }
      if (panel) panel.classList.add('fv-panel-unlocked');
    }

    function runKickSequence() {
      if (!striker) { unlockPanel(); return; }
      var panelRect = panel ? panel.getBoundingClientRect() : null;
      var strikerRect = striker.getBoundingClientRect();
      var dx = 0, dy = 0;
      if (panelRect) {
        dx = (panelRect.left + panelRect.width / 2) - (strikerRect.left + strikerRect.width / 2);
        dy = (panelRect.top + panelRect.height / 2) - (strikerRect.top + strikerRect.height / 2);
      }
      striker.style.setProperty('--fv-dash-x', dx.toFixed(0) + 'px');
      striker.style.setProperty('--fv-dash-y', dy.toFixed(0) + 'px');

      striker.classList.add('fv-striker-charge');
      setTimeout(function () {
        striker.classList.remove('fv-striker-charge');
        striker.classList.add('fv-striker-dash');
        setTimeout(function () {
          unlockPanel();
          setTimeout(function () {
            striker.classList.remove('fv-striker-dash');
            striker.classList.add('fv-striker-return');
          }, 160);
        }, 480);
      }, 650);
    }

    if (reduceMotion) {
      unlockPanel();
    } else {
      setTimeout(runKickSequence, 900);
    }

    /* ---- tabs ---- */
    var tabs = document.querySelector('.fv-login-tabs');
    var loginForm = document.getElementById('fv-login-form');
    var signupForm = document.getElementById('fv-signup-form');
    if (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-tab]');
        if (!btn) return;
        var mode = btn.dataset.tab;
        tabs.setAttribute('data-active', mode);
        tabs.querySelectorAll('button').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        if (loginForm) loginForm.classList.toggle('is-active', mode === 'login');
        if (signupForm) signupForm.classList.toggle('is-active', mode === 'signup');
      });
    }

    function handleSubmit(form, successText) {
      if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var success = document.getElementById('fv-login-success');
        var successMsg = document.getElementById('fv-login-success-msg');
        [loginForm, signupForm].forEach(function (f) { if (f) f.classList.remove('is-active'); });
        if (tabs) tabs.style.display = 'none';
        if (success) {
          success.classList.add('is-active');
          if (successMsg) successMsg.textContent = successText;
        }
        setTimeout(function () { window.location.href = 'index.html'; }, 1800);
      });
    }
    handleSubmit(loginForm, 'Welcome back to the Verse.');
    handleSubmit(signupForm, 'Your legend begins now.');

    document.querySelectorAll('.fv-glow-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var r = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'fv-btn-ripple';
        ripple.style.left = (e.clientX - r.left) + 'px';
        ripple.style.top = (e.clientY - r.top) + 'px';
        btn.style.position = btn.style.position || 'relative';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 700);
      });
    });

    if (!reduceMotion) {
      var chars = document.querySelectorAll('.fv-login-char:not(.fv-login-char--striker)');
      document.addEventListener('pointermove', function (e) {
        var px = e.clientX / window.innerWidth - 0.5;
        var py = e.clientY / window.innerHeight - 0.5;
        chars.forEach(function (c, i) {
          var depth = 8 + (i % 3) * 6;
          c.style.setProperty('--fv-parallax', (px * depth).toFixed(1) + 'px');
          c.style.marginLeft = (px * depth).toFixed(1) + 'px';
          c.style.marginTop = (py * depth * 0.6).toFixed(1) + 'px';
        });
      });
    }
  });
})();
