/* ==========================================================================
   MEANIFY.EU — Main JavaScript
   Cookie consent, language switcher, scroll animations, mobile menu,
   toast notifications, form handling, flip card touch support.
   ========================================================================== */

(function () {
  'use strict';

  var GA_ID = 'G-RDQM9R4TNT';
  var FORMSPREE_URL = 'https://formspree.io/f/maqdewdz';
  var currentLang = 'en';
  var currentTheme = 'dark';


  /* ---------- Toast Notification System ---------- */

  function showToast(message, type) {
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'info');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('visible');
    });

    setTimeout(function () {
      toast.classList.remove('visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4000);
  }


  /* ---------- Cookie Consent & Google Analytics ---------- */

  function loadGoogleAnalytics() {
    if (document.querySelector('script[src*="googletagmanager"]')) return;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function initCookieConsent() {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;

    var consent;
    try { consent = localStorage.getItem('meanify-cookie-consent'); } catch (e) {}

    if (consent === 'accepted') {
      loadGoogleAnalytics();
      return;
    }

    if (consent === 'declined') return;

    setTimeout(function () {
      banner.classList.add('visible');
      document.body.classList.add('cookie-visible');
    }, 800);

    var acceptBtn = document.getElementById('cookieAccept');
    var declineBtn = document.getElementById('cookieDecline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        try { localStorage.setItem('meanify-cookie-consent', 'accepted'); } catch (e) {}
        banner.classList.remove('visible');
        document.body.classList.remove('cookie-visible');
        loadGoogleAnalytics();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        try { localStorage.setItem('meanify-cookie-consent', 'declined'); } catch (e) {}
        banner.classList.remove('visible');
        document.body.classList.remove('cookie-visible');
      });
    }
  }


  /* ---------- i18n: Language Switcher ---------- */

  function resolve(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : null;
    }, obj);
  }

  function applyLanguage(lang) {
    var strings = translations[lang];
    if (!strings) return;

    currentLang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = resolve(strings, key);
      if (value !== null) el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var value = resolve(strings, key);
      if (value !== null) el.placeholder = value;
    });

    document.documentElement.lang = lang;

    if (strings.meta && strings.meta.title) document.title = strings.meta.title;

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && strings.meta && strings.meta.description) {
      metaDesc.setAttribute('content', strings.meta.description);
    }

    var metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && strings.meta && strings.meta.keywords) {
      metaKeywords.setAttribute('content', strings.meta.keywords);
    }

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && strings.meta && strings.meta.title) {
      ogTitle.setAttribute('content', strings.meta.title);
    }

    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && strings.meta && strings.meta.description) {
      ogDesc.setAttribute('content', strings.meta.description);
    }

    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute('content', lang === 'pt' ? 'pt_PT' : 'en_US');
    }

    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && strings.meta && strings.meta.title) {
      twTitle.setAttribute('content', strings.meta.title);
    }

    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && strings.meta && strings.meta.description) {
      twDesc.setAttribute('content', strings.meta.description);
    }

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('lang-btn--active', btnLang === lang);
      btn.setAttribute('aria-pressed', btnLang === lang ? 'true' : 'false');
    });

    try { localStorage.setItem('meanify-lang', lang); } catch (e) {}
  }

  function detectLanguage() {
    try {
      var saved = localStorage.getItem('meanify-lang');
      if (saved === 'en' || saved === 'pt') return saved;
    } catch (e) {}

    var browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';

    return 'en';
  }

  function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        if (lang !== currentLang) applyLanguage(lang);
      });
    });

    applyLanguage(detectLanguage());
  }


  /* ---------- Theme: Light / Dark ---------- */

  function applyTheme(theme) {
    currentTheme = theme;

    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }

    try { localStorage.setItem('meanify-theme', theme); } catch (e) {}
  }

  function detectTheme() {
    try {
      var saved = localStorage.getItem('meanify-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark';
  }

  function initThemeToggle() {
    var btn = document.getElementById('themeToggle');

    if (btn) {
      btn.addEventListener('click', function () {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
      });
    }

    applyTheme(detectTheme());

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
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
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navMenu.querySelectorAll('.navbar__link').forEach(function (link) {
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
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = link.getAttribute('href');
        if (targetId === '#') return;
        if (link.hasAttribute('data-modal')) return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var offset = 80;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }


  /* ---------- Scroll Animations (Intersection Observer) ---------- */

  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate-on-scroll');

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
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
        navbar.classList.toggle('navbar--scrolled', scrolled);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ---------- Flip Cards (Touch Support) ---------- */

  function initFlipCards() {
    var cards = document.querySelectorAll('.edge__card, .pillar');

    cards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        card.classList.toggle('flipped');
      });
    });
  }


  /* ---------- Formspree Helper ---------- */

  function submitToFormspree(form, onSuccess, onError) {
    var formData = new FormData(form);
    formData.delete('website');

    fetch(FORMSPREE_URL, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (response) {
      if (response.ok) {
        onSuccess();
      } else {
        return response.json().then(function (data) {
          throw new Error(data.error || 'Form submission failed');
        });
      }
    })
    .catch(function (err) {
      onError(err);
    });
  }


  /* ---------- Contact Form ---------- */

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var submitBtn = form.querySelector('[type="submit"]');
    var originalBtnText = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) {
        showToast(
          resolve(translations[currentLang], 'contact.successMessage') || 'Thank you!',
          'success'
        );
        form.reset();
        return;
      }

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        showToast(
          currentLang === 'pt'
            ? 'Por favor, preencha todos os campos obrigatórios.'
            : 'Please fill in all required fields.',
          'error'
        );
        return;
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast(
          currentLang === 'pt'
            ? 'Por favor, introduza um endereço de email válido.'
            : 'Please enter a valid email address.',
          'error'
        );
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = currentLang === 'pt' ? 'A enviar...' : 'Sending...';
      }

      function restoreButton() {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = resolve(translations[currentLang], 'contact.submit') || originalBtnText;
        }
      }

      submitToFormspree(form,
        function () {
          showToast(
            resolve(translations[currentLang], 'contact.successMessage') ||
              'Thank you! Your message has been sent successfully.',
            'success'
          );
          form.reset();
          restoreButton();
        },
        function () {
          showToast(
            resolve(translations[currentLang], 'contact.errorMessage') ||
              'Something went wrong. Please try again.',
            'error'
          );
          restoreButton();
        }
      );
    });
  }


  /* ---------- Newsletter Form ---------- */

  function initNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;

    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) {
        showToast(
          currentLang === 'pt' ? 'Obrigado pela sua subscrição!' : 'Thank you for subscribing!',
          'success'
        );
        form.reset();
        return;
      }

      var emailInput = form.querySelector('[name="email"]');
      var email = emailInput ? emailInput.value.trim() : '';

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showToast(
          currentLang === 'pt'
            ? 'Por favor, introduza um endereço de email válido.'
            : 'Please enter a valid email address.',
          'error'
        );
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      submitToFormspree(form,
        function () {
          showToast(
            currentLang === 'pt' ? 'Obrigado pela sua subscrição!' : 'Thank you for subscribing!',
            'success'
          );
          form.reset();
          if (submitBtn) submitBtn.disabled = false;
        },
        function () {
          showToast(
            currentLang === 'pt'
              ? 'Algo correu mal. Por favor tente novamente.'
              : 'Something went wrong. Please try again.',
            'error'
          );
          if (submitBtn) submitBtn.disabled = false;
        }
      );
    });
  }


  /* ---------- Modals (Privacy / Terms) ---------- */

  function initModals() {
    document.querySelectorAll('[data-modal]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var modalId = trigger.getAttribute('data-modal');
        var modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('is-open');
          document.body.classList.add('modal-open');
        }
      });
    });

    document.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        var modal = el.closest('.modal');
        if (modal) {
          modal.classList.remove('is-open');
          document.body.classList.remove('modal-open');
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var openModal = document.querySelector('.modal.is-open');
        if (openModal) {
          openModal.classList.remove('is-open');
          document.body.classList.remove('modal-open');
        }
      }
    });
  }


  /* ---------- Initialize Everything ---------- */

  function init() {
    initCookieConsent();
    initThemeToggle();
    initLanguageSwitcher();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initNavbarScroll();
    initFlipCards();
    initContactForm();
    initNewsletter();
    initModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
