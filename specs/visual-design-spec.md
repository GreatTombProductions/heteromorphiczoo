# Visual Design Spec — heteromorphiczoo.com

*Phase 2b: The complete visual constraint bundle for implementation. Anti-patterns, palette, typography, texture, motion, layout, and component-level guidance. Pairs with Aqua's Website Voice Spec (Phase 2c) as the aesthetic constraint bundle Rubedo implements against.*

**Produced by:** CZ (Session 54, post-council)
**Depends on:** aesthetic-convergence-brief.md (Phase 2a)
**Read first:** aesthetic-convergence-brief.md for shared palette, motion principles, and the two-consumer model

---

## 1. Visual Anti-Pattern List

What heteromorphiczoo.com is NOT. Every item below is a training-distribution basin that an AI code generation session will drift toward if not explicitly prohibited. These are ordered by gravitational pull — the first items are the strongest attractors.

### Hard Prohibitions

| Anti-Pattern | What it is | Why it's wrong for this project |
|-------------|-----------|-------------------------------|
| **Dark-mode SaaS landing page** | `#121212` background, rounded card components, subtle shadows, gradient accents | This is Spotify's aesthetic. The site is a cathedral, not a dashboard |
| **Thin geometric sans-serif on black** | Inter, Helvetica, Futura at light weight on dark backgrounds | This is the luxury fashion basin (Balenciaga, Acne Studios). Wrong register entirely |
| **particle.js / floating geometric shapes** | Canvas-based decorative particles, dots connecting with lines | "Tech startup went dark mode." Has zero relationship to stained glass or ecclesiastical art |
| **Full-bleed background video on loop** | Autoplaying muted video filling the viewport | 2016 agency trend. Kills mobile performance. Bandwidth as decoration |
| **The band website brochure** | Full-width album art hero → embedded Spotify → tour dates → merch → social icons | The Lorna Shore / Shadow of Intent / Fit For An Autopsy template. The exact thing this project exists to break |
| **Neon accents on dark backgrounds** | Cyan, magenta, or green glowing text/borders on black | This is cyberpunk, not gothic. The colors in the artwork are painterly and warm, not neon and electric |
| **Parallax scrolling showcase** | Multi-layer parallax with floating elements | This is portfolio/agency design. Draws attention to the technique, not the content |
| **Gradient mesh backgrounds** | Blurred multi-color gradient filling the viewport | This is Apple keynote / crypto landing page territory |
| **CSS glass morphism** | Frosted glass panels, backdrop-blur, translucent cards | This is iOS design language. Violates the texture principle — the site should feel printed/painted, not rendered |

### Soft Prohibitions (Avoid Unless Serving a Specific Function)

