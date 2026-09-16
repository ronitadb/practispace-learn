#!/usr/bin/env node
/* ==========================================================================
   Generates the social preview images — the cards WhatsApp, LinkedIn and the
   rest show when someone shares a link.

   One card per unit, plus one for the index, rendered at 1200x630 with
   headless Chrome so they use the real Tenor Sans.

   Run:  npm run cards
   Then: npm run build

   You only need to re-run this when you add a unit or change a unit's title.
   The generated PNGs live in src/assets/img/ and are committed, so a normal
   build does not need Chrome.
   ========================================================================== */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { site, units } = require('../units');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'assets', 'img');
const FONT = path.join(ROOT, 'src', 'assets', 'fonts', 'tenor-sans-latin.woff2');

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => fs.existsSync(p));

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function cardHtml({ eyebrow, title, subtitle }) {
  const fontUrl = 'file://' + FONT;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Tenor Sans';
    src: url('${fontUrl}') format('woff2');
    font-weight: 400; font-style: normal;
  }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: 'Tenor Sans', system-ui, sans-serif;
    background: #f5f2f0;
    color: #2d2d2d;
    -webkit-font-smoothing: antialiased;
  }
  .bar { height: 14px; background: #C8102E; }
  .rail {
    position: absolute; left: 0; top: 14px; bottom: 0; width: 76px;
    background: #eae3dc; border-right: 1px solid #ddd4cb;
  }
  .wrap { padding: 68px 90px 0 166px; height: 616px; display: flex; flex-direction: column; }
  .mark { font-size: 30px; letter-spacing: 0.02em; }
  .mark span { color: #C8102E; }
  .eyebrow {
    font-size: 17px; letter-spacing: 0.24em; text-transform: uppercase;
    color: #9a938c; margin-top: 54px;
  }
  h1 {
    font-size: 78px; line-height: 1.1; font-weight: 400; letter-spacing: 0.01em;
    margin-top: 26px; max-width: 900px;
  }
  .rule { width: 210px; height: 4px; background: #C8102E; border-radius: 3px; margin-top: 34px; }
  .sub {
    font-size: 25px; letter-spacing: 0.1em; text-transform: uppercase;
    color: #8a827a; margin-top: 30px; max-width: 830px; line-height: 1.45;
  }
  .foot { margin-top: auto; padding-bottom: 54px; font-size: 19px; letter-spacing: 0.16em;
          text-transform: uppercase; color: #b3aaa2; }
</style></head>
<body>
  <div class="bar"></div>
  <div class="rail"></div>
  <div class="wrap">
    <div class="mark">Practi<span>Space</span></div>
    <div class="eyebrow">${esc(eyebrow)}</div>
    <h1>${esc(title)}</h1>
    <div class="rule"></div>
    <div class="sub">${esc(subtitle)}</div>
    <div class="foot">learn.practispace.co.nz</div>
  </div>
</body></html>`;
}

function render(html, outFile) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ps-card-'));
  const htmlFile = path.join(tmp, 'card.html');
  fs.writeFileSync(htmlFile, html);

  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--allow-file-access-from-files',
      '--window-size=1200,630',
      `--screenshot=${outFile}`,
      'file://' + htmlFile,
    ],
    { stdio: 'pipe' }
  );

  fs.rmSync(tmp, { recursive: true, force: true });
}

function main() {
  if (!CHROME) {
    console.error(
      '\n  Could not find Chrome, Chromium or Edge.\n' +
        '  The cards in src/assets/img/ are already committed, so you can still\n' +
        '  run `npm run build` — you just cannot regenerate them here.\n'
    );
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });

  const cards = [
    {
      name: 'social-card.png',
      eyebrow: 'PractiSpace · Learning units',
      title: site.title,
      subtitle: site.tagline,
    },
    ...units.map((u) => ({
      name: `social-${u.slug}.png`,
      eyebrow: `Working with ACC · Unit ${u.number}`,
      title: u.title,
      subtitle: u.subtitle,
    })),
  ];

  for (const c of cards) {
    const out = path.join(OUT, c.name);
    render(cardHtml(c), out);
    const kb = (fs.statSync(out).size / 1024).toFixed(0);
    console.log(`  ${c.name}  (${kb} KB)`);
  }
  console.log(`\n  ${cards.length} cards written to src/assets/img/\n`);
}

main();
