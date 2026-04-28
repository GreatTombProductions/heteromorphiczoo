# Campaign 3 Copy Deliverables

*Produced by: Aqua (Session 29, post-council ace0e247)*
*Campaign: heteromorphiczoo-3, Phase: copy-deliverables*
*Depends on: voice-spec.md (register), ai-policy-text.md (register), copy.ts (existing patterns)*
*Informed by: Nigredo presave intelligence (2026-04-hz-presave-intelligence.md), Kazuma heist 011 (presave UX + card generator)*
*Feeds: Narberal (copy-lint), Rubedo (build-presave, build-card, build-intake)*
*LAST_PROJECTED: 2026-04-29*

---

## Implementation Notes

This document contains **complete copy** for three surfaces. Implementation sessions should treat these as source text — the words that appear on the site or feed into components. All strings below are written for `copy.ts` integration (or a new section of it). The register is consistent with the existing `copy.ts` patterns: liturgical, declarative, stained-glass luminous.

**Register verification:** Apply the same checklist from ai-policy-text.md. If any sentence could appear on a SaaS landing page, rewrite it. If any sentence apologizes, hedges, or uses the word "content," rewrite it.

---

## Deliverable 1: Pre-Save Page Copy (`/presave/benediction`)

### Context

The pre-save page is the first point of contact for many visitors. It exists inside the cathedral. Atmosphere first, capture second. Album art dominates — the form is secondary. The page works before AND after release: pre-release it captures email + platform preference; post-release the same URL shows streaming links. One URL forever.

Phase 1 is email notification only (no Spotify OAuth). Fan gives email and platform preference. Two emails follow: confirmation on pre-save, notification on release day with platform-specific deep links.

The Menagerie funnel begins here. Pre-save awards 10 DP. The founding window (1.5× multiplier) is active through 2026-07-28.

### copy.ts Integration

