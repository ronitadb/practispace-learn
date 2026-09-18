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

  // Google Search Console ownership verification.
  //
  // Only needed if the subdomain is NOT already covered by a Domain property
  // for practispace.co.nz — a Domain property includes every subdomain, so
  // check there first.
  //
  // Otherwise: Search Console -> Add property -> URL prefix ->
  // https://learn.practispace.co.nz -> "HTML tag". Google shows a tag like
  //   <meta name="google-site-verification" content="AbC123..." />
  // Paste ONLY the content value here, rebuild, deploy, then press Verify.
  // It must stay in place afterwards or Google will unverify the property.
  googleSiteVerification: '',
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
  {
    number: '03',
    slug: 'treatment-without-a-mental-injury-assessment',
    title: 'Treatment Without a Mental Injury Assessment',
    subtitle: 'Ana\u2019s journey, from referral to completion',
    description:
      'One PSB treatment claim end to end: PSY50 planning, the ACC266 plan, ' +
      'PSY60 treatment blocks, the ACC267 progress report and the ACC268 ' +
      'completion report.',
    file: '03-treatment-without-a-mental-injury-assessment.html',
  },

  {
    number: '3.1',
    slug: 'writing-the-action-plan',
    title: 'Writing the Action Plan',
    subtitle: 'Ana\u2019s ACC266, field by field',
    description:
      'How to write the ACC266 Action Plan, field by field: the treatment ' +
      'goals, the risk field, the hours you are asking for, and what ACC ' +
      'reads it for.',
    file: '3-1-writing-the-action-plan.html',
  },
  {
    number: '3.2',
    slug: 'progress-and-completion-reports',
    title: 'Progress Report & Completion Report',
    subtitle: 'Ana\u2019s ACC267 and ACC268, field by field',
    description:
      'The ACC267 and ACC268 walked together: the fields they share, where ' +
      'the two forms diverge, and what ACC is looking for in each.',
    file: '3-2-progress-and-completion-reports.html',
  },
  {
    number: '07',
    slug: 'non-attendance-dna',
    title: 'Non-Attendance (DNA)',
    subtitle: 'How to handle a no-show',
    description:
      'Claiming the ACC non-attendance fee when a client does not attend: ' +
      'when it can be claimed, appointment reminders, what to send ' +
      'PractiSpace, and how the PSYDNA is arranged.',
    file: '07-non-attendance-dna.html',
  },

  /* Not part of the numbered sequence.

     This one stands outside the stages — it belongs to the clinical-work
     series that has not been written yet, and will move there once that
     series exists. Until then it sits at the end of the list.

     `number` is deliberately absent. A unit without one gets no numeral on
     its index card and no numeral on its social card, which is what marks it
     as standing apart. Keep it LAST in this array: as Unit 3's sub-units and
     Units 4 onwards are added above it, it stays at the bottom. */
  {
    slug: 'risk-assessment',
    title: 'Risk Assessment',
    subtitle: 'The risk assessment on the ACC266',
    description:
      'The risk field on the ACC266 Action Plan: what ACC is asking for, ' +
      'screening and formulation, the language to use, and what to do when ' +
      'the answer is yes.',
    file: 'risk-assessment.html',
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