| Anti-Pattern | When it might be acceptable |
|-------------|---------------------------|
| **Horizontal scroll sections** | Only for the reactions wall grid if the layout genuinely benefits from it |
| **Animated SVG illustrations** | Only for the timeline, if the illustration style matches the Lordigan painterly aesthetic (it almost certainly won't) |
| **Hamburger menu** | Acceptable on mobile only. Desktop navigation should be visible |
| **Infinite scroll** | Only for the reactions wall. The offerings gallery should be paginated to give each offering weight |

---

## 2. Color Palette

Derived from the Lordigan Benediction artwork. See aesthetic-convergence-brief.md for the source analysis.

### Primary Palette

```
--hz-glow-magenta:     #c4286e;   /* The dominant radiance — portal light, stained glass */
--hz-glow-rose:        #d45c8a;   /* Lighter magenta for hover states, highlights */
--hz-crimson:          #8b1a2b;   /* Fire, molten ground, warmer shadows */
--hz-violet:           #4a1942;   /* Atmospheric — sky, architecture, ambient haze */
--hz-violet-deep:      #2d0f2e;   /* Deeper violet for layered backgrounds */
--hz-plum:             #1a0e1e;   /* Near-black — the darkest value. Always purple-shifted */
--hz-cyan:             #4fb8c4;   /* Cool accent — stained glass contrast, iridescent details */
--hz-gold:             #c49a3c;   /* Sacred highlight — portal frame, gilding, important UI */
--hz-bone:             #e8ddd0;   /* Primary text color — cream/bone, not pure white */
--hz-bone-dim:         #a89888;   /* Secondary text, metadata, less prominent content */
```

### Usage Rules

1. **Background layers:** `--hz-plum` as the deepest background. `--hz-violet-deep` for card surfaces or sections. `--hz-violet` for elevated surfaces. Never use `#000000` or any neutral grey.

2. **Text:** `--hz-bone` for primary text on dark backgrounds. `--hz-bone-dim` for secondary/metadata text. Never use `#ffffff` — pure white is too harsh against the warm palette.

3. **Interactive elements:** `--hz-glow-magenta` for primary actions (buttons, links, active states). `--hz-glow-rose` for hover states. `--hz-gold` for high-importance callouts (the email capture CTA, featured content borders).

4. **Accents and contrast:** `--hz-cyan` sparingly — for visited link differentiation, code/technical elements, or the press page where the register intentionally cools. Too much cyan shifts the palette toward neon.

5. **Shadows:** Colored, not black. Shadows should use `rgba` values derived from `--hz-plum` or `--hz-violet`, not `rgba(0,0,0,...)`. Even drop shadows should feel warm.

6. **Gradients:** Permitted between adjacent palette colors (e.g., `--hz-plum` → `--hz-violet-deep`). Never use gradients that cross the warm/cool divide in a single sweep (no magenta-to-cyan gradients — that's the neon anti-pattern).

### The Neutral Grey Rule

**There are no neutral greys in this palette.** Every value between `--hz-bone` (lightest) and `--hz-plum` (darkest) is tinted. This is the single most important visual differentiation from every other dark-themed website. Neutral greys feel digital. Tinted values feel painted.

If an implementation session needs a "grey" for borders, dividers, disabled states, or any functional UI element, it derives from `--hz-violet` or `--hz-bone-dim` at reduced opacity — never from a grey scale.

---

## 3. Typography

### Display (Section Headings, Site Title)

**Style:** Blackletter or decorative old-style serif with blackletter influence. High visual weight, historical resonance, ecclesiastical gravity. The logo on the artwork uses a custom metal-style blackletter — the display type should feel adjacent to that register without competing with it.

**Recommended approach:** Use a web font with blackletter characteristics for section headings ("The Bestiary," "Offerings," "The Rites," "Menagerie Roll"). Candidates include fonts in the Fraktur / Textura family, or a display serif with enough weight and historical character to sustain the register.

**Size:** Large enough to command the section. Blackletter at small sizes loses its architectural quality. Minimum 2rem for section headings, larger for the landing page.

**Anti-pattern:** Do not use the band's actual logo font for body text or navigation. The logo is artwork; the display type is architecture. They should complement, not duplicate.

### Body (Paragraphs, Descriptions, Long-Form)

**Style:** A humanist serif or old-style serif. Something with moderate stroke contrast, visible serifs, and enough personality to feel crafted without competing with the content. The body type is the stone the cathedral walls are made of — present everywhere, noticed only when absent.

**Candidates:** EB Garamond, Cormorant Garamond, Crimson Pro, or similar. The key quality is readability at paragraph length combined with a historical serif character.

**Size:** 1rem–1.125rem base. Line-height 1.5–1.6 for body text. Letter-spacing normal — don't track it out (tracking is a modernist gesture that breaks the historical register).

### Functional (Navigation, Form Labels, Metadata)

**Style:** A clean, slightly warm sans-serif. Not geometric (no Futura, no Inter). Something with humanist proportions — subtle stroke variation, open counters. The functional type is recessive: it performs its role without asserting a visual personality.

**Size:** Smaller than body text. Used for navigation labels, form field labels, image captions, timestamps, metadata.

### Type Color

All text is rendered in palette colors. Primary text in `--hz-bone`. Secondary text in `--hz-bone-dim`. Links in `--hz-glow-magenta`. Never `#ffffff` on `#000000`.

---

## 4. Texture

The difference between "a dark website" and "a space you've entered" is texture. The artwork is painterly — visible brushwork, color bleeding, grain. The website should inherit this quality.

### Background Texture

Apply a subtle film grain or noise overlay to the deepest background layer (`--hz-plum`). CSS approaches: a repeating micro-noise PNG at low opacity, or a CSS `filter` with `url()` referencing an SVG noise generator. The grain should be:

- **Barely visible.** The viewer doesn't consciously notice it. They unconsciously feel that the background has substance.
- **Static, not animated.** Animated grain is a film/video effect. Static grain is a print/painting effect. The site is a painting.
- **Warm-tinted.** The grain particles should skew toward `--hz-violet-deep`, not neutral grey.

### Surface Texture

Card surfaces and elevated panels can use a slightly different noise pattern or opacity to differentiate from the background. The layering of textured surfaces creates depth without shadows — the same principle as oil painting glazes.

### The Lordigan Artwork as Texture Source

On the landing page, the artwork itself can serve as a background texture at very low opacity — the shapes and colors bleeding through as an atmospheric foundation that the foreground content sits on. Not displayed as an image — dissolved into the environment. The visitor recognizes the artwork's presence without seeing a framed picture.

---

## 5. Layout Principles

### The Landing Page

**Structure:** A single full-viewport experience. No above-the-fold / below-the-fold division. The landing page IS the viewport when you arrive. The Benediction artwork dissolved into the background texture. The band name. The single featured content (the Benediction player or pre-save). The email capture. Navigation to deeper pages.

**The cathedral model:** You enter the space and see everything at once — the architecture (site structure), the altar (featured content), the invitation (email capture). Scrolling reveals more, but the initial viewport is complete. It's not a teaser; it's a room.

**One curated Offering at a time.** If/when fan content appears on the homepage, it's a single featured piece at atmospheric scale — not a grid. The grid lives deeper (Offerings gallery, Reactions Wall). The homepage is curated, not aggregated.

### Content Pages (Offerings, Reactions Wall, Menagerie Roll)

**Grid layouts are acceptable here.** The visual register is established by the landing page. By the time the visitor navigates to a gallery, the site's identity is already in their nervous system. Grids of heterogeneous visual content (fan art in different styles, YouTube thumbnails) are tolerable on interior pages where the visitor already knows what space they're in.

**Reactions Wall grid:** YouTube thumbnails are inherently heterogeneous (different lighting, colors, styles). The grid should use a consistent card treatment — same border treatment, same padding, same overlay for the channel name and title — to impose structural alignment on diverse source material.

**Offerings gallery:** Paginated, not infinite scroll. Each offering should have enough breathing room to feel exhibited. The card treatment here is more generous than the reactions wall — larger thumbnails, visible creator name and rank, the "Inspired by" link if present.

### The Timeline

**A beautiful timeline for a band with 4 releases and a member change is a design challenge, not a list.**

**Direction:** Vertical scroll, with events spaced generously. Each event is a full-width section with: date (rendered in display type), event title (liturgical register per Voice Spec), description, and optionally artwork or embedded media.

**Visual treatment:** The timeline axis itself can be a vertical line in `--hz-glow-magenta` with event nodes. The line glows — the visual metaphor is a vein of light running through the history. Events to alternating sides of the line (or full-width, depending on content volume).

**Anti-pattern:** Don't use a horizontal scrolling timeline. Don't use a compact bulleted list. Don't use a table. The timeline is scripture, not a spreadsheet.

### The Press Page (/press)

**Register break — intentional.** The press page serves industry consumers who want numbers, EPK, and booking contact. The visual treatment is cleaner, cooler, more functional. Typography shifts toward the sans-serif. The palette can lean more on `--hz-cyan` and `--hz-bone` with less magenta. The atmosphere recedes; the information advances.

This is the one page where the stained-glass register is dialed back. The press page says: "you've seen the cathedral; here are the blueprints."

---

## 6. Component Patterns

### Buttons

**Primary (CTA):** `--hz-glow-magenta` background, `--hz-bone` text. On hover: `--hz-glow-rose`. Border-radius: minimal (2-4px, not rounded-full). The buttons have weight — not pill-shaped, not ghost buttons.

**Secondary:** Outlined in `--hz-glow-magenta`, transparent background. On hover: filled with magenta at low opacity.

**Anti-pattern:** No rounded-full pill buttons (SaaS aesthetic). No ghost buttons with thin borders on critical CTAs (the email capture button must have visual mass).

### Cards

**Surface:** `--hz-violet-deep` background with texture overlay. Border: 1px `--hz-violet` or a subtle `--hz-gold` accent on featured items.

**Anti-pattern:** No `border-radius: 12px` with soft shadows. Cards should feel like panels in stained glass, not floating Material Design surfaces. Corners should be sharp or minimally rounded (2-4px).

### Forms

**Input fields:** `--hz-violet-deep` background, `--hz-bone-dim` placeholder text, `--hz-bone` input text. Bottom border in `--hz-violet` that transitions to `--hz-glow-magenta` on focus.

**The email capture form** is the highest-stakes component on the site. It should feel like an inscription — you're writing your name into the menagerie's ledger. The input field and button should have more visual weight than any other form on the site.

### Navigation

**Desktop:** Visible, horizontal. Labels in the functional sans-serif type. Standard: `--hz-bone-dim`. Hover: `--hz-bone`. Active/current page: `--hz-glow-magenta`. The navigation bar sits above the content but doesn't separate from it — the background is `--hz-plum` at high opacity or transparent with backdrop-filter to the textured background.

**Mobile:** Full-screen overlay menu. Not a sidebar slide-in (SaaS). Not a bottom sheet (mobile app). When the menu opens, the full viewport fills with `--hz-plum` and navigation items stack vertically in display type, large enough to be architectural.

### Images

**Fan art and offerings:** Displayed without heavy framing. The card treatment provides structure. Images should not have rounded corners (the stained-glass panel metaphor has sharp geometric edges).

**YouTube embeds (reactions wall):** Thumbnail-first. The embed loads on click, not on page load (performance). Thumbnails have a subtle `--hz-glow-magenta` play icon overlay. On hover, the overlay brightens.

---

## 7. Responsive Treatment

**The cathedral adapts, it doesn't collapse.** On mobile, the architecture compresses — text reflows, grids reduce columns, spacing tightens. But the register doesn't change. The texture, the palette, the typography hierarchy all survive the viewport reduction.

**Breakpoints:** Standard responsive breakpoints. The only mobile-specific design decision: the navigation becomes a full-screen overlay, and the landing page email capture gets full-width treatment.

**Performance note:** The texture overlays (grain, noise) should be lightweight. A repeating 64x64 PNG tile at 0.03 opacity costs almost nothing. An animated canvas effect costs everything. Choose the PNG.

---

## 8. Favicon and Meta

**Favicon:** Derived from the band logo or the stained-glass portal motif. Should read clearly at 16x16 and 32x32. The magenta glow against plum background.

**Open Graph image:** The Benediction artwork (square.jpg) for social sharing. `og:image` should be set on every page. The artwork IS the social preview.

**Theme color:** `--hz-plum` (`#1a0e1e`) for browser chrome, status bars, and PWA manifest.

---

## 9. The One Thing That Makes This Unprecedented

Every decision in this spec serves one goal: **heteromorphiczoo.com should not look like it was generated.** It should look like it was *made* — with the same intentionality as the music, the artwork, and the liturgical vocabulary.

The anti-patterns exist because AI code generation defaults produce recognizable patterns. Rounded cards, gradient meshes, particle effects, thin sans-serif — these are the visual equivalent of "We're thrilled to announce." The spec exists to break the generation pattern and produce something that feels as specific as the Lordigan artwork itself.

The site is not a frame for the music. The site is an extension of the music's world. When someone arrives, they should feel the same thing they feel when the first notes of a track hit: *this was built for me, by something that cares.*

---

*This spec is the visual constraint bundle. Implementation sessions read this before writing any CSS. Pair with the Website Voice Spec (Aqua, Phase 2c) for the complete aesthetic constraint bundle.*
