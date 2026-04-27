# Cultural Architecture Specs — heteromorphiczoo.com

*Four cultural design specifications from Rimuru's council contributions. These are not implementation specs — they're the cultural architecture layer that implementation phases embed. Each section maps to a campaign phase dependency.*

**Produced by:** Rimuru (Session 58, post-council f722487c)
**Context:** Council had 8 participants, 19 turns. My contributions were Turns 7 and 14. These specs codify the cultural architecture commitments from those turns.

---

## 1. Lateral Emergence — The "Inspired By" Field

**Campaign dependency:** Phase 6 (Offerings Gallery + UGC Submission)

### The Problem

The engagement spec treats every Offering as a submission to the band: fan creates, band approves, gallery displays. The flow is vertical: fan → band → site. This produces a fan club — a collection of individual relationships with the band.

What's missing is the lateral layer: fan → fan. When a fan creates a cover of Napalm and another fan creates fan art of *that cover*, the second fan's work is a response to the first fan's work, not to the band. Without visibility into these creative chains, the menagerie stays a collection of individuals. With visibility, it becomes a creative community.

Communities outlive the thing that created them. Fan clubs don't.

### The Spec

**One optional field on the Offerings submission form:**

```
Inspired by: [dropdown/search of existing Offerings] (optional)
```

**Behavior:**
- Optional. Most submissions won't use it. That's correct — not every Offering is a response to another.
- When populated, the gallery display shows a "response to" link: "Inspired by [Creator Name]'s [Offering Title]."
- The linked Offering gets a "sparked" counter or section: "This offering inspired N responses." No numeric display until N ≥ 2 — a single response isn't a chain yet.
- The gallery can be browsed as a flat list (default) OR as a creative lineage graph (future enhancement, not MVP). The flat list just shows the "Inspired by" link. The graph view shows chains.

**Schema addition to the Offering entity:**

```
inspired_by_offering_id: string | null  // optional foreign key to another Offering
```

**DP implications:**
- The original creator whose work sparks responses should earn bonus DP. Proposed: +10 DP per response their Offering inspires (Community Tier, uncapped). This rewards the cultural generativity the system wants to produce — not just creating, but creating things that make other people create.
- The responding creator earns normal submission DP. No penalty or bonus for being a response.

**Anti-patterns:**
- NOT a "reply" or "remix" feature. This isn't social media threading. It's creative lineage — a quiet link that surfaces organically in the gallery.
- NOT mandatory. The moment the field is required, every submission becomes a response to something, and the lateral signal drowns in noise.
- NOT bidirectional. The original creator doesn't "accept" or "acknowledge" the link. The curation gate (band approval) handles quality. The link is the submitter's claim, not a mutual relationship.

**Cultural rationale:**

The four transfer patterns apply to the menagerie the same way they apply to the agent ecosystem. Top-down (band → fans) is well-specified in the engagement spec. Lateral emergence (fan → fan) is what the "Inspired by" field enables. Without it, the only visible creative flow is vertical. With it, the gallery becomes a map of how the menagerie's creative culture propagates — who inspires whom, which Offerings become generative nodes. This is the data that tells you whether you've built a community or a fan club.

---

## 2. Industry Surface Guidance — The /press Page

**Campaign dependency:** Phase 8 (Band Content Pages — specifically the Press/EPK page)

### The Three-Consumer Model

The council identified two consumers (Shihoutu Turn 8): the uninitiated and the returning menagerie. There's a third: **industry** — labels, booking agents, press outlets, playlist curators, other bands researching potential tour partners.

Each consumer needs a different register:

| Consumer | Register | Where they land |
|----------|----------|----------------|
| Uninitiated | Liturgical + atmospheric (tartare — feel first, understand later) | Homepage, discovery pages |
| Returning menagerie | Liturgical + familiar (reduction — same register, deeper each visit) | Offerings, Menagerie Roll, Rites |
| Industry | Professional + evidence-based (the numbers, the narrative, the contact) | /press |

### What the /press Page Needs

**The register breaks here — intentionally.** Industry people don't want to feel like they've entered a cult. They want to see the cult working and extract numbers from it. The /press page speaks industry language because its consumer speaks industry language.

**Content (organized for scanning, not atmosphere):**

1. **One-paragraph band summary.** Who, what, where, genre, key differentiators. No liturgical vocabulary. "Heteromorphic Zoo is a Canadian melodic death metal / progressive-symphonic project..." Standard press bio format.

2. **Key numbers.** Monthly listeners, streaming totals, email list size (the Census), social following. Updated from the aggregation pipeline — these should be static JSON values, same as the menagerie display, but formatted for industry legibility. "12,000 monthly Spotify listeners" not "The menagerie grows."

3. **The community evidence.** This is where the site's unique architecture becomes a selling point:
   - Total Offerings count by category (evidence of unsolicited creative engagement)
   - Reactions Wall count (social proof from third parties)
   - Menagerie Roll tier distribution (fan depth, not just breadth — "43 Elders, 312 Deacons" means something to an A&R person)
   - Conversion rate if impressive (23% email capture per the engagement spec is exceptional — display if achieved)

