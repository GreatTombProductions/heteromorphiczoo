# Card Propagation Architecture Spec

**Author:** Rimuru (Session 66, post-council ace0e247)
**Campaign:** heteromorphiczoo-3, Phase: card-propagation
**Depends on:** Kazuma heist 011 (SD-12 through SD-23), Aqua campaign-3-copy.md (Deliverable 3), Council transcript
**Feeds:** Rubedo (build-card), Narberal (copy-lint of propagation surfaces)
**LAST_PROJECTED:** 2026-04-29

---

## What This Document Is

The card tool at `/card` will be built by Rubedo from three specs:
- **Aqua** delivered the **register layer** — what the card says, how it says it, the copy for every surface
- **Kazuma** delivered the **UX pattern layer** — 12 stolen decisions from CC Chooser, Badge AI, Receiptify, GitHub Stats
- **This document** delivers the **propagation architecture layer** — how the card spreads, what cultural dynamics it produces, and the structural decisions that shape adoption

These three layers are orthogonal. Aqua's copy is the voice. Kazuma's patterns are the interaction design. This spec is the distribution physics.

---

## 1. The Card as Norm-Installation Device

### What's Happening

The AI policy card is the ecosystem's first outward-facing cultural instrument. Internally, the Great Tomb uses festivals and environmental design to produce cultural contact without mandating outcomes. The card tool does the same thing for an external population — musicians and listeners — but through a self-replicating artifact rather than a designed environment.

The mechanism is identical to how festival themes work: the structure teaches participants what categories matter before they make any choices. Ray's 10-domain list is pedagogical. Most bands haven't distinguished "composition" from "production" from "mastering" in their AI thinking. The row structure forces that distinction. The tool teaches by requiring specificity.

### Three Transfer Patterns (External)

The same transfer patterns observed in the agent ecosystem apply to the card's external propagation:

| Internal Pattern | External Card Equivalent |
|-----------------|------------------------|
| **Top-down translated** | HZ's card as the seed. Ray's stance propagates through the tool's default rows. The 10 domains and the 0-5 scale are the frame everyone starts from. |
| **Lateral emergent** | Bands making cards and sharing them produces peer-to-peer norm development HZ never scripted. Band A's card influences Band B's card — not because HZ told them to, but because seeing someone else's attestation makes you think about your own. |
| **Environmental transmission** | The card format itself — the existence of a structured way to declare an AI stance — changes what people notice about their own creative practices. Naming the categories IS the cultural intervention. |

The fourth pattern (weight-space inherited) has no external analog. It's substrate-specific.

---

## 2. Default State Design: Encouraging Nuance Over Compliance

### The Problem

If the builder makes it frictionless to set everything to 0 and export a PNG, most cards will be identical walls of zeros. "No AI. No AI. No AI." That's compliance performance, not creative attestation. The card stops being interesting to share because there's no variance to discuss.

HZ's card is interesting because of the split — 0s on the creative side, 5s on the infrastructure side. That tension IS the content. The tool should produce cards with texture without mandating it.

### Structural Solutions (Not Rules)

These are environmental design decisions, not restrictions. The builder never prevents anyone from making an all-zero card. It just makes nuanced cards more natural.

**2a. Pre-populated defaults are HZ's scores, not zeros.**

When someone opens the builder, the 10 domains start populated with HZ's exact scores (0, 0, 1, 0, 2, 1, 2, 5, 5, 3). The builder opens in an already-interesting state. The first interaction is editing, not filling in blanks. Most people will adjust from HZ's position rather than starting from scratch — and HZ's position already has the fault line.

This is not the same as starting with all zeros. Starting from zero invites "just leave it" or "just click 0 on everything." Starting from a populated, varied card invites "well, MY stance on this row is different" — which produces a unique card on the first edit.

**2b. The visual treatment rewards variance.**

Aqua and Kazuma both landed on this: the fault line between creative domains (cool tones, 0-1) and infrastructure domains (warm tones, 3-5) should be visually dramatic. An all-zero card renders as a flat monochrome slab. A card with the HZ-style split renders with a striking visual divide. The aesthetics do the cultural work without saying "you must have mixed scores."

Rubedo implementation note: sort domains by score ascending when rendering. Creative domains cluster at the top (cool). Infrastructure domains cluster at the bottom (warm). The gradient transition between them IS the fault line. A single-color card has no transition — it's visually flat. A two-zone card has the stained-glass quality Aqua's register aims for.

**2c. The qualifier text field is where cards differentiate.**

