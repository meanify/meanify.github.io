/* ==========================================================================
   MEANIFY.EU — Main JavaScript
   Theme, language preference, mobile menu, scroll animations,
   cookie consent and lead tracking for Google Analytics.
   ========================================================================== */

(function () {
  'use strict';

  var currentLang = document.body.getAttribute('data-lang') || 'en';

  /** Send an event to Google Analytics, if gtag is available. */
  function track(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  }


  /* ---------- Language Preference ---------- */

  // Pages are pre-rendered per language; the switcher links to the matching
  // page. Remember the choice so the root URL sends the visitor there next time.
  function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn[data-lang]').forEach(function (link) {
      link.addEventListener('click', function () {
        var lang = link.getAttribute('data-lang');
        try { localStorage.setItem('meanify-lang', lang); } catch (e) {}
        if (lang !== currentLang) {
          track('language_switch', { from_language: currentLang, to_language: lang });
        }
      });
    });
  }

  /* ---------- Theme: Light / Dark ---------- */

  var currentTheme = 'dark';

  /**
   * Apply a theme ('dark' or 'light') to the document.
   */
  function applyTheme(theme) {
    currentTheme = theme;

    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Update aria label on toggle button
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }

    // Persist choice
    try {
      localStorage.setItem('meanify-theme', theme);
    } catch (e) {
      // localStorage not available
    }
  }

  /**
   * Detect initial theme from localStorage or browser preference.
   */
  function detectTheme() {
    // Check localStorage first
    try {
      var saved = localStorage.getItem('meanify-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      // ignore
    }

    // Check browser preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark';
  }

  /**
   * Initialize the theme toggle button.
   */
  function initThemeToggle() {
    var btn = document.getElementById('themeToggle');

    if (btn) {
      btn.addEventListener('click', function () {
        var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
      });
    }

    // Apply detected theme
    applyTheme(detectTheme());

    // Listen for OS-level preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
        // Only auto-switch if user hasn't manually chosen
        try {
          if (!localStorage.getItem('meanify-theme')) {
            applyTheme(e.matches ? 'light' : 'dark');
          }
        } catch (ex) {
          applyTheme(e.matches ? 'light' : 'dark');
        }
      });
    }
  }


  /* ---------- Mobile Menu ---------- */

  function initMobileMenu() {
    var hamburger = document.getElementById('hamburgerBtn');
    var navMenu = document.getElementById('navMenu');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a nav link is clicked
    navMenu.querySelectorAll('.navbar__link, .navbar__sublink').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }


  /* ---------- Smooth Scrolling ---------- */

  function initSmoothScroll() {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Arriving from another page with a hash (e.g. /en/#contact): jump to the section
    // once layout has settled, since smooth scrolling on load is unreliable.
    if (window.location.hash.length > 1) {
      var initial = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (initial) {
        window.addEventListener('load', function () {
          window.scrollTo({ top: initial.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'auto' });
        });
      }
    }

    // Handles "#id" and "/en/#id" links that point to a section on the current page.
    document.querySelectorAll('a[href*="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (link.pathname !== window.location.pathname || !link.hash || link.hash === '#') return;

        var target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
        if (!target) return;

        e.preventDefault();
        var offset = 80; // Navbar height
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: top,
          behavior: reduceMotion ? 'auto' : 'smooth'
        });
        history.replaceState(null, '', link.hash);
      });
    });
  }


  /* ---------- Scroll Animations (Intersection Observer) ---------- */

  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      elements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* ---------- Navbar Scroll Effect ---------- */

  function initNavbarScroll() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    var scrolled = false;

    function onScroll() {
      var shouldBeScrolled = window.scrollY > 20;
      if (shouldBeScrolled !== scrolled) {
        scrolled = shouldBeScrolled;
        // Let CSS handle the background via data-theme; just add/remove a class
        if (scrolled) {
          navbar.classList.add('navbar--scrolled');
        } else {
          navbar.classList.remove('navbar--scrolled');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Cookie Consent (Google Consent Mode v2) ---------- */

  var CONSENT_KEY = 'meanify-consent';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: value });
    }
  }

  function initConsent() {
    var banner = document.getElementById('consentBanner');
    if (!banner) return;

    function show() { banner.hidden = false; }
    function hide() { banner.hidden = true; }

    if (getConsent() !== 'granted' && getConsent() !== 'denied') show();

    banner.querySelectorAll('[data-consent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setConsent(btn.getAttribute('data-consent'));
        hide();
      });
    });

    document.querySelectorAll('[data-consent-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        show();
        var first = banner.querySelector('[data-consent]');
        if (first) first.focus();
      });
    });
  }


  /* ---------- Lead & CTA Tracking ---------- */

  // Links marked with data-lead (whatsapp | email | phone) count as leads in GA4.
  // On service pages the service id is sent too (data-service on <body>).
  // Mark generate_lead as a key event in the GA4 admin.
  function initLeadTracking() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('a[data-lead], a[data-cta]') : null;
      if (!link) return;

      var location = link.getAttribute('data-cta') || 'unknown';
      var method = link.getAttribute('data-lead');

      var service = link.getAttribute('data-service') || document.body.getAttribute('data-service') || 'none';

      if (method) {
        track('generate_lead', {
          method: method,
          cta_location: location,
          service: service,
          page_language: currentLang,
          page_path: window.location.pathname
        });
      } else {
        track('cta_click', { cta_location: location, page_language: currentLang });
      }
    });
  }


  /* ---------- AI Readiness Checklist ---------- */

  // Live score, highlighted result, WhatsApp message with the score, and print.
  function initReadinessChecklist() {
    var form = document.getElementById('readiness');
    if (!form) return;

    var total = parseInt(form.getAttribute('data-total'), 10);
    var scoreEl = document.getElementById('readinessScore');
    var meter = document.getElementById('readinessMeter');
    var levels = document.querySelectorAll('.readiness__level');
    var wa = document.getElementById('readinessWhatsapp');
    var started = false;

    function update() {
      var score = form.querySelectorAll('.readiness__check:checked').length;
      scoreEl.textContent = score;
      meter.style.width = Math.round((score / total) * 100) + '%';

      var active = null;
      levels.forEach(function (level) {
        if (score >= parseInt(level.getAttribute('data-min'), 10)) active = level;
      });
      levels.forEach(function (level) {
        level.classList.toggle('readiness__level--active', level === active);
      });

      if (wa) {
        var text = wa.getAttribute('data-template').replace('{score}', score).replace('{total}', total);
        wa.href = 'https://wa.me/' + wa.getAttribute('data-phone') + '?text=' + encodeURIComponent(text);
      }
      return score;
    }

    form.addEventListener('change', function () {
      var score = update();
      if (!started) {
        started = true;
        track('checklist_start', { page_language: currentLang });
      }
      if (score === total) track('checklist_complete', { score: score, page_language: currentLang });
    });

    var printBtn = document.getElementById('readinessPrint');
    if (printBtn) {
      printBtn.addEventListener('click', function () {
        track('checklist_print', { score: update(), page_language: currentLang });
        window.print();
      });
    }

    update();
  }


  /* ---------- Initialize Everything ---------- */

  function init() {
    initThemeToggle();
    initLanguageSwitcher();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initNavbarScroll();
    initConsent();
    initLeadTracking();
    initReadinessChecklist();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
