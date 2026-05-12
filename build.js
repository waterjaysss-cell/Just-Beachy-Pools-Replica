#!/usr/bin/env node
/* =========================================================================
   Just Beachy Pools — static-site build pipeline (zero-dep, vanilla Node).
   Reads:    src/templates/ src/partials/ src/content/ src/css/ src/js/ src/assets/
   Writes:   dist/<route>/index.html  (prod)   |   dist/<route>.html  (local)
             dist/css/ dist/js/ dist/assets/ dist/sitemap.xml

   Env vars:
     URL_MODE=local  (default)  — flat .html output; href "/foo/" → "/foo.html"
     URL_MODE=prod              — nested /foo/index.html; href stays "/foo/"
   ========================================================================= */
'use strict';

const fs   = require('fs');
const path = require('path');

const URL_MODE = process.env.URL_MODE === 'prod' ? 'prod' : 'local';
const ROOT     = __dirname;
const SRC      = path.join(ROOT, 'src');
const DIST     = path.join(ROOT, 'dist');

/* ------------------------------------------------------------------------ */
/* Filesystem helpers                                                       */
/* ------------------------------------------------------------------------ */
function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function writeFile(p, body) {
  mkdirp(path.dirname(p));
  fs.writeFileSync(p, body);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  mkdirp(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/* ------------------------------------------------------------------------ */
/* Content loaders                                                          */
/* ------------------------------------------------------------------------ */
function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(SRC, 'content', name), 'utf8'));
}
function loadCsv(name) {
  const text = fs.readFileSync(path.join(SRC, 'content', name), 'utf8').trim();
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const headers = lines.shift().split(',').map((h) => h.trim());
  return lines.filter(Boolean).map((line) => {
    // Simple CSV (no quoted commas — adequate for our hand-edited sheets)
    const cells = line.split(',').map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] || ''; });
    return row;
  });
}
function loadPartials() {
  const dir = path.join(SRC, 'partials');
  const map = {};
  if (!fs.existsSync(dir)) return map;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.html')) {
      map[f.replace(/\.html$/, '')] = fs.readFileSync(path.join(dir, f), 'utf8');
    }
  }
  return map;
}

/* ------------------------------------------------------------------------ */
/* Rendering                                                                */
/* ------------------------------------------------------------------------ */
function lookup(ctx, dottedKey) {
  const parts = dottedKey.split('.');
  let cur = ctx;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function inlinePartials(html, partials) {
  // Resolve {{> name}} recursively (with a guard against runaway recursion).
  for (let i = 0; i < 16; i++) {
    if (!/\{\{>\s*[\w-]+\s*\}\}/.test(html)) return html;
    html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
      if (!(name in partials)) {
        throw new Error(`Unknown partial "{{> ${name}}}".`);
      }
      return partials[name];
    });
  }
  throw new Error('Partial inclusion depth limit hit (cycle?).');
}

function substitute(html, context) {
  // Replace {{key.path}} with looked-up value. Anything starting with `>` was
  // already handled in inlinePartials.
  return html.replace(/\{\{\s*([a-zA-Z_][\w.]*)\s*\}\}/g, (m, key) => {
    const v = lookup(context, key);
    if (v == null) return m; // leave for the unresolved-check pass
    return String(v);
  });
}

function rewriteLinks(html) {
  // Rewrite href="/path/" and href="/path" so they point at real output files.
  // Leaves external URLs, mailto:, tel:, #anchors, .html paths and asset
  // paths alone.
  return html.replace(/(href|src)="(\/[^"#?]*)(\?[^"#]*)?(#[^"]*)?"/g,
    (m, attr, urlPath, query, hash) => {
      query = query || '';
      hash  = hash  || '';
      // Skip anything that is already a concrete file (has an extension).
      if (/\.[a-z0-9]+$/i.test(urlPath)) return m;
      if (URL_MODE === 'prod') {
        if (!urlPath.endsWith('/')) urlPath += '/';
        return `${attr}="${urlPath}${query}${hash}"`;
      }
      // local: turn "/foo/bar/" into "/foo/bar.html"; "/" → "/index.html"
      let p = urlPath.replace(/\/+$/, '');
      p = p === '' ? '/index.html' : `${p}.html`;
      return `${attr}="${p}${query}${hash}"`;
    });
}

function assertNoUnresolved(html, where) {
  const stray = html.match(/\{\{[^{}]+\}\}/);
  if (stray) {
    throw new Error(`Unresolved placeholder "${stray[0]}" in ${where}.`);
  }
}

function render(template, partials, context, where) {
  let html = inlinePartials(template, partials);
  html = substitute(html, context);
  html = rewriteLinks(html);
  assertNoUnresolved(html, where);
  return html;
}

/* ------------------------------------------------------------------------ */
/* Route planning                                                           */
/* ------------------------------------------------------------------------ */
// Maps template-name → URL path (with trailing slash). Iterated templates are
// listed in `iterated` and resolve route per row.
const SINGLE_ROUTES = {
  'home':            '/',
  'about-us':        '/about-us/',
  'contact-us':      '/contact-us/',
  'careers':         '/careers/',
  'schedule-service':'/schedule-service/',
  'reviews':         '/reviews/',
  'service-area':    '/service-area/',
  'privacy-policy':  '/privacy-policy/',
  'blog-index':      '/news/',
  '404':             '/404/',
};

