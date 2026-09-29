# Development notes

Static site, no build step. Open `index.html` in a browser or upload the folder to any host.
GitHub Pages serves it from the `main` branch root.

## Files

- `index.html` — the whole site: HTML, CSS and JS inline. GSAP 3.12.5 and ScrollTrigger load
  from cdnjs; Playfair Display, Caveat and Outfit load from Google Fonts.
- `img/` — ten generated photos (hero, six burgers, grill, interior, sides) as web-sized JPEGs,
  plus `logo.png` (1075×314, transparent) and `logo-sm.png` (half size, used in the nav).
- `artifact.html` — the same page without the document wrapper, used only for the claude.ai
  preview. Ignored by git.

## Brand tokens

Defined on `:root` at the top of the stylesheet.

| Token | Value | Use |
|---|---|---|
| `--cream` | #FCE0BC | text, sampled from the logo |
| `--rust` | #9C2C0C | fills: buttons, ribbon, cursor, avatars (logo rust) |
| `--gold` | #CF4A22 | small accent text; the true rust is too dark at small sizes |
| `--char` / `--smoke` / `--ash` | #0F0C09 / #1B1612 / #2A231C | page, cards, inputs |
| `--display` | Playfair Display | headings |
| `--hand` | Caveat | accent words inside headings (`h1 em`, `h2 em`) |

## The burger that travels the page

The hero burger is one `position: fixed` element (`#travel`) driven by a scroll-scrubbed GSAP
timeline built in `buildTravel()`. Each waypoint is `{p, s}` where `p` is page progress (0–1) at
which a section's centre reaches the viewport centre and `s` is x, y, scale, spin, 3D tilt. The
last waypoint is the landing ring (`#ctaPad`); after landing the burger moves with the page so it
stays in the ring. The timeline is rebuilt on resize and after `load`.

Inside it: `.travel-3d` takes the rotationX/Y from the timeline, `.travel-float` bobs,
`.travel-tilt` follows the mouse, and the image sits at `translateZ(40px)` over a shadow, an
orbiting ring and steam.

## Other motion

- `.drift` holds the ingredient particles; each scrubs down the page at its own depth and wraps.
- Headings marked `data-split` are split into words that flip up out of a clipped box.
- Cards, accordion slices, steps and sides enter on a perspective hinge; step photos wipe in.
- `.marquee-track` speed follows scroll velocity.
- Everything animated switches off under `prefers-reduced-motion`; static images show instead.
- A `setTimeout` hides the loader after 4.5 s even if a script stalls.

## Data that runs on its own

- `HOURS` (Sun–Sat, 25 = 01:00 next day) drives the open/closed pill, hours table, footer
  clock and the booking time slots.
- `SPECIALS` is one entry per weekday.
- The cart lives in `localStorage` under `re-cart`. Checkout and booking are demo-only: replace
  the two `submit` handlers with a request to your backend or embed an ordering provider.

## Checking a render

Headless Chrome with `--virtual-time-budget` freezes the GSAP loader, so a plain screenshot
shows a stuck loading screen. Either add `--force-prefers-reduced-motion` for a layout check, or
drive the page over the DevTools protocol and scroll before capturing.
