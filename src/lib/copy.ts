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
  body: "A blessing spoken in two voices. The founding voice and the new.\n\nNot every band says goodbye with a song.",
  bodyLine1: "A blessing spoken in two voices. The founding voice and the new.",
  bodyLine2: "Not every band says goodbye with a song.",
  ctaPrimary: "Receive the blessing",
  ctaVideo: "Witness",
  credits: "Mixed by Ray Heberer \u00B7 Produced by Greg Thomas \u00B7 Mastered by Joel Wanasek \u00B7 Video by Scott Hansen",
} as const;

export const EMAIL_CAPTURE = {
  prompt: "Join the menagerie.",
  placeholder: "Your name for the roll",
  button: "Enter",
  success: "You have been counted.",
  alreadyRegistered: "You are already among us.",
  errorInvalid: "The roll requires a true name.",
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
  title: "Benediction \u2014 Heteromorphic Zoo (feat. Coty Garcia)",
  description: "A blessing spoken in two voices. The first rite of the new era.",
  image: "/og-image.jpg",
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
  submitSuccess: "Your witness has been received. It awaits consecration.",
  submitError: "The altar rejected the offering. Check the URL and try again.",
  submitDuplicate: "This witness is already known to the menagerie.",
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
  submitButton: "Present Offering",
  submitSuccess: "Your offering has been received. The menagerie will judge its worthiness.",
  submitError: "The altar rejected your offering. Try again.",
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
  joinPrompt: "Your name is not yet written. Join the menagerie.",
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
      title: "The Zoo Awakens",
      body: "Heteromorphic Zoo coalesces in British Columbia. Ray Heberer — guitar, composition, production. Coty Garcia — the founding voice. Megan Ash — violin, written into the architecture, never decoration. Bryce Butler — drums. The tagline crystallizes: worship music for monsters.",
      era: "formation" as const,
    },
    {
      date: "February 2, 2024",
      title: "First Rites — Napalm",
      body: "The first single and music video. No Clean Singing writes of \"utterly deranged vocals that sound like a fight between bull elephants, howler monkeys, and a pack of demons that just escaped Hell.\" The 13-year editorial thread between Ray and NCS reviewer Islander continues.",
      era: "singles" as const,
      videoUrl: "https://youtu.be/8uQZ5Rv8yIs",
    },
    {
      date: "May 10, 2024",
      title: "Second Offering — Avatara",
      body: "Second single and music video. Artwork by Lordigan Pedro Sena. \"Gentle and beguiling at first\u2026 the violin, guitar, and piano elegantly channel wistfulness and sorrow.\"",
      era: "singles" as const,
      videoUrl: "https://youtu.be/nWZVq-u7Lec",
    },
    {
      date: "October 10, 2024",
      title: "The New World Arrives",
      body: "Five vignettes from a coalition of monsters conquering a new realm. Guest appearances: Ville Hokkanen of Synestia on \"Your Final Seconds.\" Raymond Heberer III \u2014 Ray\u2019s father \u2014 on trombone, and Francesco Ferrini of Fleshgod Apocalypse on orchestral arrangement, both on \"Aura of Despair.\" Produced by Chris Wiseman. Mixed and mastered by Christian Donaldson. Artwork by Lordigan Pedro Sena.",
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
      date: "September 2025",
      title: "The Solo Flight — Hexed",
      body: "Megan Ash releases \"Hexed,\" her first solo single. The violinist steps forward as vocalist and artist in her own right. Covered by FemMetal Rocks.",
      era: "solo" as const,
    },
    {
      date: "2025",
      title: "The Crucible",
      body: "The year the zoo went underground and leveled up. Fifteen-plus instrumental mixes with Bryce. One hundred percent real toms and cymbals, snare at ninety percent of the blended tone. Violin tone refined through covers and Hexed. Greg\u2019s production mentorship. Coty sharing vocal chain secrets. The backlog grew. The vision sharpened.",
      era: "crucible" as const,
    },
    {
      date: "April 2026",
      title: "Benediction",
      body: "Ray takes the voice. Benediction \u2014 featuring Coty Garcia \u2014 is a dual-vocalist rite honoring the founding voice and ushering in the next era. Not every band announces a succession with a song where both voices coexist. Written early 2024. Mastered April 2026. The last long-cycle release. Everything after ships faster.",
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
      roles: "Composition, arrangement, guitars, vocals, production",
      description: "Every note in the zoo is written by this hand. The arrangements are scripture \u2014 violin, guitar, and orchestral voices interwoven from inception, not layered afterward. A decade of metal projects before the zoo existed. The one who heard the sound first and transmits it. Now the voice as well as the architect.",
      current: true,
    },
    {
      name: "Megan Ash",
      designation: "The Resonance",
      roles: "Violin",
      description: "The violin is structural \u2014 fugue element, not embellishment. Written into the DNA of every composition. A classical 3-voice fugue between violin, lead guitar, and rhythm section opens \"Ritual of Fidelity.\" Her solo flight, \"Hexed,\" arrived September 2025.",
      current: true,
    },
    {
      name: "Coty Garcia",
      designation: "The Founding Voice",
      roles: "Vocals (founding)",
      description: "The voice that summoned the first congregation. Every word on Napalm, Avatara, the New World EP. Honored as a founding member through the medium of the music itself \u2014 Benediction is two voices in a single blessing. Not every band says goodbye with a song.",
      current: false,
    },
    {
      name: "Bryce Butler",
      designation: "The Engine",
      roles: "Drums, drum arrangement",
      description: "The percussive foundation beneath the orchestral chaos. Drum arrangement credited alongside performance \u2014 the rhythmic architecture is as composed as the melodies above it.",
      current: true,
    },
    {
      name: "Jon Power",
      designation: "The Foundation",
      roles: "Bass",
      description: "The low end that anchors the orchestral chaos. Tracked bass for Benediction. The weight beneath the architecture.",
      current: true,
    },
  ],
  guests: [
    {
      name: "Raymond Heberer III",
      role: "Trombone",
      track: "Aura of Despair",
      note: "Ray\u2019s father. Four trombones on the closing track \u2014 a family operation with elite musicianship.",
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
      note: "Synestia. Adds a second dimension of vocal hostility to the EP\u2019s second track.",
    },
  ],
  collaborators: {
    title: "The Circle of Production",
    entries: [
      { name: "Greg Thomas", role: "Producer (Benediction)", note: "" },
      { name: "Chris Wiseman", role: "Producer, mixing (New World EP)", note: "Shadow of Intent, Currents" },
      { name: "Christian Donaldson", role: "Mixed and mastered (New World EP)", note: "Cryptopsy" },
      { name: "Joel Wanasek", role: "Mastering (Benediction)", note: "" },
      { name: "Lordigan Pedro Sena", role: "Artwork", note: "New World EP, Avatara" },
      { name: "Scott Hansen", role: "Music video (Benediction)", note: "" },
      { name: "Harry Tadayon", role: "Additional production — synth samples (Benediction)", note: "" },
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
      { heading: "The menagerie answers", body: "Submit offerings during the rite window. Standard DP applies. Active multipliers compound." },
      { heading: "The rite closes", body: "No rankings during the rite. No votes. No competition pressure." },
      { heading: "The altar receives", body: "After the rite closes, the most resonant offerings are featured on the altar." },
    ],
  },
  founding: {
    name: "The First Blessing",
    theme: "What does Benediction sound like in your medium?",
    description: "The founding rite. Fourteen days. Every medium welcome \u2014 paint it, play it, write it, move to it. The theme constrains concept, not format. A painter and a guitarist interpreting the same bridge section discover each other through the gallery.",
    dpNote: "Standard offering DP. Founding Menagerie 1.5\u00D7 multiplier applies.",
    announcement: "The First Blessing has been called. For fourteen days, the altar receives your translation. What does Benediction sound like in your medium? The menagerie awaits.",
  },
} as const;

