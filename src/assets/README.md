# /assets

This folder contains the real assets pulled from the live justbeachypools.com site,
plus placeholder slots for the service-card and brand-logo images.

## Folder structure

```
assets/
├── logos/        Brand logos (horizontal, circular, square)
├── hero/         4-image hero slideshow
├── sections/     Backgrounds + trust badges
└── icons/        (empty — reserved for any future icon SVGs)
```

## Downloaded assets

| File                                  | Used by                                    |
| ------------------------------------- | ------------------------------------------ |
| `logos/logo-horizontal.png`           | Main nav + footer                          |
| `logos/logo-circular.png`             | "What We Do Best" overlay badge            |
| `logos/logo-square.png`               | (reserved — favicon / social cards)         |
| `hero/hero-1.jpg` ... `hero-4.jpg`    | Hero crossfade slideshow (5s rotation)     |
| `sections/trust-badges.webp`          | Hero · Trust banner · Estimate form        |
| `sections/reviews-badge.png`          | Reviews section badge strip                |
| `sections/trust-banner-bg.jpg`        | Trust banner (fixed background)            |
| `sections/faq-bg.jpg`                 | FAQ section background                     |
| `sections/what-we-do-photo.png`       | "What We Do Best" right-column photo       |

## To replace later

The service card images currently use `hero-1.jpg` through `hero-4.jpg` (cards 1-4) and two Unsplash URLs (cards 5-6). Replace with proper photography:

```
sections/service-weekly.jpg
sections/service-repairs.jpg
sections/service-installations.jpg
sections/service-green.jpg
sections/service-chemicals.jpg
sections/service-drain.jpg
```

Brand-logo placeholders are currently inline text (Hayward / Jandy / Pentair / Zodiac). Replace with official SVGs:

```
sections/brand-hayward.svg
sections/brand-jandy.svg
sections/brand-pentair.svg
sections/brand-zodiac.svg
```

## Re-running the download

If you need to re-fetch the live assets, run from inside `assets/`:

```bash
curl -o logos/logo-horizontal.png "https://justbeachypools.com/wp-content/uploads/elementor/thumbs/Just-Beachy-Pools-Horzontal-r7qr3tli68cpnja5jurr6679370j2z69hl7tw1mwow.png"
curl -o logos/logo-circular.png "https://justbeachypools.com/wp-content/uploads/2025/06/logo-light-bue-transparent.png"
curl -o logos/logo-square.png "https://justbeachypools.com/wp-content/uploads/2025/06/cropped-logo-light-bue-transparent.png"

curl -o hero/hero-1.jpg "https://justbeachypools.com/wp-content/uploads/2025/08/AdobeStock_1028162746-scaled.jpeg"
curl -o hero/hero-2.jpg "https://justbeachypools.com/wp-content/uploads/2025/07/978b752f-id0021-img_2174-1-scaled.jpg"
curl -o hero/hero-3.jpg "https://justbeachypools.com/wp-content/uploads/2025/08/AdobeStock_1028162676-scaled.jpeg"
curl -o hero/hero-4.jpg "https://justbeachypools.com/wp-content/uploads/2025/08/AdobeStock_1227833560-scaled.jpeg"

curl -o sections/trust-badges.webp "https://justbeachypools.com/wp-content/uploads/2024/01/JJ-TRUST.png.webp"
curl -o sections/reviews-badge.png "https://justbeachypools.com/wp-content/uploads/2023/12/REVIEWS-BADGE-1.png"
curl -o sections/trust-banner-bg.jpg "https://justbeachypools.com/wp-content/uploads/2025/05/AdobeStock_235136282-scaled.jpeg"
curl -o sections/faq-bg.jpg "https://justbeachypools.com/wp-content/uploads/2025/05/AdobeStock_116633511-scaled.jpeg"
curl -o sections/what-we-do-photo.png "https://justbeachypools.com/wp-content/uploads/2025/06/Screenshot-2025-05-31-100204.png"
```
