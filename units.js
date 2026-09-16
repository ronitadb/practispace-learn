/* ==========================================================================
   The unit list.

   THIS IS THE ONLY FILE YOU NEED TO EDIT TO ADD A UNIT.

   To add a unit:
     1. Export it from Claude Design and save the *source* file (the one with
        the <x-dc> wrapper) into  src/units/
     2. Add an entry to `units` below, in the order it should be read.
     3. Run:  npm run build
     4. Deploy.

   Order in this array is the order of the series. Because URLs come from the
   `slug` and never from the number, you can insert a unit anywhere in the list
   without breaking a link anyone has already saved or shared.

   `number` is only what gets printed — it is not used for ordering or URLs.
   ========================================================================== */

const site = {
  // No trailing slash. Used for canonical URLs, the sitemap, and social cards.
  origin: 'https://learn.practispace.co.nz',

  title: 'Working with ACC',
  tagline: 'Learning units for psychologists delivering ACC-funded treatment',

  description:
    "Plain-language learning units for psychologists working under ACC's " +
    'Psychological Services (PSB) contract in New Zealand: referrals, ' +
    'reports, codes and forms.',

  // Where the footer "get in touch" link points.
  contactUrl: 'https://practispace.co.nz/contact-us',
  mainSiteUrl: 'https://www.practispace.co.nz',

  locale: 'en_NZ',
  lang: 'en-NZ',
};

const units = [
  {
    number: '01',
    slug: 'working-under-the-psb-contract',
    title: 'Working Under the PSB Contract',
    subtitle: 'An introduction to the service and to these learning units',
    description:
      "How ACC's Psychological Services (PSB) contract works: who gets " +
      'referred, how PSB differs from the ISSC, and the difference between ' +
      'treatment and assessment.',
    file: '01-working-under-the-psb-contract.html',
  },
  {
    number: '02',
    slug: 'reading-an-acc-referral',
    title: 'Reading an ACC Referral',
    subtitle: 'Understanding what ACC is asking you to do',
    description:
      'How to read an ACC265 referral: Purchase Order and service codes such ' +
      'as PSY50, allocations, service dates, and what the ACC Recovery ' +
      'Partner does.',
    file: '02-reading-an-acc-referral.html',
  },
];

/* Units that are written or in draft but not published yet.

   These appear on the index page greyed out, so readers can see the series
   continues, and no page is built for them. When one is ready, move it up into
   `units` above and give it a `file`.

   Leave the array empty to show nothing. Example entry:

     { number: '03', title: 'Writing the Action Plan' },
*/
const upcoming = [];

module.exports = { site, units, upcoming };
