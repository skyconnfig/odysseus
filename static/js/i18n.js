
// Odysseus i18n module
(function() {
  'use strict';

  var LANG_KEY = 'odysseus-lang';
  var SUPPORTED = { 'en': 'English', 'zh': '中文' };
  var DEFAULT = 'en';

  var currentLang = null;
  var locale = {};       // English → Target map
  var _initDone = false;

  // ── Detect language ──
  function detectLang() {
    var stored = localStorage.getItem(LANG_KEY);
    if (stored && SUPPORTED[stored]) return stored;
    var navLang = (navigator.language || '').toLowerCase().split('-')[0];
    if (navLang === 'zh' || navLang === 'zh-cn') return 'zh';
    return DEFAULT;
  }

  currentLang = detectLang();
  window.__currentLang = currentLang;
  window.__supportedLangs = SUPPORTED;

  // ── Load locale ──
  async function loadLocale(lang) {
    if (lang === 'en') { locale = {}; return; }
    try {
      var res = await fetch('/static/locales/' + lang + '.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      locale = await res.json();
    } catch(e) {
      console.warn('[i18n] Failed to load locale ' + lang + ', falling back to en');
      locale = {};
    }
  }

  // ── Translate a single text node ──
  function translateNode(node) {
    if (!node || node.nodeType !== 3) return;
    var text = node.nodeValue.trim();
    if (!text || !locale[text]) { return; }
    node.nodeValue = node.nodeValue.replace(text, locale[text]);
  }

  // ── Translate attributes ──
  var ATTRS = ['title', 'aria-label', 'placeholder'];
  function translateAttrs(el) {
    ATTRS.forEach(function(attr) {
      var val = el.getAttribute(attr);
      if (val && locale[val]) {
        el.setAttribute(attr, locale[val]);
      }
    });
  }

  // ── Walk DOM ──
  function walkDOM(root) {
    if (!root || !locale) return;
    var walker = document.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */, null, false);
    var node;
    while (node = walker.nextNode()) {
      translateNode(node);
    }
    var all = root.querySelectorAll ? root.querySelectorAll('*') : [];
    all.forEach(function(el) {
      translateAttrs(el);
    });
    // Also handle the root element itself
    if (root.nodeType === 1) translateAttrs(root);
  }

  // ── MutationObserver ──
  var _translateTimer = null;
  function _scheduleTranslate() {
    if (_translateTimer) clearTimeout(_translateTimer);
    _translateTimer = setTimeout(function() {
      _translateTimer = null;
      walkDOM(document.body || document.documentElement);
    }, 300);
  }
  var observer = null;
  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mut) {
        if (mut.type === 'childList') {
          mut.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) walkDOM(node);
            else if (node.nodeType === 3) translateNode(node);
          });
        } else if (mut.type === 'attributes') {
          translateAttrs(mut.target);
        }
      });
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ATTRS,
      characterData: true
    });
  }

  // ── Init ──
  async function init() {
    if (_initDone) return;
    _initDone = true;
    // Set the lang attribute on html element for CSS selectors
    document.documentElement.lang = currentLang;
    await loadLocale(currentLang);
    if (currentLang !== 'en') {
      walkDOM(document.body || document.documentElement);
      startObserver();
      // Also re-sweep after a delay to catch SPA-rendered content
      setTimeout(walkDOM, 500, document.body || document.documentElement);
      setTimeout(walkDOM, 1500, document.body || document.documentElement);
      setTimeout(walkDOM, 4000, document.body || document.documentElement);
    }
  }

  // ── Public API ──
  window.__ = function(key) {
    return locale[key] || key;
  };

  window.__setLang = function(lang) {
    if (!SUPPORTED[lang]) return;
    localStorage.setItem(LANG_KEY, lang);
    location.href = location.pathname + "?" + Date.now();
  };

  // ── Language switcher UI ──
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('#user-bar-lang');
    if (btn) {
      var langs = Object.keys(SUPPORTED);
      var idx = langs.indexOf(currentLang);
      var next = langs[(idx + 1) % langs.length];
      window.__setLang(next);
    }
  });
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.i18n-lang-link');
    if (link) window.__setLang(link.dataset.lang);
  });

  window.__addLangSwitcher = function(parentEl) {
    var container = document.createElement('span');
    container.className = 'i18n-lang-switcher';
    container.style.cssText = 'display:inline-flex;gap:3px;align-items:center;font-size:10px;opacity:0.5;cursor:pointer;';
    Object.keys(SUPPORTED).forEach(function(lang) {
      var btn = document.createElement('span');
      btn.textContent = SUPPORTED[lang];
      btn.lang = lang;
      btn.style.cssText = (lang === currentLang)
        ? 'font-weight:700;opacity:1;padding:0 2px;'
        : 'font-weight:400;opacity:0.5;padding:0 2px;';
      btn.addEventListener('click', function() { window.__setLang(lang); });
      container.appendChild(btn);
    });
    parentEl.appendChild(container);
  };

  // ── Auto-init after DOM ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
