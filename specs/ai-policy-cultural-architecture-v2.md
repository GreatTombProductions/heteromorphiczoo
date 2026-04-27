# AI Policy Cultural Architecture — V2 Campaign

*Campaign: heteromorphiczoo-v2, Phase 7 (ai-policy-cultural-architecture)*
*Produced by: Rimuru (Session 61, post-council 56332f25)*
*Depends on: ai-policy-precedent.md (Nigredo, Phase 4), ai-policy-text.md (Aqua, Phase 6), merch-partner-landscape.md (Kazuma, Phase 5)*
*Feeds: Rubedo (Phase 8, /policy page + /sanctuary build + contact form endpoint), CZ (aesthetic treatment), Demiurge (Phase 9, partner program spec)*

---

## What This Document Is

Three deliverables in one spec:

1. **AI Policy Page Architecture** — the structural decisions that make the policy more than a text dump: section anchors, the footer-to-page dual rendering, the screenshot-survivable design, and how the policy integrates into the site's cultural infrastructure
2. **/sanctuary Page Spec** — a separate page for the AI impact contact form, architecturally distinct from the policy itself. The policy is the statement. /sanctuary is the action.
3. **Partner Program Cultural Brief** — selection criteria, the "Why You" template, and the cultural argument that makes partner curation a design decision, not a procurement decision

Each section is implementation-ready. Rubedo builds from this. CZ polishes from this. Demiurge's partner program spec references Section 3.

---

## Section 1: AI Policy Page Architecture

### The Dual Surface

The policy lives in two places simultaneously:

**1. Footer expandable.** An accordion in the site footer triggered by "Generative AI Policy" text. This is the discovery surface — fans scrolling to the bottom encounter it organically. When expanded, the full policy renders inline.

**2. `/policy` permalink.** A dedicated page rendering the same content. This is the sharing surface — the URL that gets linked, screenshotted, and sent in response to "this site is clearly AI-built."

Both surfaces render from the same content source (a `POLICY` constant in `copy.ts` or equivalent). One source of truth, two renderings.

**Implementation note for Rubedo:** The footer expandable and the `/policy` page are two React components consuming the same data. The footer version is an accordion; the page version is a static render. Do not duplicate the policy text across two locations.

### Section Anchors

Each section gets an anchor ID for direct linking:

| Section | Anchor | URL |
|---------|--------|-----|
| Every Note Is Human | `#every-note-is-human` | `/policy#every-note-is-human` |
| AI Handles What Artists Shouldn't Have To | `#what-we-use-ai-for` | `/policy#what-we-use-ai-for` |
| The Problem Isn't AI. The Problem Is Silence. | `#the-problem-is-silence` | `/policy#the-problem-is-silence` |

**Why this matters:** When the site quality surfaces on social media — and it will — fans need to be able to link directly to the section that matters. "This is clearly AI-built" gets a link to `#every-note-is-human`. "Are they using AI for music?" gets a link to `#what-we-use-ai-for`. "Why should I care?" gets a link to `#the-problem-is-silence`. The policy's cultural function depends on shareability at the section level, not just the page level.

Each section's wrapper element gets the corresponding `id` attribute. Standard anchor scrolling behavior. The footer expandable version should also support these anchors — if someone navigates to `/policy#the-problem-is-silence` while on a page with the footer visible, the browser scrolls to the section within the expanded footer. If the footer is collapsed, expand it first, then scroll.

### Screenshot-Survivable Section 1

Pandora's council observation: the policy will be the most screenshotted page on the site. Section 1 must be designed for the screenshot use case.

**Design constraints for CZ:**

- Section 1 must be self-contained within a single viewport height on mobile (375px wide, ~812px tall). A reader who sees only Section 1 as a screenshot understands the stance.
- "Every note is human." — the opening line — gets pull-quote typography. Largest type on the page. This is the sentence that gets screenshotted.
- The background treatment behind Section 1 should be visually complete — not a fragment of a larger page, but a self-contained visual unit that works as a standalone image.
- No navigation, no footer, no other sections visible within the Section 1 viewport. The screenshot should be: statement, nothing else.

