/* =====================================================================
   YASEEN MUHAMMED — PORTFOLIO SCRIPT
   Vanilla JS only. Organized by feature:
   1. Shared helpers
   2. Mobile navigation
   3. Navbar scroll state + active link tracking
   4. Scroll reveal animations
   5. Skill telemetry bars
   6. Animated stat counters
   7. Contact form validation
   ===================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------------
     1. SHARED HELPERS
     ------------------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initNavbarScrollState();
    initActiveNavTracking();
    initScrollReveal();
    initSkillTelemetry();
    initStatCounters();
    initContactForm();
  });

  /* -------------------------------------------------------------------
     2. MOBILE NAVIGATION
     ------------------------------------------------------------------- */
  function initMobileNav() {
    const toggle = $('#navToggle');
    const menu = $('#mobileMenu');
    if (!toggle || !menu) return;

    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    const openMenu = () => {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Close the mobile menu whenever a link inside it is used
    $$('[data-mobile-link]', menu).forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape for keyboard users
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* -------------------------------------------------------------------
     3. NAVBAR SCROLL STATE + ACTIVE LINK TRACKING
     ------------------------------------------------------------------- */
  function initNavbarScrollState() {
    const navbar = $('#navbar');
    if (!navbar) return;

    const updateState = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    };

    updateState();
    window.addEventListener('scroll', updateState, { passive: true });
  }

  function initActiveNavTracking() {
    const sections = $$('main section[id]');
    const navLinks = $$('[data-nav-link]');
    if (!sections.length || !navLinks.length) return;

    const setActive = (id) => {
      navLinks.forEach((link) => {
        const isMatch = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', isMatch);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* -------------------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS
     ------------------------------------------------------------------- */
  function initScrollReveal() {
    const revealEls = $$('.reveal');
    if (!revealEls.length) return;

    // If the user prefers reduced motion, just show everything immediately.
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  /* -------------------------------------------------------------------
     5. SKILL TELEMETRY BARS
     Reads data-percent from each .skill-row and animates both the
     fill bar and the numeric readout when the row enters view.
     Edit skill values directly on the data-percent attribute in HTML.
     ------------------------------------------------------------------- */
  function initSkillTelemetry() {
    const rows = $$('.skill-row');
    if (!rows.length) return;

    const animateRow = (row) => {
      const target = parseInt(row.getAttribute('data-percent'), 10) || 0;
      const fill = $('.skill-row__fill', row);
      const countEl = $('.count', row);

      if (fill) fill.style.width = target + '%';

      if (countEl) {
        if (prefersReducedMotion) {
          countEl.textContent = target;
          return;
        }
        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          countEl.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateRow(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    rows.forEach((row) => observer.observe(row));
  }

  /* -------------------------------------------------------------------
     6. ANIMATED STAT COUNTERS
     Reads data-value / data-suffix from each .stat. Elements with
     data-infinite="true" resolve directly to the infinity symbol.
     ------------------------------------------------------------------- */
  function initStatCounters() {
    const stats = $$('.stat');
    if (!stats.length) return;

    const animateStat = (statEl) => {
      const numberEl = $('.stat__number', statEl);
      if (!numberEl) return;

      if (statEl.dataset.infinite === 'true') {
        numberEl.textContent = '∞';
        return;
      }

      const target = parseInt(statEl.dataset.value, 10) || 0;
      const suffix = statEl.dataset.suffix || '';

      if (prefersReducedMotion) {
        numberEl.textContent = target + suffix;
        return;
      }

      const duration = 1500;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        numberEl.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStat(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach((stat) => observer.observe(stat));
  }

  /* -------------------------------------------------------------------
     7. CONTACT FORM VALIDATION
     No backend: validates fields client-side and shows a friendly
     success message in place of an actual network submission.
     ------------------------------------------------------------------- */
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;

    const nameField = $('#name', form);
    const emailField = $('#email', form);
    const messageField = $('#message', form);
    const successMsg = $('#formSuccess');

    const errors = {
      name: $('#nameError'),
      email: $('#emailError'),
      message: $('#messageError'),
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setError = (field, errorEl, message) => {
      field.classList.toggle('has-error', Boolean(message));
      if (errorEl) errorEl.textContent = message || '';
    };

    const validate = () => {
      let isValid = true;

      if (!nameField.value.trim()) {
        setError(nameField, errors.name, 'Please enter your name.');
        isValid = false;
      } else {
        setError(nameField, errors.name, '');
      }

      if (!emailField.value.trim() || !emailPattern.test(emailField.value.trim())) {
        setError(emailField, errors.email, 'Please enter a valid email address.');
        isValid = false;
      } else {
        setError(emailField, errors.email, '');
      }

      if (!messageField.value.trim() || messageField.value.trim().length < 10) {
        setError(messageField, errors.message, 'Message should be at least 10 characters.');
        isValid = false;
      } else {
        setError(messageField, errors.message, '');
      }

      return isValid;
    };

    // Clear individual field errors as the user corrects them
    [nameField, emailField, messageField].forEach((field) => {
      field.addEventListener('input', () => {
        if (field.classList.contains('has-error')) validate();
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (successMsg) successMsg.classList.remove('is-visible');

      if (!validate()) return;

      // No backend by design — simulate a short "sending" delay, then
      // show a success state and reset the form.
      const submitBtn = $('.form-submit', form);
      const submitText = $('.form-submit__text', submitBtn);
      const originalText = submitText ? submitText.textContent : '';

      if (submitBtn) submitBtn.setAttribute('disabled', 'true');
      if (submitText) submitText.textContent = 'Sending...';

      window.setTimeout(() => {
        if (submitText) submitText.textContent = originalText;
        if (submitBtn) submitBtn.removeAttribute('disabled');
        if (successMsg) successMsg.classList.add('is-visible');
        form.reset();
      }, 700);
    });
  }
})();