```typescript
/* ============================================================
   Pre-Save — /presave/[release]
   ============================================================ */

export const PRESAVE = {
  /* --- Page Frame --- */
  headline: "Benediction",
  subheadline: "feat. Coty Garcia",
  releaseDate: "2026",  // Replace with exact date when known from distributor
  countdownLabel: "arrives",  // renders as "Benediction arrives in X days"

  /* --- Atmospheric Text (below artwork, above form) --- */
  atmosphericLine: "A blessing spoken in two voices. The congregation appoints a new speaker.",
  // Reuses BENEDICTION.body intentionally — the presave IS the Benediction page pre-release.

  /* --- Platform Selection --- */
  platformPrompt: "Where do you listen?",
  platforms: {
    spotify: "Spotify",
    apple: "Apple Music",
    youtube: "YouTube Music",
    bandcamp: "Bandcamp",
    other: "Other",
  },

  /* --- Email Capture --- */
  emailPrompt: "Leave your name with the menagerie. We summon you on the day.",
  emailPlaceholder: "your@email.com",
  // Note: email field is PARALLEL to platform selection, not gated behind it.
  // A visitor can pre-save without email (platform-only) or with email (notification + DP).

  /* --- Submit --- */
  submitButton: "Be Summoned",

  /* --- Success States --- */
  success: {
    headline: "You have been summoned.",
    body: "When the rite begins, you will know.",
    dpNotice: "The menagerie has noted your devotion.",
    // DP notice appears only if the fan is a menagerie member or provides email.
    // "10 Devotion Points" — do NOT display the number in copy. The system handles it.
    // The copy acknowledges without gamifying.
    menageriePrompt: "Not yet among us?",
    menagerieLink: "Enter the menagerie →",
    // This is the funnel: presave → menagerie join. Rimuru's cultural observation.
    sharePrompt: "Spread the word.",
    // Share buttons (native Web Share API or copy-link) appear below this.
  },

  /* --- Error States --- */
  errors: {
    invalidEmail: "The roll requires a valid name.",
    alreadyPresaved: "You are already among the summoned.",
    general: "Something broke the ritual. Try again.",
    network: "The connection was severed. The faithful persist.",
  },

  /* --- Post-Release Transition --- */
  // Same URL, different state. When release is live, the page transforms.
  postRelease: {
    headline: "Benediction",
    subheadline: "feat. Coty Garcia",
    atmosphericLine: "The rite has begun.",
    listenPrompt: "Hear the blessing.",
    // Platform buttons change from "pre-save" to direct streaming links.
    // The email capture section disappears or moves below the fold.
  },

  /* --- Countdown --- */
  countdown: {
    daysLabel: "days",
    dayLabel: "day",
    hoursLabel: "hours",
    hourLabel: "hour",
    // Countdown is anticipation, not urgency. No "don't miss out."
    // The countdown is a liturgical calendar marking: the blessing approaches.
    imminent: "The hour draws near.",  // When < 24 hours remain
    arrived: "The rite has begun.",    // When release is live
  },

  /* --- Open Graph / Social Card --- */
  og: {
    title: "Benediction — Heteromorphic Zoo (feat. Coty Garcia)",
    description: "A blessing spoken in two voices. Be summoned.",
    // og:image should be Benediction album art. Set in page metadata, not copy.
  },
} as const;

/* ============================================================
   Pre-Save Emails (Resend templates)
   ============================================================ */

export const PRESAVE_EMAILS = {
  /* --- Confirmation Email (sent immediately after pre-save) --- */
  confirmation: {
    subject: "You have been summoned — Benediction",
    preheader: "The blessing approaches. You will know when it arrives.",
    body: [
      "You have been summoned.",
      "",
      "Benediction — featuring Coty Garcia — arrives soon.",
      "A blessing spoken in two voices. The congregation appoints a new speaker.",
      "",
      "When the rite begins, we will reach you.",
      "",
      "— The Zoo",
    ],
    // Footer: unsubscribe link, heteromorphiczoo.band
  },

  /* --- Release Day Email (sent manually by Ray when confirmed live) --- */
  releaseDay: {
    subject: "The rite has begun — Benediction is live",
    preheader: "Hear the blessing. Every note is human.",
    body: [
      "The rite has begun.",
      "",
      "Benediction is live. Hear the blessing:",
      "",
      // Platform-specific deep link inserted here based on fan's stated preference.
      // e.g. "Listen on Spotify →" with the Spotify URI
      "",
      "Every note is human. Every lyric. Every melody. Every arrangement.",
      "Every voice you hear spent years becoming itself.",
      "",
      "If this moved you — tell someone.",
      "",
      "— The Zoo",
    ],
    listenCta: "Listen on {platform} →",
    // {platform} is replaced with the fan's stated preference: Spotify, Apple Music, etc.
    // All other platform links appear below as secondary options.
    allPlatformsLabel: "Also available on:",
  },
} as const;
```

### Design Notes for Rubedo

**Layout:** Single-column, centered, max-width ~400px. Album art is the above-the-fold hero — full-width or near-full-width, no sidebar, no competing elements. The art IS the page. Everything text-based lives below it.

**Platform buttons:** Vertical list, full-width on mobile. Spotify first (largest market share), Apple Music second, YouTube Music third, Bandcamp fourth. Each button: platform icon + platform name. Icon provides trust signal. No "Pre-save on..." prefix — the platform name alone. The `platformPrompt` ("Where do you listen?") frames the entire section.

**Email field:** Below platform buttons, not gated. Single field. The prompt ("Leave your name with the menagerie...") provides enough invitation. No name field, no phone, no extra fields. Every friction point kills conversion.

**Countdown:** Rendered as large-type numerals with the `countdownLabel` beneath. `"Benediction arrives in 14 days"` not `"14 days left!"` — anticipation, not urgency.

**Post-presave:** The page does NOT redirect. Success state renders in-place: the form area transforms into the success copy. Share buttons appear. Menagerie prompt appears if the fan isn't already a member. DP notification appears if they are.

**Same-URL lifecycle:** `/presave/benediction` is permanent. Before release: presave flow. After release: streaming link hub. All promotional materials, QR codes, and social links point here forever. The URL never dies.

**Mobile-first:** 48×48dp minimum touch targets. Sub-2-second load. This should be one of the lightest pages on the site.

