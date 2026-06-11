# Drip Detailing — Website

Interactive single-page site for Drip Detailing, a mobile car detailing
business serving the North West, UK. A 3D car (three.js) transforms from
dusty to showroom shine as you scroll (GSAP ScrollTrigger), echoing the
brand promise: **bring back the shine**.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build for production

```bash
npm run build    # outputs static site to dist/
npm run preview  # serve the production build locally
```

The build is fully static — host `dist/` anywhere (GitHub Pages, Netlify,
Cloudflare Pages). Relative asset paths are already configured.

## Things to update

- **WhatsApp number**: in `index.html`, replace `447000000000` in the
  `wa.me` link with the real number (country code, no `+`).
- **Services & prices**: all content lives in `index.html`.
- **3D model**: `public/models/car.glb` — Ferrari 458 Italia by
  [vicent091036](https://sketchfab.com/vicent091036) (CC BY, credited in
  the footer). Swap for any DRACO-compressed glTF with nodes named
  `body`, `glass`, `rim_*`, `trim`.

## Stack

- [Vite](https://vitejs.dev) — dev server & static build
- [GSAP + ScrollTrigger](https://gsap.com) — scroll choreography, reveals
- [three.js](https://threejs.org) — 3D car, particles, lighting

Accessibility & compatibility: native scrolling (no scroll-hijack),
`prefers-reduced-motion` honoured (static layout, no pinning), WebGL
failure falls back to a styled static page, verified in Chromium and
WebKit (Safari engine), responsive down to 375px.
