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

function cardHtml({ eyebrow, title, subtitle, ghost, railLabel }) {
  const fontUrl = 'file://' + FONT;
  // Long titles come down in size, and are given more of the card's width by
  // pushing the ghost further out — otherwise a four-line title overflows the
  // 630px card and pushes the rule and the URL off the bottom.
  const len = title.length;
  const titleSize = len > 40 ? 56 : len > 30 ? 66 : len > 22 ? 74 : 82;
  const wrapRight = len > 40 ? 380 : 470;
  // The ghost is sized so a longer mark ("ACC") stays clear of the text block
  // instead of running underneath it the way a two-digit number can.
  const ghostSize = ghost.length >= 3 ? 250 : 440;
  const ghostRight = ghost.length >= 3 ? -28 : -46;
  const echoRight = ghost.length >= 3 ? 38 : 62;
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
    position: relative;
  }

  .bar { height: 14px; background: #C8102E; }

  /* The unit rail, as on the page itself. */
  .rail {
    position: absolute; left: 0; top: 14px; bottom: 0; width: 84px;
    background: #eae3dc; border-right: 1px solid #ddd4cb;
    display: flex; flex-direction: column; align-items: center;
    justify-content: space-between; padding: 40px 0 46px;
  }
  .rail-num { font-size: 27px; color: #C8102E; letter-spacing: 0.02em; }
  .rail-tick { width: 1px; height: 44px; background: #C8102E; margin-top: 14px; }
  .rail-top { display: flex; flex-direction: column; align-items: center; }
  .rail-label {
    writing-mode: vertical-rl; transform: rotate(180deg);
    font-size: 15px; letter-spacing: 0.3em; text-transform: uppercase;
    color: #b3aaa2; white-space: nowrap;
  }

  /* The oversized numeral, bleeding off the right edge. */
  .ghost {
    position: absolute; right: ${ghostRight}px; top: 50%; transform: translateY(-50%);
    font-size: ${ghostSize}px; line-height: 0.78; color: #C8102E; opacity: 0.07;
    letter-spacing: -0.02em; user-select: none;
  }
  /* A second, softer echo behind it for depth. */
  .ghost-echo {
    position: absolute; right: ${echoRight}px; top: 50%; transform: translateY(-50%);
    font-size: ${ghostSize}px; line-height: 0.78; color: #8a827a; opacity: 0.05;
    letter-spacing: -0.02em;
  }

  .wrap {
    position: relative; z-index: 2;
    padding: 64px ${wrapRight}px 0 150px; height: 616px;
    display: flex; flex-direction: column;
  }
  .mark { font-size: 29px; letter-spacing: 0.02em; }
  .mark span { color: #C8102E; }
  .eyebrow {
    font-size: 16px; letter-spacing: 0.26em; text-transform: uppercase;
    color: #9a938c; margin-top: 50px;
  }
  h1 {
    font-size: ${titleSize}px; line-height: 1.08; font-weight: 400;
    letter-spacing: 0.01em; margin-top: 24px; text-wrap: pretty;
  }
  .rule { width: 200px; height: 4px; background: #C8102E; border-radius: 3px; margin-top: 32px; }
  .sub {
    font-size: 22px; letter-spacing: 0.09em; text-transform: uppercase;
    color: #8a827a; margin-top: 28px; line-height: 1.5; text-wrap: pretty;
  }
  .foot {
    margin-top: auto; padding-bottom: 50px;
    display: flex; align-items: center; gap: 16px;
    font-size: 18px; letter-spacing: 0.16em; text-transform: uppercase; color: #b3aaa2;
    white-space: nowrap;
  }
  .foot-dot { width: 5px; height: 5px; border-radius: 50%; background: #C8102E; flex: none; }
</style></head>
<body>
  <div class="bar"></div>
  <div class="rail">
    <div class="rail-top">
      <div class="rail-num">${esc(ghost)}</div>
      <div class="rail-tick"></div>
    </div>
    <div class="rail-label">${esc(railLabel)}</div>
  </div>
  <div class="ghost-echo">${esc(ghost)}</div>
  <div class="ghost">${esc(ghost)}</div>
  <div class="wrap">
    <div class="mark">Practi<span>Space</span></div>
    <div class="eyebrow">${esc(eyebrow)}</div>
    <h1>${esc(title)}</h1>
    <div class="rule"></div>
    <div class="sub">${esc(subtitle)}</div>
    <div class="foot"><span class="foot-dot"></span>learn.practispace.co.nz</div>
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
      ghost: 'ACC',
      railLabel: 'The series',
    },
    ...units.map((u) => ({
      name: `social-${u.slug}.png`,
      eyebrow: `Working with ACC · Unit ${u.number}`,
      title: u.title,
      subtitle: u.subtitle,
      ghost: u.number,
      railLabel: `Unit ${u.number}`,
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
