# Drip Detailing — Project Context

## What this is
Single-page marketing website for **Drip Detailing**, a mobile car detailing business serving the North West, UK. A 3D three.js car transforms from dusty to showroom shine as the user scrolls, powered by GSAP ScrollTrigger. Brand promise: *bring back the shine*.

## Stack
| Tool | Purpose |
|------|---------|
| Vite 5 | Dev server + static build |
| three.js 0.165 | 3D WebGL car, particles, lighting |
| GSAP 3 + ScrollTrigger | Scroll choreography, reveals, intro animation |
| Vanilla JS (ES modules) | No framework |
| Google Fonts | Anton (display), Permanent Marker (accent), Space Grotesk (body) |

## Key files — read these before making changes

| File | What's in it |
|------|-------------|
| `index.html` | All HTML: copy, prices, services, booking links, social links |
| `src/style.css` | All CSS — design tokens at the top, section styles below |
| `src/main.js` | Loader boot, intro animation, nav scroll state, pinned story scroll, cursor, card tilt, services carousel (mobile) |
| `src/scene.js` | three.js scene: 3D car load, camera keyframes, paint material transitions, foam + sparkle particles |
| `vite.config.js` | Build config (base path for GitHub Pages) |

## Design tokens (CSS variables)
```
--black:    #0a0a0a   (background)
--black-2:  #101010
--lime:     #b4f000   (brand accent — lime green)
--lime-dim: #86b300
--white:    #f4f4f0
--grey:     #9a9a92
--font-display: 'Anton'
--font-marker:  'Permanent Marker'
--font-body:    'Space Grotesk'
```

## Page sections (in DOM order)
1. `#hero` — big title + scroll prompt
2. `#story` — pinned scroll section, 4 stages (Foam Wash → Deep Interior → Polish & Dress → The Shine), drives the 3D car transformation
3. `#services` — 5 service cards with prices; mobile (≤768px): horizontal scroll-snap carousel, dots injected by JS, auto-scrolls to Full Detail (Most Popular) card on load
4. `#deals` — marquee + 3 deal cards (10% new customer, 15% weekly, £10 referral)
5. `#why` — 4 bullet reasons
6. `#book` — CTA with Instagram DM + WhatsApp links
7. Footer — brand, social links, credits

## Booking / contact info
- **Instagram**: `https://ig.me/m/mobile.dripdetailing` / `@mobile.dripdetailing`
- **WhatsApp**: placeholder `447000000000` — needs replacing with real number
- **TikTok**: `@mobiledripdetailing`

## Dev commands
```bash
npm run dev      # http://localhost:5173
npm run build    # static output → dist/
npm run preview  # serve dist/ locally
```

## Deployment
GitHub Pages via `.github/workflows/` — push to `main` triggers a deploy.

## Accessibility / compat notes
- `prefers-reduced-motion` is honoured throughout — animations disabled, scene jumps to final state
- WebGL failure falls back gracefully (`no-webgl` class on body)
- Responsive from 375px wide
- `pointer: coarse` / mobile detection used to reduce particle counts and hide cursor
