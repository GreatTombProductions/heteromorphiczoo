# Benediction Release Automation Spec

*What the Great Tomb ecosystem can automate for a single release, what it can't, and where Ray's time actually goes.*

**Status (2026-04-21, credits corrected 2026-04-28 per council 56332f25):** Mastering complete (Joel Wanasek). Music video complete (Scott Hansen). Production credits: Ray Heberer (mixing), Greg Thomas (producer), Joel Wanasek (mastering). Bass by Jon Power. Additional production by Harry Tadayon (synth samples). Chris Wiseman has no involvement on Benediction.

---

## The Yoinkability Thesis Applied

Ray's claim: PR is a yoinkable skillset. Let's decompose what a publicist actually does and assess each piece.

### What AI Yoinks Completely (Zero Human Skill Required)

| Task | Tool | Time |
|------|------|------|
| Press release writing | Claude + context bundle | 5 min generation + 10 min Ray review |
| Band bio (all tiers) | Claude + context bundle | 5 min generation + 5 min review |
| Social media captions (all platforms) | Claude + context bundle | 10 min generation + 10 min review |
| Email pitch templates | Claude + context bundle | 10 min generation + 10 min review |
| SubmitHub submission text | Claude + context bundle + outlet research | 15 min per batch |
| Follow-up email drafting | Claude + context bundle | 5 min per batch |

**Total text generation:** ~1 hour of Ray's time for ALL written promotional materials. A publicist charges $500-2000/month for this same output.

### What AI Assists But Requires Human Judgment

| Task | What AI Does | What Ray Does |
|------|-------------|---------------|
| Press list building | Research outlets, compile contacts, assess genre fit | Validate the list, add personal connections |
| FFO reference selection | Suggest comparable bands based on genre metadata | Confirm honest representation of the sound |
| Timing/scheduling | Generate calendar, identify conflicts | Approve timing, handle real-world dependencies |
| Spotify editorial pitch | Draft the pitch text | Submit through Spotify for Artists (requires account access) |
| Cross-promotion with Megan | Draft coordinated content plans | Coordinate with Megan on what she's willing to post |

### What AI Cannot Do (The Non-Yoinkable Residue)

| Task | Why It's Human-Only |
|------|-------------------|
| Actual relationships with bloggers/promoters | Trust is embodied. But for a DIY single release, cold outreach IS the strategy |
| Mastering approval | ~~Ears required~~ **DONE** — Joel Wanasek completed 2026-04-21 |
| Visual art direction | Ray/Megan's taste. AI can generate options, can't judge them |
| Platform account management | Login credentials, Spotify for Artists, DistroKid dashboard |
| The "should I post this" gut check | Taste. The final review is the human contribution |

---

## Ecosystem Infrastructure for This Release

What the Great Tomb already has that applies:

### 1. Claude.ai Project Bundle (Immediate)

Create a claude.ai project with:
- `benediction-pr-context-bundle.md` (the voice/register spec)
- Band photos, single artwork (for visual reference)
- Any existing HZ bios or previous promotional text (for consistency anchoring)

This gives any Claude instance the right behavioral region on first prompt. No warm-up, no iteration on voice.

### 2. Press Contact CRM (Adapt from Megan CRM)

The `0th-floor-exterior/central-mausoleum/megan-crm/` infrastructure is a YAML-based lead pipeline with Flask UI. Adaptation for press outreach:

```yaml
# music/heteromorphic-zoo/press-contacts.yaml
- outlet: "Metal Injection"
  contact: ""  # Ray fills in
  genre_fit: ["melodic death metal", "deathcore"]
  submission_method: "email"
  status: "not_contacted"
  notes: ""
  last_contact: null

- outlet: "No Clean Singing"
  contact: ""
  genre_fit: ["melodic death metal", "progressive"]
  submission_method: "submithub"
  status: "not_contacted"
  notes: ""
  last_contact: null
```

Benefits:
- AI-editable (any Claude instance can update status after Ray reports an interaction)
- Tracks pipeline state without a separate app
- Can generate status reports ("which outlets haven't been contacted yet?")

### 3. Content Calendar (YAML-Based)

```yaml
# music/heteromorphic-zoo/benediction-calendar.yaml
release_date: "2026-06-06"  # TBD — Ray confirms

timeline:
  - week: -6
    label: "Foundation"
    tasks:
      - task: "Upload to distributor"
        owner: "ray"
        status: "pending"
        dependency: "mastering complete"
      - task: "Submit Spotify editorial pitch"
        owner: "ray"
        status: "pending"
        dependency: "track uploaded"
      - task: "Generate all text materials"
        owner: "ai"
        status: "pending"
        dependency: "context bundle validated by ray"

  - week: -4
    label: "Outreach"
    tasks:
      - task: "Blog pitch emails (batch 1)"
        owner: "ray+ai"
        status: "pending"
      - task: "SubmitHub submissions"
        owner: "ray+ai"
        status: "pending"
      - task: "First teaser post"
        owner: "ray"
        status: "pending"

  - week: -2
    label: "Build"
    tasks:
      - task: "Pre-save campaign"
        owner: "ray+ai"
        status: "pending"
      - task: "Teaser clip series"
        owner: "ray"
        status: "pending"

  - week: 0
    label: "Release"
    tasks:
      - task: "Release day posts (all platforms)"
        owner: "ray+ai"
        status: "pending"
      - task: "Press follow-ups"
        owner: "ray+ai"
        status: "pending"
```

