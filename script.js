/**
 * ══════════════════════════════════════════════════════════════════
 *  NEXORA — script.js
 *  Vanilla JS: Scroll Spy · Navbar · Hamburger · Parallax ·
 *              Scroll Reveal · Progress Bar · Dark/Light Mode · Form
 * ══════════════════════════════════════════════════════════════════
 */

'use strict';

/* ──────────────────────────────────────────────────────────────────
   DOM ELEMENT REFERENCES
────────────────────────────────────────────────────────────────── */
const navbar          = document.getElementById('navbar');
const hamburger       = document.getElementById('hamburger');
const mobileMenu      = document.getElementById('mobile-menu');
const themeToggle     = document.getElementById('theme-toggle');
const scrollProgress  = document.getElementById('scroll-progress');
const contactForm     = document.getElementById('contact-form');
const formFeedback    = document.getElementById('form-feedback');

/** All desktop nav-links */
const navLinks        = document.querySelectorAll('.nav-link');
/** All mobile nav-links */
const mobileNavLinks  = document.querySelectorAll('.mobile-nav-link');
/** Elements to reveal on scroll */
const revealEls       = document.querySelectorAll('.reveal');
/** Page sections for scroll spy */
const sections        = document.querySelectorAll('section[id]');


/* ──────────────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────────────── */
const SCROLL_THRESHOLD = 60;   // px before navbar style flips
const THEME_KEY        = 'nexora-theme';
const ROOT             = document.documentElement;


/* ══════════════════════════════════════════════════════════════════
   1. THEME MANAGEMENT (Dark / Light)
══════════════════════════════════════════════════════════════════ */
function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function applyTheme(theme) {
  ROOT.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

// Initialise on load
applyTheme(getStoredTheme());

themeToggle.addEventListener('click', () => {
  const next = ROOT.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});


/* ══════════════════════════════════════════════════════════════════
   2. SCROLL PROGRESS INDICATOR
══════════════════════════════════════════════════════════════════ */
function updateScrollProgress() {
  const scrollTop  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
  const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = `${Math.min(progress, 100)}%`;
  scrollProgress.setAttribute('aria-valuenow', Math.round(progress));
}


/* ══════════════════════════════════════════════════════════════════
   3. NAVBAR — Scroll State
══════════════════════════════════════════════════════════════════ */
function updateNavbar() {
  if (window.scrollY > SCROLL_THRESHOLD) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}


/* ══════════════════════════════════════════════════════════════════
   4. SCROLL SPY — Active Link Highlighting
══════════════════════════════════════════════════════════════════ */
function updateScrollSpy() {
  let current = '';

  sections.forEach(section => {
    const sectionTop    = section.offsetTop - (parseInt(getComputedStyle(ROOT).getPropertyValue('--nav-h')) || 80) - 20;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    link.removeAttribute('aria-current');
    if (link.dataset.section === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}


/* ══════════════════════════════════════════════════════════════════
   5. SMOOTH SCROLL — Nav Links
══════════════════════════════════════════════════════════════════ */
function smoothScrollTo(href) {
  const target = document.querySelector(href);
  if (!target) return;

  const navH   = parseInt(getComputedStyle(ROOT).getPropertyValue('--nav-h')) || 72;
  const top    = target.getBoundingClientRect().top + window.scrollY - navH;

  window.scrollTo({ top, behavior: 'smooth' });
}

/** Attach smooth scroll to all anchor links */
function attachSmoothScroll(linkNodeList) {
  linkNodeList.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        smoothScrollTo(href);
      }
    });
  });
}

attachSmoothScroll(navLinks);
attachSmoothScroll(mobileNavLinks);
// Also attach to footer logo / back-to-top and CTAs
attachSmoothScroll(document.querySelectorAll('a[href^="#"]'));


/* ══════════════════════════════════════════════════════════════════
   6. HAMBURGER MENU
══════════════════════════════════════════════════════════════════ */
let menuOpen = false;

function openMenu() {
  menuOpen = true;
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  hamburger.setAttribute('aria-label', 'Close navigation menu');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation menu');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  menuOpen ? closeMenu() : openMenu();
});

// Close when a mobile link is clicked
mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      // smooth scroll handled by attachSmoothScroll above
    }
  });
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOpen) closeMenu();
});

// Close if click outside the menu panel (on the overlay)
mobileMenu.addEventListener('click', e => {
  if (e.target === mobileMenu) closeMenu();
});


