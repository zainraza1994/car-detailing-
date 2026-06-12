import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createScene } from './scene.js';

gsap.registerPlugin(ScrollTrigger);

// Don't refresh pin measurements when the mobile URL bar shows/hides —
// that refresh mid-scroll is a visible jump on phones.
ScrollTrigger.config({ ignoreMobileResize: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (reducedMotion) document.body.classList.add('reduced-motion');

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Loader + scene boot ---------- */

const loaderFill = document.querySelector('.loader__fill');
const loaderEl = document.getElementById('loader');
let sceneApi = null;

const minLoaderTime = new Promise((r) => setTimeout(r, 900));

const sceneReady = createScene(document.getElementById('scene'), {
  isMobile,
  reducedMotion,
  onLoadProgress(p) {
    gsap.to(loaderFill, { width: `${Math.round(p * 90)}%`, duration: 0.3, overwrite: true });
  },
}).catch((err) => {
  console.warn('WebGL scene unavailable, using static fallback', err);
  document.body.classList.add('no-webgl');
  return null;
});

Promise.all([sceneReady, minLoaderTime]).then(([api]) => {
  sceneApi = api;
  gsap
    .timeline()
    .to(loaderFill, { width: '100%', duration: 0.25 })
    .to(loaderEl, {
      yPercent: -100,
      duration: reducedMotion ? 0 : 0.7,
      ease: 'power3.inOut',
      onComplete: () => loaderEl.remove(),
    })
    .add(introAnimation, '-=0.15');
});

function introAnimation() {
  if (reducedMotion) return;
  gsap.from('.hero__line > span', {
    yPercent: 110,
    duration: 1,
    stagger: 0.12,
    ease: 'power4.out',
  });
  gsap.to('.hero [data-reveal]', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.12,
    delay: 0.35,
    ease: 'power3.out',
  });
}

/* ---------- Scroll: nav state ---------- */

const nav = document.getElementById('nav');
const updateNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ---------- Scroll: pinned transformation story ---------- */

if (!reducedMotion) {
  const stages = gsap.utils.toArray('.story__stage');
  const storyTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#story',
      start: 'top top',
      end: '+=420%',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      onUpdate(self) {
        if (sceneApi) sceneApi.setProgress(self.progress);
      },
    },
  });

  storyTl.to('.story__progress-fill', { height: '100%', ease: 'none', duration: 4 }, 0);

  stages.forEach((stage, i) => {
    if (i === 0) {
      storyTl.set(stage, { autoAlpha: 1 }, 0);
    } else {
      storyTl.to(stages[i - 1], { autoAlpha: 0, y: -24, duration: 0.45, ease: 'power1.inOut' }, i - 0.45);
      storyTl.fromTo(
        stage,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power1.inOut' },
        i - 0.12
      );
    }
  });
  storyTl.to({}, { duration: 0.5 }); // hold the final shine

  /* ---------- Scroll: reveals ---------- */

  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    if (el.closest('.hero')) return; // hero handled by intro
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
} else if (sceneApi) {
  sceneApi.setProgress(1);
}

/* ---------- Pointer: scene parallax + custom cursor ---------- */

if (finePointer) {
  const cursor = document.getElementById('cursor');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power2.out' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power2.out' });

  window.addEventListener('pointermove', (e) => {
    cx(e.clientX - 7);
    cy(e.clientY - 7);
    if (sceneApi) {
      sceneApi.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    }
  });

  document.querySelectorAll('a, .btn, .card, .deal').forEach((el) => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  });
}

/* ---------- Card tilt (desktop only) ---------- */

if (finePointer && !reducedMotion) {
  document.querySelectorAll('.card').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' });

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 10);
      rx(-py * 8);
    });
    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
    gsap.set(card, { transformPerspective: 700 });
  });
}

/* ---------- Services carousel (mobile) ---------- */

function initServicesCarousel() {
  const mq = window.matchMedia('(max-width: 768px)');

  let dots = null;
  let observer = null;

  function setup() {
    if (dots) return; // prevent double-init
    const grid = document.querySelector('.services__grid');
    if (!grid) return;
    const cards = [...grid.querySelectorAll('.card')];

    // Inject dot container
    dots = document.createElement('div');
    dots.className = 'services__dots';
    cards.forEach((card, i) => {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Go to ${card.querySelector('h3').textContent}`);
      btn.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      btn.addEventListener('click', () => {
        card.scrollIntoView({
          behavior: reducedMotion ? 'instant' : 'smooth',
          inline: 'center',
        });
      });
      dots.appendChild(btn);
    });
    grid.after(dots);
    const btns = [...dots.querySelectorAll('button')];

    // Keep active dot in sync with snapped card
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = cards.indexOf(entry.target);
          btns.forEach((btn, i) => {
            btn.classList.toggle('active', i === idx);
            btn.setAttribute('aria-current', i === idx ? 'true' : 'false');
          });
        });
      },
      { root: grid, threshold: 0.6 }
    );
    cards.forEach((card) => observer.observe(card));

    // Scroll to Most Popular on load
    const popular = grid.querySelector('.card--popular');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      popular?.scrollIntoView({ behavior: 'instant', inline: 'center' });
    }));
  }

  function teardown() {
    if (dots) { dots.remove(); dots = null; }
    if (observer) { observer.disconnect(); observer = null; }
  }

  if (mq.matches) setup();

  mq.addEventListener('change', (e) => {
    if (e.matches) setup();
    else teardown();
  });
}

initServicesCarousel();
