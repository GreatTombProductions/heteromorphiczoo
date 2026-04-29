/**
 * All text strings for heteromorphiczoo.com.
 * Single source of truth — edit here, not in components.
 * Register: liturgical unless noted otherwise.
 */

export const SITE = {
  name: "Heteromorphic Zoo",
  tagline: "Worship music for monsters.",
  copyright: "\u00A9 MMXXVI Heteromorphic Zoo. All rites reserved.",
  themeColor: "#1a0e1e",
} as const;

export const NAV = {
  bestiary: "The Bestiary",
  offerings: "Offerings",
  reactions: "Reactions",
  menagerieRoll: "Menagerie Roll",
  rites: "The Rites",
  chronicle: "The Chronicle",
  press: "Press",
  relics: "Relics",
} as const;

export const LANDING = {
  featuredCallout: "Benediction. The first blessing of the new order. Feat. Coty Garcia.",
  atmosphericLine: "Worship music for monsters.",
} as const;

export const BENEDICTION = {
  headline: "Benediction",
  subheadline: "feat. Coty Garcia",
  body: "A blessing spoken in two voices.\nThe congregation appoints a new speaker.",
  bodyLine1: "A blessing spoken in two voices.",
  bodyLine2: "The congregation appoints a new speaker.",
  ctaPrimary: "Heed now the summons",
  ctaVideo: "Witness",
  credits: "Mixed by Ray Heberer \u00B7 Produced by Greg Thomas \u00B7 Mastered by Joel Wanasek \u00B7 Art by Lordigan Pedro Sena \u00B7 Video by Scott Hansen",
} as const;

export const EMAIL_CAPTURE = {
  prompt: "Join the menagerie.",
  namePlaceholder: "Name / alias for the roll",
  emailPlaceholder: "your@email.com",
  newsletterLabel: "Subscribe to the newsletter",
  newsletterFrequency: "expected frequency: once per season",
  addFieldButton: "+ Add a detail",
  fieldKeyPlaceholder: "e.g. city, favorite song",
  fieldValuePlaceholder: "value",
  button: "Enter",
  success: "You have been counted.",
  alreadyRegistered: "You are already among us.",
  updated: "The menagerie has noted your changes.",
  errorInvalid: "The roll requires a valid email.",
  errorGeneral: "Something broke the ritual. Try again.",
  errorNetwork: "The connection to the menagerie was severed. The faithful persist.",
} as const;

export const LOADING = {
  page: "The congregation assembles\u2026",
  gallery: "The offerings emerge\u2026",
  reactions: "The witnesses gather\u2026",
  search: "The archives open\u2026",
  roll: "The roll unfurls\u2026",
} as const;

export const ERRORS = {
  general: "Something broke the ritual. Try again.",
  upload: "The altar rejected your offering. The format was unworthy.",
  network: "The connection to the menagerie was severed. The faithful persist.",
  rateLimited: "Your devotion exceeds the altar\u2019s capacity. Wait, and return.",
  server: "The cathedral shudders. The architects have been summoned.",
  fileTooLarge: "The offering exceeds the altar\u2019s measure. Compress and return.",
  invalidUrl: "This does not lead where you claim. Provide a true path.",
} as const;

export const NOT_FOUND = {
  line1: "You have wandered beyond the known rites.",
  line2: "The menagerie does not extend this far.",
  returnLink: "Return to the altar",
} as const;

export const OG = {
  title: "Benediction - Heteromorphic Zoo (feat. Coty Garcia)",
  description: "A blessing spoken in two voices. The first rite of the new era.",
  image: "/og-image-landscape.jpg",
} as const;

export const FOOTER = {
  copyright: SITE.copyright,
  terms: "The Law",
  privacy: "Privacy Rites",
} as const;

/* ============================================================
   Reactions Wall
   ============================================================ */

export const REACTIONS = {
  title: "Reactions",
  subtitle: "The witnesses speak.",
  emptyState: "No reactions have been consecrated yet. The witnesses are gathering.",
  searchPlaceholder: "Search by title or channel\u2026",
  filterAll: "All Rites",
  submitTitle: "Submit a Reaction",
  submitPrompt: "Found a reaction video the menagerie should witness?",
  submitUrlPlaceholder: "YouTube URL",
  submitSongPlaceholder: "Which song?",
  submitButton: "Offer Witness",
  submitEmailPlaceholder: "Your menagerie email (optional)",
  submitSuccess: "Your witness has been received. It awaits consecration.",
  submitError: "The altar rejected the offering. Check the URL and try again.",
  submitDuplicate: "This witness is already known to the menagerie.",
  claimButton: "This is my reaction",
  claimEmailPlaceholder: "Your menagerie email",
  claimSubmit: "Claim",
  claimSuccess: "Your claim has been received. It awaits verification.",
  claimError: "The claim could not be processed. Try again.",
  claimedByLabel: "by",
} as const;