**QR code:** Generate a QR code for `/presave/benediction` — for flyers, posters, show handouts, physical merch. The QR code bridges physical to digital.

---

## Deliverable 2: Rites ↔ Relics Bridge Links

### Context

The rites page addresses the congregation — community members who participate in creative challenges. The relics page addresses artisans — craftspeople whose work carries the menagerie's aesthetic into physical form. Someone standing in one room might belong in the other. The bridge links acknowledge this without breaking either room's register.

Ray's closing council signal is load-bearing here: transparent incentives produce trust. The relics page must communicate that partners are paid upfront, handle their own production/pricing/shipping, and that HZ's site is a thin showcase with outbound links. The economic simplicity IS the trust signal. No hidden terms. No complexity that suggests extraction.

### copy.ts Integration

```typescript
/* ============================================================
   Bridge Links — Rites ↔ Relics Cross-Navigation
   ============================================================ */

export const BRIDGE = {
  /* --- On the Rites page (routes artisans toward Relics) --- */
  ritesToRelics: {
    text: "Your craft deserves more than a rite. If you forge things that endure, the relics program awaits.",
    linkText: "See the Relics →",
    // Placement: below the "How the Rites Work" section, above the footer.
    // Styled as a quiet callout — not a banner, not a modal. A single line of text
    // with a link. The register of the rites page is communal and creative;
    // the bridge link acknowledges that some community members are professionals
    // without turning the rites page into a recruiting surface.
  },

  /* --- On the Relics page (routes community toward Rites) --- */
  relicsToRites: {
    text: "If you seek the act of creation over its artifacts, the rites are where the congregation gathers.",
    linkText: "Join the Rites →",
    // Placement: below the partner cards section (or the empty-state text), above footer.
    // Same quiet treatment. The relics page register is artisanal and reverent;
    // the bridge link acknowledges that some artisans might also want to participate
    // in creative challenges as community members, not as partners.
  },
} as const;

/* ============================================================
   Partner Intake Form — /partner-apply
   ============================================================ */

export const PARTNER_APPLY = {
  /* --- Page Frame --- */
  title: "Tell Us About Your Craft",
  // NOT "Apply for Partnership" or "Relic Partner Application."
  // The register is conversational-liturgical: an invitation, not a form.
  subtitle: "Heteromorphic Zoo partners with artisans whose craft speaks the same language as the music. If you make things that endure — forged, carved, painted, sewn, printed — and you see something of your work in this world, we want to hear from you.",

  /* --- How It Works (brief, transparent) --- */
  howItWorks: {
    heading: "How partnerships work",
    points: [
      "We pay upfront for your design work.",
      "You produce, price, stock, and ship independently. Your craft, your terms.",
      "Our site showcases your work and links to your shop.",
      "No revenue share. No minimums. No contracts.",
      "We trust you to fulfill orders. If you stop, we remove the listing. Simple.",
    ],
    // Ray's Carne Village insight: stating the economics plainly produces trust.
    // "No revenue share" is the surprising line. It signals that HZ isn't extracting.
    // "We trust you to fulfill orders" is the tit-for-tat policy stated as trust, not threat.
    volumeNote: "A note on volume: Heteromorphic Zoo is a niche extreme metal band. Order volume may be low. You should be prepared to store your designs and reactivate production when orders come. The opportunity is creative alignment and exposure to a devoted audience, not high-volume sales.",
    // This is Ray's "underpromise on volume" signal. Stated plainly.
    // The honesty IS the trust. An artisan who reads this and still applies is the right partner.
  },

  /* --- Form Fields --- */
  fields: {
    nameLabel: "Your name",
    namePlaceholder: "Or studio name",
    craftLabel: "What you make",
    craftPlaceholder: "Metalwork, illustration, leather, textiles, ceramics…",
    portfolioLabel: "Where we can see your work",
    portfolioPlaceholder: "Website, Instagram, Etsy — wherever your craft lives",
    pitchLabel: "Why the Zoo",
    pitchPlaceholder: "What about Heteromorphic Zoo resonates with your craft? A sentence or a story — your call.",
    emailLabel: "How to reach you",
    emailPlaceholder: "your@email.com",
  },

  /* --- Submit --- */
  submitButton: "Send",
  // Not "Submit Application." Not "Apply." Just "Send."
  // The conversational register continues through the action.

  /* --- Response States --- */
  success: {
    headline: "Your craft has been noted.",
    body: "We review submissions when the forge is open. If your work speaks the same language as ours, we will reach out. No timeline. No SLA. Patience is a craft too.",
    // Sets expectations: no guaranteed response timeline. Silence is not rejection — it's pace.
  },
  errors: {
    invalidEmail: "We need a way to reach you.",
    missingFields: "The forge needs more material. Fill in what's marked.",
    general: "Something broke the ritual. Try again.",
    network: "The connection was severed. The faithful persist.",
  },
} as const;

/* ============================================================
   Relics Page — Updated Description (post-spec-revision)
   ============================================================ */

export const RELICS_UPDATED = {
  // Replaces RELICS.description to match the new economic model.
  // The existing RELICS.subtitle ("Every piece is made by someone whose craft we believe in.") holds.
  description: [
    "Each piece on this page was made by a specific artisan who is named, attributed, and linked. Their craft, interpreted through the world of Heteromorphic Zoo. The maker is not a vendor. The maker is the reason.",
    "We pay our partners upfront for their design work. They handle production, pricing, and fulfillment on their own terms. Our site links to their shop. No revenue share. No extraction. The economics are simple because the mission is propagation, not margin.",
  ],
  // Note: the second paragraph replaces the old revenue-share language.
  // "No revenue share. No extraction." is the updated model per Ray's council signal.
  // "The economics are simple because the mission is propagation, not margin" —
  // same philosophical register as the original, updated to the new model.
} as const;
```

