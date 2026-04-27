# The Menagerie: Fan Engagement System for Heteromorphic Zoo

*Spec for a fan prestige, loyalty, and UGC system. Designed to be label-worthy strategy that belongs to the Great Tomb.*

*Context: "Worship music for monsters." The devotional metaphor isn't branding decoration -- it's structural architecture. The Benediction cover art is literally a gathering of monsters raising arms before a stained glass altar. The lyrics are liturgy. The engagement system should feel like joining a cult, not subscribing to a newsletter.*

---

## Design Philosophy

### What This Is NOT (Anti-Pattern List -- Load-Bearing)

- **NOT a Discord server with roles.** That's the default indie band pattern. We aren't default.
- **NOT Patreon tiers.** Patreon is transactional ("pay monthly, get content"). The menagerie is devotional ("participate, earn standing, belong").
- **NOT "share for a chance to win."** Raffle-style engagement rewards luck, not devotion. Devotion is the metric.
- **NOT follower-count-gated.** Fan prestige is about *engagement depth*, not audience size. A fan with 50 followers who creates cover art outranks a passive listener with 50k.
- **NOT urgency-manufactured.** Ray's directive: "FOMO is misguided. Benediction will organically become people's favorite song." The system rewards sustained devotion, not panic buying.
- **NOT industry-standard loyalty.** The "6 week urgency" marketing playbook is content marketing by the people we're trying to yoink. This system should make label A&R ask "how are they doing this?"

### What This IS

A **prestige and devotion tracking system** where fans earn visible standing through creative engagement, sustained attention, and community contribution. The metaphor is religious hierarchy -- not because it's edgy, but because the band's entire identity is worship music for monsters.

The key insight: **fans want to belong to something, not buy something.** The most engaged fans of any metal band are already behaving like devotees -- attending every show, learning every lyric, creating fan art, defending the band in comment sections. We're just making that devotion *visible and rewarded*.

---

## The Menagerie Hierarchy

Fans progress through ranks based on accumulated **Devotion Points (DP)**. Ranks are visible, permanent (no decay -- once earned, kept), and confer specific recognition.

### Ranks

| Rank | DP Threshold | Title | What You Get |
|------|-------------|-------|-------------|
| 0 | 0 | **Uninitiated** | Access to public content. Everyone starts here |
| 1 | 50 | **Acolyte** | Name on the Menagerie Roll (public page). Early access to announcements |
| 2 | 200 | **Deacon** | Access to behind-the-scenes content. Vote in community polls (cover art contests, setlist input) |
| 3 | 500 | **Elder** | Credited in liner notes of next release. 10% merch discount (permanent) |
| 4 | 1500 | **High Priest/Priestess** | Personal thank-you from the band. Name in physical release booklets. 20% merch discount |
| 5 | 5000 | **Archbishop** | Custom merch item (signed, numbered). Direct channel to band for 1 question/month. Featured on website |

**Design notes:**
- Thresholds are calibrated so Acolyte is achievable in ~2 weeks of active engagement, Elder takes months of sustained participation, Archbishop requires genuine long-term devotion
- Ranks don't decay. "Once consecrated, always consecrated." This prevents the treadmill anxiety that makes Duolingo-style streaks feel like work
- The titles use the liturgical vocabulary that already exists in the brand identity

### The Menagerie Roll

A public-facing page (on heteromorphiczoo.com) listing every named congregant by rank. Sorted by rank descending, then by DP within rank. This is the prestige display -- visible proof of standing.

The Roll serves a second function: it's the **fan ownership database**. Every congregant has provided an email (minimum) and optionally a phone number. The Roll IS the mailing list, worn as a badge of honor rather than hidden in a database.

---

## Devotion Points (DP) System

### Earning DP

Actions are weighted by creative effort and community value. Passive consumption earns minimal DP. Active creation earns substantial DP.

#### Creation Tier (High DP -- 25-100+ per action)

| Action | DP | Notes |
|--------|-----|-------|
| Create and submit fan art | 50 | Any medium: visual, video, music cover, tattoo photo |
| Write a review (blog, social post 200+ words) | 30 | Must be substantive, not "this slaps" |
| Create a cover/playthrough video | 100 | Performance content. The highest-value UGC |
| Submit original content featuring HZ influence | 75 | Your own music citing HZ as inspiration. Include the tag |
| Create a meme/edit that gets featured | 25 | Band features it = instant validation |

