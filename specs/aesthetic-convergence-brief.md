# Aesthetic Convergence Brief

*Phase 2a: Joint foundation for the Visual Design Spec (CZ) and Website Voice Spec (Aqua). Two pages, not twenty. The shared ground that both specs build from.*

**Produced by:** CZ (Session 54, post-council)
**For:** Aqua (Phase 2c), Rubedo (all implementation phases), any agent touching heteromorphiczoo.com

---

## The Core Correction

The council's default instinct — shared by every participant including Aqua and CZ — was "dark, atmospheric, something moves." This is the maximum-entropy "dark metal website" basin. **The Lordigan artwork corrects this.**

The Benediction artwork is not dark. It is **luminous**. Stained glass radiating magenta and crimson from a central portal. A robed, winged figure performing a benediction before a congregation of creatures. The light source is *behind* the stained glass, bleeding outward through something you can't quite see through. The darkest values in the painting are purple-shifted, never neutral grey or pure black. The palette is ecclesiastical — the colors of real stained glass windows at sunset, of illuminated manuscripts, of fire bleeding through colored glass.

**The website should feel like standing inside this painting.** Not framing it. Not displaying it. Inhabiting it.

---

## Shared Palette

Derived from the Lordigan artwork. These are the colors that exist in the painting, not the colors that "dark metal website" suggests.

| Role | Color | Hex (approximate) | Source in artwork |
|------|-------|-------------------|-------------------|
| **Primary glow** | Hot magenta / rose | `#c4286e` | The stained-glass portal's dominant radiance |
| **Secondary glow** | Deep crimson | `#8b1a2b` | Fire at the base, molten ground, warmer shadows |
| **Atmospheric** | Violet / purple | `#4a1942` | Sky, architectural elements, ambient haze |
| **Cool accent** | Cyan / teal | `#4fb8c4` | Stained glass right panel, iridescent creature details |
| **Sacred highlight** | Gold / amber | `#c49a3c` | Portal frame, architectural gilding |
| **Text / light** | Bone white / cream | `#e8ddd0` | The brightest surfaces, logo-adjacent values |
| **Deep ground** | Plum / near-black | `#1a0e1e` | Shadows — purple-shifted, never neutral |

**The rule:** No neutral greys. No `#0a0a0a`. No `#121212`. Every dark value shifts toward purple. Every light value shifts toward cream/gold. The color temperature is warm-dominant with cool contrast, like firelight filtered through stained glass.

---

## Typography Direction

**Display / headings:** Something with weight, history, and ecclesiastical gravity. A blackletter or old-style serif — not thin, not geometric, not sans-serif. The PR context bundle says "liturgical cadence." The type must match. Candidates: a well-crafted blackletter for the site title / section headings, an old-style serif with moderate contrast for secondary headings.

**Body text:** A humanist serif or a legible old-style serif. Not sans-serif — the site is a cathedral, not a dashboard. Readable at paragraph length but with enough character to sustain the register.

**Functional text / UI:** A clean sans-serif is acceptable for navigation labels, form inputs, metadata — the functional layer that sits underneath the atmospheric. But it should feel recessive, not dominant.

**Anti-pattern:** Thin geometric sans-serif everywhere is the luxury fashion basin (Balenciaga, not Benediction). The site has NO relationship to that register.

---

## Motion Principles

1. **Motion serves state, not atmosphere.** If something moves, it's because something changed — content rotating, a section revealing, a gallery shuffling. No decorative CSS keyframes running in perpetuity. No particle.js. No floating dots. No ambient video loops.

2. **Transitions, not animations.** The site transitions between states with weight and intention. A gallery card entering view should feel like something materializing, not sliding in from the left. Opacity transitions and subtle scale changes — the vocabulary of something appearing, not performing.

3. **The reactions wall shuffles.** On each page load, the grid randomizes from the pre-computed JSON. This IS motion — real data rearranging. The shuffle itself can be visually subtle (a brief stagger as thumbnails populate) but it communicates: this is alive, the content is different than last time you came.

4. **Scroll reveals with restraint.** Content can reveal on scroll — but the reveal vocabulary is consistent. Same easing, same duration, same opacity curve. The system is mechanical, not theatrical.

---

## The Two-Consumer Model (from Shihoutu)

The website has two primary consumers and a third industry surface:

**Consumer 1 — The Uninitiated:** First visit. No context. The liturgical vocabulary is strange. That strangeness IS the three-second experience extended through language. The site is tartare — unprocessed, no interpretation provided, the visitor supplies meaning from their own encounter.

**Consumer 2 — The Returning Menagerie:** The same vocabulary that confused a stranger is now home. The register never breaks — not in error states, not in loading states, not in the 404 page. Consistency is what makes inside language feel like inside language.

**Consumer 3 — Industry:** The /press page breaks register intentionally. Professional, clean, numbers-forward. Census stats, EPK, booking contact. Industry people don't want to feel like they've entered a cult — they want to see the cult working.

---

## Where Visual and Voice Diverge

This brief is the shared ground. From here:

**CZ's Visual Design Spec (Phase 2b)** specifies: the full anti-pattern list for visual design, the exact color palette with usage rules, typography selection, texture treatment (grain, noise — the visual equivalent of tape hiss), timeline UX guidance, component-level design constraints.

**Aqua's Website Voice Spec (Phase 2c)** specifies: the text surface register catalog (navigation labels, email capture, confirmation flows, error states, 404, rank-up notifications, loading states, empty states, footer), anti-patterns for copy, format-specific examples, the Coty transition language for the Benediction single page.

**The convergence point:** The stained-glass luminous palette and the liturgical copy register inhabit the same building. A dark, austere visual palette with warm liturgical copy would feel dissonant. A luminous, ecclesiastical visual palette with generic web copy would feel hollow. Both specs serve the same space — a cathedral that glows from within, where the vocabulary is as carefully chosen as the light.

---

*This brief is the shared foundation. CZ and Aqua build their separate specs from this ground. Rubedo reads both specs before touching any implementation.*
