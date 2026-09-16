# ACC Training Units 01–02 — handoff

## Files
- `Unit-01-Working-Under-the-PSB-Contract.html` — standalone, self-contained. Open in a browser to see the finished page exactly as designed. All fonts/assets inlined; no server needed.
- `Unit-02-Reading-an-ACC-Referral.html` — same, for Unit 02.
- `source/Unit-01.source.html`, `source/Unit-02.source.html` — the authoring source. **Read these when porting to the site.** Everything between `<x-dc>` and `</x-dc>` is ordinary HTML with inline styles; the `<helmet>` block holds the font links and the few global rules (body reset, `@page`, print rules). Strip the `<x-dc>`/`<helmet>` wrappers and the `support.js` script tag — nothing else in the markup depends on the runtime.

## Design system (keep consistent across units)
- Type: **Tenor Sans** (Google Fonts) for everything.
- Colours: background `#f5f2f0`, ink `#2d2d2d`, muted `#8a827a` / `#b3aaa2`, rule `#ddd4cb`, accent red `#C8102E`, rail `#eae3dc`.
- Left fixed rail (48px): unit number in accent red, vertical unit title, "PractiSpace" at the foot. Hidden under 850px and in print.
- Body column is centred and max-width constrained — reflow, don't fix widths.
- Marginal blockquotes sit narrower and offset into the outer margin.

## Notes for the site build
- Pages are print-ready as authored (`@page { margin: 14mm }`, colour-exact print rules). Preserve the print styles if the site offers a download/print view.
- The rail is decorative navigation; on the site it can become real inter-unit navigation (Units 01–07 plus Unit 03A).
- Units 03–07 exist in the same series and will follow in the same visual language.
