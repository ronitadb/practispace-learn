#!/usr/bin/env node
/* ==========================================================================
   Builds the static site into dist/.

   Run:  npm run build

   What it does, per unit:
     - reads the Claude Design source export from src/units/
     - strips the Claude Design runtime wrappers (<x-dc>, <helmet>,
       support.js, the thumbnail template, the empty component script)
     - keeps the authored markup exactly as it is
     - wraps it in a proper HTML document with title, description, canonical
       URL and social card tags
     - swaps the footer mailto: for the contact page
     - adds a back-to-index link at the top and previous/next at the foot
     - writes it to  dist/<slug>/index.html  so the URL is  /<slug>

   No dependencies. Node's standard library only.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const { site, units, upcoming } = require('./units');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

function write(relPath, contents) {
  const full = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

/* -------------------------------------------------------------------------
   Extract the authored markup from a Claude Design export.

   The export looks like:
       <body>
         <x-dc>
           <helmet> ...fonts and global CSS... </helmet>
           <template id="__bundler_thumbnail"> ... </template>
           ...the actual page...
           <script type="text/x-dc"> ...empty component... </script>
         </x-dc>
       </body>

   Everything the page needs is between </helmet> and </x-dc>. The helmet CSS
   is identical across units and lives in src/styles/base.css instead.

   Tolerant of files that have already been stripped by hand.
   ------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------
   Extract a unit's own CSS from its <helmet>.

   Each unit carries its own stylesheet, and they are NOT interchangeable:
   Unit 02 defines .f2/.fscroll/.frag at 700px, Unit 03 defines
   --bleed/.sec/.mblock/.recap at 760px, and the two disagree about .col.
   So every unit gets its own stylesheet rather than one shared base.

   @font-face blocks are dropped: a bundled export inlines them pointing at
   bundle-internal asset ids that do not exist once published. The site
   self-hosts Tenor Sans from base.css instead.
   ------------------------------------------------------------------------- */