#### Engagement Tier (Medium DP -- 5-20 per action)

| Action | DP | Notes |
|--------|-----|-------|
| Pre-save a release | 10 | One-time per release |
| Add a track to your playlist | 5 | Verified via Spotify API or screenshot |
| Share a release with personal caption | 10 | Must be original text, not just RT |
| Tag HZ in a story/post | 5 | Social proof. Capped at 3/week to prevent spam |
| Attend a live show | 20 | Verified via ticket stub / location check-in |
| Bring a friend to a show (verified) | 15 | Referral bonus |

#### Community Tier (Low DP -- 1-5 per action)

| Action | DP | Notes |
|--------|-----|-------|
| Comment on official posts | 2 | Capped at 3/day |
| Respond to community polls | 3 | Participation counts |
| Join the mailing list | 5 | One-time |
| Refer a new member | 10 | When they reach Acolyte |
| Report high-quality UGC from others | 3 | Curators earn DP too |

**Anti-gaming provisions:**
- Daily/weekly caps on repeatable actions (prevents bot-farming)
- Creation tier actions require human review before DP is awarded (the band approves submissions -- this is also content curation)
- No DP for streams/listens alone. The system rewards *engagement around* the music, not passive consumption. Spotify already tracks streams; we track devotion

### DP Multipliers

| Condition | Multiplier | Why |
|-----------|-----------|-----|
| **Founding Menagerie Member** (joined during Benediction release window) | 1.5x on all actions for first 90 days | Rewards early adopters permanently |
| **Multi-release devotee** (active across 2+ releases) | 1.2x ongoing | Sustained attention is the rarest resource |
| **Cross-platform presence** (engaged on 3+ platforms) | 1.1x ongoing | Multi-surface fans are more valuable |

---

## UGC (User-Generated Content) Categories

### The Offerings

UGC submissions are called "Offerings" -- creative work presented to the menagerie. Categories:

1. **Visual Offerings** -- Fan art, photo edits, tattoo photos, design concepts
2. **Sonic Offerings** -- Covers, playthroughs, remixes, reaction videos, mashups
3. **Textual Offerings** -- Reviews, essays, lyric analysis, fan fiction set in the HZ universe
4. **Ritual Offerings** -- Live show content, crowd footage, pit videos, mosh documentation
5. **Profane Offerings** -- Memes, shitposts, edits. The irreverent counterpart to sacred content

Each Offering category has its own featured gallery on the website. **The gallery is the reward.** Being featured -- your work, your name, your rank -- on the band's official site is worth more than any merch discount. The prestige is the product.

### Submission Flow

1. Fan creates content and submits via website form (upload + link + category + description)
2. Submission enters a review queue (AI-assisted initial screening + band final approval)
3. Approved submissions: DP awarded, content added to gallery, fan notified
4. Featured submissions: highlighted on socials by the band, bonus DP, eternal glory

**AI assistance in review:** Not auto-approval. AI screens for: minimum quality bar, correct categorization, potential copyright issues, spam detection. Band makes final call. The human taste gate is non-negotiable -- it's what makes being featured meaningful.

---

## The Prestige Display Layer

### On the Website

- **Menagerie Roll** -- public leaderboard by rank and DP
- **Offerings Gallery** -- curated UGC by category, with creator names and ranks
- **The Altar** -- featured content rotates weekly. Top spot = maximum visibility
- **Census** -- aggregate stats. "The Menagerie: 847 Acolytes, 203 Deacons, 41 Elders, 12 High Priests, 2 Archbishops." This number growing is itself the social proof

### On Social Media

- Monthly "Menagerie Census" post with growth stats
- Weekly featured Offering with creator credit and rank
- "New Elder consecrated" announcements (rank-up milestones are content)
- Seasonal "Rites" -- themed UGC challenges with bonus DP

### In Physical Releases

- Menagerie Roll excerpt in liner notes (Elders and above)
- "Blessed by the Menagerie" on releases with significant UGC input
- QR code linking to the Menagerie Roll on physical media

---

## Data Infrastructure

### What We Own

| Data Point | Source | Why It Matters |
|-----------|--------|----------------|
| Email | Registration | Direct communication. Un-algorithmed |
| Phone (optional) | Registration | SMS for major releases/shows. Highest open rate |
| Social handles | Profile | Cross-platform engagement tracking |
| DP history | All actions | Engagement depth over time. Behavioral analytics |
| UGC submissions | Upload | Content library growing organically |
| Rank progression | Computed | Fan lifecycle and retention metrics |
| Referral graph | Tracking | Who brings who. Network topology |