export const SONG_TAGS = [
  "Ritual of Fidelity",
  "Your Final Seconds",
  "Napalm",
  "Avatara",
  "Aura of Despair",
  "Benediction",
] as const;

/* ============================================================
   Offerings Gallery
   ============================================================ */

export const OFFERINGS = {
  title: "Offerings",
  subtitle: "What the menagerie brings to the altar.",
  emptyState: "The altar awaits its first offering.",
  filterAll: "All Offerings",
  categories: {
    visual: { label: "Visual", description: "Art, illustration, photography" },
    sonic: { label: "Sonic", description: "Covers, remixes, performances" },
    textual: { label: "Textual", description: "Reviews, poetry, prose" },
    ritual: { label: "Ritual", description: "Inspired by the zoo" },
    profane: { label: "Profane", description: "Memes, edits, chaos" },
  },
  submitTitle: "Present an Offering",
  submitPrompt: "The altar accepts all forms of devotion.",
  submitEmailPlaceholder: "Your menagerie email",
  submitTitlePlaceholder: "Title of the offering",
  submitDescriptionPlaceholder: "Describe your offering\u2026",
  submitUrlPlaceholder: "Link to content (YouTube, SoundCloud, etc.)",
  submitInspiredByPlaceholder: "Inspired by another offering? (optional)",
  submitCategoryLabel: "Category",
  submitFileLabel: "Upload a file",
  submitFileHint: "Image, audio, video, or PDF. 10 MB limit.",
  submitFileOrUrl: "Upload a file, provide a link, or both.",
  submitButton: "Present Offering",
  submitSuccess: "Your offering has been received. The menagerie will judge its worthiness.",
  submitError: "The altar rejected your offering. Try again.",
  submitFileTooLarge: "The offering exceeds the altar\u2019s measure. Maximum 10 MB.",
  submitNotMember: "Join the menagerie first. Only the counted may offer.",
  featuredLabel: "Featured Offering",
  byLabel: "by",
} as const;

/* ============================================================
   Menagerie Roll
   ============================================================ */

export const MENAGERIE_ROLL = {
  title: "The Menagerie Roll",
  subtitle: "The counted. The ranked. The devoted.",
  emptyState: "The roll is empty. Be the first to be counted.",
  foundingBadge: "Founding",
  dpLabel: "DP",
  censusTitle: "Census",
  rankLabels: {
    0: "Uninitiated",
    1: "Acolyte",
    2: "Deacon",
    3: "Elder",
    4: "High Priest/Priestess",
    5: "Archbishop",
  },
  joinPrompt: "Add your voice to our ranks. Join the menagerie.",
  joinButton: "Enter the Roll",
} as const;

/* ============================================================
   Band Content Pages — Chronicle, Bestiary, Press
   ============================================================ */

export interface ChronicleImage {
  src: string;
  alt: string;
}