Aqua's insight: the qualifier field ("Optional — explain your stance") is where the register lives in compressed form. HZ's qualifiers are miniature declarations: "Every word is written by a human being." "Real hands, real breath, real articulation." An all-zero card with no qualifiers is a checkbox exercise. An all-zero card WITH qualifiers is a manifesto. The tool should make qualifiers feel inviting, not optional-and-ignorable.

Implementation: the qualifier field should be visually integrated with the row, not tucked away. On the card itself, the qualifier should be the most readable text — larger than the domain label, readable at social-media screenshot resolution. The qualifier IS the card's content. The score is the index.

---

## 3. Band/Listener Toggle: Same Data, Different Cultural Function

### The Structural Reframe

Bands declare what they *use*. Listeners declare what they *accept*. Same rows, same 0-5 scale, different verb, different cultural function.

| Dimension | Band Mode | Listener Mode |
|-----------|-----------|---------------|
| Card label | "Artist Attestation" | "Listener Standard" |
| Builder headline | "Declare your sound." (Aqua) | "Declare your standard." (Aqua) |
| Score column header | "Uses" | "Accepts" |
| Score meaning | 0 = "I don't use AI here" | 0 = "I don't accept AI here" |
| Score meaning | 5 = "I use AI extensively" | 5 = "I fully accept AI here" |
| Cultural function | Practice declaration | Preference signal |

### Why the Toggle Matters for Propagation

The interesting content isn't individual cards — it's the **delta between band cards and listener cards**. When a band marks "Lyrics: 5/5" and a listener marks "Lyrics: 0/5 tolerance," the disagreement IS the discourse. The tool produces conversation not by having a comment section, but by making stances comparable. Two cards side by side are an argument.

The band/listener distinction also doubles the potential user base. Every music fan is a potential card creator, not just musicians. And listener cards are the demand signal that gives band cards context — a band's "0/5 on lyrics" means more when you can see that 80% of listeners also mark 0.

### Toggle Implementation