function urlPathToOutputFile(urlPath) {
  // urlPath is canonical "/foo/bar/" form. Convert to filesystem path under dist.
  if (URL_MODE === 'prod') {
    const trimmed = urlPath.replace(/^\/+|\/+$/g, '');
    return trimmed === '' ? 'index.html' : `${trimmed}/index.html`;
  }
  // local
  const trimmed = urlPath.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? 'index.html' : `${trimmed}.html`;
}

/* ------------------------------------------------------------------------ */
/* Main                                                                     */
/* ------------------------------------------------------------------------ */
function main() {
  const start = Date.now();
  console.log(`[build] URL_MODE=${URL_MODE}`);

  // 1) Clear dist
  rmrf(DIST);
  mkdirp(DIST);

  // 2) Load content + partials
  const site     = loadJson('site.json');
  const hubs     = loadJson('hubs.json').hubs;
  const services = loadJson('services.json').services;
  const cities   = loadJson('cities.json').cities;
  const posts    = loadJson('posts.json').posts;
  const faqs     = loadJson('faqs.json').faqs;
  const cityServices = loadCsv('city-services.csv');
  const partials = loadPartials();

  const baseContext = {
    site:   site.site,
    nav:    site.nav,
    footer: site.footer,
    cities,
    hubs,
    services,
    posts,
    faqs,
    cityServices,
  };

  // 3) Discover templates
  const tplDir = path.join(SRC, 'templates');
  const templates = {};
  for (const f of fs.readdirSync(tplDir)) {
    if (f.endsWith('.html')) {
      templates[f.replace(/\.html$/, '')] = fs.readFileSync(path.join(tplDir, f), 'utf8');
    }
  }

  // 4) Build the render queue: array of { tplName, outFile, page }
  const jobs = [];

  for (const [name, urlPath] of Object.entries(SINGLE_ROUTES)) {
    if (!templates[name]) continue;
    jobs.push({
      tplName: name,
      outFile: urlPathToOutputFile(urlPath),
      urlPath,
      page: { slug: name, url: urlPath, h1: '' },
    });
  }

  if (templates['service-hub']) {
    for (const hub of hubs) {
      const urlPath = `/${hub.slug}/`;
      jobs.push({
        tplName: 'service-hub',
        outFile: urlPathToOutputFile(urlPath),
        urlPath,
        page: Object.assign({ url: urlPath }, hub),
      });
    }
  }
  if (templates['individual-service']) {
    for (const svc of services) {
      const urlPath = `/${svc.hub_slug}/${svc.slug}/`;
      jobs.push({
        tplName: 'individual-service',
        outFile: urlPathToOutputFile(urlPath),
        urlPath,
        page: Object.assign({ url: urlPath }, svc),
      });
    }
  }
  if (templates['city-landing']) {
    for (const row of cityServices) {
      const urlPath = row.url_path && row.url_path.startsWith('/') ? row.url_path : `/${row.url_path || ''}`;
      jobs.push({
        tplName: 'city-landing',
        outFile: urlPathToOutputFile(urlPath),
        urlPath,
        page: Object.assign({ url: urlPath }, row),
      });
    }
  }
  if (templates['blog-post']) {
    for (const post of posts) {
      const urlPath = `/${post.slug}/`;
      jobs.push({
        tplName: 'blog-post',
        outFile: urlPathToOutputFile(urlPath),
        urlPath,
        page: Object.assign({ url: urlPath }, post),
      });
    }
  }

  // 5) Render each job
  const sitemapUrls = [];
  jobs.forEach((job, i) => {
    const tpl = templates[job.tplName];
    const ctx = Object.assign({}, baseContext, { page: job.page });
    const html = render(tpl, partials, ctx, `${job.tplName} → ${job.outFile}`);
    const outPath = path.join(DIST, job.outFile);
    writeFile(outPath, html);
    sitemapUrls.push(job.urlPath);
    console.log(`[${String(i + 1).padStart(3, ' ')}/${jobs.length}] /dist/${job.outFile}`);
  });

  // 6) Copy static directories verbatim
  copyDir(path.join(SRC, 'css'),    path.join(DIST, 'css'));
  copyDir(path.join(SRC, 'js'),     path.join(DIST, 'js'));
  copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'));

  // 7) Sitemap (canonical prod URLs regardless of URL_MODE)
  const origin = `https://${site.site.domain_prod}`;
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapUrls.map((u) => `  <url><loc>${origin}${u}</loc></url>`).join('\n') +
    `\n</urlset>\n`;
  writeFile(path.join(DIST, 'sitemap.xml'), sitemap);

  const dur = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`[build] wrote ${jobs.length} pages + sitemap.xml in ${dur}s`);
}

try {
  main();
} catch (e) {
  console.error(`[build] FAILED: ${e.message}`);
  process.exit(1);
}