export const CHRONICLE = {
  title: "The Chronicle",
  subtitle: "A history written in blood and resonance.",
  events: [
    {
      date: "November 2022",
      title: "The Specimen",
      body: "A demo called Avatara. Ray Heberer, Megan Ash, and Harry Tadayon on vocals. The specimen the band formed around. Chris linked Ray with Bryce, Harry recommended Coty. Everything that follows grows from this recording.",
      era: "formation" as const,
      images: [] as ChronicleImage[],
    },
    {
      date: "2023",
      title: "The Tomb Awakens",
      body: "Heteromorphic Zoo coalesces in British Columbia. Ray Heberer - guitar, composition, production. Coty Garcia - the founding voice. Megan Ash - violin, written into the architecture, never decoration. Bryce Butler - drums. The tagline crystallizes: worship music for monsters.",
      era: "formation" as const,
    },
    {
      date: "February 2, 2024",
      title: "First Rites: Napalm",
      body: "The first single and music video. No Clean Singing writes of \"utterly deranged vocals that sound like a fight between bull elephants, howler monkeys, and a pack of demons that just escaped Hell.\" The 13-year editorial thread between Ray and NCS reviewer Islander continues.",
      era: "singles" as const,
      videoUrl: "https://youtu.be/8uQZ5Rv8yIs",
    },
    {
      date: "May 10, 2024",
      title: "Second Offering: Avatara",
      body: "Second single and music video. Artwork by Lordigan Pedro Sena. \"Gentle and beguiling at first\u2026 the violin, guitar, and piano elegantly channel wistfulness and sorrow.\"",
      era: "singles" as const,
      videoUrl: "https://youtu.be/nWZVq-u7Lec",
    },
    {
      date: "October 10, 2024",
      title: "The New World Arrives",
      body: "Five vignettes from a coalition of monsters conquering a new realm. Guest appearances: Ville Hokkanen of Synestia (Poetic Edda era) on \"Your Final Seconds.\" Raymond Heberer III - Ray\u2019s father - on trombone, and Francesco Ferrini of Fleshgod Apocalypse on orchestral arrangement, both on \"Aura of Despair.\" Produced by Chris Wiseman. Mixed and mastered by Christian Donaldson. Artwork by Lordigan Pedro Sena.",
      era: "ep" as const,
      tracks: [
        "Ritual of Fidelity",
        "Your Final Seconds",
        "Napalm",
        "Avatara",
        "Aura of Despair",
      ],
    },
    {
      date: "2025",
      title: "The Crucible",
      body: "The year the zoo went underground and leveled up. Ray and Bryce agonizing over fifteen-plus instrumental mixes. One hundred percent real toms and cymbals, snare at ninety percent of the blended tone. Violin tone refined through covers and Hexed. Greg\u2019s production mentorship. Coty sharing vocal chain secrets. The backlog grew. The vision sharpened.",
      era: "crucible" as const,
    },
    {
      date: "September 2025",
      title: "The Solo Flight: Hexed",
      body: "Megan Ash releases \"Hexed,\" her first solo single. The violinist steps forward as frontwoman and artist in her own right.",
      era: "solo" as const,
      videoUrl: "https://www.youtube.com/watch?v=wqJJC_gMDGM",
    },
    {
      date: "April 2026",
      title: "Benediction",
      body: "Ray takes the voice. Benediction (featuring Coty Garcia) is a dual-vocalist rite honoring the founding voice and ushering in the next era. Not every band announces a succession with a song where both voices coexist. Written early 2024. Mastered April 2026. The last long-cycle release. Now the Overlord's will can flow.",
      era: "benediction" as const,
    },
  ],
} as const;

export const BESTIARY = {
  title: "The Bestiary",
  subtitle: "The creatures that inhabit the zoo.",
  members: [
    {
      name: "Ray Heberer",
      designation: "The First Disciple",
      roles: "Composition, guitars, vocals, production",
      description: "Every note in the zoo is written by this hand. The arrangements are scripture. Violin, guitar, and orchestral voices interwoven from inception rather than layered naively. A decade of metal projects before the zoo existed. The one who heard the sound first and transmits it. Now the voice as well as the architect.",
      current: true,
    },
    {
      name: "Megan Ash",
      designation: "The Resonance",
      roles: "Violin",
      description: "The violin is central to the sound. Written into the DNA of every composition. A classical 3-voice fugue between violin, lead guitar, and rhythm section features in \"Ritual of Fidelity.\" Her first solo flight, \"Hexed,\" arrived September 2025.",
      current: true,
    },
    {
      name: "Bryce Butler",
      designation: "The Chaos Engine",
      roles: "Drums, drum arrangement",
      description: "The heart of the band, in more way than one. Distinctive drum arrangements that only a distinctively deranged mind could dream up.",
      current: true,
    },
    {
      name: "Jon Power",
      designation: "The Foundation",
      roles: "Bass",
      description: "The low end that anchors the chaos above. First studio appearance in Benediction. The weight beneath the architecture.",
      current: true,
    },
    {
      name: "Coty Garcia",
      designation: "The Founding Voice",
      roles: "Vocals (founding)",
      description: "The voice that summoned the first congregation. Every word on Napalm, Avatara, the New World EP. Honored as a founding member through the medium of the music itself. Benediction is two voices in a single blessing. Not every band says goodbye with a song.",
      current: false,
    }
  ],
  guests: [
    {
      name: "Raymond Heberer III",
      role: "Trombone",
      track: "Aura of Despair, Benediction",
      note: "Ray\u2019s father. Four trombones on the closing track of New World, appearing again in Benediction.",
    },
    {
      name: "Francesco Ferrini",
      role: "Orchestral arrangement",
      track: "Aura of Despair",
      note: "Fleshgod Apocalypse. The orchestral grandeur on the EP\u2019s final track bears his fingerprints.",
    },
    {
      name: "Ville Hokkanen",
      role: "Guest vocals",
      track: "Your Final Seconds",
      note: "Adds a second dimension of vocal hostility to the EP\u2019s second track.",
    },
  ],
  collaborators: {
    title: "The Circle of Production",
    entries: [
      { name: "Lordigan Pedro Sena", role: "Artwork", note: "" },
      { name: "Greg Thomas", role: "Producer (Benediction), Recording engineer (New World EP)", note: "END" },
      { name: "Joel Wanasek", role: "Mastering (Benediction)", note: "" },
      { name: "Scott Hansen", role: "Music video (Benediction)", note: "" },
      { name: "Harry Tadayon", role: "Additional production - synth samples (Benediction)", note: "Vile Sycophant, Worm Shepherd" },
      { name: "Chris Wiseman", role: "Producer (New World EP)", note: "Shadow of Intent, Currents" },
      { name: "Christian Donaldson", role: "Mixed and mastered (New World EP)", note: "Cryptopsy" },
    ],
  },
} as const;