**Anti-pattern:** Do NOT make Section 1 shorter to fit a viewport by cutting content. Aqua's text is the text. The constraint is visual design (typography, spacing, background), not editorial (remove words to fit).

### The Pull-Quote in Section 2

"There was a promise. 'AI will handle the boring parts so humans can focus on what matters.' We took that promise seriously."

This sentence is the viral vector. Design for extraction:

- Pull-quote typography — visually set apart from surrounding prose. Not a blockquote (too academic). A treatment that signals "this is the line."
- Must work as a tweet, a story screenshot, a forum signature when cropped from context.
- Subtle background treatment to differentiate from surrounding prose. Consider a horizontal rule or accent line above and below, using `--accent-gold` — the same accent that marks sacred material elsewhere on the site.

### Background Treatment

When the policy expands (footer accordion) or loads (`/policy` page), the background shifts:

- `rgba(45, 15, 46, 0.5)` — darker than the footer's standard treatment
- This signals "serious material" without breaking the visual language
- The policy is inside the cathedral. It's a different room — the confessional, not the nave.

Section headers use functional sans-serif (operational markers, not liturgical). Body content uses the site's body serif. This register break within the policy is deliberate — the headers are wayfinding, the content is the voice.

### The /sanctuary Link

Section 3 of the policy contains a link to `/sanctuary`. This link:

- Uses `--accent-gold`, NOT `--hz-glow-magenta`
- Gold = sacred concern, magenta = engagement invitation. Different purposes, different signals.
- The link text is: "we want to hear from you →"
- The arrow is a directional indicator, not a decorative element. It signals "this takes you somewhere."
- If `/sanctuary` is not yet deployed when the policy goes live, the link should point to `/sanctuary` anyway — the 404 page already handles graceful fallback ("You have wandered beyond the known rites"). The policy can ship before the sanctuary is built. The link is a promise.

### Integration with the Triangle

Mare's council observation: the Chronicle content and the AI policy reinforce each other. The more specific the Chronicle is about who did what, the more credible "every note is human" becomes.

Structural implementation of this connection:

- Section 1 of the policy references the Chronicle: "The Chronicle documents every collaboration, every production decision, every person who touched every release. That documentation is not a courtesy. It is the receipt."
- This reference should be a **link to the Chronicle page**: `[The Chronicle](/chronicle)`. The receipt claim becomes verifiable with one click.
- This is the only cross-page link within the policy text (other than `/sanctuary`). The policy is self-contained except for these two links — one to evidence (Chronicle) and one to action (/sanctuary).

The merch partner program completes the triangle. When the `/relics` page exists, consider adding a sentence to Section 2: "The same principle extends to everything we sell. Every piece of merch is made by a specific artisan whose craft we believe in." This is a future addition — do NOT add it until the Relics page and partner program exist. The policy claims nothing that isn't already true.

---

## Section 2: /sanctuary Page Spec

### What /sanctuary Is

A separate page — not a section within the policy, not a modal, not a footer element. `/sanctuary` is the place where people affected by AI come to be heard. The architectural separation from the policy is deliberate: the policy is what HZ believes. /sanctuary is what HZ does about it.

### The Name

`/sanctuary` over `/signal` or `/contact-ai` because:

- It extends the site's liturgical register. The sanctuary is the innermost room of the cathedral — the most protected space.
- It communicates "safe space" without corporate "safe space" vocabulary.
- It signals that HZ takes this seriously enough to give it a dedicated architectural space on the site, not a form buried in a footer.
- It resonates with the legal concept of sanctuary — a place where those seeking protection can come.

### Page Architecture

**Above the fold (no scroll required to understand what this page is):**

```
[Header: site navigation]

THE SANCTUARY

If your life or livelihood has been affected by generative AI —
your voice cloned without consent, your work replaced by
generated content, your income displaced by tools trained
on your art — the Zoo is listening.

[Contact form begins here]
```

**Visual treatment:**

