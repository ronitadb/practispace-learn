# Working with ACC — learning units

The static site at **learn.practispace.co.nz**. Public teaching material for
psychologists delivering ACC-funded treatment under the Psychological Services
(PSB) contract.

Separate from the main PractiSpace site, which stays on Webflow at
practispace.co.nz. The two are linked by hand.

---

## Where the content lives — read this before editing a unit

**Once a unit is live, this repository is the copy of record.** Not Claude
Design, and not any markdown draft.

Claude Design is the tool that *creates* a unit and sets how it looks. The
moment that unit ships, the file in `src/units/` becomes the authoritative
version, and every later change — a wording fix, a new sub-section — is made
here.

This matters because of what happens otherwise:

> Re-exporting a unit from Claude Design overwrites the file in `src/units/`
> with whatever Claude Design last knew. Any edit made here since then is
> silently lost.

So: **do not drop a fresh Claude Design export over a unit that has been
edited here.** Files that carry repo-side edits say so in an HTML comment at
the top — that comment never reaches the published page.

Markdown drafts are fine for writing and revising text, but they cannot be the
source the site is built from: markdown does not carry the design. The callout
box label "Moving towards assessment work", the four white profile cards, the
bordered comparison tables — none of those survive a round trip through
markdown. Use markdown to decide what the words should say, then make the
change here.

If you ever do need to take a unit back into Claude Design to rework its
design, reconcile it by hand first: apply the repo-side edits there, re-export,
and check the diff before committing.

---

## Adding a unit

1. Export the unit from Claude Design. Save the **source** file — the one that
   still has the `<x-dc>` wrapper — into `src/units/`, named like the others:
   `03-writing-the-action-plan.html`

2. Add an entry to `units.js`, in the position it should be read:

   ```js
   {
     number: '03',
     slug: 'writing-the-action-plan',
     title: 'Writing the Action Plan',
     subtitle: 'What goes in the plan and how ACC reads it',
     description: 'One or two sentences, about 150 characters. This is what ' +
                  'shows under the title in Google results.',
     file: '03-writing-the-action-plan.html',
   },
   ```

3. Generate its social card and rebuild:

   ```bash
   npm run cards && npm run build
   ```

4. Commit and push. Cloudflare rebuilds and publishes automatically.

That is the whole process. Navigation, the index page, the sitemap and
previous/next all update themselves from `units.js`.

### Inserting a unit in the middle

Just put it where it belongs in the array. **URLs come from the `slug`, never
from the number or the position**, so inserting a unit does not change anyone
else's URL and does not break a link someone has saved or shared.

If you renumber the printed unit numbers, remember that the number is baked
into the authored markup too — the left rail and the "UNIT 0X" line come from
the Claude Design file, not from `units.js`.

### A unit that isn't ready yet

Add it to the `upcoming` array in `units.js` with just a number and title. It
appears on the index greyed out, and no page is built for it.

---

## Writing a good description

The `description` is what Google shows under the title, and what appears in the
WhatsApp preview card. Aim for roughly 150 characters, written for a
psychologist who does not yet know this material exists.

Name the actual forms and codes — `ACC265`, `ACC266`, `PSY50`, "Purchase
Order", "Recovery Partner". Very little plain-language material about this
contract exists online, so those specific terms are how people will find the
pages.

---

## Commands

```bash
npm run build     # build the site into dist/
npm run cards     # regenerate the social preview images (needs Chrome)
npm run serve     # build, then serve dist/ at http://localhost:8080
```

`npm run cards` only needs re-running when you add a unit or change a title.
The generated PNGs are committed, so a normal build does not need Chrome.

There are no dependencies to install.

---

## How it is put together

```
units.js              the unit list — the only file you normally edit
build.js              assembles dist/
tools/social-cards.js renders the WhatsApp/LinkedIn preview images
src/units/            Claude Design source exports, untouched
src/styles/base.css   design system + site additions
src/assets/           fonts, images
dist/                 build output — not committed
```

The build strips the Claude Design runtime wrappers and keeps the authored
markup exactly as it is, then wraps it in a proper HTML document with the
title, description, canonical URL and social card tags, and adds the
navigation. **The design is not modified.**

### The one deliberate change to how a unit renders

`src/styles/base.css`, Part 4. The referral tables are authored as fixed
five-column grids. Below about 640px that left roughly 35px of text per column,
which clipped the column headings and made long words overlap the next column.
The table now scrolls sideways inside its own card instead, keeping its
authored shape — which also keeps it looking like the ACC form it is teaching
people to read.

Nothing in that rule applies above 640px, so the desktop design is untouched.

### Other things the build does

- Self-hosts Tenor Sans instead of calling Google Fonts. Faster, no
  third-party request, no flash of fallback type.
- Replaces the footer `mailto:` with a link to the contact page, so the email
  address is not published for scrapers to harvest.
- Writes `robots.txt` (nothing disallowed) and `sitemap.xml`.

---

## Deploying

The site is hosted on **Cloudflare Pages**. DNS for practispace.co.nz stays at
Discount Domains; only one record is added there.

### First time

1. Push this repository to GitHub.

2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and select the repository.

3. Build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

   Deploy. The site goes live at `something.pages.dev`.

4. In the project → **Custom domains** → **Set up a domain** → enter
   `learn.practispace.co.nz`. Cloudflare shows you the CNAME target.

5. Add that one record at Discount Domains — see below.

### The DNS record

Add **one** record. Change nothing else.

| Field | Value |
| --- | --- |
| Type | `CNAME` |
| Host / Name | `learn` |
| Points to / Value | `<your-project>.pages.dev` |
| TTL | default (3600) |

`<your-project>.pages.dev` is the exact target Cloudflare shows in step 4.

Some registrars want the host as the full name — if Discount Domains rejects
`learn`, use `learn.practispace.co.nz`.

**Leave every existing record alone.** The Webflow records that must not
change are the `A` records on the root/apex `@` and the `CNAME` on `www`.
Touching those takes the main site down.

DNS usually propagates in 15–60 minutes. Cloudflare issues the HTTPS
certificate automatically once it sees the record.

Check it with:

```bash
dig learn.practispace.co.nz CNAME +short
```

### After that

Every push to the default branch rebuilds and republishes. Nothing else to do.

---

## Notes

- Everything here is public. **No client information of any kind belongs on
  this site** — no names, no claim numbers, no referral content. The worked
  examples in the units are invented people, and any future example must be
  too.
- WhatsApp caches link previews hard, and there is no official way to clear
  them. If a preview ever needs forcing, share the URL with `?v=2` on the end —
  it is treated as a new link and serves the same page.