function extractUnitCss(raw, label) {
  const helmet = raw.match(/<helmet>([\s\S]*?)<\/helmet>/i);
  if (!helmet) return '';

  let css = [...helmet[1].matchAll(/<style>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join('\n');

  // Drop @font-face rules, including any nested braces.
  css = css.replace(/@font-face\s*\{[^}]*\}/gi, '');
  // Tidy the comment left behind by a removed block.
  css = css.replace(/\/\*\s*(cyrillic|latin(-ext)?)\s*\*\//gi, '');

  if (/@font-face|url\(["']?[0-9a-f-]{36}/i.test(css)) {
    throw new Error(`Bundle-internal font reference left in ${label}'s CSS`);
  }
  return css.replace(/\n{3,}/g, '\n\n').trim();
}

function extractBody(raw, label) {
  let html = raw;

  // Prefer the region inside <x-dc>, after </helmet> if there is one.
  const xdc = html.match(/<x-dc>([\s\S]*?)<\/x-dc>/i);
  if (xdc) html = xdc[1];

  const afterHelmet = html.match(/<\/helmet>([\s\S]*)$/i);
  if (afterHelmet) html = afterHelmet[1];

  // Already-stripped file: fall back to <body>.
  if (!xdc && !afterHelmet) {
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (body) html = body[1];
  }

  // Remove runtime leftovers.
  html = html.replace(
    /<template id="__bundler_thumbnail"[\s\S]*?<\/template>/gi,
    ''
  );
  html = html.replace(
    /<script\b[^>]*type=["']text\/x-dc["'][\s\S]*?<\/script>/gi,
    ''
  );
  html = html.replace(/<script\b[^>]*support\.js[\s\S]*?<\/script>/gi, '');

  /* Claude Design conditionals.

     Unit 03B wraps the rail in <sc-if value="{{ showRail }}">, backed by a
     component prop that defaults to true. The site is static, so the default
     is what publishes: unwrap the tag and keep its contents.

     If a future unit ever uses <sc-if> for something that should default to
     hidden, this would publish it anyway — hence the explicit check below,
     which fails the build rather than guessing. */
  const scIf = [...html.matchAll(/<sc-if\b([^>]*)>/gi)];
  for (const m of scIf) {
    if (!/hint-placeholder-val="\{\{\s*true\s*\}\}"/i.test(m[1])) {
      throw new Error(
        `${label}: <sc-if> without an explicit true default — check what it ` +
          `should do before publishing.\n  ${m[0]}`
      );
    }
  }
  html = html.replace(/<\/?sc-if\b[^>]*>/gi, '');

  html = html.trim();

  if (!html) throw new Error(`No markup found in ${label}`);
  if (/<x-dc|<helmet|support\.js/i.test(html)) {
    throw new Error(`Runtime wrapper still present after stripping ${label}`);
  }
  return html;
}

/* -------------------------------------------------------------------------
   Navigation injected into each unit page.
   Both anchors below exist exactly once in every authored unit.
   ------------------------------------------------------------------------- */

const TOP_RULE = '<div style="height:8px;background:#C8102E;"></div>';
const FOOTER_OPEN =
  '<div style="margin-top:44px;border-top:1px solid #e2dad2;padding-top:22px;';

function topNav() {
  return `${TOP_RULE}
<nav class="ps-topnav"><a href="/">&#8592; All units</a></nav>`;
}

function unitNav(prev, next) {
  const slot = (unit, dir) => {
    if (!unit) return '<div class="ps-unitnav-slot"></div>';
    const label = dir === 'prev' ? '&#8592; Previous' : 'Next &#8594;';
    return `<div class="ps-unitnav-slot${dir === 'next' ? ' is-next' : ''}">
        <a class="ps-unitnav-link" href="/${unit.slug}/">
          <span class="ps-unitnav-label">${label}</span>
          <span class="ps-unitnav-title">${esc(unit.title)}</span>
        </a>
      </div>`;
  };

  return `<nav class="ps-unitnav">
      ${slot(prev, 'prev')}
      <div class="ps-unitnav-slot is-index">
        <a class="ps-unitnav-allunits" href="/">All units</a>
      </div>
      ${slot(next, 'next')}
    </nav>
    `;
}

/* -------------------------------------------------------------------------
   The document shell
   ------------------------------------------------------------------------- */

function shell({ title, description, canonical, bodyHtml, pageTitle, image, unitCssHref }) {
  const ogImage = `${site.origin}/assets/img/${image || 'social-card.png'}`;
  return `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

${
  site.googleSiteVerification
    ? `<meta name="google-site-verification" content="${esc(
        site.googleSiteVerification
      )}">\n`
    : ''
}<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">

<meta property="og:type" content="article">
<meta property="og:site_name" content="${esc(site.title)} &#183; PractiSpace">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${esc(pageTitle || title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:secure_url" content="${ogImage}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(
    (pageTitle || title).includes('PractiSpace')
      ? pageTitle || title
      : `${pageTitle || title} — PractiSpace`
  )}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(pageTitle || title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">

<link rel="preload" href="/assets/fonts/tenor-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/styles/base.css">${
  unitCssHref ? `\n<link rel="stylesheet" href="${unitCssHref}">` : ''
}
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
</head>
<body>
${bodyHtml}
</body>
</html>
`;
}

/* -------------------------------------------------------------------------
   Build a unit page
   ------------------------------------------------------------------------- */

function buildUnit(unit, prev, next) {
  const file = path.join(SRC, 'units', unit.file);
  if (!fs.existsSync(file)) {
    throw new Error(
      `Unit "${unit.title}" points at src/units/${unit.file}, which does not exist.`
    );
  }

  const raw = fs.readFileSync(file, 'utf8');

  // The unit's own CSS, published beside the page.
  const unitCss = extractUnitCss(raw, unit.file);
  let unitCssHref = null;
  if (unitCss) {
    unitCssHref = `/assets/styles/unit-${unit.slug}.css`;
    write(
      path.join('assets', 'styles', `unit-${unit.slug}.css`),
      `/* ${unit.title} — authored in Claude Design, extracted from the\n` +
        `   unit's <helmet> at build time. Do not edit by hand. */\n\n${unitCss}\n`
    );
  }

  let body = extractBody(raw, unit.file);

  // Back-to-index link under the red top rule.
  if (!body.includes(TOP_RULE)) {
    throw new Error(
      `Could not find the red top rule in ${unit.file} — cannot place the ` +
        `back-to-index link. Expected: ${TOP_RULE}`
    );
  }
  body = body.replace(TOP_RULE, topNav());

  // Previous / next, immediately above the PractiSpace footer.
  const footerAt = body.indexOf(FOOTER_OPEN);
  if (footerAt === -1) {
    throw new Error(
      `Could not find the footer block in ${unit.file} — cannot place the ` +
        `previous/next navigation.`
    );
  }
  body = body.slice(0, footerAt) + unitNav(prev, next) + body.slice(footerAt);

  // Footer email goes to the contact page instead of exposing the address.
  body = body.replace(
    /<a href="mailto:[^"]*">[^<]*<\/a>/gi,
    `<a href="${site.contactUrl}">Get in touch</a>`
  );

  const title = `${unit.title} — ${site.title} · PractiSpace`;

  write(
    path.join(unit.slug, 'index.html'),
    shell({
      title,
      pageTitle: unit.title,
      description: unit.description,
      canonical: `${site.origin}/${unit.slug}/`,
      image: `social-${unit.slug}.png`,
      unitCssHref,
      bodyHtml: body,
    })
  );

  return `/${unit.slug}/`;
}

/* -------------------------------------------------------------------------
   Build the index page
   ------------------------------------------------------------------------- */

function buildIndex() {
  // A unit with no number stands outside the numbered sequence, so its card
  // drops the numeral column rather than leaving a gap where one would be.
  const card = (u) => `
        <a class="ps-unitcard${u.number ? '' : ' is-unnumbered'}" href="/${u.slug}/">
          ${u.number ? `<span class="ps-unitcard-num">${esc(u.number)}</span>` : ''}
          <span>
            <span class="ps-unitcard-title">${esc(u.title)}</span>
            <span class="ps-unitcard-sub">${esc(u.subtitle)}</span>
          </span>
        </a>`;

  const upcomingCard = (u) => `
        <div class="ps-unitcard is-upcoming">
          <span class="ps-unitcard-num">${esc(u.number)}</span>
          <span>
            <span class="ps-unitcard-title">${esc(u.title)}</span>
            <span class="ps-unitcard-sub">In preparation</span>
          </span>
        </div>`;

  const body = `
<div style="background:#f5f2f0;min-height:100vh;">
  <div style="height:8px;background:#C8102E;"></div>

  <div class="ps-index-wrap">

    <div class="ps-index-head">
      <div class="ps-wordmark">Practi<span>Space</span></div>
      <div class="ps-eyebrow">Working with ACC</div>
    </div>

    <h1 class="ps-index-title">Working with ACC</h1>
    <div class="ps-index-sub">${esc(site.tagline)}</div>
    <div class="ps-index-rule"></div>

    <p class="ps-index-intro">These learning units are here to help psychologists work confidently within ACC&#8217;s Psychological Services contract, usually called <strong>PSB</strong>. They are not clinical training. They cover the part that is specific to working within an ACC-funded service: who it is for, what ACC is asking of you, and how your clinical work is communicated back to ACC.</p>
    <p class="ps-index-intro">Read them in order the first time. After that they stand alone, and you can come back to whichever one you need.</p>

    <div class="ps-unitlist">
${units.map(card).join('\n')}${
    upcoming.length ? '\n' + upcoming.map(upcomingCard).join('\n') : ''
  }
    </div>

    <p class="ps-index-intro">Further units in this series are in preparation.</p>

    <div class="ps-index-footer">
      <p><span class="ps-strong">PractiSpace Limited</span> &#8212; a contracted supplier to ACC under the Psychological Services (PSB) contract. We manage referrals, purchase orders and ACC correspondence so that providers can concentrate on clinical work.</p>
      <div>
        <div class="ps-strong">Ronit Adiv, Clinical Psychologist</div>
        <div class="ps-strong">Managing Director, PractiSpace Limited</div>
        <div style="margin-top:6px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <a href="${site.contactUrl}">Get in touch</a>
          <span style="color:#c4bab1;">&#183;</span>
          <a href="${site.mainSiteUrl}">www.practispace.co.nz</a>
        </div>
      </div>
    </div>

  </div>
</div>`;

  write(
    'index.html',
    shell({
      title: `${site.title} — ${site.tagline} · PractiSpace`,
      pageTitle: `${site.title} · PractiSpace`,
      description: site.description,
      canonical: `${site.origin}/`,
      bodyHtml: body,
    })
  );
}

/* -------------------------------------------------------------------------
   robots.txt and sitemap.xml
   ------------------------------------------------------------------------- */

function buildSeoFiles(urls) {
  write(
    'robots.txt',
    `# Everything here is public teaching material — nothing is disallowed.
User-agent: *
Allow: /

Sitemap: ${site.origin}/sitemap.xml
`
  );

  const today = new Date().toISOString().slice(0, 10);
  const entry = (loc, priority) =>
    `  <url>
    <loc>${site.origin}${loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`;

  write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entry('/', '1.0')}
${urls.map((u) => entry(u, '0.8')).join('\n')}
</urlset>
`
  );

  // Tells GitHub Pages not to run the files through Jekyll.
  write('.nojekyll', '');

  // GitHub Pages reads this to keep the custom domain attached. Without it,
  // a deploy can reset the domain back to the github.io address.
  write('CNAME', `${new URL(site.origin).hostname}\n`);

  // Long cache for fingerprint-free static assets; always revalidate HTML.
  // (Used by Cloudflare Pages and Netlify; GitHub Pages ignores it harmlessly.)
  write(
    '_headers',
    `/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=86400

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`
  );
}

/* -------------------------------------------------------------------------
   Go
   ------------------------------------------------------------------------- */

function main() {
  const slugs = new Set();
  for (const u of units) {
    if (!u.slug || !/^[a-z0-9-]+$/.test(u.slug)) {
      throw new Error(`Unit "${u.title}" has a missing or invalid slug.`);
    }
    if (slugs.has(u.slug)) throw new Error(`Duplicate slug: ${u.slug}`);
    slugs.add(u.slug);
  }

  rmrf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'));
  copyDir(path.join(SRC, 'styles'), path.join(DIST, 'assets', 'styles'));

  const urls = units.map((u, i) =>
    buildUnit(u, units[i - 1] || null, units[i + 1] || null)
  );

  buildIndex();
  buildSeoFiles(urls);

  console.log(`\n  Built ${units.length} unit${units.length === 1 ? '' : 's'} into dist/\n`);
  console.log('    /');
  for (const u of urls) console.log(`    ${u}`);

  // Units edited here since their Claude Design export. Re-exporting one of
  // these over the top would lose those edits — see the README.
  const edited = units.filter((u) =>
    fs
      .readFileSync(path.join(SRC, 'units', u.file), 'utf8')
      .includes('THIS FILE HAS BEEN EDITED IN THE REPOSITORY')
  );
  if (edited.length) {
    console.log(
      `\n  Edited here since their Claude Design export — do not overwrite\n` +
        `  with a fresh export without reconciling first:`
    );
    for (const u of edited) console.log(`    ${u.file}`);
  }
  if (upcoming.length) {
    console.log(`\n  Listed as upcoming (no page built): ${upcoming.length}`);
  }
  console.log('');
}

main();