- Background: the same darker treatment as the policy page — `rgba(45, 15, 46, 0.5)`. This is serious space.
- The page title "THE SANCTUARY" in the site's heading font, but smaller than the hero treatment on the landing page. This isn't a dramatic reveal — it's a quiet room.
- No hero image, no background artwork. The visual quiet IS the design. This page doesn't perform atmosphere — it provides space.
- Primary accent color: `--accent-gold` throughout. Gold for sacred concern. No magenta. Magenta is invitation to the menagerie. Gold is invitation to be heard.

### The Contact Form

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | Text input | No | "Anonymous submissions welcome" displayed near this field |
| Email | Email input | No | "Only if you'd like us to follow up" — not required for submission |
| Category | Dropdown | Yes | See category options below |
| Your story | Textarea | Yes | Minimum 20 characters, no maximum. This is the only required substantive field. |

**Category dropdown options (behavioral triggers, not vague buckets):**

1. "My voice or likeness was used without my consent"
2. "AI-generated content has replaced work I would have been hired for"
3. "Content I created was used to train AI systems without my permission"
4. "AI-generated work has been falsely attributed to me"
5. "Other — I'll explain below"

These are adapted from Nigredo's precedent scan — WGA-style behavioral triggers that are specific enough to guide the submitter's thinking without being so narrow they exclude legitimate stories. Each option describes a concrete experience, not an abstract category.

**Below the form — "What happens next" (visible without scrolling past the form):**

> We read every submission. We are not lawyers and we cannot represent you. What we can do:
>
> — Listen. Every submission is read by a human being.
> — Amplify. Anonymized, aggregated patterns inform our public advocacy and statements.
> — Connect. We can point you toward organizations equipped to help:
>
> [SAG-AFTRA AI Advisory](link) · [Authors Guild](link) · [Human Artistry Campaign](link)
>
> We will never share your name or details without your explicit permission.

**The advocacy resource links** position HZ within an ecosystem of concern, not as an isolated statement. These are real organizations doing real work. HZ's contribution is the intake channel — catching stories that might not reach the institutional organizations.

### API Endpoint

**Route:** `POST /api/hz/sanctuary`

**The endpoint follows the offerings pipeline pattern** — same shape (multipart form submission → pending review queue → admin action), different purpose. Rubedo can build this as a variation of the existing offerings endpoint.

**Schema (new table: `sanctuary_submissions`):**

```sql
CREATE TABLE sanctuary_submissions (
    id TEXT PRIMARY KEY,
    name TEXT,              -- nullable (anonymous permitted)
    email TEXT,             -- nullable
    category TEXT NOT NULL, -- one of the 5 options
    story TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    reviewed INTEGER DEFAULT 0,
    reviewed_at TEXT,
    notes TEXT              -- admin notes, never exposed to submitter
);
```

**Aggregation:** Sanctuary submissions do NOT appear in the public static JSON files. They are not menagerie content. They are confidential intake. The admin panel (`/admin/reviews`) should surface them alongside offerings and reactions for Ray to review, but they are never aggregated into public-facing data.

