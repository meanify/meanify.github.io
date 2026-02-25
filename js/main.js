/* ==========================================================================
   MEANIFY.EU — Main JavaScript
   Language switcher, scroll animations, mobile menu, form handling.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- i18n: Language Switcher ---------- */

  let currentLang = 'en';

  /**
   * Resolve a nested key like "hero.headline" from an object.
   */
  function resolve(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && acc[key] !== undefined ? acc[key] : null;
    }, obj);
  }

  /**
   * Apply all translations for the given language.
   */
  function applyLanguage(lang) {
    var strings = translations[lang];
    if (!strings) return;

    currentLang = lang;

    // Update all [data-i18n] elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = resolve(strings, key);
      if (value !== null) {
        el.textContent = value;
      }
    });

    // Update all [data-i18n-placeholder] elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var value = resolve(strings, key);
      if (value !== null) {
        el.placeholder = value;
      }
    });

    // Update <html lang>
    document.documentElement.lang = lang;

    // Update <title>
    if (strings.meta && strings.meta.title) {
      document.title = strings.meta.title;
    }

    // Update meta description
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && strings.meta && strings.meta.description) {
      metaDesc.setAttribute('content', strings.meta.description);
    }

    // Update meta keywords
    var metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && strings.meta && strings.meta.keywords) {
      metaKeywords.setAttribute('content', strings.meta.keywords);
    }

    // Update OG tags
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

    // Update Twitter tags
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && strings.meta && strings.meta.title) {
      twTitle.setAttribute('content', strings.meta.title);
    }

    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && strings.meta && strings.meta.description) {
      twDesc.setAttribute('content', strings.meta.description);
    }

    // Update language switcher active state
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      var btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('lang-btn--active', btnLang === lang);
      btn.setAttribute('aria-pressed', btnLang === lang ? 'true' : 'false');
    });

    // Persist choice
    try {
      localStorage.setItem('meanify-lang', lang);
    } catch (e) {
      // localStorage not available
    }
  }

  /**
   * Detect initial language from localStorage or browser.
   */
  function detectLanguage() {
    // Check localStorage first
    try {
      var saved = localStorage.getItem('meanify-lang');
      if (saved === 'en' || saved === 'pt') return saved;
    } catch (e) {
      // ignore
    }

    // Check browser language
    var browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';

    return 'en';
  }

  /**
   * Initialize language switcher buttons.
   */
  function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = btn.getAttribute('data-lang');
        if (lang !== currentLang) {
          applyLanguage(lang);
        }
      });
    });

    // Apply detected language
    var lang = detectLanguage();
    applyLanguage(lang);
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
        var offset = 80; // Navbar height
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
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


  /* ---------- Formspree Helper ---------- */

  var FORMSPREE_URL = 'https://formspree.io/f/maqdewdz';

  function submitToFormspree(form, onSuccess, onError) {
    var formData = new FormData(form);

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

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="message"]').value.trim();

      // Basic validation
      if (!name || !email || !message) {
        var msgs = {
          en: 'Please fill in all required fields.',
          pt: 'Por favor, preencha todos os campos obrigatórios.'
        };
        alert(msgs[currentLang] || msgs.en);
        return;
      }

      // Email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        var emailMsgs = {
          en: 'Please enter a valid email address.',
          pt: 'Por favor, introduza um endereço de email válido.'
        };
        alert(emailMsgs[currentLang] || emailMsgs.en);
        return;
      }

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = currentLang === 'pt' ? 'A enviar...' : 'Sending...';
      }

      submitToFormspree(form,
        function () {
          var successMsgs = {
            en: 'Thank you! Your message has been sent successfully.',
            pt: 'Obrigado! A sua mensagem foi enviada com sucesso.'
          };
          alert(successMsgs[currentLang] || successMsgs.en);
          form.reset();
        },
        function () {
          var errorMsgs = {
            en: 'Something went wrong. Please try again or email us at info@meanify.eu.',
            pt: 'Algo correu mal. Por favor tente novamente ou envie email para info@meanify.eu.'
          };
          alert(errorMsgs[currentLang] || errorMsgs.en);
        }
      );

      // Always restore button after a timeout (covers edge cases)
      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }, 5000);
    });
  }


  /* ---------- Newsletter Form ---------- */

  function initNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;

    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = form.querySelector('[name="email"]');
      var email = emailInput ? emailInput.value.trim() : '';

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        var msgs = {
          en: 'Please enter a valid email address.',
          pt: 'Por favor, introduza um endereço de email válido.'
        };
        alert(msgs[currentLang] || msgs.en);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      submitToFormspree(form,
        function () {
          var successMsgs = {
            en: 'Thank you for subscribing!',
            pt: 'Obrigado pela sua subscrição!'
          };
          alert(successMsgs[currentLang] || successMsgs.en);
          form.reset();
          if (submitBtn) submitBtn.disabled = false;
        },
        function () {
          var errorMsgs = {
            en: 'Something went wrong. Please try again.',
            pt: 'Algo correu mal. Por favor tente novamente.'
          };
          alert(errorMsgs[currentLang] || errorMsgs.en);
          if (submitBtn) submitBtn.disabled = false;
        }
      );
    });
  }


  /* ---------- Modals (Privacy / Terms) ---------- */

  function initModals() {
    // Open modal via data-modal attribute
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

    // Close modal via data-modal-close (overlay or close button)
    document.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        var modal = el.closest('.modal');
        if (modal) {
          modal.classList.remove('is-open');
          document.body.classList.remove('modal-open');
        }
      });
    });

    // Close on Escape key
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
    initThemeToggle();
    initLanguageSwitcher();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initNavbarScroll();
    initContactForm();
    initNewsletter();
    initModals();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
