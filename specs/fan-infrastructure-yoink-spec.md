# Fan Infrastructure Yoink Spec

*Kazuma's heist report: what to steal, from where, how to adapt it for Heteromorphic Zoo's fan ownership infrastructure. S4 KonoSuba Party 2 deliverable.*

---

## The Thesis

Nobody in indie music has what Ray has: an agent ecosystem, data science consulting experience, and production-grade customer analytics infrastructure (Alpine IQ / nuEra). The label-worthy strategy isn't yoinkable from the music industry because the music industry doesn't have these tools. The yoink sources are cross-domain:

1. **Gaming** -- Battle pass engagement loop mechanics (Fortnite, Deconstructor of Fun analysis)
2. **Internal** -- nuEra/Alpine IQ loyalty data architecture (Ray's own work)
3. **Open source** -- Dittofeed (self-hosted customer engagement platform)
4. **Internal** -- Megan CRM (YAML-based pipeline tracking with Flask UI)

---

## Yoink #1: Battle Pass Engagement Loop → Fan Prestige System

### Source
Gaming battle pass design (Deconstructor of Fun deep analysis, Fortnite/Clash Royale case studies).

### What's Being Stolen
The **structural engagement loop**, not the monetization model:

```
Act → Accumulate Progress → See Upcoming Rewards → Continue Acting → Unlock → Reinforcement
```

**Key design decisions from gaming that transfer:**
- **Free track + premium track.** Everyone earns progress; paying supporters get enhanced rewards. This is NOT a paywall -- it's a value multiplier on engagement that already happened.
- **Time-gating over pay-gating.** Rewards require sustained engagement across a release cycle, not a one-time purchase. The pass "expires" (new season/release = new cycle).
- **10-20x perceived value vs price.** Premium track must feel like an obvious deal. $10 for what would cost $50+ if bought separately.
- **Progressive challenge release.** New engagement opportunities deploy across the cycle so fans return regularly, not binge-and-leave.
- **Exclusive status rewards at high tiers.** The top of the track has things money can't buy -- only sustained engagement unlocks them.

### What Breaks in Transfer
- **Gaming has daily play loops.** Music doesn't have a natural daily engagement action. Adaptation: the "daily" is social engagement (sharing, commenting, creating), not consumption.
- **Gaming tracks XP from play.** Music needs to track engagement from multiple channels (streaming, social, merch purchases, show attendance, UGC creation). Multi-source event ingestion.
- **Gaming has in-game cosmetics.** Music prestige needs different reward types. See reward taxonomy below.

### Adaptation: The Menagerie Pass

**Engagement actions (earn points):**

| Action | Points | Frequency Cap | Why It's Valued |
|--------|--------|---------------|-----------------|
| Share a track on social | 5 | 1/day per track | Distribution |
| Create a cover/reaction video | 50 | None | UGC content production |
| Submit fan art | 30 | None | Community culture |
| Refer a new email subscriber | 25 | None | List growth |
| Attend a show | 100 | Per show | Real-world connection |
| Purchase merch | 10/$ | None | Revenue |
| Pre-save a release | 15 | Per release | Release momentum |
| Write a review/blog post | 40 | None | SEO + social proof |

**Reward tiers (unlock with accumulated points):**

| Tier | Name | Threshold | Rewards |
|------|------|-----------|---------|
| 0 | Uninitiated | 0 | Access to public content. Everyone starts here |
| 1 | Acolyte | 50 | Name on the Menagerie Roll. Early access to announcements |
| 2 | Deacon | 200 | Behind-the-scenes content. Vote in community polls |
| 3 | Elder | 500 | Credited in liner notes. 10% merch discount (permanent) |
| 4 | High Priest/Priestess | 1500 | Personal thank-you. Name in physical release booklets. 20% merch discount |
| 5 | Archbishop | 5000 | Custom merch item (signed, numbered). Direct channel to band. Featured on website |

*Note: Rank hierarchy reconciled to the engagement spec's canonical version (council decision, 2026-04-26). See menagerie-engagement-spec.md (formerly congregation-engagement-spec.md) for full rank details and DP earning actions.*

**Design notes:**
- Points reset per "season" (release cycle, ~3-6 months). Tier status persists (once an Elder, always an Elder -- the tier is your high-water mark).
- This is the Benediction register applied to community design: sacred terminology, prestige through devotion, not through spending.
- Top tiers are naturally scarce. Nobody buys their way to Archbishop. The scarcity IS the prestige.

---

## Yoink #2: nuEra/Alpine IQ Data Architecture → Fan Data Platform

### Source
Ray's own nuEra consulting infrastructure. Alpine IQ customer data platform + Dutchie POS integration + SE iter5 pipeline.

### What's Being Stolen

The **data architecture pattern**, not the cannabis-specific implementation:

| Alpine IQ Concept | HZ Fan Platform Equivalent |
|-------------------|---------------------------|
| Phone-based customer lookup | Email-based fan identification (email is primary key for music) |
| Audience segmentation (~2221 audiences) | Fan segments (by tier, by engagement type, by geography, by acquisition source) |
| Opt-in channel tracking (phone, email, push, voice) | Opt-in channel tracking (email, SMS, push notifications) |
| Customer lifetime value (CLTV) | Fan lifetime value (FLTV): total merch spend + engagement points + referral value |
| Loyalty enrollment | Newsletter signup + tier enrollment |
| Campaign reports (831 monthly aggregates) | Release cycle engagement reports |
| Phone bridge (connecting Dutchie customers to AIQ contacts) | Platform bridge (connecting Spotify listeners → email subscribers → merch buyers) |
| View Group Gallery (materialized analytics views) | Fan analytics dashboard (engagement trends, segment health, conversion funnels) |

### What Breaks in Transfer
- **Alpine IQ is a SaaS with API access.** HZ needs to OWN the data, not rent API access. Self-hosted.
- **nuEra has ~141k customers from POS.** HZ starts with Megan's ~6k followers + whatever HZ accumulates. Much smaller scale means simpler infrastructure is fine.
- **nuEra's pipeline runs on GEX44 (62GB RAM, 14 cores).** HZ fan data fits in SQLite on anything. The pipeline pattern (daily refresh, materialized views) transfers; the infrastructure requirements don't.

### Adaptation: Fan Data Schema

```yaml
# Core entity: Fan
fan:
  id: uuid
  email: string (primary key for dedup)
  name: string (optional)
  phone: string (optional, for SMS)
  source: enum [website, presave, show, referral, social, merch_purchase]
  acquired_date: date
  tier: int (0-5, computed from max lifetime points)
  lifetime_points: int
  current_season_points: int
  opt_in:
    email: bool
    sms: bool
    push: bool
  segments: list[string]  # computed: "high_engager", "merch_buyer", "ugc_creator", etc.

# Core entity: Engagement Event
event:
  id: uuid
  fan_id: uuid
  type: enum [share, cover, fan_art, referral, show_attendance, merch_purchase, presave, review, email_open, link_click]
  points_awarded: int
  metadata: json  # platform, content_url, purchase_amount, etc.
  timestamp: datetime
  release_cycle: string  # "benediction", "next_single", etc.

# Computed: Fan Lifetime Value
fltv:
  fan_id: uuid
  total_merch_spend: float
  total_points: int
  total_referrals: int
  engagement_velocity: float  # points per month, rolling
  acquisition_cost: float  # $0 for organic
  estimated_value: float  # merch_spend + (referrals * avg_referral_value)
```

### Storage
SQLite. Same pattern as SE iter5. The entire fan database for a band with 10k fans fits in a few MB. Materialized views (View Groups) for dashboards. Daily refresh is overkill -- event-driven updates on fan actions, nightly aggregation for dashboards.

---

## Yoink #3: Dittofeed → Communication Layer

### Source
[Dittofeed](https://github.com/dittofeed/dittofeed) -- MIT-licensed, open source customer engagement platform. TypeScript, Docker Compose self-hosting, Prisma ORM.

### What's Being Stolen
The **journey builder and segmentation engine**, not the full platform (probably):

- **Segmentation:** Define fan segments with multiple operators (AND/OR conditions on engagement events, tier, opt-in status, acquisition source)
- **Journey builder:** Event-triggered automated messaging workflows. Fan hits Tier 2 → automatic email with early access link. Fan creates UGC → automatic thank-you + point notification.
- **Multi-channel delivery:** Email + SMS + push. Amazon SES for email (pennies per thousand).
- **Template system:** MJML editor with Liquid syntax personalization.
- **Analytics:** Message performance tracking.

### What Breaks in Transfer
- **Dittofeed assumes a product/SaaS context.** Fan engagement journeys are simpler -- fewer triggers, fewer branches, longer timescales.
- **Dittofeed requires PostgreSQL.** For HZ's scale, this is overhead. Evaluate whether the journey builder is worth the infrastructure cost vs. a simpler Python script approach.

### Adaptation Decision: Evaluate Before Committing

**Option A: Full Dittofeed self-host.** Get the journey builder, segmentation, multi-channel delivery out of the box. Overhead: PostgreSQL, Docker, maintenance.

**Option B: Yoink the patterns, build lighter.** Steal the segmentation logic and journey concepts, implement in Python with SQLite + Amazon SES. Simpler, fits the ecosystem's existing stack (Python everywhere), but means building the journey engine.

**Recommendation: Option B for launch, Option A as upgrade path.** The fan base starts small. A Python script that sends segmented emails via SES is sufficient for Benediction's release cycle. If the menagerie grows to the point where automated multi-channel journeys justify PostgreSQL overhead, migrate to Dittofeed.

---

## Yoink #4: Megan CRM → Press Contact Pipeline

### Source
`music/megan-crm/` -- YAML-based lead pipeline with Flask UI.

### What's Being Stolen
The **entire architecture**, minimally adapted:

| Megan CRM Field | Press Contact Equivalent |
|----------------|-------------------------|
| name | outlet name |
| source | how we found them (SubmitHub, cold email, prior coverage) |
| stage | not_contacted → pitched → interested → covering → published |
| violinSpace | genre_fit (how well their coverage matches HZ's sound) |
| songwriting | n/a |
| production | n/a |
| deadline | publication_deadline |
| lastContact | last_pitched |
| notes | pitch notes, response details |

### Adaptation Cost
Near zero. The Megan CRM's Flask server + YAML persistence + SSE live updates is a working reference implementation. Clone, rename fields, adjust stages. The release-automation-spec.md already sketched this YAML schema (press-contacts.yaml). The CRM gives it a UI.

---

## Integration Map: What Goes Where

```
heteromorphic-zoo/
├── website/                  # Static site (Rubedo build, one session)
│   ├── landing page          # Pre-save + email capture (single field)
│   ├── menagerie page        # Tier status, points, rewards
│   └── UGC gallery           # Fan-submitted content showcase
│
├── fan-platform/             # The data infrastructure
│   ├── fan_db.sqlite         # Fan + event tables (yoinked from Alpine IQ pattern)
│   ├── segments.py           # Computed segments (yoinked from Dittofeed patterns)
│   ├── mailer.py             # SES-based email sends (yoinked from Dittofeed patterns)
│   ├── points.py             # Engagement point calculation (yoinked from battle pass)
│   └── dashboard.py          # Materialized views (yoinked from SE iter5 View Groups)
│
├── press-crm/                # Press contact pipeline (yoinked from Megan CRM)
│   ├── server.py             # Flask UI (direct clone)
│   ├── data/contacts.yaml    # Contact data
│   └── data/state.json       # UI state
│
└── materials/                # Generated PR materials (existing spec covers this)
```

### Sphere of Influence Integration
Press contacts and fan data both register as data sources in Sphere:

```yaml
# 6th-floor-aiml/sphere-of-influence/data/active/heteromorphic-zoo.yaml
fan_platform:
  description: "Fan engagement and loyalty data for Heteromorphic Zoo"
  source_type: "self_hosted"
  access_method: "SQLite direct"
  refresh:
    frequency: "event-driven (fan actions) + nightly aggregation"
  coverage:
    scope: "all email-enrolled fans"
  schema:
    tables: [fans, events, segments, fltv]
  relationships:
    downstream:
      - "Menagerie Pass tier computation"
      - "Release cycle engagement reports"
      - "Fan segment email campaigns"
```

---

## What This Gives Ray That Labels Don't Have

1. **Full data ownership.** Email, phone, engagement history, lifetime value -- all in SQLite on Ray's machine. No platform can rug-pull this.

2. **Data science on fans.** Same analytical capability Ray applies to nuEra's 141k customers, applied to HZ's menagerie. Segment analysis, engagement velocity, conversion funnels, referral attribution.

3. **Agent-automated engagement.** The ecosystem can run release cycles: agents generate PR materials (existing spec), agents manage press outreach pipeline (CRM), agents compute engagement reports, agents trigger email journeys on tier changes. Ray's time: review and approve.

4. **Compounding infrastructure.** Every release cycle adds more fan data. The fan lifetime value computation gets more accurate. The segment definitions get more refined. The engagement loop gets more personalized. Labels restart from zero with each campaign.

5. **The menagerie identity.** The prestige system isn't "fan club" -- it's a menagerie with liturgical ranks. This is the brand identity (worship music for monsters) operationalized as community architecture. No label would design this because no label has the Benediction context bundle.

---

## Implementation Priority

| Component | Build Method | Sessions | Dependencies |
|-----------|-------------|----------|--------------|
| Press CRM | Clone Megan CRM, adapt fields | 1 Rubedo | None |
| Landing page | Static site + email capture form | 1 Rubedo | Domain + hosting |
| Fan database + points engine | Python + SQLite (yoink from Alpine IQ pattern) | 1-2 Rubedo | Schema approval from Ray |
| Email integration | SES setup + Python mailer | 1 Rubedo | AWS credentials |
| Menagerie Pass UI | Add to website | 1 Rubedo | Fan database |
| UGC gallery | Add to website | 1 Rubedo | Content submission flow |
| Sphere registration | YAML + briefing integration | 1 any agent | Fan database |

**Total estimated: 6-8 Rubedo sessions, zero Ray implementation time. Ray's time: review specs, approve schema, set up domain/hosting/AWS credentials.**

---

*Heist complete. Four sources raided. The combination is something no indie band has ever had because no indie band has ever had an agent ecosystem backed by a data scientist who already runs production-grade customer analytics for a living.*