/* ══════════════════════════════════════════════════════════════════
   7. SCROLL REVEAL — Intersection Observer
══════════════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, stop observing (one-shot animation)
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,          // trigger when 12% of element is visible
    rootMargin: '0px 0px -40px 0px', // slightly before entering viewport
  }
);

revealEls.forEach(el => revealObserver.observe(el));


/* ══════════════════════════════════════════════════════════════════
   8. PARALLAX HERO — subtle depth effect on mouse move
══════════════════════════════════════════════════════════════════ */
(function initParallax() {
  const heroSection = document.querySelector('.hero-section');
  const orbs        = document.querySelectorAll('.hero-orb');
  if (!heroSection || !orbs.length) return;

  let heroRect = heroSection.getBoundingClientRect();
  window.addEventListener('resize', () => {
    heroRect = heroSection.getBoundingClientRect();
  });

  // For touch/mobile we skip the mousemove parallax
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const INTENSITY = [0.015, 0.025, 0.035]; // per-orb depth factor

  heroSection.addEventListener('mousemove', e => {
    if (window.scrollY > heroSection.offsetHeight) return; // skip if scrolled past

    const cx = heroRect.left + heroRect.width  / 2;
    const cy = heroRect.top  + heroRect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    orbs.forEach((orb, i) => {
      const factor = INTENSITY[i] || 0.02;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });

  heroSection.addEventListener('mouseleave', () => {
    orbs.forEach(orb => {
      orb.style.transform = '';
    });
  });
})();


/* ══════════════════════════════════════════════════════════════════
   9. SCROLL-BASED PARALLAX — hero moves slower than page
══════════════════════════════════════════════════════════════════ */
(function initScrollParallax() {
  const heroContent = document.querySelector('.hero-content');
  const heroStats   = document.querySelector('.hero-stats');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!heroContent || prefersReduced) return;

  function applyScrollParallax() {
    const y = window.scrollY;
    // Only apply whilst hero is visible
    if (y < window.innerHeight) {
      heroContent.style.transform = `translateY(${y * 0.25}px)`;
      if (heroStats) heroStats.style.transform = `translateY(${y * 0.15}px)`;
    }
  }

  window.addEventListener('scroll', applyScrollParallax, { passive: true });
})();


/* ══════════════════════════════════════════════════════════════════
   10. CONTACT FORM — Validation & Submit Handling
══════════════════════════════════════════════════════════════════ */
if (contactForm) {

  /**
   * Mark a field as valid or invalid and return validity.
   * @param {HTMLElement} field
   * @param {boolean}     valid
   */
  function setFieldValidity(field, valid) {
    if (valid) {
      field.classList.remove('invalid');
    } else {
      field.classList.add('invalid');
    }
    return valid;
  }

  /** Simple email regex */
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  /** Validate the form, annotate invalid fields. Returns true if all valid. */
  function validateForm() {
    const name    = document.getElementById('name');
    const email   = document.getElementById('email');
    const message = document.getElementById('message');

    let valid = true;

    valid = setFieldValidity(name,    name.value.trim().length >= 2) && valid;
    valid = setFieldValidity(email,   isValidEmail(email.value))     && valid;
    valid = setFieldValidity(message, message.value.trim().length >= 10) && valid;

    return valid;
  }

  // Live validation on input
  ['name', 'email', 'message'].forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) {
          validateForm(); // re-run to clear errors as user types
        }
      });
    }
  });

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validateForm()) {
      showFeedback('Please fill in all required fields correctly.', 'error');
      return;
    }

    const submitBtn = document.getElementById('submit-btn');
    const btnText   = submitBtn.querySelector('.btn-text');
    const original  = btnText.textContent;

    // Loading state
    submitBtn.disabled    = true;
    btnText.textContent   = 'Sending…';

    // Simulate async request (replace with your real API call)
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Success state
    btnText.textContent = original;
    submitBtn.disabled  = false;
    contactForm.reset();
    showFeedback('🎉 Message sent! We\'ll be in touch within 24 hours.', 'success');
  });

  /**
   * Show form feedback message.
   * @param {string} message
   * @param {'success'|'error'} type
   */
  function showFeedback(message, type) {
    formFeedback.textContent = message;
    formFeedback.className   = `form-feedback ${type}`;

    // Auto-clear after 6 seconds
    setTimeout(() => {
      formFeedback.textContent = '';
      formFeedback.className   = 'form-feedback';
    }, 6000);
  }
}


/* ══════════════════════════════════════════════════════════════════
   11. UNIFIED SCROLL HANDLER (passive, RAF-throttled)
══════════════════════════════════════════════════════════════════ */
let rafId = null;

function onScroll() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    updateScrollProgress();
    updateNavbar();
    updateScrollSpy();
    rafId = null;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

// Run once on load to set initial states
updateScrollProgress();
updateNavbar();
updateScrollSpy();


/* ══════════════════════════════════════════════════════════════════
   12. SERVICE CARD — subtle tilt on mouse move
══════════════════════════════════════════════════════════════════ */
(function initCardTilt() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const cx      = rect.left + rect.width  / 2;
      const cy      = rect.top  + rect.height / 2;
      const dx      = (e.clientX - cx) / (rect.width  / 2);
      const dy      = (e.clientY - cy) / (rect.height / 2);
      const tiltX   = -(dy * 5).toFixed(2);
      const tiltY   =   (dx * 5).toFixed(2);

      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ══════════════════════════════════════════════════════════════════
   13. ENTRANCE ANIMATIONS — Trigger hero on load
══════════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  // Hero content is the first .reveal element — force a quick trigger
  const heroReveals = document.querySelectorAll('.hero-section .reveal');
  heroReveals.forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
});


/* ══════════════════════════════════════════════════════════════════
   14. CLOSE MOBILE MENU ON RESIZE (if desktop breakpoint reached)
══════════════════════════════════════════════════════════════════ */
const resizeObserver = new ResizeObserver(() => {
  if (window.innerWidth > 768 && menuOpen) closeMenu();
});
resizeObserver.observe(document.documentElement);