export const PRESS = {
  title: "Press",
  subtitle: "Heteromorphic Zoo — melodic death metal / deathcore / progressive-symphonic from British Columbia, Canada.",
  oneLiner: "Worship music for monsters.",
  bio: "Heteromorphic Zoo is a Canadian extreme metal project led by guitarist and composer Ray Heberer. Drawing strength from all corners of the genre \u2014 melodic death metal, deathcore, progressive-symphonic \u2014 the band integrates structural violin, orchestral arrangements, and relentless composition into a sound built for pariahs, outcasts, and dark souls. Self-released under Great Tomb Productions.",
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
    "Ray Heberer \u2014 Guitar, vocals, composition, production",
    "Megan Ash \u2014 Violin",
    "Jon Power \u2014 Bass",
    "Bryce Butler \u2014 Drums",
  ],
  links: {
    bandcamp: "https://heteromorphiczoo.bandcamp.com",
    spotify: "https://open.spotify.com/album/63jGbRDpMbYBvyklH2WIUT",
    youtube: "https://youtube.com/@heteromorphiczoo",
    instagram: "https://instagram.com/heteromorphic.zoo",
  },
  contact: {
    booking: "hzoo@greattombproductions.com",
    press: "hzoo@greattombproductions.com",
    general: "hzoo@greattombproductions.com",
  },
} as const;