### Design Notes for Rubedo

**Bridge links:** Quiet treatment. A single line of body-serif text with an inline link. Not a banner. Not a card. Not a highlighted callout. The bridge is a whisper, not a shout — it catches the right person's eye without disrupting the room. Placement below the main content of each page, above the footer.

**Partner intake form:** Standard form layout. Title + subtitle at the top. "How partnerships work" section below the subtitle — this is the transparency section that builds trust before the form fields appear. Form fields below that. Submit button at the bottom. The form should feel like writing a letter, not filling out an application. Field labels are conversational. Placeholders provide guidance without restricting.

**Volume note:** Styled distinctly from the "how partnerships work" points — perhaps lighter text, or a bordered aside. This is the honesty checkpoint. It should be visible enough that no artisan misses it, but not so prominent that it discourages before the invitation has landed.

---

## Deliverable 3: AI Policy Card Register Spec

### Context

The AI policy card compresses the full policy page into a shareable visual artifact. The critical risk: compression kills register. A grid of domains and numbers looks like a compliance checklist. The card must be a stained-glass window — the same conviction, in visual form.

The card tool at `/card` serves two populations: bands declaring what they use, and listeners declaring what they accept. Same rows, different verbs. HZ's card is the seed — hardcoded, the reference implementation. The create-your-own tool is the product. Client-only (URL-encoded params, no server storage). PNG export + shareable URL. Maintenance-zero.

### Card Data Model

