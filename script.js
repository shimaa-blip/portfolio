
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  const savedTheme = safeGet('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', savedTheme || (prefersLight ? 'light' : 'dark'));

  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    safeSet('theme', next);
  });

  /* ---------- Welcome screen ---------- */
  const welcome = $('#welcome-screen');
  function hideWelcome() {
    if (!welcome) return;
    welcome.classList.add('hide');
    setTimeout(() => welcome.remove(), 700);
  }
  window.addEventListener('load', () => setTimeout(hideWelcome, reducedMotion ? 0 : 1500));
  setTimeout(hideWelcome, 4000); // safety net if load is slow

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuToggle');
  const nav = $('#nav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('.nav-link').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });

  /* ---------- Scroll: header, progress, back-to-top ---------- */
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 20);
    toTop.classList.toggle('show', y > 600);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Active nav link (scrollspy) ---------- */
  const links = $$('.nav-link');
  const sections = links.map(l => $(l.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Typing effect ---------- */
  const typed = $('#typed');
  const roles = ['Full Stack Developer', 'Front-End Developer', 'PHP & MySQL Developer', 'Problem Solver'];

  if (typed && !reducedMotion) {
    let roleIdx = 0, charIdx = 0, deleting = false;

    (function tick() {
      const word = roles[roleIdx];
      typed.textContent = word.slice(0, charIdx);

      let delay = deleting ? 40 : 85;
      if (!deleting && charIdx === word.length) { deleting = true; delay = 1800; }
      else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 400; }

      charIdx += deleting ? -1 : 1;
      if (charIdx > word.length) charIdx = word.length;
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Count-up stats ---------- */
  const counters = $$('[data-count]');

  function animateCount(el) {
    const target = Number(el.dataset.count);
    const duration = 1200;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  if ('IntersectionObserver' in window && !reducedMotion) {
    const countObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(c => countObserver.observe(c));
  } else {
    counters.forEach(c => { c.textContent = c.dataset.count; });
  }

  /* ---------- Footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();