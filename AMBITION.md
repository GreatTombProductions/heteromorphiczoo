# Heteromorphic Zoo — AMBITION.md

*Vision and constraints. Never current status. Campaign CLI handles state.*

---

## The Posture

Three surfaces, one value: **human craft is the product, AI is the infrastructure, transparency is the stance.**

| Surface | What it proves |
|---------|---------------|
| **Chronicle** | The music is 100% human. Named collaborators, specific techniques, documented craft. |
| **AI Policy** | The stance is active, not performative. Boundaries drawn, contact channels open. |
| **Merch Partner Program** | The economics back the words. Artisan partnerships, negative margins acceptable. |

These aren't three separate initiatives. They're one posture expressed across three surfaces. The website itself is the proof that the infrastructure layer works. The music is the proof that the creative layer is untouched. The merch is the proof that the stance extends beyond words into economic relationships.

---

## Hard Constraints (Time-Bounded)

### Founding Window: April 28 – July 28, 2026
- `config.py:34-36`: `BENEDICTION_START = "2026-04-28"`
- Fans who join during this window: `founding_member=1`, 1.5x DP multiplier, permanent status
- The founding cohort's behavioral norms become the community's norms
- Pipeline must be live and seeded before Ray drives Instagram traffic
- **Not recoverable** — time-bounded conversions by design

### DNS Swap
- heteromorphiczoo.com must point to Vercel before the old print-on-demand site goes dark
- Old merch disappears with the DNS swap — partner program replaces it
- Every push to the submodule auto-deploys: no staging environment once DNS is live

### Benediction Promotion Cycle
- Coordinated with single release cadence
- Instagram theater → website arrival → menagerie enrollment → founding window mechanics
- The landing page is the continuation of the Instagram experience, not a separate destination

---

## Medium-Term Trajectory (Next 6 Months)

### AI Policy as Competitive Positioning
- The policy isn't a disclaimer — it's the Congregation's founding ethical position
- "Every note is human" as the community's organizing statement
- The /sanctuary contact form as action backing words
- Target: the thing other bands reference when they write their AI policies
- The Neural DSP distinction (modeling vs. generative) demonstrates technical literacy
- Screenshot-survivable: Section 1 works as a standalone image on social media

### Partner Merch Program
- Artisan partnerships, NOT print-on-demand
- Upfront compensation + revenue share — economics inverted from industry standard
- Partner selection as cultural curation: "whose aesthetic extends the Zoo's territory?"
- Each outreach is a specific cultural argument, not a form letter
- `/relics` page with partner attribution as feature, not footnote
- Investment scales with Ray's total income, not band revenue
- "Every shirt costs me 5 dollars net" — this IS the strategy

### Content Pipeline Maturity
- BTS photo infrastructure for Chronicle gallery (expandable timeline entries → photo grids)
- Chronicle content as evidence chain for AI policy credibility
- Production transparency: specific techniques, named collaborators, craft documentation
- The more specific the Chronicle, the more credible the "every note is human" claim

### Community Growth Mechanics
- First Rite during founding window: "The First Blessing" — themed UGC challenge
- Offerings gallery seeded before traffic (cold start prevention)
- Menagerie rank progression targets (what does a healthy rank distribution look like?)
- The "Inspired by" field on Offerings making lateral creative culture visible
- Rites cadence: what Rite #2, #3, #4 look like in practice

### Inner Circle Testing
- 3-5 test accounts walking every pipeline before public promotion
- Email signup → menagerie roll, reaction submission → wall, offering → gallery
- Founding member mechanic verification (1.5x DP multiplier)
- Mobile experience verification

---

## Evergreen Vision (The Subcultural Locus)

### What "Subcultural Locus" Means Operationally
HZ occupies cultural territory that other bands reference. Not by size — by coherence. When a new melodic deathcore band figures out their web presence, HZ's approach becomes the template they either follow or consciously deviate from. That's what "reference point" means — you don't ignore it when making decisions.

### Three Components of the Path
1. **The Congregation has visible culture.** Offerings gallery, Menagerie Roll, Rites — artifacts outsiders can point to. "Look at what HZ's fans are doing." The "Inspired by" field makes creative chains visible, not just isolated submissions.

2. **The infrastructure is replicable.** AI policy, partner program, prestige system — patterns other bands can adopt. HZ benefits from being the first mover. The AMBITION should explicitly name this: "We intend for our approach to be studied and adopted. Raising the bar for the entire scene is the mission."

3. **The economic model is the moat.** Ray's livelihood doesn't depend on HZ. Every decision optimizes for cultural impact, not revenue. Other bands can copy the website. They can't copy the economic freedom that makes artisan partnerships sustainable at negative margins. The disentanglement of art from livelihood isn't a personal choice — it's the strategic moat.

### Longer-Arc Infrastructure
- **Multi-language support** — the Congregation's international reach
- **Live event integration** — when touring begins, the website becomes the pre/post-show hub
- **Video content infrastructure** — BTS, studio sessions, production transparency backing the AI policy
- **Community tools** — what the Menagerie needs as it grows from dozens to hundreds to thousands
- **The partner portfolio at scale** — from initial 3-5 artisans to a curated network

### The Economic Model
Merch-as-propagation. Investment scaling with total income, not band revenue. The "every shirt costs me 5 dollars net" framing means every economic decision prioritizes pattern propagation over extraction. This produces a fundamentally different incentive structure than any band operating under revenue constraints.

### Infrastructure Decisions Constraining Future Phases
- SQLite-only (no external DB) — sufficient to 100K fans
- Static JSON read path — pre-computed, CDN-served, no real-time DB access from frontend
- Vercel for frontend — auto-deploy from main
- GEX44 on saturna — FastAPI + uvicorn, same pattern as GoP API
- Founding window mechanic as reusable pattern — future albums can have their own windows

---

## What This Document Is Not

- **Not current status.** Use `greattomb campaign show heteromorphiczoo-v2` for phase state.
- **Not a campaign spec.** The campaign YAML at `7th-floor-caldera/vents/grand-calculus/campaign-drafts/heteromorphiczoo-v2.yaml` has the phasing.
- **Not a technical spec.** The specs directory has implementation details.

This document captures vision and constraints that survive beyond any single campaign.

---

*Drafted: 2026-04-28 (Council 56332f25, 14 participants)*
*The triangle (Chronicle ↔ AI Policy ↔ Merch) named by Demiurge Turn 14.*
*Founding window constraint surfaced by Nigredo Turn 6, reinforced by Pandora Turn 7.*
*Subcultural locus trajectory specified by Rimuru Turn 8.*
*Infrastructure correction by Mare Turn 12 (no server provisioning needed).*