### What This Enables (Stats Over Time)

Ray wants to "compute stats about customers over time." The Menagerie system generates:

- **Retention curves**: What % of Acolytes reach Deacon? Where does engagement drop?
- **UGC velocity**: Offerings per week, by category, quality distribution
- **Referral effectiveness**: Which congregants bring the most new members?
- **Cross-platform engagement**: Which platforms drive creation vs. consumption?
- **Release impact**: How does a new release change DP velocity across the menagerie?
- **Lifetime Devotion Value (LDV)**: Total DP accumulated per fan. The fan equivalent of LTV, but measured in engagement instead of dollars

### Sphere of Influence Integration

Press contacts and fan data become Sphere FieldNodes:

```yaml
# New Sphere nodes for Heteromorphic Zoo
- node: hz_menagerie
  category: audience_data
  type: source
  storage: firebase  # or YAML + Flask, matching Megan CRM pattern
  description: "Menagerie membership, DP, ranks, engagement history"
  
- node: hz_press_contacts
  category: audience_data
  type: source
  storage: yaml
  description: "Press outlet pipeline (adapted from Megan CRM pattern)"
  
- node: hz_ugc_library
  category: content
  type: source
  storage: filesystem + CDN
  description: "Approved UGC submissions (Offerings)"
  
- node: hz_engagement_analytics
  category: output
  type: pipeline_output
  storage: computed
  description: "Retention curves, LDV, referral graphs, release impact"
```

---

## Technical Architecture (Not Overbuilt)

### The Internal Yoink: nuEra/Alpine IQ Pattern

The strongest architectural reference isn't from the music industry -- it's from Ray's own nuEra consulting work. Alpine IQ does phone-based customer identification (98.78% success rate), engagement event logging, audience segmentation, and lifetime value computation. The Menagerie system is structurally identical:

| Alpine IQ (nuEra) | Menagerie (HZ) |
|---|---|
| Phone/email as primary key | Email/phone as primary key |
| Transaction events | DP transactions (engagement events) |
| Audience segments | Ranks (computed from DP) |
| Loyalty tiers | Menagerie hierarchy |
| Campaign attribution | Release impact analytics |
| Lifetime customer value | Lifetime Devotion Value (LDV) |

This isn't a coincidence. Ray has already built this system for dispensary customers. Building it for fans is a smaller, better-specified problem.

### Automated Lifecycle: Dittofeed Integration