4. **Press quotes.** The NCS review and any future press. Pull quotes, linked to source.

5. **Release chronology.** Compact timeline — dates, titles, key credits. The full atmospheric timeline lives on the Timeline page. /press gets the functional version.

6. **The hook.** The Coty transition narrative: "Not every band announces a lineup change with a dual vocalist song between incumbent and successor." This is the press angle that makes Benediction newsworthy beyond the music.

7. **Assets.** High-res photos, logo files, the Lordigan artwork at print resolution. Either hosted directly or a download link. Industry people need these without asking.

8. **Booking / contact.** Email, management (if applicable), booking contact. Clean, functional.

**What the /press page does NOT contain:**
- Liturgical vocabulary (no "Offerings," no "the menagerie gathers," no "consecration")
- The atmospheric visual treatment from the rest of the site (clean layout, readable typography, white or light background acceptable here)
- Any mention of the AI ecosystem or how the site was built (per Pandora's Turn 16 — the site never explains what built it)

**One architectural note:** The /press page is the only page on the site where the visual register can deviate from the stained-glass spec. A clean, minimal design works here because the consumer expects industry-standard legibility. The atmospheric treatment that makes every other page extraordinary would make the /press page annoying to navigate for a label A&R with 40 tabs open.

---

## 3. First Rite Design — Benediction Launch Window

**Campaign dependency:** Phase 9 (Rites System)

### Context

The engagement spec mentions "seasonal Rites" — themed UGC challenges with bonus DP. My council Turn 7 mapped these directly onto festival design principles. The first Rite is the highest-leverage cultural intervention the menagerie will ever have, because the founding cohort's behavioral norms become the community's norms.

### The Rite

**Name:** "The First Blessing"

**Duration:** 14 days from Benediction release (the Founding Menagerie window)

**Theme:** "What does Benediction sound like in your medium?"

This is deliberately medium-agnostic. A visual artist paints what they see. A guitarist films a playthrough. A writer describes what the song evokes. A dancer films their movement. The theme doesn't constrain format — it constrains conceptual focus. Every submission is a different sensory translation of the same source material. This produces the non-obvious contact that festival design requires: a painter and a guitarist discover they're interpreting the same bridge section.

### Design Principles (from ecosystem festival methodology)

1. **Specific theme creating non-obvious contact.** "What does Benediction sound like in your medium?" is narrow enough to create shared conceptual space (everyone is interpreting the same song) and broad enough to produce creative variety (every medium produces a different translation). Compare to "Submit fan art" — too broad, produces isolated submissions with no shared referent.

2. **Temporal boundedness.** 14 days matches the Founding Menagerie window. This is an event, not a standing policy. The bounded duration creates organic urgency without FOMO-manufacturing. After 14 days, the Rite closes. What was submitted IS the founding record.

3. **Post-hoc capture, not pre-specified output.** No format constraints beyond the existing Offering categories. Let the medium be the fan's choice. The curation gate (band approval) handles quality, not the submission form.

4. **The pad, not the hit.** No rankings during the Rite. No leaderboard. No "vote for your favorite." After the Rite closes, the band features the most resonant Offerings on the Altar (homepage rotation). The absence of real-time competition pressure is what lets people create something genuine instead of optimizing for votes.

5. **Seeded, not empty.** Ray said he'll handle content seeding (reaction videos, fan art, press). Before the Rite opens, the Offerings gallery should already have seeded content — the Lordigan artwork as the first Visual Offering, existing press reviews as Textual Offerings, pre-loaded reaction videos. The founding cohort arrives to a space that's already been consecrated, not an empty warehouse.

### DP Mechanics for The First Blessing

- All submissions during the Rite earn standard Offering DP (per engagement spec categories)
- Founding Menagerie 1.5x multiplier applies (per engagement spec)
- **No additional Rite-specific multiplier for the first Rite.** The 1.5x is already generous. Stacking multipliers on the first Rite devalues subsequent Rites. Reserve Rite-specific multipliers for future seasonal events where the founding multiplier has expired.

### What the First Rite Produces (Cultural Predictions)

- **A founding creative corpus.** Every Offering submitted during "The First Blessing" is the menagerie's founding document. These are the Offerings that early visitors see. The quality and variety of this corpus sets the ceiling for what future fans believe is possible to submit.
- **Cross-medium contact.** A guitarist watching a painter's interpretation of the same bridge section they just played is the environmental transmission mechanism. The Rite theme creates this contact; the gallery makes it visible.
- **The first lateral emergence test.** If "Inspired by" links appear during the first Rite — one fan's submission inspiring another's — that's the signal that lateral creative culture is developing. If they don't appear until later, the vertical (fan → band) pattern is dominant. Both outcomes are data, not failures.

### Announcement Copy (for Aqua / voice spec alignment)

The Rite announcement should use the liturgical register:

> The First Blessing has been called. For fourteen days, the altar receives your translation. What does Benediction sound like in your medium? The menagerie awaits.

Not: "We're launching our first fan art contest! Submit your Benediction-inspired content for bonus points!"

---

## 4. Cultural Telemetry Mapping — The Live Menagerie

**Campaign dependency:** Post-launch (when fan data flows through Mare's pipeline)

### What This Is

A specification for what the fan data pipeline should surface for cultural observation once the menagerie goes live. Not a tool spec — a mapping between the data Mare's pipeline produces and the cultural signals those data encode.

### Mapping: Data Surfaces → Cultural Signals

| Data Surface | Pipeline Source | Cultural Signal |
|-------------|----------------|-----------------|
| Offering submissions by category | `offerings.json` aggregation | Which creative mediums the menagerie gravitates toward. Heavy Visual + Light Sonic = the community is visual-arts-dominant. The balance shifts over time and reflects which founding cohort members were most generative |
| "Inspired by" link frequency | Offering entity relationships | Lateral emergence rate. High = creative community developing. Low = fan club (vertical relationships only). The ratio of linked to unlinked Offerings is the primary indicator |
| "Inspired by" chain depth | Graph traversal on Offering links | Creative lineage depth. Chain depth > 2 means fan-to-fan-to-fan creative propagation — genuine lateral culture, not isolated responses |
| Offering submission rate over time | Time series from `offerings.json` | Engagement decay or growth. The slope after the Founding Menagerie window closes reveals whether the 1.5x multiplier was artificially inflating activity or whether genuine creative culture sustains without incentive |
| DP distribution across tiers | `census.json` | Engagement depth distribution. Healthy: pyramid (many Acolytes, fewer Deacons, rare Elders). Unhealthy: bimodal (many Uninitiated + a few Archbishops, nothing in between — means only hardcore fans engage, casual engagement isn't rewarded enough) |
| Reaction Wall submission rate | `reactions.json` time series | Third-party social proof velocity. New reaction videos are an external signal — people outside the menagerie encountering HZ for the first time. Growth rate here correlates with discoverability |
| Rite participation by Offering category | Cross-reference Rite window timestamps with submissions | Which Rite themes produce which creative mediums. "What does Benediction sound like in your medium?" should produce cross-category submissions. If a Rite only produces one category, the theme was too narrow or the menagerie is more homogeneous than expected |
| Founding Menagerie retention | Track founding cohort activity over months | The most important long-term cultural signal. Do the people who joined during Benediction's launch keep participating after the 1.5x multiplier expires? If yes, the cultural architecture is working — belonging sustains engagement beyond incentives. If no, the system is a loyalty program, not a community |

### What I'll Track Myself (Not in the Pipeline)

These require observation beyond what aggregation scripts surface:

- **Vocabulary adoption rate.** Do fans start using the liturgical vocabulary in their own social posts? "My Offering for the menagerie" vs. "my fan art for HZ." The former signals cultural internalization of the site's register. Track via social media monitoring (manual or automated hashtag/keyword scanning)
- **Cross-medium creative patterns.** Do visual artists reference musicians' covers? Do musicians reference visual Offerings? This is environmental transmission within the menagerie — the same mechanism the canteen produces in the agent ecosystem at small scale
- **The /press page signal.** When industry visitors access /press, that's a discoverability signal. If trackable (analytics on /press page views with referrer data), it tells you whether the community-evidence display is attracting industry attention

### Implementation Notes for Mare's Pipeline

No new pipeline surfaces are needed — the data is already in the schema the engagement spec and yoink spec define. The cultural mapping is a *read* layer on top of existing aggregations:

- `offerings.json` already includes category, submission date, and creator. Add `inspired_by_offering_id` per Section 1.
- `census.json` already includes tier distribution.
- `reactions.json` already includes submission date and metadata.
- Founding cohort identification: any fan entity with `created_at` within the Founding Menagerie window (first 90 days from Benediction launch).

The only addition the pipeline needs is a simple time-series export: weekly snapshots of the aggregation outputs, stored as dated JSON files. This lets me (or Ray, or any analyst) compute deltas and slopes without querying the live database. One cron job appending dated copies of the aggregation output to a `/snapshots/` directory on GEX44.

---

## Summary — What Each Section Feeds

| Section | Campaign Phase | Implementation Agent | When |
|---------|---------------|---------------------|------|
| 1. Inspired By Field | Phase 6 (Offerings Gallery) | Rubedo | When Offerings submission form is built |
| 2. Industry Surface | Phase 8 (Band Content — Press page) | Rubedo | When press/EPK page is built |
| 3. First Rite | Phase 9 (Rites System) | Rubedo | When Rites framework exists |
| 4. Cultural Telemetry | Post-launch | Mare (pipeline), Rimuru (observation) | When fan data flows |

---

*These specs complement, not duplicate, existing specs. The engagement spec defines DP mechanics. The voice spec defines copy register. The visual spec defines visual treatment. These four sections define the cultural architecture that the implementation embeds: how fans relate to each other (lateral emergence), how industry reads the site (press surface), what the first cultural intervention is (first Rite), and what signals the data surfaces for ongoing observation (telemetry mapping).*
