#!/usr/bin/env node
/**
 * Static template builder for Just Beachy Pools.
 *
 * Reads src/templates/individual-service.html and src/content/services.json,
 * renders one HTML page per service entry, writes to
 * <hub_slug>/<slug>/index.html at the repo root.
 *
 * Supports a small Handlebars-like syntax:
 *   {{var}}                resolved against the context; supports dotted paths.
 *   {{> partial}}          inlines src/partials/<partial>.html (recursive).
 *   {{#each path}}…{{/each}} repeats the inner block once per array item,
 *                          with each item pushed onto the context stack.
 *
 * Zero external dependencies. Node 18+.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const TEMPLATE = path.join(SRC, 'templates', 'individual-service.html');
const PARTIALS = path.join(SRC, 'partials');
const SERVICES = path.join(SRC, 'content', 'services.json');

// --- tiny template engine -----------------------------------------------------

function loadPartial(name) {
  return fs.readFileSync(path.join(PARTIALS, `${name}.html`), 'utf8');
}

/** Expand all {{> name}} references (recursive). */
function expandPartials(tpl, seen = new Set()) {
  return tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
    if (seen.has(name)) throw new Error(`Circular partial: ${name}`);
    seen.add(name);
    const result = expandPartials(loadPartial(name), seen);
    seen.delete(name);
    return result;
  });
}

/** Resolve a dotted path on the context stack; falls back through parent frames. */
function lookup(stack, expr) {
  if (expr === '.' || expr === 'this') return stack[stack.length - 1];
  const parts = expr.split('.');
  for (let i = stack.length - 1; i >= 0; i--) {
    let cur = stack[i];
    let ok = true;
    for (const p of parts) {
      if (cur == null || !(p in cur)) { ok = false; break; }
      cur = cur[p];
    }
    if (ok) return cur;
  }
  return '';
}

/** Render {{#each ...}}…{{/each}} blocks first (innermost), then {{vars}}. */
function render(tpl, context) {
  // Expand each-blocks (handle nested by repeated passes — innermost matches first).
  const eachRe = /\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/;
  let prev;
  do {
    prev = tpl;
    tpl = tpl.replace(eachRe, (_, expr, body) => {
      const arr = lookup([context], expr);
      if (!Array.isArray(arr)) return '';
      return arr.map(item => render(body, { ...context, _parent: context, ...item })).join('');
    });
  } while (tpl !== prev);

  // Resolve {{var}} — leave {{>...}} alone (already expanded earlier).
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, expr) => {
    const v = lookup([context], expr);
    return v == null ? '' : String(v);
  });
}

// --- build --------------------------------------------------------------------

function rootPrefixFor(hub) {
  // Output sits at <hub>/<slug>/index.html → ../../ back to repo root.
  return '../../';
}

function buildOne(service, template) {
  const context = {
    page: service,
    rootPrefix: rootPrefixFor(service.hub_slug),
  };
  const html = render(template, context);
  const outDir = path.join(ROOT, service.hub_slug, service.slug);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, html);
  return path.relative(ROOT, outPath);
}

function main() {
  const tplRaw = fs.readFileSync(TEMPLATE, 'utf8');
  const tpl = expandPartials(tplRaw);
  const { services } = JSON.parse(fs.readFileSync(SERVICES, 'utf8'));

  if (!Array.isArray(services) || services.length === 0) {
    console.error('No services found in services.json');
    process.exit(1);
  }

  const written = [];
  for (const svc of services) {
    if (!svc.slug || !svc.hub_slug) {
      console.warn(`Skipping entry without slug/hub_slug:`, svc);
      continue;
    }
    written.push(buildOne(svc, tpl));
  }

  console.log(`Built ${written.length} pages:`);
  for (const p of written) console.log('  ' + p);
}

main();