/* ============================================================
   The Rites — Themed UGC Challenges
   ============================================================ */

export const RITES = {
  title: "The Rites",
  subtitle: "Themed challenges. Bounded windows. What the menagerie creates under constraint.",
  emptyState: "No rites have been called. The altar rests between seasons.",
  loading: "The rites unfold\u2026",
  activeLabel: "Active Rite",
  closedLabel: "Rite Closed",
  upcomingLabel: "Forthcoming",
  daysRemaining: "days remain",
  dayRemaining: "day remains",
  hoursRemaining: "hours remain",
  ended: "The rite has closed.",
  themeLabel: "The Call",
  durationLabel: "Window",
  dpLabel: "Devotion",
  offeringsLabel: "Offerings Received",
  featuredLabel: "Altar Selections",
  featuredDescription: "Chosen from the rite\u2019s offerings. Featured on the altar.",
  participateButton: "Answer the Call",
  participateNote: "Submissions are offerings. Present yours on the Offerings page.",
  howItWorks: {
    title: "How the Rites Work",
    steps: [
      { heading: "A call is made", body: "A narrow theme. A bounded window. The medium is yours to choose." },
      { heading: "The menagerie answers", body: "Submit offerings during the rite window." },
      { heading: "The rite closes", body: "No public rankings during the rite. No competition pressure. Leave appreciation for offerings that resonate." },
      { heading: "The altar receives", body: "After the rite closes, the most resonant offerings are featured on the altar." },
    ],
  },
  founding: {
    name: "The First Blessing",
    theme: "What does Benediction sound like in your medium?",
    description: "The founding rite. Fourteen days. Every medium welcome: paint it, play it, write it, move to it. The theme constrains concept, not format. A painter and a guitarist interpreting the same bridge section discover each other through the gallery.",
    dpNote: "Standard offering DP. Founding Menagerie 1.5\u00D7 multiplier applies.",
    announcement: "The First Blessing has been called. For fourteen days, the altar receives your translation. What does Benediction sound like in your medium? The menagerie awaits.",
  },
} as const;

/* ============================================================
   Generative AI Policy
   ============================================================ */

