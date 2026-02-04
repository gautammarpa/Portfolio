// Helper: safely select elements
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initTypingEffect();
  initScrollReveal();
  initBackToTop();
  initSkillsBars();
  initContactForm();
  initYear();
});

/* THEME TOGGLE */
function initThemeToggle() {
  const toggle = $('#theme-toggle');
  if (!toggle) return;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const storedTheme = localStorage.getItem('theme');

  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }
}

/* MOBILE NAV */
function initMobileNav() {
  const navToggle = $('#nav-toggle');
  const navDrawer = $('#nav-drawer');
  if (!navToggle || !navDrawer) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navDrawer.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
  });

  // Close drawer on link click
  $$('#nav-drawer .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navDrawer.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });
}

/* TYPING EFFECT */
function initTypingEffect() {
  const target = $('#typing-text');
  if (!target) return;

  const phrases = [
    'Securing modern web apps',
    'Building DAST tooling',
    'Reducing false positives',
    'Exploring OWASP Top 10',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const phrase = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      if (charIndex === phrase.length + 1) {
        deleting = true;
        setTimeout(type, 1500);
        target.textContent = phrase;
        return;
      }
    } else {
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    target.textContent = phrase.slice(0, charIndex);
    const delay = deleting ? 40 : 90;
    setTimeout(type, delay);
  };

  type();
}

/* SCROLL REVEAL */
function initScrollReveal() {
  const sections = $$('.section-reveal');
  if (!sections.length || !('IntersectionObserver' in window)) {
    sections.forEach((s) => s.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

/* BACK TO TOP */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  const toggleVisibility = () => {
    if (window.scrollY > 380) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  toggleVisibility();
}

/* SKILL BARS */
function initSkillsBars() {
  const bars = $$('.skill-bar');
  if (!bars.length) return;

  const animate = () => {
    bars.forEach((bar) => {
      const level = parseInt(bar.dataset.level || '0', 10);
      const fill = bar.querySelector('.skill-bar-fill');
      if (fill) {
        fill.style.width = `${Math.max(0, Math.min(level, 100))}%`;
      }
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    const skillsSection = $('#skills');
    if (skillsSection) observer.observe(skillsSection);
    else animate();
  } else {
    animate();
  }
}

/* CONTACT FORM VALIDATION */
function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const nameInput = $('#name');
  const emailInput = $('#email');
  const messageInput = $('#message');
  const nameError = $('#name-error');
  const emailError = $('#email-error');
  const messageError = $('#message-error');
  const status = $('#form-status');

  const sanitize = (value) =>
    value
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .trim();

  const validators = {
    name(value) {
      if (!value.trim()) return 'Please enter your name.';
      if (value.trim().length < 2) return 'Name should be at least 2 characters.';
      if (!/^[\p{L}\p{N}\s.'-]+$/u.test(value)) return 'Name contains invalid characters.';
      return '';
    },
    email(value) {
      if (!value.trim()) return 'Please enter your email address.';
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(value.trim())) return 'Please enter a valid email address.';
      return '';
    },
    message(value) {
      if (!value.trim()) return 'Please write a short message.';
      if (value.trim().length < 10) return 'Message should be at least 10 characters.';
      return '';
    },
  };

  function showError(input, errorEl, message) {
    if (!input || !errorEl) return;
    errorEl.textContent = message || '';
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function validateField(input, errorEl, key) {
    if (!input || !errorEl) return true;
    const raw = input.value || '';
    const safe = sanitize(raw);
    if (safe !== raw) {
      input.value = safe;
    }
    const error = validators[key](safe);
    showError(input, errorEl, error);
    return !error;
  }

  nameInput?.addEventListener('blur', () => validateField(nameInput, nameError, 'name'));
  emailInput?.addEventListener('blur', () => validateField(emailInput, emailError, 'email'));
  messageInput?.addEventListener('blur', () => validateField(messageInput, messageError, 'message'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.classList.remove('success', 'error');
    status.textContent = '';

    const okName = validateField(nameInput, nameError, 'name');
    const okEmail = validateField(emailInput, emailError, 'email');
    const okMessage = validateField(messageInput, messageError, 'message');

    if (!okName || !okEmail || !okMessage) {
      status.classList.add('error');
      status.textContent = 'Please fix the highlighted fields and try again.';
      return;
    }

    status.classList.add('success');
    status.textContent = 'Message validated locally. Plug this form into your backend or a service to receive emails.';

    form.reset();
  });
}

/* YEAR IN FOOTER */
function initYear() {
  const yearEl = $('#year');
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}