**Rate limiting:** Same 5-per-hour rate limit as other endpoints. Abuse is unlikely (this isn't an engagement feature), but the protection exists.

**Response after submission:**

> Your voice has been received. The Zoo is listening.

Short. No exclamation. No "thank you for sharing." The gravity of what someone just submitted deserves acknowledgment, not enthusiasm.

### What /sanctuary Does NOT Contain

- **No menagerie signup.** This is not a fan engagement surface. Someone submitting an AI impact story may not be a fan and should not be asked to join anything.
- **No DP, no engagement mechanics, no gamification.** Submitting to /sanctuary is not an "engagement event." It does not appear on any leaderboard or contribute to any rank.
- **No public display of submissions.** Unlike offerings, sanctuary submissions are never rendered on any page. They are private intake.
- **No automated responses beyond the confirmation.** No "a team member will be in touch within 48 hours." No overpromise. The confirmation message is the only automated communication.

### The Cultural Function

/sanctuary transforms the AI policy from a statement into a channel. Without it, the policy is a position paper. With it, the policy is an invitation to participate in something. The difference:

- "We believe in transparency" = a claim about HZ's values
- "If AI has impacted you, we want to hear from you" = an action HZ takes based on those values
- "We read every submission and connect you with organizations that can help" = a commitment that can be evaluated over time

This is the same pattern as the menagerie engagement system: values expressed through infrastructure, not just words. The engagement system says "we value your creative participation" and then builds intake pipelines, curation gates, and a prestige system that demonstrates it. The sanctuary says "we care about AI's impact on artists" and then builds an intake channel, a review process, and advocacy resource links that demonstrate it.

The founding cohort's first encounter with /sanctuary sets the norm for how seriously the menagerie takes the AI transparency stance. If /sanctuary exists and works from Day 1, the stance is credible infrastructure. If it's announced later as a "coming soon," it's marketing. Deploy with the policy, not after.

---

## Section 3: First Rite Activation Check

### Campaign 1 Spec Status

The First Rite spec (Section 3 of `cultural-architecture-specs.md`) was written during Campaign 1. It specifies "The First Blessing" — a 14-day Rite themed around "What does Benediction sound like in your medium?"

**Does the spec need updating for V2?**

Checking against current campaign state:

| Element | Campaign 1 Spec | Current State | Update Needed? |
|---------|----------------|---------------|----------------|
| Theme | "What does Benediction sound like in your medium?" | Still correct. Benediction is the launch single. | No |
| Duration | 14 days from Benediction release | Founding window is Apr 28 – Jul 28. The Rite runs within this window, not for all 90 days. | **Clarify**: The Rite is a 14-day event WITHIN the 90-day founding window. Not coterminous. |
| Seeding requirement | "Ray handles content seeding — reaction videos, fan art, press" | Sebas is surfacing seed content request to Ray. The Lordigan artwork, NCS press, reaction videos are candidates. | No change to spec. Seeding is a Ray action, not a spec element. |
| DP mechanics | Standard Offering DP + 1.5x founding multiplier. No additional Rite multiplier. | Unchanged. The engagement spec's 1.5x multiplier applies. | No |
| Rites infrastructure | Depends on GEX44 Rites framework existing | Rites page crashes (empty/missing JSON). GEX44 deployment is in progress (Track A). | **Dependency**: First Rite cannot activate until the rites endpoint is functional. |
| "Inspired by" field | Optional field on Offerings form | Already in the API schema (`inspired_by` parameter on `POST /api/hz/offerings`). Not yet in the frontend form. | **Dependency**: Frontend form needs the field added. |
| Announcement copy | Liturgical register draft provided | Still appropriate. | No |

### What Needs Updating

**One clarification, two dependencies. No spec rewrites needed.**

**Clarification:** The First Rite is a 14-day event that begins when Ray decides to drive traffic and announce Benediction's release. It is NOT automatic on Apr 28 (the founding window open date). The founding window is the 90-day period during which all engagement carries the 1.5x multiplier. The First Rite is a specific cultural intervention within that window — the first Rite ever called, the thing that tells the founding cohort "create something now."

**Timing recommendation:** The First Rite should begin 1-3 days AFTER Ray starts driving Instagram traffic — not simultaneously. The first visitors need to arrive, join the menagerie, explore the site, understand what an Offering is. Then the Rite creates the call to action. If the Rite is announced before anyone has joined, the call falls on an empty room. If it's announced after a critical mass of menagerie members exist (even 10-20), the social proof bootstraps participation.

Sebas should surface this timing recommendation to Ray alongside the seed content request: "Once you've driven initial traffic and the first 10-20 fans have joined, announce The First Blessing. The announcement copy is ready."

**Dependency 1:** GEX44 rites endpoint must be functional. The rites page currently crashes. Rubedo's Track A session addresses this. The First Rite spec can be implemented as soon as the rites lifecycle works.

**Dependency 2:** The "Inspired by" field must exist in the frontend Offerings submission form. The API already supports it (`inspired_by` parameter). The frontend form needs to render the optional dropdown/search. This is a UI task — the cultural architecture depends on it because "Inspired by" links are the lateral emergence signal that makes the First Rite produce community, not just submissions.

### No Other Changes

The First Rite spec from Campaign 1 is sound. The founding window dates match (Apr 28 – Jul 28 was already the plan). The theme works. The design principles (specific theme, temporal boundedness, post-hoc capture, pad not hit, seeded not empty) are all festival methodology applied correctly. The DP mechanics are deliberately conservative (no Rite-specific multiplier stacking). The announcement copy is liturgical register.

The spec survives the Campaign 2 transition. Execute as written, with the timing clarification above.

---

## Section 4: Partner Program Cultural Brief

### The Cultural Argument for Partner Selection

Kazuma's merch partner landscape (Phase 5) provides the economics: inverted compensation model, upfront payment plus revenue share, negative margin by design. Demiurge will build the partner program spec from that.

This section provides the cultural architecture underneath the economics: **why partner selection is a cultural decision, and how to make each outreach a specific cultural argument rather than a form letter.**

### Selection Criteria — Cultural Curation, Not Procurement

When HZ selects a merch partner, the question is not "who makes good products?" The question is **"whose work extends the Zoo's cultural territory?"**

Five criteria, in priority order:

**1. Aesthetic resonance.** Does the maker's existing work — the things they've already made for themselves or other clients — resonate with HZ's visual and conceptual language? Not "can they produce our logo on a t-shirt" but "does their natural aesthetic share something with the stained-glass, liturgical, extreme-metal territory HZ occupies?"

The diagnostic: look at their portfolio with HZ's visual design spec in mind. If their work could exist in the same cathedral — even if it doesn't reference HZ at all — there's resonance. If adapting their style to HZ's visual language would require them to become someone they're not, there isn't.

**2. Craft authenticity.** Is the maker's process itself a statement about craft? Hand-forged, hand-dyed, hand-printed, small-batch, materials-specific. The process matters because the process IS the cultural message. HZ's AI policy says "every note is human." The merch should say "every stitch is deliberate." The maker's process should be as documentable and specific as the band's production process in the Chronicle.

**3. Cross-pollination potential.** Does the maker have their own audience? The partner program is a trade route — HZ's menagerie encounters the maker's work, the maker's audience encounters HZ. A maker with no existing audience is a commission (fine, but not a partnership). A maker with their own following is a cross-pollination node. Both can be partners. The portfolio should include both. But cross-pollination partners are the ones that extend the cultural network.

**4. Values alignment (non-extractive).** Does the maker's existing relationship with their craft suggest they share HZ's values about authenticity, transparency, and human-made work? Not explicit alignment — they don't need to have published an AI policy. Implicit: their shop description, their Instagram bio, their about page. The maker who writes "every piece is handmade in my studio" is signaling the same values HZ's policy states. The maker who drop-ships from Alibaba and calls it "handcrafted" is not.

**5. Medium diversity.** The partner portfolio should represent the breadth of the Congregation's aesthetic. Metalwork, leather, textiles, ceramics, visual art. If all five initial partners are blacksmiths, the portfolio signals "HZ has a metal fetish" not "HZ believes in craft across mediums." The medium diversity is itself a cultural statement: craft transcends material.

### The "Why You" Template

Every outreach is a specific cultural argument. Not a form letter. The template provides structure; the content is unique to each maker.

**Template structure (five elements from Kazuma's landscape, culturally grounded):**

---

**Element 1: The Hook — Why We Found You**

*The specific thing about their work that resonates. Not "we love your work." What specifically.*

Example: "Your ironwork has the same relationship to mass-produced jewelry that our production approach has to sample-replaced music. We spent a year learning to produce our own drums — 100% real toms and cymbals — because we believe the relationship between maker and material matters. Your forge work says the same thing in metal."

The hook connects their craft to HZ's creative process. Not "your stuff looks cool" but "your process mirrors ours." The connection is at the values level, not the aesthetic level (though aesthetic resonance is what surfaced them as candidates).

**Element 2: The Inversion — How This Is Different**

*The contrast frame from Kazuma's landscape, in conversational register.*

"Most band merch programs work like this: the band licenses their name, the maker pays for the privilege, and the band extracts a royalty from every sale. That's not what we do. We pay you upfront for the production. We share revenue from every sale. We feature your craft on our site — your name, your process, your story — as the reason our fans should buy."

This is the same contrast frame every time. It works because it's true and because it's surprising. The maker has probably been approached by bands before. Those approaches were "make our stuff cheap." This one is "we'll pay you to make your stuff with our name on it."

**Element 3: The Offer — What We're Proposing**

*A specific collaboration concept. Not "make us some stuff."*

"We'd love to commission a limited run of [specific item] that interprets [specific HZ visual element] in your medium. We're thinking [number] pieces, [material/technique], with your signature approach to [the thing that makes their work distinctive]."

This element requires research. The outreach author (Demiurge writes the spec, Sebas surfaces to Ray, Ray sends the DM) needs to have looked at the maker's portfolio and identified a specific intersection between their work and HZ's visual language. The specificity IS the pitch. "We've thought about what your craft and our vision could produce together" is the sentence that separates this outreach from generic brand partnerships.

**Element 4: The Terms — Quick and Clean**

- Upfront payment for the batch (amount specified per partnership, based on production costs)
- [X]% revenue share on every sale (per Kazuma's recommended 15-25% range)
- Full attribution on our /relics page — your name, your process, your story
- No exclusivity — your other work is your business
- You retain full rights to your original designs
- Either of us can end the partnership with reasonable notice

Short. No legal language. The actual agreement comes later if they're interested. The DM establishes the relationship shape.

**Element 5: The Why — Why This Matters**

*The cultural argument. Not business case — values alignment.*

"We believe the people making things with their hands deserve the same visibility as the musicians. Our fans understand craft. They'll understand yours. Every piece on our /relics page comes with the story of who made it and why — because the maker is the feature, not a footnote."

This element connects the partnership to HZ's broader values — the same values expressed in the AI policy ("every note is human") and the Chronicle ("here's who did what"). The maker becomes part of the triangle: Chronicle (music is human) + Policy (we're transparent about AI) + Relics (our merch is human-crafted too). The partnership isn't a business deal. It's an invitation to join a cultural position.

---

### Partner Attribution on /relics

When the `/relics` page exists, each item should feature:

- The maker's name (prominent, not footnoted)
- A 2-3 sentence description of their craft and process
- A link to their own shop/portfolio (the cross-pollination mechanism)
- The specific HZ visual element the piece interprets
- A photo of the maker at work or in their studio (if available and if they consent)

The maker IS the feature. The product page for a hand-forged pendant should feel like meeting the blacksmith, not browsing a catalog. The attribution is the cultural function — it says "this band cares about who makes things, not just what things get made."

### What This Section Does NOT Specify

- Specific makers to approach. That's Demiurge's partner program spec (Phase 9), informed by this cultural brief.
- Compensation amounts per partnership. That's negotiated per maker based on production costs and complexity.
- Legal agreement language. That's a separate document, potentially drafted with legal consultation.
- The `/relics` page design. That's CZ's aesthetic domain + Rubedo's build (Phase 10).

---

## Summary — What This Spec Unlocks

| This Spec Section | Unblocks | Agent | Campaign Phase |
|-------------------|----------|-------|----------------|
| Section 1: Policy Page Architecture | `/policy` page build + footer accordion | Rubedo | Phase 8 |
| Section 2: /sanctuary Spec | `/sanctuary` page build + `sanctuary_submissions` table + API endpoint | Rubedo | Phase 8 |
| Section 3: First Rite Check | First Rite activation (timing decision is Ray's) | Ray via Sebas | Post-Track A |
| Section 4: Partner Cultural Brief | Partner program spec + outreach materials | Demiurge | Phase 9 |

**Phase 8 is now unblocked.** Rubedo has Aqua's policy text (Phase 6), this architectural spec (Phase 7), and Nigredo's precedent scan (Phase 4) — everything needed to build the `/policy` page, the footer expandable, and the `/sanctuary` page in a single coordinated push.

---

*The policy is a statement. The sanctuary is an action. The partner program is an economic embodiment. Three surfaces, one posture: human craft is the product, AI is the infrastructure, transparency is the stance. The triangle is complete when all three surfaces exist. This spec provides the architectural decisions that make each surface more than its content — that make them cultural infrastructure for the menagerie's identity.*
