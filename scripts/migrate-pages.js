// One-shot migrator (idempotent): convert each existing standalone HTML page
// into a template under src/templates/ that uses {{> partial}} references
// for the shared shell (top-bar, main-nav, footer) and links the new CSS layers.
//
// Re-running this script reproduces the same templates verbatim.
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const tplDir = path.join(repo, 'src', 'templates');

const pages = [
  ['index.html',            'home.html',             'home'],
  ['about-us.html',         'about-us.html',         'about-us'],
  ['contact-us.html',       'contact-us.html',       'contact-us'],
  ['careers.html',          'careers.html',          'careers'],
  ['schedule-service.html', 'schedule-service.html', 'schedule-service'],
  ['reviews.html',          'reviews.html',          'reviews'],
];

const cssBlock = (slug) => `  <!-- Fonts: Cabin (headings), Inter (body), Outfit (buttons), Sacramento (script accents) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Sacramento&display=swap" rel="stylesheet" />

  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <!-- Build-pipeline CSS layers -->
  <link rel="stylesheet" href="/css/tokens.css" />
  <link rel="stylesheet" href="/css/globals.css" />
  <link rel="stylesheet" href="/css/components.css" />
  <link rel="stylesheet" href="/css/${slug}.css" />`;

const scriptBlock = `<script src="/js/nav.js"></script>
  <script src="/js/carousel.js"></script>
  <script src="/js/forms.js"></script>
  <script src="/js/faq.js"></script>`;

for (const [src, out, slug] of pages) {
  let html = fs.readFileSync(path.join(repo, src), 'utf8');

  // Replace the original <head> font/css block.
  html = html.replace(
    /  <!-- Fonts[\s\S]*?<link rel="stylesheet" href="styles\.css" \/>/,
    cssBlock(slug)
  );

  // Replace the contents of <header class="site-header" ...>...</header> with partials.
  html = html.replace(
    /(<header class="site-header"[^>]*>)[\s\S]*?(<\/header>)/,
    '$1\n    {{> top-bar}}\n    {{> main-nav}}\n  $2'
  );

  // Replace the <footer>...</footer> block with the footer partial.
  html = html.replace(
    /<footer class="footer"[\s\S]*?<\/footer>/,
    '{{> footer}}'
  );

  // Replace <script src="script.js"></script> with the 4 module scripts.
  html = html.replace(
    /<script src="script\.js"><\/script>/,
    scriptBlock
  );

  // Rewrite asset paths to absolute so they resolve regardless of page depth.
  html = html.replace(/src="assets\//g, 'src="/assets/');
  html = html.replace(/href="assets\//g, 'href="/assets/');

  fs.writeFileSync(path.join(tplDir, out), html);
  console.log(`migrated ${src} -> src/templates/${out}`);
}