export const POLICY = {
  title: "Generative AI Policy",
  footerTrigger: "Generative AI Policy",
  sections: [
    {
      id: "every-note-is-human",
      title: "Every Note Is Human",
      paragraphs: [
        "Every note is human.",
        "Every lyric. Every melody. Every arrangement. Every vocal performance, every guitar line, every drum pattern, every violin phrase, every orchestral voice. Human hands. Human voices. Human decisions. From the first demo to the final master.",
        "This is not a negotiable position. This is not a phase. This is the line, and it does not move.",
        "Heteromorphic Zoo\u2019s music is written by Ray Heberer. The drums are written and performed by Bryce Butler \u2014 real toms, real cymbals, a snare tone that is ninety percent the instrument and ten percent reinforcement. The violin is performed by Megan Ash. The vocals are performed by human beings who spent years developing their voices. The orchestral arrangements are written by human composers. The artwork is painted by human artists.",
      ],
    },
    {
      id: "what-we-use-ai-for",
      title: "AI Handles What Artists Shouldn\u2019t Have To",
      paragraphs: [
        "You are looking at a website built with artificial intelligence. You probably noticed.",
        "Good.",
        "This website, our operations infrastructure, our data systems, our logistics \u2014 generative AI handles the work that artists have always hated doing but that careers die without. The website you\u2019re navigating right now. The fan engagement systems running underneath it. The intake pipelines, the aggregation scripts, the deployment infrastructure. Every artist knows this territory: the work that isn\u2019t the art but that the art can\u2019t reach anyone without.",
      ],
      pullQuote: "There was a promise. \u201CAI will handle the boring parts so humans can focus on what matters.\u201D We took that promise seriously.",
      paragraphsAfterPullQuote: [
        "We are one of the only artists in the world who can say: we used AI exactly how it was supposed to be used. The infrastructure is automated. The art is untouched.",
        "A note on tools, because precision matters here. We distinguish between generative AI \u2014 systems that produce novel creative content: text, images, audio, music \u2014 and modeling tools \u2014 systems that digitally simulate the behavior of physical equipment. Amp modeling, effects simulation, cabinet impulse responses. The former creates something that didn\u2019t exist. The latter replicates something that does. The former replaces the player. The latter is a tool in the hand of the player.",
        "Every guitarist in modern metal uses modeling and simulation tools. This is not AI in the generative sense. It is digital craftsmanship \u2014 the same relationship a woodworker has to a power tool versus a 3D printer.",
      ],
    },
    {
      id: "the-problem-is-silence",
      title: "The Problem Is Silence.",
      // Ordered content blocks. Move any block to rearrange the section.
      flow: [
        { type: "p", text: "We do not believe AI is evil. We do not believe it should be banned from creative work. People are allowed to make art however they want." },
        { type: "p", text: "What we believe is this: you deserve to know." },
        { type: "p", text: "When you listen to a song that moves you, you are entering a relationship with the person who made it. You are investing something \u2014 attention, emotion, money, identity. That investment is made on the assumption that a human being poured themselves into what you\u2019re hearing. When that assumption is wrong and nobody told you, the relationship is a fraud. Not because AI music is bad. Because silence about it is dishonest." },
        { type: "p", text: "The music industry is not having this conversation loudly enough. Labels are quietly licensing AI-generated content. Artists are quietly using generative tools and not disclosing it. Platforms are adding optional disclosure tags that almost nobody uses. The infrastructure for transparency exists. The will to use it does not." },
        { type: "p", text: "We are not waiting for the industry to figure this out." },
        { type: "declaration", prefix: "Heteromorphic Zoo\u2019s position: ", text: "Every artist who uses generative AI in their creative output should say so, clearly, permanently, and without being asked." },
        { type: "p", text: "Not buried in metadata. Not in response to accusations. Proactively. Proudly, if they believe in what they\u2019re doing. The audience will decide what they value. The audience cannot decide if they don\u2019t know." },
        { type: "card-embed", intro: "Here\u2019s ours.", cta: "Make yours \u2192" },
        { type: "sanctuary", prompt: "If your life or livelihood has been affected by AI \u2014 your voice cloned without consent, your work replaced by generated content, your income displaced by tools trained on your art \u2014", linkText: "we want to hear from you \u2192", coda: "We are not lawyers. We cannot represent you. But we can listen, we can amplify patterns we see, and we can connect you with organizations that can help. The Zoo\u2019s reach is small. The principle is not." },
      ],
    },
  ],
} as const;

/* ============================================================
   /sanctuary — AI Impact Contact Form
   ============================================================ */

export const SANCTUARY = {
  title: "The Sanctuary",
  intro: "If your life or livelihood has been affected by generative AI \u2014 your voice cloned without consent, your work replaced by generated content, your income displaced by tools trained on your art \u2014 the Zoo is listening.",
  categories: [
    "My voice or likeness was used without my consent",
    "AI-generated content has replaced work I would have been hired for",
    "Content I created was used to train AI systems without my permission",
    "AI-generated work has been falsely attributed to me",
    "Other \u2014 I\u2019ll explain below",
  ],
  nameLabel: "Name",
  namePlaceholder: "Anonymous submissions welcome",
  emailLabel: "Email",
  emailPlaceholder: "Only if you\u2019d like us to follow up",
  categoryLabel: "What happened",
  storyLabel: "Your story",
  storyPlaceholder: "Tell us what happened\u2026",
  storyMinLength: 20,
  submitButton: "Submit",
  submitSuccess: "Your voice has been received. The Zoo is listening.",
  submitError: "Something went wrong. Please try again.",
  submitRateLimited: "Please wait before submitting again.",
  whatHappensNext: {
    heading: "What happens next",
    lines: [
      "We read every submission. We are not lawyers and we cannot represent you. What we can do:",
      "\u2014 Listen. Every submission is read by a human being.",
      "\u2014 Amplify. Anonymized, aggregated patterns inform our public advocacy and statements.",
      "\u2014 Connect. We can point you toward organizations equipped to help.",
    ],
    resources: [
      { name: "SAG-AFTRA AI Advisory", url: "https://www.sagaftra.org/ai" },
      { name: "Authors Guild", url: "https://authorsguild.org" },
      { name: "Human Artistry Campaign", url: "https://www.humanartistrycampaign.com" },
    ],
    privacyNote: "We will never share your name or details without your explicit permission.",
  },
} as const;

