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

4. Commit and push. GitHub Actions rebuilds and publishes automatically.

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
src/units/            Claude Design exports, untouched
src/styles/base.css   site-wide base + the site's own additions
src/assets/           fonts, images
dist/                 build output — not committed
```

Each unit also gets its own stylesheet. The build lifts the CSS out of that
unit's `<helmet>` and publishes it as `assets/styles/unit-<slug>.css`, loaded
after `base.css`. Units do **not** share one stylesheet: Unit 02 defines
`.f2` / `.fscroll` / `.frag` at 700px, Unit 03 defines `--bleed` / `.sec` /
`.mblock` at 760px, and the two disagree about `.col`. Because this is
automatic, a new export can introduce whatever CSS it likes and nothing is
lost.

The build strips the Claude Design runtime wrappers and keeps the authored
markup exactly as it is, then wraps it in a proper HTML document with the
title, description, canonical URL and social card tags, and adds the
navigation. **The design is not modified.**

### Deliberate changes to how a unit renders

Two rules in `base.css`, both phone-only, both leaving desktop untouched:

- **Part 4** — wide fixed-column tables scroll sideways inside their own card
  rather than clipping their headings. Dormant now that Unit 02's export
  handles its own table with `.fscroll`, but kept for future units.
- **Part 5** — the two-column term/definition tables ("What PSB pays for" in
  Unit 01, "ACC language at a glance" in Unit 02) stack below 600px. Without
  it the definition column gets about 95px, roughly twelve characters a line.
  Scoped to the `minmax(170px,…)` signature, so the four comparison tables in
  Unit 01 are untouched.

### Other things the build does

- Self-hosts Tenor Sans instead of calling Google Fonts. Faster, no
  third-party request, no flash of fallback type.
- Replaces the footer `mailto:` with a link to the contact page, so the email
  address is not published for scrapers to harvest.
- Writes `robots.txt` (nothing disallowed) and `sitemap.xml`.

---

## Google Search Console

The site is built to be indexed: every page has a title, a description, a
canonical URL, and `sitemap.xml` lists them all. Search Console is not required
for Google to find the site, but it makes indexing faster and shows what people
searched for to reach it.

**First check whether it is already covered.** practispace.co.nz is verified
with Google (there is a `google-site-verification` TXT record on the apex). If
that was set up as a **Domain property**, every subdomain is included and
learn.practispace.co.nz is already verified — nothing to do but submit the
sitemap.

If not, add it as a new property:

1. search.google.com/search-console -> **Add property** -> **URL prefix**
2. Enter `https://learn.practispace.co.nz`
3. Choose the **HTML tag** method. Google shows something like
   `<meta name="google-site-verification" content="AbC123..." />`
4. Put the `content` value into `googleSiteVerification` in `units.js`,
   then `npm run build`, commit and push
5. Once the deploy finishes, press **Verify**

Use the HTML tag method rather than the DNS one: DNS changes at Discount
Domains take about an hour to publish, the tag is live as soon as the deploy
finishes.

**Leave the token in place.** Google re-checks it, and removing it unverifies
the property.

### Submitting the sitemap

Once verified: **Sitemaps** in the left menu, enter `sitemap.xml`, Submit.
Do it again after adding a unit only if you want to hurry it along — Google
re-reads the sitemap by itself.

---

## Deploying

Hosted on **GitHub Pages** from `github.com/ronitadb/practispace-learn`.
Every push to `master` runs `.github/workflows/deploy.yml`, which builds and
publishes. Nothing else to do.

The repository is public because GitHub Pages requires that on the free plan.
Everything in it is published on the site anyway.

### DNS

One record at Discount Domains, already in place:

| Field | Value |
| --- | --- |
| Type | `CNAME` |
| Host | `learn` |
| Points to | `ronitadb.github.io` |
| TTL | 3600 |

**Leave every other record alone** — the `www` CNAME to `cdn.webflow.com`, the
apex `A` record, and the Google Workspace `MX` records. Touching those takes
down the main site or the email.

Discount Domains takes up to an hour to publish a zone change. A record that
looks missing is usually just unpublished; check the zone export before
assuming something is wrong.

HTTPS is issued automatically by GitHub and renews itself.

### Checking it

```bash
dig learn.practispace.co.nz CNAME +short
```

## Notes

- Everything here is public. **No client information of any kind belongs on
  this site** — no names, no claim numbers, no referral content. The worked
  examples in the units are invented people, and any future example must be
  too.
- WhatsApp caches link previews hard, and there is no official way to clear
  them. If a preview ever needs forcing, share the URL with `?v=2` on the end —
  it is treated as a new link and serves the same page.