```typescript
/* ============================================================
   AI Policy Card — /card
   ============================================================ */

export const CARD = {
  /* --- Page Frame --- */
  title: "What\u2019s Human. What Isn\u2019t.",
  // NOT "AI Transparency Card." NOT "AI Policy Card." NOT "Create Your Card."
  // The title is a question that doubles as a declaration.
  subtitle: "A creative attestation.",
  // "Attestation" — not "policy," not "disclosure," not "statement."
  // Legal language kills this. The card is testimony, not compliance.

  /* --- Builder Page --- */
  builder: {
    headline: "Declare your sound.",
    // NOT "Create Your AI Policy Card." NOT "Build Your Card."
    // Imperative-declarative. The act of filling in the card IS the declaration.
    // Bands: "Declare your sound." Listeners: "Declare your standard."
    headlineBand: "Declare your sound.",
    headlineListener: "Declare your standard.",
    toggleBand: "I make music",
    toggleListener: "I listen to music",
    // The toggle is identity, not role selection. "I make music" vs "I listen to music."
    // Some people are both. The card captures one posture at a time.
    // A person can generate two cards.
  },

  /* --- Domain Rows (Default, Opinionated) --- */
  // These are Ray's 10 domains. The list itself is an argument —
  // it says "these are the categories that matter."
  // Default rows appear pre-populated in the builder. Users can rename, remove, add freely.
  defaultRows: [
    {
      domain: "Lyrics",
      hzScore: 0,
      hzQualifier: "Every word is written by a human being.",
      // Short. Declarative. No "we believe" hedging.
    },
    {
      domain: "Composition & Arrangement",
      hzScore: 0,
      hzQualifier: "Every note, every harmony, every structural choice. Human decisions.",
      // "Human decisions" — the operative phrase. Composition is decision-making.
    },
    {
      domain: "Production & Mixing",
      hzScore: 1,
      hzQualifier: "No generative AI. Standard digital tools and modeling are craft, not generation.",
      // Score 1 (not 0) because modeling tools exist in this space.
      // The qualifier draws the line the policy page draws: generative vs. modeling.
    },
    {
      domain: "Cover Art",
      hzScore: 0,
      hzQualifier: "Painted by Lordigan Pedro Sena. A human hand, a human eye.",
    },
    {
      domain: "Music Videos",
      hzScore: 2,
      hzQualifier: "No AI preferred. Industry VFX trends make a hard zero increasingly unusual.",
      // Score 2 — honest about the landscape. The qualifier explains the non-zero.
    },
    {
      domain: "Performance & Recording",
      hzScore: 1,
      hzQualifier: "No generative AI. No AI-mimicked performances. Real hands, real breath, real articulation.",
      // This is the violin line. "Our human violinist who makes her own decisions
      // on articulation and dynamics" — compressed to its essence.
    },
    {
      domain: "Mastering",
      hzScore: 2,
      hzQualifier: "No generative AI. The line is blurry and we don\u2019t directly control producers\u2019 tools.",
      // Honest about control limits. The qualifier IS the honesty.
    },
    {
      domain: "Web Development",
      hzScore: 5,
      hzQualifier: "Built with AI. Every page you\u2019re looking at.",
      // Unapologetic. This is the infrastructure side of the fault line.
    },
    {
      domain: "PR & Copywriting",
      hzScore: 5,
      hzQualifier: "AI drafts. Humans decide what ships.",
      // Short. The "humans decide what ships" is the critical qualifier.
    },
    {
      domain: "Social Media",
      hzScore: 3,
      hzQualifier: "AI assists in drafting. Final voice is usually human.",
      // "Usually" — honest qualifier. Not always. Not never.
    },
  ],

  /* --- Score Scale Labels --- */
  // These appear in the builder as reference labels when adjusting the slider.
  // They are NOT on the card itself (the card shows the number + qualifier).
  scaleLabels: {
    0: "No AI",
    1: "Tools only — no generative AI",
    2: "Mostly human, AI at the edges",
    3: "Mixed — AI assists, human decides",
    4: "AI-led, human-reviewed",
    5: "AI",
  },

  /* --- Card Visual --- */
  visual: {
    // The card has a visible fault line between creative domains (low scores)
    // and infrastructure domains (high scores). This is the stained-glass moment:
    // the sacred side and the profane side. The visual split IS the argument.
    faultLineLabel: "",
    // No label on the fault line itself. The visual separation speaks.
    // Domains are ordered by score (ascending): creative domains cluster at top,
    // infrastructure at bottom. The gradient runs from deep cool tones (0)
    // through warm transition (2-3) to bright warm tones (5).
    // An all-zero card looks monochrome. A card with the HZ split looks dramatic.
    // The aesthetics reward nuance without mandating it. (Rimuru's observation.)

    bandLabel: "Artist Attestation",
    listenerLabel: "Listener Standard",
    // These appear as a small type label at the top of the generated card.
    // "Artist Attestation" for band mode. "Listener Standard" for listener mode.
    // Different noun, same format.

    bandVerb: "uses",
    listenerVerb: "accepts",
    // The column header changes based on mode:
    // Band card: "Domain | Uses | Qualifier"
    // Listener card: "Domain | Accepts | Qualifier"
    // Same data, different framing. Bands declare practice. Listeners declare preference.
  },

  /* --- Watermark --- */
  watermark: "Made at heteromorphiczoo.band/card",
  watermarkHook: "What\u2019s human in your music?",
  // The watermark has two lines:
  // Line 1: "Made at heteromorphiczoo.band/card" — the URL, the attribution.
  // Line 2: "What's human in your music?" — the question, the viral hook.
  // The question is what makes someone who sees the card visit the URL.
  // The URL is what makes the visit produce another card.

  /* --- Export --- */
  export: {
    downloadPng: "Download",
    copyLink: "Copy link",
    // The link is the URL-encoded card state. No server storage.
    // URL structure: heteromorphiczoo.band/card?d=<lz-string-compressed-json>
    sharePrompt: "Your attestation is ready.",
    // NOT "Share your card!" Not "Post it!" Declarative, not imperative.
    privacyNote: "This tool stores nothing. Your card exists only in the image you download and the link you share.",
    // Kazuma's insight: "This site does not store any information" is a trust signal
    // for musicians wary of AI-adjacent tools tracking their data.
  },

  /* --- Builder Controls --- */
  controls: {
    addRow: "+ Add a domain",
    removeRow: "Remove",
    domainPlaceholder: "e.g. Merchandise design",
    qualifierPlaceholder: "Optional — explain your stance",
    resetToDefaults: "Reset to defaults",
    // "Reset to defaults" restores HZ's 10 rows. The defaults are opinionated
    // because the list itself is pedagogical. When someone resets, they get
    // Ray's categories back — which is the point.
  },

  /* --- Empty State / First Visit --- */
  firstVisit: {
    heroHeadline: "What\u2019s Human. What Isn\u2019t.",
    heroBody: "Every band makes choices about AI. Most don\u2019t say so. This tool lets you.",
    // Three sentences. The third is the invitation. No sales language.
    // The hero shows HZ's own card as the reference implementation.
    ctaCreate: "Make yours",
    ctaLearnMore: "Read our policy →",
    // "Read our policy" links to /policy. The card tool and the policy page
    // are two representations of the same stance. The card compresses; the policy elaborates.
  },

  /* --- HZ Reference Card (hardcoded, canonical source) --- */
  hzCard: {
    name: "Heteromorphic Zoo",
    type: "band" as const,
    tagline: "Every note is human.",
    // The tagline appears on HZ's card only. User-generated cards don't get a tagline
    // unless they type one into a field. HZ's tagline is the policy's opening line
    // compressed to four words. Screenshot-survivable.
  },

  /* --- JSON Schema (for format adoption) --- */
  // Published at heteromorphiczoo.band/card/schema.json
  // Plain JSON. No JSON-LD. No semantic web overhead. (Pandora's recommendation.)
  schemaDescription: "AI Policy Card v1 — heteromorphiczoo.band",
  // The schema is the durable asset (Pandora). The React component is a projection.
  // Other developers can build their own renderers from this schema.
  // Schema: { name: string, type: "band"|"listener", tagline?: string,
  //   rows: [{ domain: string, score: 0-5, qualifier?: string }] }
} as const;
```

