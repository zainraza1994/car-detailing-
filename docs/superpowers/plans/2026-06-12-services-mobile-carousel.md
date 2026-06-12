# Services Mobile Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the `#services` card grid into a horizontally swipeable CSS scroll-snap carousel on mobile (≤768px), with lime dot indicators and auto-scroll to the Most Popular (Full Detail) card on load.

**Architecture:** Pure CSS scroll-snap for the carousel layout (no JS library), a small vanilla JS function appended to `src/main.js` to inject dots, wire an IntersectionObserver for active state, and scroll to the popular card on init. Desktop grid layout is entirely untouched.

**Tech Stack:** Vanilla JS ES modules, CSS custom properties, IntersectionObserver API, `scrollIntoView`

---

## File Map

| File | Change |
|------|--------|
| `src/style.css` | Add `@media (max-width: 768px)` block for carousel layout + dot styles |
| `src/main.js` | Append `initServicesCarousel()` function and call it at module level |

---

### Task 1: CSS — Mobile carousel layout

**Files:**
- Modify: `src/style.css` (after line 321, inside the existing services block area)

- [ ] **Step 1: Add the mobile carousel media block**

Open `src/style.css`. After the `.services__note` rule (around line 321), add:

```css
@media (max-width: 768px) {
  .services__grid {
    display: flex;
    max-width: none;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    margin-inline: calc(-1 * var(--pad));
    padding-inline: 7.5vw;
    gap: 1rem;
  }
  .services__grid::-webkit-scrollbar { display: none; }
  .card {
    scroll-snap-align: center;
    width: 85vw;
    flex-shrink: 0;
  }
}
```

- [ ] **Step 2: Verify layout in browser**

Run `npm run dev` and open `http://localhost:5173` in Chrome DevTools with device emulation set to iPhone 12 Pro (390px wide).

Expected:
- Cards appear as a single horizontal row
- ~85% of the viewport is filled by one card; ~7.5vw of the next card peeks on the right
- Swiping left/right snaps card-to-card
- No horizontal scrollbar visible
- Desktop layout (widen to 1024px) is unchanged — 5-column auto-fit grid

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "feat: mobile carousel layout for services section"
```

---

### Task 2: CSS — Dot indicator styles

**Files:**
- Modify: `src/style.css` (append after the mobile carousel block from Task 1)

- [ ] **Step 1: Add dot styles**

Append to `src/style.css` immediately after the `@media (max-width: 768px)` block added in Task 1:

```css
.services__dots {
  display: none;
}
@media (max-width: 768px) {
  .services__dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.2rem;
  }
  .services__dots button {
    width: 8px; height: 8px;
    border-radius: 50%;
    border: none;
    background: var(--grey);
    padding: 0;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }
  .services__dots button.active {
    background: var(--lime);
    transform: scale(1.4);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/style.css
git commit -m "feat: dot indicator styles for services carousel"
```

---

### Task 3: JS — Carousel initialisation

**Files:**
- Modify: `src/main.js` (append new function at the end of the file)

- [ ] **Step 1: Append the carousel init function**

Open `src/main.js`. Append the following at the very end of the file (after the closing `}` of the card tilt block):

```js
/* ---------- Services carousel (mobile) ---------- */

function initServicesCarousel() {
  const mq = window.matchMedia('(max-width: 768px)');

  let dots = null;
  let observer = null;

  function setup() {
    const grid = document.querySelector('.services__grid');
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

    // Keep active dot in sync with snapped card
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = cards.indexOf(entry.target);
          [...dots.querySelectorAll('button')].forEach((btn, i) => {
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
    requestAnimationFrame(() => {
      popular.scrollIntoView({ behavior: 'instant', inline: 'center' });
    });
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
```

Note: `reducedMotion` is already declared at the top of `main.js` (line 12) — no need to re-declare it.

- [ ] **Step 2: Verify in browser**

With `npm run dev` running, open Chrome DevTools mobile emulation (iPhone 12 Pro, 390px).

Expected:
- 5 dots appear below the carousel
- On page load, carousel is scrolled to the **Full Detail** card (3rd card) — it should be the snapped card at center
- The 3rd dot is active (lime, slightly larger)
- Swiping to another card updates the active dot
- Clicking a dot smoothly scrolls to that card
- The "Most popular" lime badge and glowing border are visible on the Full Detail card

- [ ] **Step 3: Verify desktop has no dots**

Widen DevTools to 1024px. Expected: dots div is not visible (hidden via `display: none` outside the media query), grid shows 5-column layout.

- [ ] **Step 4: Verify reduced motion**

In Chrome DevTools → Rendering tab → Emulate CSS media: `prefers-reduced-motion: reduce`.

Expected: clicking a dot snaps instantly (no smooth scroll animation).

- [ ] **Step 5: Commit**

```bash
git add src/main.js
git commit -m "feat: services carousel JS — dots, snap observer, scroll to popular"
```

---

### Task 4: Final cross-check

- [ ] **Step 1: Check Most Popular ring is intact**

On mobile emulation, confirm the Full Detail card has:
- Lime border (`border-color: var(--lime)`)
- Green glow (`box-shadow: 0 0 45px rgba(180,240,0,0.13)`)
- "Most popular" pill badge visible above the card title

These come from existing `.card--popular` and `.card__badge` CSS rules — no changes were made to them, so this is a regression check only.

- [ ] **Step 2: Check accessibility**

Open DevTools → Accessibility panel. Confirm each dot button has a readable `aria-label` (e.g. "Go to Full Detail") and the active dot has `aria-current="true"`.

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: exits with no errors, `dist/` directory updated.

- [ ] **Step 4: Final commit if any lint/build fixes were needed**

```bash
git add -p
git commit -m "fix: build/lint issues from carousel implementation"
```