/* ============================================================
   Relics — Artisan Partner Program
   ============================================================ */

export const RELICS = {
  title: "Relics",
  subtitle: "Every piece is made by someone whose craft we believe in.",
  description: [
    "Each piece on this page was made by a specific artisan who is named, attributed, and linked. Their craft, interpreted through the world of Heteromorphic Zoo.",
    "We pay our partners upfront for their design work. They handle production, pricing, and fulfillment on their own terms. Our site links to their shop. No revenue share. No extraction. The economics are simple because the mission is propagation.",
  ],
  emptyState: {
    line1: "The forge is lit. The commissions are spoken.",
    line2: "The first relics are being made.",
    line3: "When they arrive, each will carry the name of the artisan who made it, the process that shaped it, and a link to their craft.",
    coda: "Prepare to arm yourself.",
  },
  partnerCard: {
    shopLinkLabel: "Visit their craft",
  },
  purchase: {
    claimButton: "Claim",
    editionLabel: "Edition of",
    confirmation: {
      line1: "The relic is yours.",
      line2: "made this. Remember their name.",
    },
  },
} as const;

export const PRESS = {
  title: "Press",
  subtitle: "Heteromorphic Zoo: melodic death metal / deathcore / progressive-symphonic from British Columbia, Canada.",
  oneLiner: "Worship music for monsters.",
  bio: "Heteromorphic Zoo is a Canadian extreme metal project led by guitarist and composer Ray Heberer. Drawing strength from all corners of the genre - melodic death metal, deathcore, progressive-symphonic - the band integrates violin, orchestral arrangements, and relentless composition into a sound built for pariahs, outcasts, and dark souls. Self-released under Great Tomb Productions.",
  stats: {
    title: "By the Numbers",
    spotifyListeners: "~2,800 monthly listeners",
    releases: "1 EP \u00B7 2 singles \u00B7 1 remix \u00B7 1 incoming",
    epRuntime: "18:56 across 5 tracks",
    pressOutlets: "No Clean Singing \u00B7 The Circle Pit \u00B7 FemMetal Rocks",
    label: "Great Tomb Productions (self-released)",
  },
  pressQuotes: [
    {
      text: "Utterly deranged vocals that sound like a fight between bull elephants, howler monkeys, and a pack of demons that just escaped Hell.",
      source: "No Clean Singing",
      context: "on Napalm",
    },
    {
      text: "An extravagant manifestation of symphonic death metal, filigreed with equally extravagant violin and guitar performances.",
      source: "No Clean Singing",
      context: "on the New World EP",
    },
    {
      text: "A classical 3-voice fugue between the violin, lead guitar, and rhythm guitars + bass.",
      source: "The Circle Pit",
      context: "on Ritual of Fidelity",
    },
  ],
  comparisons: "In Flames \u00B7 Within the Ruins \u00B7 Ne Obliviscaris",
  lineup: [
    "Ray Heberer - Guitar, vocals, composition, production",
    "Megan Ash - Violin",
    "Jon Power - Bass",
    "Bryce Butler - Drums",
  ],
  links: {
    bandcamp: "https://heteromorphiczoo.bandcamp.com",
    spotify: "https://open.spotify.com/artist/6yPAqoIMCfvAVMsDsWyNbp",
    youtube: "https://youtube.com/@heteromorphiczoo",
    instagram: "https://instagram.com/heteromorphic.zoo",
  },
  contact: {
    booking: "hzoo@greattombproductions.com",
    press: "hzoo@greattombproductions.com",
    general: "hzoo@greattombproductions.com",
  },
} as const;

/* ============================================================
   Pre-Save — /presave/[release]
   ============================================================ */