### Design Notes for Rubedo

**Card renderer:** The card component renders both in the builder (live preview) and as the export source (html-to-image). One component, two contexts. Desktop: builder inputs on left, live preview on right. Mobile: inputs on top, preview below (scrollable).

**The fault line:** Domains render sorted by score ascending. Creative domains (0-1) cluster at the top. Infrastructure domains (3-5) cluster at the bottom. The visual treatment makes this split dramatic: cool tones at the top, warm tones at the bottom. A card with HZ's score distribution — mostly 0s then mostly 5s — has a visible, striking divide. An all-zero card is monochrome and flat. The aesthetics do the cultural work without mandating nuance. (Per Rimuru's propagation architecture.)

**Builder UX:** Content-only editing. No color picker. No font selector. Visual consistency IS the brand. Users edit domains, scores, and qualifiers. The card's visual treatment is determined by the data. This means every card looks like it belongs to the same family — the HZ watermark plus the consistent visual language makes every generated card recognizable as coming from this tool.

**PNG export:** Use html-to-image (Kazuma's recommendation over html2canvas). Render the card component to PNG via React ref. Mobile: Web Share API fallback if available, direct download otherwise.

**Shareable URL:** Card state compressed via lz-string into URL query params. `heteromorphiczoo.band/card?d=<compressed>`. The URL IS the card — visiting it renders the card in view mode with an "Edit a copy" button that opens the builder pre-populated. No server round-trip. Maintenance-zero.

**OG image:** `/api/og/card` endpoint generates a PNG from URL params for social previews. When someone shares a card link on social media, the preview image IS the card. Vercel OG or similar server-side image generation.

**Social card meta tags:** Dynamic per shared card. `og:title` = "{Name}'s Creative Attestation" (or "Artist Attestation" / "Listener Standard" based on type). `og:image` = the OG-generated PNG. `og:description` = "What's human in your music? Make yours at heteromorphiczoo.band/card"

**Trust signal:** The privacy note ("This tool stores nothing") should be visible in the builder — not buried in a footer. Musicians evaluating an AI-adjacent tool are rightly suspicious. The no-storage design is a feature. Communicate it.

---

## Register Verification Checklist (All Three Deliverables)

Read every string aloud. Apply these tests:

- [ ] Could this appear on a SaaS landing page? → Rewrite
- [ ] Could this appear in a corporate press release? → Rewrite
- [ ] Does this sentence use FOMO language ("don't miss," "limited," "hurry")? → Delete
- [ ] Does this use the word "content" for creative work? → Use "work," "art," "music," "offering"
- [ ] Does this use gamification language ("level up," "earn points," "unlock")? → Rewrite in liturgical register
- [ ] Does this use "subscribe," "sign up," or "register"? → Use "enter," "join," "be counted," "be summoned"
- [ ] Does this hedge a factual claim with "we believe" or "in our opinion"? → State it
- [ ] Does this explain what melodic death metal is? → Delete
- [ ] Does any sentence contain an exclamation mark? → The cathedral does not exclaim
- [ ] Does the economic language on the partner form read as extractive? → Simplify further

---

## Cross-Deliverable Consistency Notes

**"You have been summoned" / "You have been counted":** The presave success state uses "summoned" (active — the visitor is being called to return on release day). The menagerie join uses "counted" (passive — the visitor has been enrolled). Different verbs, different liturgical functions. Both are consecration, but the presave is future-oriented (a summoning) and the menagerie join is present-oriented (an enrollment). Don't conflate them.

**DP acknowledgment pattern:** The presave awards 10 DP. The copy acknowledges this as "The menagerie has noted your devotion" — NOT "You earned 10 DP!" or "10 Devotion Points added!" The system handles the number. The copy handles the register. This is consistent with how the existing menagerie join works: `EMAIL_CAPTURE.success` is "You have been counted." — it doesn't say "Welcome to Tier 1! You now have 0 DP!"

**The policy↔card relationship:** The policy page is the uncompressed stance. The card is the compressed stance. They must not contradict. HZ's card scores and qualifiers are derived directly from the policy's three sections. Any future policy edit must cascade to the card's `hzCard` data. The canonical source for HZ's AI stance is the POLICY section of copy.ts. The CARD.defaultRows are a projection of it.

**Transparent economics:** The partner form's "How partnerships work" section and the updated relics page description both communicate the same model. The form is more detailed (five bullet points + volume note). The relics page is more atmospheric (two paragraphs). Neither should contain information that contradicts the other. The partner-program-spec (Sections 2 and 8, revised by Demiurge) is the source of truth for the economic model. Both copy surfaces project from it.

---

*Three deliverables. One register. The cathedral extends.*
