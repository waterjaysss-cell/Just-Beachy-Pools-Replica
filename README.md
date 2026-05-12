# Just Beachy Pools — Homepage (Pixel-Perfect Replica v3)

A 1:1 visual replica of the Just Beachy Pools homepage, built from the live site's exact computed CSS values and using the real asset files pulled from the production site.

## Stack
- **HTML5 / CSS3 / vanilla JS** — open `index.html` and it works
- **Google Fonts** — Cabin (headings) · Inter (body) · Outfit (buttons) · Sacramento (script accents)
- **Font Awesome 6** — icons via CDN
- **Real assets** — logos, hero slideshow, trust badges, and section backgrounds downloaded from the live site

## File tour

```
justbeachy-pools/
├── index.html      14 semantic sections + 2 floating widgets
├── styles.css      design tokens at top, section-by-section CSS, responsive
├── script.js       slideshow · sticky nav · hamburger · accordion · carousel · widget
├── assets/
│   ├── logos/      logo-horizontal · logo-circular · logo-square
│   ├── hero/       hero-1..hero-4 (slideshow images)
│   ├── sections/   trust-badges · reviews-badge · trust-banner-bg · faq-bg · what-we-do-photo
│   └── icons/      reserved
└── README.md
```

## Exact design tokens

| Token              | Value                                       |
| ------------------ | ------------------------------------------- |
| `--color-primary`  | `#0077BC` rgb(0,119,188)                    |
| `--color-heading`  | `#26272C` rgb(38,39,44)                     |
| `--color-body`     | `#676C75` rgb(103,108,117)                  |
| `--color-topbar`   | `#BDE9FB` rgb(189,233,251)                  |
| `--color-orange-start` | `#FCA01A`                               |
| `--color-orange-end`   | `#FF6602`                               |
| `--color-light-blue-bg`| `#D6EEFA`                               |
| `--color-input-bg` | `#F5F5F5` (hero quote form)                 |
| Container          | **1140px** max-width                        |
| Utility bar        | **48px** height                             |
| Main nav           | **115px** height                            |
| Header total       | **163px** (sticky)                          |

## Buttons (.btn-primary)

| Spec        | Value                                                           |
| ----------- | --------------------------------------------------------------- |
| Background  | `linear-gradient(180deg, #FCA01A 0%, #FF6602 100%)`             |
| Color       | `#FFFFFF`                                                       |
| Font        | Outfit, weight 600, uppercase                                   |
| Padding     | `12px 24px`                                                     |
| Radius      | `10px` (`.btn-white-pill` is the only 999px variant)            |
| Box-shadow  | **none**                                                        |
| Small size  | `font-size: 13px`                                               |
| Large size  | `font-size: 20px`                                               |

## Sections

1. Utility bar (`48px`, `#BDE9FB`, contact + socials)
2. Sticky main nav (`115px`, `#0077BC`, real horizontal logo + dropdowns)
3. **Hero** — 4-image slideshow with crossfade (5s rotation, 2s opacity transition), glass quote form
4. What We Do Best — split with checklist + real photo + circular logo overlay
5. Trusted Partner 3-step — over `hero-4.jpg` with blue overlay
6. Reviews carousel with summary card + chevrons + dots + touch swipe
7. Trust banner — `background-attachment: fixed` underwater photo, white pill CTA
8. Specialized Pool Services 3×2 grid — light blue bg, side-by-side card layout, blue check-badge overlapping
9. Brand logos strip (Hayward / Jandy / Pentair / Zodiac)
10. Why Choose Us — 45/55 split with 2×2 cards (orange icon top-LEFT)
11. Service Areas — list + Pasco County map iframe
12. FAQ accordion — faq-bg with `rgba(214,238,250,0.85)` overlay
13. Get Your Free Estimate — dashed blue border, 3-column field grid
14. Footer with 4 columns + bottom strip
- Floating: dismissible Google rating + reCAPTCHA badge

## Behaviors

| Where                | What                                                          |
| -------------------- | ------------------------------------------------------------- |
| Hero                 | 4-image crossfade slideshow, 5s rotation, 2s opacity ease     |
| Anchor links         | Smooth-scroll with scroll-padding for 163px header            |
| Header scroll        | Shadow appears once `scrollY > 40`                            |
| Nav dropdowns        | Open on hover (`ABOUT ▾`, `SERVICES ▾`)                       |
| `< 1023px`           | Hamburger panel slides in from the right                      |
| Reviews carousel     | Auto-advance 6s · chevrons · dots · touch swipe · pause hover |
| FAQ                  | First item open per column · one-open-per-column enforced     |
| Rating widget        | Dismissible via the × button                                  |
| Buttons              | 2px translate-y on hover + darker gradient                    |
| `prefers-reduced-motion` | All transitions + slideshow paused                        |

## Run it locally

```powershell
start index.html
```
```bash
npx serve .
# or
python -m http.server 8080
```

## Push to GitHub

This build is pushed to:
**https://github.com/waterjaysss-cell/Just-Beachy-Pools-Replica**

If you need to push fresh changes:
```bash
git add .
git commit -m "Your message"
git push
```

## Notes on assets

- **Hero slideshow uses real `.jpeg`/`.jpg` files** pulled from justbeachypools.com (see `assets/README.md` for the curl commands to re-fetch).
- **Service card images** for the first 4 cards reuse `hero-1.jpg` through `hero-4.jpg`; the last 2 cards use Unsplash URLs as placeholders. Swap for real photography when available.
- **Brand-logo wordmarks** (Hayward / Jandy / Pentair / Zodiac) are inline text placeholders — download official SVGs from each brand's resources page and drop in `assets/sections/brand-{name}.svg`.

## Next pages

The design tokens at the top of `styles.css` and the header/footer markup in `index.html` are built to be reused. For each new page:
- Reuse the same `:root` CSS variable block
- Reuse the same `<header class="site-header">` and `<footer class="footer">` markup
- Add page-specific styles below the existing CSS using the same `/* ===== n. SECTION ===== */` comment markers