export const PRESAVE = {
  headline: "Benediction",
  subheadline: "feat. Coty Garcia",
  releaseDate: "2026",
  countdownLabel: "arrives",

  atmosphericLine: "A blessing spoken in two voices. The congregation appoints a new speaker.",

  platformPrompt: "Where do you listen?",
  platforms: {
    spotify: "Spotify",
    apple: "Apple Music",
    youtube: "YouTube Music",
    bandcamp: "Bandcamp",
    other: "Other",
  },

  emailPrompt: "Leave your name with the menagerie. We summon you on the day.",
  emailPlaceholder: "your@email.com",

  submitButton: "Be Summoned",

  success: {
    headline: "You have been summoned.",
    body: "When the rite begins, you will know.",
    dpNotice: "The menagerie has noted your devotion.",
    menageriePrompt: "Not yet among us?",
    menagerieLink: "Enter the menagerie \u2192",
    sharePrompt: "Spread the word.",
  },

  errors: {
    invalidEmail: "The roll requires a valid name.",
    alreadyPresaved: "You are already among the summoned.",
    general: "Something broke the ritual. Try again.",
    network: "The connection was severed. The faithful persist.",
  },

  postRelease: {
    headline: "Benediction",
    subheadline: "feat. Coty Garcia",
    atmosphericLine: "The rite has begun.",
    listenPrompt: "Hear the blessing.",
  },

  countdown: {
    daysLabel: "days",
    dayLabel: "day",
    hoursLabel: "hours",
    hourLabel: "hour",
    imminent: "The hour draws near.",
    arrived: "The rite has begun.",
  },

  og: {
    title: "Benediction \u2014 Heteromorphic Zoo (feat. Coty Garcia)",
    description: "A blessing spoken in two voices. Be summoned.",
  },
} as const;

export const PRESAVE_EMAILS = {
  confirmation: {
    subject: "You have been summoned \u2014 Benediction",
    preheader: "The blessing approaches. You will know when it arrives.",
    body: [
      "You have been summoned.",
      "",
      "Benediction \u2014 featuring Coty Garcia \u2014 arrives soon.",
      "A blessing spoken in two voices. The congregation appoints a new speaker.",
      "",
      "When the rite begins, we will reach you.",
      "",
      "\u2014 The Zoo",
    ],
  },

  releaseDay: {
    subject: "The rite has begun \u2014 Benediction is live",
    preheader: "Hear the blessing. Every note is human.",
    body: [
      "The rite has begun.",
      "",
      "Benediction is live. Hear the blessing:",
      "",
      "",
      "Every note is human. Every lyric. Every melody. Every arrangement.",
      "Every voice you hear spent years becoming itself.",
      "",
      "If this moved you \u2014 tell someone.",
      "",
      "\u2014 The Zoo",
    ],
    listenCta: "Listen on {platform} \u2192",
    allPlatformsLabel: "Also available on:",
  },
} as const;

/* ============================================================
   Bridge Links — Rites \u2194 Relics Cross-Navigation
   ============================================================ */

export const BRIDGE = {
  ritesToRelics: {
    text: "If you are a professional seeking paid opportunities, you may be looking for the Relics page.",
    linkText: "See the Relics \u2192",
  },

  relicsToRites: {
    text: "If you seek the act of community creation without professional obligation, the Rites are where the congregation gathers.",
    linkText: "Join the Rites \u2192",
  },
} as const;

/* ============================================================
   Partner Intake Form — /partner-apply
   ============================================================ */

export const PARTNER_APPLY = {
  title: "Tell Us About Your Craft",
  subtitle: "Heteromorphic Zoo partners with artisans whose craft speaks the same language as the music. If you make things that endure \u2014 forged, carved, painted, sewn, printed \u2014 and you see something of your work in this world, we want to hear from you.",

  howItWorks: {
    heading: "How partnerships work",
    points: [
      "We pay upfront for your design work.",
      "You produce, price, stock, and ship independently. Your craft, your terms.",
      "Our site showcases your work and links to your shop.",
      "No revenue share. No minimums. No contracts.",
      "We trust you to fulfill orders. If you stop, we remove the listing. Simple.",
    ],
    volumeNote: "A note on volume: Heteromorphic Zoo is a niche extreme metal band. Order volume may be low. You should be prepared to store your designs and reactivate production when orders come. The opportunity is creative alignment and exposure to a devoted audience, not high-volume sales.",
  },

  fields: {
    nameLabel: "Your name",
    namePlaceholder: "Or studio name",
    craftLabel: "What you make",
    craftPlaceholder: "Metalwork, illustration, leather, textiles, ceramics\u2026",
    portfolioLabel: "Where we can see your work",
    portfolioPlaceholder: "Website, Instagram, Etsy \u2014 wherever your craft lives",
    pitchLabel: "Why the Zoo",
    pitchPlaceholder: "What about Heteromorphic Zoo resonates with your craft? A sentence or a story \u2014 your call.",
    emailLabel: "How to reach you",
    emailPlaceholder: "your@email.com",
  },

  submitButton: "Send",

  success: {
    headline: "Your craft has been noted.",
    body: "We review submissions when the forge is open. If your work speaks the same language as ours, we will reach out. No timeline. No SLA. Patience is a craft too.",
  },
  errors: {
    invalidEmail: "We need a way to reach you.",
    missingFields: "The forge needs more material. Fill in what\u2019s marked.",
    general: "Something broke the ritual. Try again.",
    network: "The connection was severed. The faithful persist.",
  },
} as const;

