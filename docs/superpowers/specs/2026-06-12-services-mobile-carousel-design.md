# Services Section — Mobile Swipeable Carousel

## Overview

Convert the `#services` card grid into a horizontally swipeable carousel on mobile (≤768px), with dot indicators and auto-scroll to the Most Popular (Full Detail) card on load. Desktop layout is unchanged.

## Scope

- **Files changed:** `src/style.css`, `src/main.js`
- **No HTML changes required** — dots are injected by JS
- **Breakpoint:** `≤768px` (mobile only)

## Layout

`.services__grid` on mobile becomes a horizontal scroll container:

- `display: flex` (overrides grid)
- `overflow-x: scroll` with hidden scrollbar (`scrollbar-width: none` / `::-webkit-scrollbar`)
- `scroll-snap-type: x mandatory`
- Horizontal padding on the container (`~7.5vw` each side) so card edges peek on both sides

Each `.card`:

- `scroll-snap-align: center`
- `width: 85vw`, `flex-shrink: 0`
- Height remains auto (content-driven)

## Most Popular Card — Initial Scroll Position

On `DOMContentLoaded`, if `window.matchMedia('(max-width: 768px)').matches` and `prefers-reduced-motion` is not set, call:

```js
document.querySelector('.card--popular').scrollIntoView({ behavior: 'instant', inline: 'center' });
```

This snaps the carousel to the Full Detail card without a visible scroll animation.

## Dot Indicators

A `<div class="services__dots">` containing 5 `<button>` elements is injected by JS immediately after `.services__grid`, only when the mobile breakpoint is active.

- Dots are `8px` circles, grey (`var(--grey)`) by default, lime (`var(--lime)`) when active, `12px` when active (slight scale-up)
- The active dot is determined by an `IntersectionObserver` on each `.card` with threshold `0.6` and `root` set to the scroll container — whichever card is ≥60% visible becomes active
- Clicking a dot calls `card.scrollIntoView({ behavior: 'smooth', inline: 'center' })` on the corresponding card
- On resize above 768px, the dots div is removed and the grid reverts to its original CSS grid layout

## Most Popular Ring

`.card--popular` retains its existing lime `border-color` and `glow box-shadow`. The `.card__badge` "Most popular" pill stays absolutely positioned. No changes needed — the existing styles are compatible with the flex carousel layout.

## Accessibility

- Dot `<button>` elements have `aria-label="Go to [card title]"` and `aria-current="true"` on the active dot
- `prefers-reduced-motion`: initial scroll uses `behavior: 'instant'` always; dot clicks use `'instant'` instead of `'smooth'` when reduced motion is preferred

## Desktop

The existing `grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))` layout is entirely untouched. No dot elements exist in the DOM on desktop.
