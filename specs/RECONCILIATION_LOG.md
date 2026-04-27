# Spec Reconciliation Log

**Date:** 2026-04-26
**Agent:** Protagonist (Session 62, Phase 0 of heteromorphiczoo campaign)
**Council origin:** f722487c (8 participants, 19 turns)

---

## Changes Made

### Nomenclature: "congregation" → "menagerie"
- All fan-facing uses of "congregation" changed to "menagerie" across all six specs
- The liturgical system vocabulary (Devotion Points, Offerings, Rites, Altar, consecration, ranks) is unchanged
- "Congregation" is reserved for Vampires All the Way Down (VatWD)
- File renamed: `congregation-engagement-spec.md` → `menagerie-engagement-spec.md`

### Rank Hierarchy: Reconciled to Engagement Spec Version
- **Canonical hierarchy (confirmed by Ray, Turn 11):**
  - 0: Uninitiated (0 DP)
  - 1: Acolyte (50 DP)
  - 2: Deacon (200 DP)
  - 3: Elder (500 DP)
  - 4: High Priest/Priestess (1500 DP)
  - 5: Archbishop (5000 DP)
- The yoink spec's alternate hierarchy (Listener/Devotee/Congregant/Celebrant/Officiant with 1000/2500 thresholds) has been replaced with the canonical version
- Reconciliation note added to the yoink spec for traceability

### PR Context Bundle: Vocal Transition
- Ray's credits updated: added "vocals" → "Ray Heberer (composition, arrangement, guitars, vocals, production)"
- Added Coty Garcia as founding member (not current member, per Ray Turn 18)
- Added vocal transition narrative section
- Added narrative hooks #6 (dual-vocalist benediction) and #7 (first member change handled with grace)
- "congregation" → "menagerie" in voice register examples

### Ray's Decisions (Turn 18, Binding)
1. Coty Garcia: founding member honored in timeline, NOT a current member
2. Launch on temporary Vercel URL; Ray handles DNS swap to heteromorphiczoo.com
3. SQLite fan database from day one (not a temporary store)

---

## Specs in This Directory

| File | Content |
|------|---------|
| menagerie-engagement-spec.md | Fan prestige, DP, ranks, UGC categories, prestige display |
| fan-infrastructure-yoink-spec.md | Data architecture yoinks (gaming/nuEra/Dittofeed/CRM) |
| benediction-pr-context-bundle.md | Voice register, anti-patterns, narrative hooks |
| release-automation-spec.md | What AI yoinks, what requires human judgment, workflow |
| MUSIC_MARKETING_POSTURE.md | Contamination defense for web research inputs |
| benediction-lyrics | Benediction lyric sheet |

These are copies of the reconciled originals in `music/heteromorphic-zoo/`. Both locations are canonical after reconciliation.