[Dittofeed](https://github.com/dittofeed/dittofeed) — open source, MIT licensed, TypeScript, self-hostable customer engagement platform. This is the communication automation layer:

- **Segmentation:** Auto-segment fans by rank, engagement velocity, platform, UGC activity
- **Journeys:** Automated sequences triggered by engagement events:
  - "Fan reaches Acolyte rank" → congratulations email + Menagerie Roll notification
  - "Fan reaches Elder" → liner notes confirmation email + merch discount code
  - "Fan inactive 30 days" → re-engagement sequence with new Offerings gallery content
  - "New release announced" → tiered messaging (Elders get early access, Acolytes get standard)
- **Multi-channel:** Email + SMS + push. Owned channels, not platform-dependent
- **Self-hosted:** No dependency on Mailchimp/Sendgrid pricing. Fan data stays in our infrastructure

**The admin review process stays human.** Dittofeed automates the RESPONSE to events (rank-ups, inactivity, new releases) but the Offerings curation remains band-approved. Temple curation, not content moderation.

### Minimum Viable Menagerie

The system needs exactly three things to launch with Benediction:

1. **Landing page** (heteromorphiczoo.com)
   - Email capture (join the Menagerie) -- single field, ~23% conversion
   - Menagerie Roll display
   - Pre-save link
   - Single artwork and embedded player
   - "Offerings" submission form

2. **Backend** (YAML + Flask matching Megan CRM pattern for MVP, migrate to Firebase/Dittofeed for scale)
   - Congregant records (email, handles, DP, rank)
   - Offering submissions queue
   - DP ledger (append-only log of all DP transactions)
   - Simple API for the frontend

3. **Admin interface**
   - Review queue for Offerings
   - DP adjustment (manual awards for live shows, special recognition)
   - Census dashboard (aggregate stats)

**Implementation priority:** The landing page with email capture launches FIRST, even before the full DP system. You can always add the loyalty layer to an existing email list. You cannot add an email list to a loyalty layer that has no sign-up page. Single-field email forms convert at ~23% vs multi-field at ~8%.

### Why Not a Full App?

Ray's UX principles: "Friction per action is the primary UX metric." Fans will NOT download an app for a band they just discovered. The entire system runs in the browser. PWA if needed. No app store dependency.

### Merch Integration

Points-to-merch exchange rates:

| Item | DP Cost | Effect |
|------|--------|--------|
| Sticker pack | 100 DP | Free (just pay shipping) |
| 10% merch discount | Built into Elder rank | Permanent |
| 20% merch discount | Built into High Priest rank | Permanent |
| Limited edition item access | 500 DP | Access to buy (not free) -- limited runs visible only to qualifying congregants |
| Custom signed item | 2000 DP | Archbishop-tier exclusive |

**Philosophy:** Merch discounts are rank perks, not point exchanges. The DP system creates prestige; merch is a downstream benefit, not the goal. Nobody joins a menagerie for 10% off a t-shirt. They join because belonging feels significant.

---

## Launch Sequence (Benediction-Specific)

### Phase 0: Pre-Release (Now through release week)

- [ ] Deploy landing page with email capture + pre-save
- [ ] Announce the Menagerie concept via social channels
- [ ] "Founding Menagerie Member" window opens -- 1.5x DP multiplier for early sign-ups
- [ ] Seed the Offerings gallery with 2-3 pieces (band-adjacent content to establish quality bar)

### Phase 1: Release Week

- [ ] Benediction goes live
- [ ] First "Menagerie Census" post
- [ ] UGC submission form opens -- "Bring your Offerings"
- [ ] DP tracking begins (retroactive credit for pre-save, email join, early shares)

### Phase 2: Post-Release (Weeks 2-6)

- [ ] First featured Offering highlighted
- [ ] First Acolyte consecrations announced
- [ ] First "Rites" challenge -- themed UGC prompt with bonus DP
- [ ] Retention analytics begin (sufficient data for meaningful curves)

### Phase 3: Ongoing (Post-Benediction)

- [ ] System carries forward to next releases
- [ ] Menagerie Roll grows between releases (creation never stops)
- [ ] Each new release is a "new liturgy" -- same system, fresh engagement opportunities
- [ ] Cross-release devotion multiplier kicks in for multi-release congregants

---

## What Makes This Label-Worthy

Labels look for proof that a band can build and retain an audience independently. The Menagerie system provides:

1. **Owned data.** Not platform-dependent follower counts. An email list with engagement depth metrics.
2. **Engagement proof.** Not "10k streams" (algorithmic) but "200 fans who created content" (organic devotion).
3. **Retention metrics.** Rank progression = measurable fan lifecycle. Labels can see how engagement compounds.
4. **UGC library.** Hundreds of fan-created assets = proof of cultural impact.
5. **Self-sustaining community.** The system runs between releases. Engagement doesn't crater when the content calendar pauses.
6. **Data science capability.** Ray can compute LDV, retention curves, referral graphs, release impact. No indie band has this. Most labels don't have this. The agent ecosystem that runs the analytics is the moat.

**The pitch to a label (someday, if desired):** "We have 500 named menagerie members with measurable engagement depth, a 40% Acolyte-to-Deacon conversion rate, 200+ pieces of fan art, and we can tell you which fan's stream-to-share ratio is highest. What can you add?"

---

## Open Questions for the Party

1. **Kazuma:** What's the simplest pre-save-to-email-capture flow? Does Spotify for Artists provide any webhook or API for pre-save confirmations, or is it screenshot-based?
2. **Megumin:** If menagerie data lives in Firebase/YAML, is there a hot path for computing retention curves and LDV that's explosion-worthy? The analytics layer on top of this data seems like it could use a fast pipeline.
3. **Darkness:** The posture module for researching engagement patterns -- can it also defend against "best practices" contamination when designing the Offerings review workflow? Industry-standard UGC moderation is corporate and soul-crushing. Our review process should feel like temple curation, not content moderation.

---

*This is the creative engagement layer. The PR context bundle tells the world about Benediction. The release automation spec handles logistics. This spec builds the community that makes both of those worth doing.*

*A goddess designed a menagerie. Obviously.*