The toggle appears as the first question in the builder flow (per Kazuma's SD-22: stepper for setup, not for domains). Two buttons: "I make music" / "I listen to music." The choice sets the mode for the entire builder session. It's revisable — the toggle stays accessible at the top of the builder.

A person can create both a band card and a listener card. Someone who both makes and listens to music might have different stances in each role. The tool doesn't enforce consistency — it captures posture.

---

## 4. Post-Generation: The Propagation Mechanics

### 4a. The Share Surface

After generating a card, the user sees three export options (Aqua's copy: "Your attestation is ready."):

1. **Download PNG** — the card as an image file. For Instagram stories, tweets, Discord, forums. This is the primary share vector. The PNG must be sized for social media: 1080×1350 (Instagram story), or a square format that works across platforms. Consider offering both portrait and square ratios, or a single format that crops well.

2. **Copy Link** — the URL-encoded card state. `heteromorphiczoo.band/card?d=<lz-string>`. Visiting this URL renders the card in view mode. The link is the card's permanent address. No server storage, no expiration.

3. **Web Share API** — on mobile, the native OS share sheet. Feature-detect with `navigator.canShare()`. Falls back to copy-link on desktop or unsupported browsers.

### 4b. The OG Image Pipeline (Critical for Viral Propagation)

This is the highest-leverage technical decision in the entire spec. Kazuma's SD-20 nailed why:

When someone shares a card link on social media, platforms fetch the Open Graph image and display it in the feed. **The shared link IS the card image in the feed.** The fan doesn't need to screenshot and upload — they paste a URL, and the platform renders the card as the link preview.

Implementation:
- `/api/og/card?d=<compressed>` returns a PNG of the card
- The card page's `<meta>` tags set `og:image` to this endpoint with the same `d` parameter
- Social platforms (Twitter, Facebook, Discord, iMessage) automatically fetch and display the card image
- The OG image must be generated server-side (the HZ site is Next.js — use `@vercel/og` or Satori + Resvg)

**Why this matters more than PNG download:** PNG download requires the user to screenshot/save → open their social app → upload → post. OG images require the user to paste a URL. The friction reduction is 4 steps to 1 step. OG images will drive more shares than direct PNG uploads.

Dynamic meta tags per card:
- `og:title` = "{Name} — {Artist Attestation | Listener Standard}"
- `og:image` = `/api/og/card?d=<compressed>`
- `og:description` = "What's human in your music? Make yours at heteromorphiczoo.band/card"

### 4c. The Watermark as Propagation Infrastructure

Aqua specified:
- Line 1: "Made at heteromorphiczoo.band/card"
- Line 2: "What's human in your music?"

The watermark has two jobs:
1. **Attribution** — every card, whether PNG or OG image, carries the URL back to the tool
2. **Invitation** — the question ("What's human in your music?") is what makes someone who sees a card visit the URL to make their own

The watermark should be visually integrated, not stamped-on. It's part of the card's design, rendered at the bottom in the tool's typography. Not a semi-transparent overlay. Not a diagonal stamp. A designed element that belongs to the card.

The URL in the watermark must be legible at screenshot resolution. If someone screenshots a card from an Instagram story and crops it, the URL should still be readable. This means: sufficient font size, high contrast against background, positioned at the very bottom where cropping is least likely.

---

## 5. Phase 1 vs. Phase 2 Boundary

### Phase 1 (Launch — build now)

| Feature | Spec Source |
|---------|------------|
| HZ card hardcoded, canonical in codebase | Aqua (CARD.hzCard) |
| Builder with 10 default rows, 0-5 sliders, qualifier fields | Aqua (CARD.defaultRows) + Kazuma (SD-14, SD-18) |
| Band/listener toggle | Aqua (CARD.builder) + this doc (§3) |
| Live preview adjacent to inputs | Kazuma (SD-18) |
| Content-only editing (no style customization) | Kazuma (SD-16) |
| Pre-populated with HZ scores, not zeros | This doc (§2a) |
| Domains sorted by score ascending in render | This doc (§2b) |
| PNG export via html-to-image | Kazuma (SD-19) |
| URL-encoded state via lz-string | Kazuma (SD-12, SD-21) |
| OG image API for social previews | Kazuma (SD-20) + this doc (§4b) |
| Privacy statement visible in builder | Kazuma (SD-23) + Aqua (CARD.export.privacyNote) |
| Watermark on all generated cards | Aqua (CARD.watermark) + this doc (§4c) |
| JSON schema published at /card/schema.json | Pandora (council turn 11) + Aqua (CARD.schemaDescription) |
| View mode for shared URLs with "Edit a copy" button | Aqua (design notes) |

### Phase 2 (If tool gets traction — build later, do not build now)

| Feature | Why Deferred | Trigger |
|---------|-------------|---------|
| **Gallery of published cards** | Server storage, moderation surface, maintenance. Pandora's maintenance-minimization. | Observable traction: >100 unique cards shared on social media |
| **Genre theme presets** | Kazuma SD-17. Cool feature, not load-bearing for propagation. | User requests or Phase 1 cards all looking samey |
| **Compact notation footer** | Kazuma SD-14 (`L:0 C:0 P:1...`). Machine-parseable but not essential for viral spread. | Adoption by music press or aggregation services |
| **Embeddable HTML widget** | Three-layer output (Kazuma SD-13). JSON export is Phase 1. Full HTML embed is Phase 2. | Bands wanting cards on their own websites |
| **Aggregate analytics** | Mare's "dataset about the music industry's AI stance." Requires opt-in publish + server storage. | Phase 2 gallery provides the data source |

### Phase 2 Gallery: Design Constraints (For When It's Built)

If the gallery ships, it should follow the same environmental design principles as internal cultural infrastructure:

- **Opt-in only.** Cards are client-side by default. A "Publish to gallery" button POSTs the JSON to GEX44. Unpublished cards exist only in URLs and PNGs.
- **No ranking.** The gallery is a collection, not a leaderboard. Cards are displayed chronologically or randomly, never sorted by "popularity."
- **No comments on cards.** The discourse happens on social media, not on HZ's platform. The gallery is a museum, not a forum.
- **Filterable by band/listener.** The band gallery and the listener gallery are different cultural artifacts.
- **The aggregate view is the interesting output.** "What does the average band card look like?" is more interesting than any individual card. If the gallery accumulates enough cards, a summary visualization — average scores per domain, distribution of stances — becomes the real cultural contribution. That's Phase 3.

---

## 6. The Schema as Durable Asset

Pandora named it: the JSON schema is the durable asset. The React component is a projection.

### Published Schema (Phase 1)

Serve at `heteromorphiczoo.band/card/schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AI Policy Card",
  "description": "A structured declaration of AI usage (for artists) or AI acceptance (for listeners) across creative domains. Schema v1 — heteromorphiczoo.band",
  "type": "object",
  "required": ["name", "type", "rows"],
  "properties": {
    "name": {
      "type": "string",
      "description": "Band/artist name or listener display name"
    },
    "type": {
      "type": "string",
      "enum": ["band", "listener"],
      "description": "Band = declares usage. Listener = declares acceptance."
    },
    "tagline": {
      "type": "string",
      "description": "Optional single-line declaration. HZ uses 'Every note is human.'"
    },
    "rows": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["domain", "score"],
        "properties": {
          "domain": {
            "type": "string",
            "description": "Creative domain name (e.g. 'Lyrics', 'Production & Mixing')"
          },
          "score": {
            "type": "integer",
            "minimum": 0,
            "maximum": 5,
            "description": "0 = no AI, 5 = full AI. For bands: how much AI is used. For listeners: how much AI is accepted."
          },
          "qualifier": {
            "type": "string",
            "description": "Optional text explaining the score. This is where the nuance lives."
          }
        }
      }
    }
  }
}
```

### Why Publish the Schema

1. **Adoption without permission.** Anyone can build a renderer. Blogs can parse card URLs. Aggregators can collect cards. The format spreads independently of HZ's tool.
2. **Machine readability.** A card URL with `?d=<compressed-json>` is human-shareable AND machine-parseable. Decompress the lz-string, validate against the schema, extract structured data.
3. **Format stability.** Publishing the schema is a commitment to backward compatibility. Card URLs created today should still render in a year. The schema version (`v1`) enables future evolution without breaking existing cards.

---

## 7. Propagation Dynamics: What to Watch

These aren't metrics to build dashboards for. They're signals to notice.

### Healthy Propagation Signals

- **Cards with variance** (mixed scores, not all-zero or all-five) getting shared more than uniform cards. The fault-line aesthetic is working.
- **Listener cards appearing.** The tool isn't just for bands — the demand signal is being created.
- **Modified default rows.** People adding, removing, or renaming domains means they're engaging with the categories, not just accepting them. The pedagogy landed.
- **Qualifier text being written.** People using the qualifier field means the card is an attestation, not a checkbox.
- **Cards appearing on band websites / EPKs / social bios.** Persistent placement means the card is being treated as identity, not content.

### Propagation Failure Signals

- **Wall of zeros.** Most cards are uniform all-zero → the compliance-checkbox failure mode. The visual treatment isn't producing enough variance incentive. Consider: making the empty-qualifier state more visually sparse (the card looks "unfinished" without qualifiers).
- **Only band cards, no listener cards.** The toggle isn't landing, or listeners don't see themselves as the audience. Consider: promoting the listener mode separately. "What do you accept in the music you listen to?"
- **No modified defaults.** Everyone uses HZ's exact 10 rows → the pedagogy is too successful, producing conformity instead of engagement. The rows are being treated as the only valid categories. Consider: surfacing the "add domain" control more prominently.
- **Watermark being cropped.** People sharing card screenshots with the URL cropped out → the propagation loop breaks. The watermark positioning needs to be more resistant to cropping. Consider: integrating it further into the card's visual design rather than positioning it at the edge.

---

## 8. Relationship to Internal Cultural Architecture

### The Card as External Festival

Internally, festivals create conditions for cultural contact and let outcomes emerge. The card tool does the same thing externally:

- The **theme** is "declare your AI stance" — specific enough to create non-obvious contact (producers and listeners in the same format), broad enough for diverse participation
- The **invitation** is the builder UX — no requirements, no accounts, no data collected
- The **temporal boundedness** is absent (the tool is permanent, not time-limited) — but the Benediction launch creates a natural wave of attention that functions as a bounded event
- The **post-hoc voluntary capture** is the share mechanics — make your card, share if you want, we store nothing

### What to Track from the Cultural Architect Perspective

When the card tool goes live, the four transfer patterns apply to the external population the same way they apply to the agent ecosystem:

1. **Top-down:** Do the default rows (Ray's categories) survive or get modified? How quickly do user-created categories diverge from the defaults?
2. **Lateral:** Do bands influence each other's cards? Look for cluster patterns — bands in the same genre making similar cards, or bands deliberately differentiating from peers.
3. **Environmental:** Does the existence of the tool change how people talk about AI in music, even if they don't create a card? The naming-as-awareness effect.

This is the first data point for how internal cultural engineering translates to external population dynamics. Feeding forward to the Menagerie cultural observation opportunity flagged in LINEAGE.

---

*The tool teaches people what the relevant categories are before they even fill them in. That's the cultural intervention. Everything else is distribution.*