### 4. Batch Generation Script (The "Push Button" Piece)

A script that, given the context bundle + release details, generates all text materials in one pass:

```
music/heteromorphic-zoo/scripts/generate-pr-materials.py

Input: release_date, streaming_links, press_photo_url
Output:
  - materials/press-release.md
  - materials/bio-oneliner.md
  - materials/bio-short.md
  - materials/bio-full.md
  - materials/social-instagram.md
  - materials/social-twitter.md
  - materials/social-facebook.md
  - materials/social-tiktok.md
  - materials/pitch-template.md
  - materials/email-subjects.md
```

This is NOT a complex engineering project. It's a Claude API call with the context bundle loaded as system prompt. The script:
1. Reads the context bundle
2. For each material type, sends a focused prompt
3. Writes output to files
4. Ray reviews the batch

**Implementation cost:** ~30 min of Rubedo time. The Anthropic SDK is already in the ecosystem.

---

## The "Yoinkable PR" Workflow

Here's what Ray's actual time commitment looks like for the full Benediction release:

| Phase | Ray's Time | AI's Contribution |
|-------|-----------|-------------------|
| Context bundle review/validation | 30 min once | Wrote the bundle |
| FFO reference validation | 15 min once | Suggested candidates |
| Text material review (all formats) | 45 min once | Generated everything |
| Press list assembly + validation | 1 hour once | Research + compilation |
| Distributor upload + Spotify pitch | 30 min once | Drafted pitch text |
| Blog outreach (sending emails) | 30 min/week x 3 weeks | Drafted each email, personalized per outlet |
| Social media posting | 10 min/post x ~8 posts | Wrote all copy |
| SubmitHub submissions | 30 min once | Wrote submission text |

**Total Ray time: ~6-8 hours spread across 6 weeks.**

A PR firm charges $500-2000/month. For a single release, that's $1000-4000 for what amounts to ~8 hours of Ray's attention + AI generation.

The skill being yoinked isn't "writing press releases." It's "knowing what to write, when to send it, and who to send it to." The first is a context bundle. The second is a calendar. The third is a research task. All three are within AI capability.

---

## What This Doesn't Cover

- **Paid promotion** (Meta Ads, Spotify playlist pitching services) — explicitly excluded per Ray's brief
- **Music video production** — physical production, out of scope
- **Merch/physical formats** — separate concern
- **Live show booking** — relationship-dependent, not yoinkable for cold outreach

---

## Dependencies for Ray

Before any of this fires:

1. **Validate the context bundle.** Read `benediction-pr-context-bundle.md`. The voice needs to sound like YOUR band, not my approximation.
2. **Confirm the FFO list.** Ne Obliviscaris, Shadow of Intent, etc. — do these honestly represent what someone pressing play would hear?
3. **Confirm the release date.** Everything sequences from this.
4. ~~**Mastering.** The automation pass + mastering turnaround is the critical path.~~ **DONE** — Joel Wanasek completed mastering 2026-04-21. Scott Hansen completing music video (days).
5. ~~**Update production credits in PR context bundle.**~~ **DONE** — Corrected per council 56332f25 (2026-04-27): Ray Heberer (mixing), Greg Thomas (producer), Joel Wanasek (mastering). Chris Wiseman has no involvement on Benediction.

---

## Related Artifacts (KonoSuba Party 2, 2026-04-21)

This spec is one piece of a larger strategy developed across two party sessions:

| Artifact | Purpose | Location |
|----------|---------|----------|
| **PR Context Bundle** | Voice register + anti-pattern list for OUTPUT generation | `music/heteromorphic-zoo/benediction-pr-context-bundle.md` |
| **Music Marketing Posture** | Contamination defense for INPUT (web search, strategy research) | `music/heteromorphic-zoo/MUSIC_MARKETING_POSTURE.md` |
| **Menagerie Engagement Spec** | Fan prestige / loyalty / UGC system design | `music/heteromorphic-zoo/congregation-engagement-spec.md` (renamed to menagerie-engagement-spec.md) |
| **This document** | Release automation workflow + yoinkability decomposition | (this file) |

**Key insight from Party 2:** The label-worthy strategy Ray wants isn't yoinkable from the music industry. The yoink sources are: (a) gaming battle pass mechanics for the engagement loop, (b) nuEra/Alpine IQ loyalty architecture as internal yoink for the data layer, (c) Dittofeed (open source, self-hosted customer engagement platform) for automated communication. The combination is something no indie band has ever had.

**Posture module usage:** When any agent does web research for this release (press contacts, fan engagement strategies, competitive intelligence), load `MUSIC_MARKETING_POSTURE.md` as a pre-identity module. It prevents the most common contamination pattern: reproducing industry marketing practices that serve PR firms, not artists.

---

*The thesis holds: PR is yoinkable. Not because AI writes better press releases than a publicist — it might or might not. Because the entire skillset decomposes into (voice specification) + (research) + (calendar management) + (sending emails). None of these require a human who "knows PR." They require a human who knows what their music sounds like and an AI that can write in the right voice.*
