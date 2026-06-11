# Drip Detailing — Website Design Spec

**Date:** 2026-06-11
**Status:** Approved by owner (via design Q&A)

## Goal

A single-page, scroll-driven marketing site for Drip Detailing, a mobile car
detailing business serving the North West, UK. The site must feel premium,
interactive and different — inspired by vectrfl.com's dark, bold, numbered
scroll-story aesthetic — while staying true to the brand's black + neon lime
green, graffiti-accent identity.

## Brand

- **Name:** DRIP DETAILING — "Bring back the shine"
- **Colours:** near-black background (#0a0a0a), neon lime green accent
  (~#b4f000), white type
- **Voice:** confident, street-smart. Tagline: "We don't cut corners, we
  perfect them."
- **Socials:** Instagram @mobile.dripdetailing, TikTok @mobiledripdetailing

## Centerpiece

A realistic free-licence glTF car model rendered with three.js, bundled into
the site (optimised, DRACO-compressed). On scroll the car transforms from
dull/matte to glossy showroom shine (animated paint material: colour,
roughness, clearcoat) with neon-green foam/drip particle effects — the brand
promise acted out live.

## Page flow

1. **Loader** — neon drip-fill animation over the DRIP wordmark
2. **Hero** — oversized DRIP DETAILING type, 3D car, "BRING BACK THE SHINE",
   scroll prompt
3. **Transformation story (pinned)** — car pinned while numbered stages
   (01–04) wash/vacuum/polish it as the user scrolls
4. **Services & Prices** — 5 cards from the Instagram post:
   - Exterior Wash — from £15 (foam wash, hand wash, rinse & dry, tyre shine, windows)
   - Inside + Outside — from £30 (exterior wash, interior vacuum, dash & surfaces, windows, tyre shine)
   - Full Detail — from £50–100, **MOST POPULAR** (exterior wash, interior deep clean, vacuum & shampoo, dash/trims/vents, windows, tyre shine)
   - Deep Interior — from £30 (seats shampooed, deep vacuum, carpets, trims & panels, odour removal)
   - Monthly Maintenance — from £40 (exterior wash, interior tidy, maintain that shine, priority booking)
   - Note: "Prices may vary depending on the size of the vehicle"
5. **Special Deals** — neon marquee: 10% off first booking, 15% off weekly
   regulars, £10 off refer-a-friend
6. **Why Drip** — mobile service, premium products, attention to detail,
   satisfaction guaranteed → "WE DON'T CUT CORNERS, WE PERFECT THEM."
7. **Book Now** — Instagram DM button (ig.me/m/mobile.dripdetailing) and
   WhatsApp button (placeholder number, owner to supply)
8. **Footer** — socials, "Serving the North West, UK", model attribution if
   licence requires

## Tech

- Vite + vanilla JS/CSS (static build, GitHub Pages friendly)
- GSAP + ScrollTrigger for scroll animation; three.js for 3D
- Native scrolling (no scroll-hijack) for Safari compatibility
- Mobile: capped devicePixelRatio, reduced particle counts, touch-friendly
  CTAs
- `prefers-reduced-motion` respected; static fallback when WebGL unavailable
- Verified in Chrome and Safari, desktop and mobile viewport, before handover

## Out of scope

- CMS/admin, online payments, booking calendar, testimonials/gallery (no
  assets supplied) — all can be added later.