/* ============================================================
   AI Policy Card — /card
   ============================================================ */

export const CARD = {
  title: "What\u2019s Human. What Isn\u2019t.",
  subtitle: "A creative attestation.",

  builder: {
    headline: "Declare your sound.",
    headlineBand: "Declare your sound.",
    headlineListener: "Declare your standard.",
    toggleBand: "I make music",
    toggleListener: "I listen to music",
  },

  defaultRows: [
    { domain: "Lyrics", hzScore: 0, hzQualifier: "Every word is conceived and written by a human being." },
    { domain: "Composition & Arrangement", hzScore: 0, hzQualifier: "Every note, every harmony, every rhythm and structural choice." },
    { domain: "Production & Mixing", hzScore: 1, hzQualifier: "No generative AI. Narrow AI deployed for emulation and optimization by various plugins." },
    { domain: "Cover Art", hzScore: 0, hzQualifier: "Painted by Lordigan Pedro Sena." },
    { domain: "Music Videos", hzScore: 2, hzQualifier: "No AI preferred. Industry VFX trends make a hard zero increasingly unusual." },
    { domain: "Performance & Recording", hzScore: 1, hzQualifier: "No generative AI. No AI-mimicked performances. Sample-based VSTs preferred for synths and orchestrations if human performances are unfeasible." },
    { domain: "Mastering", hzScore: 2, hzQualifier: "No generative AI. The line is blurry and we don\u2019t directly control producers\u2019 tools." },
    { domain: "Web Development", hzScore: 5, hzQualifier: "Built with AI. Every page you\u2019re looking at." },
    { domain: "PR & Copywriting", hzScore: 5, hzQualifier: "Written with AI. The words you're reading right now." },
    { domain: "Social Media", hzScore: 3, hzQualifier: "AI assists in drafting. Final voice is usually human." },
  ],

  scaleLabels: {
    0: "No AI",
    1: "Tools only \u2014 no generative AI",
    2: "Mostly human, AI at the edges",
    3: "Mixed \u2014 AI assists, human decides",
    4: "AI-led, human-reviewed",
    5: "AI",
  } as Record<number, string>,

  visual: {
    faultLineLabel: "",
    bandLabel: "Artist Attestation",
    listenerLabel: "Listener Standard",
    bandVerb: "uses",
    listenerVerb: "accepts",
  },

  watermark: "Made at heteromorphiczoo.band/card",
  watermarkHook: "What\u2019s human in your music?",

  export: {
    downloadPng: "Download",
    copyLink: "Copy link",
    sharePrompt: "Your attestation is ready.",
    privacyNote: "This tool stores nothing. Your card exists only in the image you download and the link you share.",
  },

  controls: {
    addRow: "+ Add a domain",
    removeRow: "Remove",
    domainPlaceholder: "e.g. Merchandise design",
    qualifierPlaceholder: "Optional \u2014 explain your stance",
    resetToDefaults: "Reset to defaults",
  },

  firstVisit: {
    heroHeadline: "What\u2019s Human. What Isn\u2019t.",
    heroBody: "Every band makes choices about AI. Most don\u2019t say so. This tool lets you.",
    ctaCreate: "Make yours",
    ctaLearnMore: "Read our policy \u2192",
  },

  hzCard: {
    name: "Heteromorphic Zoo",
    type: "band" as const,
    tagline: "Every note is human.",
  },

  schemaDescription: "AI Policy Card v1 \u2014 heteromorphiczoo.band",
} as const;
