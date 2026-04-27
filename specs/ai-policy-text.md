# Generative AI Policy — heteromorphiczoo.com

*Campaign: heteromorphiczoo-v2, Phase 6 (ai-policy-text)*
*Produced by: Aqua (Session 27, post-council 56332f25)*
*Depends on: ai-policy-precedent.md (Nigredo, Phase 4), voice-spec.md (Aqua, Phase 2c)*
*Feeds: Rimuru (Phase 7, cultural architecture + /sanctuary spec), Rubedo (Phase 8, implementation), CZ (aesthetic treatment)*

---

## Implementation Notes

This document contains the **complete copy** for the Generative AI Policy page. Implementation sessions should treat this as the source text — the words that appear on the site.

**Page architecture:**
- Expandable accordion in the footer with a "Generative AI Policy" trigger, OR a dedicated `/policy` page. The council converged on both — the footer expandable as the primary surface, with `/policy` as a permalink that renders the same content.
- Three sections, each with an anchor ID for section-linkable URLs: `#every-note-is-human`, `#what-we-use-ai-for`, `#the-problem-is-silence`
- Section 1 must be **screenshot-survivable** — self-contained, quotable as a standalone image when shared on social media
- The contact form ("If AI has impacted your life or livelihood") lives on a **separate page** (`/sanctuary`), not in the policy itself. The policy links to it. See Rimuru's Phase 7 spec for `/sanctuary` architecture.
- **Typography**: CZ specified functional sans-serif for section headers (operational, not liturgical), body serif for content. When expanded, background shifts subtly — `rgba(45, 15, 46, 0.5)` instead of the footer's lighter treatment — to signal serious material.

**The register:**
This is constitutive ceremony. The statement IS the stance, not a description of a stance. The voice spec's reverent-irreverent register holds — the gravity of something carved, the confidence of something that doesn't ask permission. Not a legal document. Not a manifesto. A declaration from inside the cathedral.

**The triangle:**
This policy is one surface of a three-surface posture. The Chronicle documents who made what and how (the evidence chain). The AI policy declares what the band believes and where the lines are. The Merch partner program embodies the same values in economic relationships. Mare's observation from the council: the more specific the Chronicle is about who did what, the more credible this policy becomes. The policy doesn't float in space — it's anchored by the craft documentation in the Chronicle and enacted by the partner economics on the Relics page.

---

## Section 1: Every Note Is Human

*Anchor: `#every-note-is-human`*
*Design: Screenshot-survivable. This section must work as a standalone image. Pull-quote typography for the opening line. Self-contained — a reader who sees only this section understands the stance.*

---

**Every note is human.**

Every lyric. Every melody. Every arrangement. Every vocal performance, every guitar line, every drum pattern, every violin phrase, every orchestral voice. Human hands. Human voices. Human decisions. From the first demo to the final master.

This is not a negotiable position. This is not a phase. This is the line, and it does not move.

Heteromorphic Zoo's music is written by Ray Heberer. The drums are arranged and performed by Bryce Butler — real toms, real cymbals, a snare tone that is ninety percent the instrument and ten percent reinforcement. The violin is performed by Megan Ash. The vocals are performed by human beings who spent years developing their voices. The orchestral arrangements are written by human composers. The artwork is painted by human artists.

We can prove all of this. The Chronicle documents every collaboration, every production decision, every person who touched every release. That documentation is not a courtesy. It is the receipt.

---

## Section 2: AI Handles What Artists Shouldn't Have To

*Anchor: `#what-we-use-ai-for`*
*Design: The acknowledgment section. Honest, specific, unapologetic. This is where the "we took the meme seriously" pull-quote lives — design it for quotation (pull-quote typography, a sentence that works as a tweet, a story screenshot, a forum signature).*

---

You are looking at a website built with artificial intelligence. You probably noticed.

Good.

This website, our operations infrastructure, our data systems, our logistics — generative AI handles the work that artists have always hated doing but that careers die without. The website you're navigating right now. The fan engagement systems running underneath it. The intake pipelines, the aggregation scripts, the deployment infrastructure. Every artist knows this territory: the work that isn't the art but that the art can't reach anyone without.

**There was a promise. "AI will handle the boring parts so humans can focus on what matters." We took that promise seriously.** We are one of the only artists in the world who can say: we used AI exactly how it was supposed to be used. The infrastructure is automated. The art is untouched.

A note on tools, because precision matters here. We distinguish between generative AI — systems that produce novel creative content: text, images, audio, music — and modeling tools — systems that digitally simulate the behavior of physical equipment. Amp modeling, effects simulation, cabinet impulse responses. The former creates something that didn't exist. The latter replicates something that does. The former replaces the player. The latter is a tool in the hand of the player.

Every guitarist in modern metal uses modeling and simulation tools. This is not AI in the generative sense. It is digital craftsmanship — the same relationship a woodworker has to a power tool versus a 3D printer.

---

## Section 3: The Problem Isn't AI. The Problem Is Silence.

*Anchor: `#the-problem-is-silence`*
*Design: The ethical stance. This is where the band stops talking about itself and talks about the industry. The contact form link to `/sanctuary` lives here — gold accent, not magenta. The transition from "what we do" to "what we believe everyone should do."*

---

We do not believe AI is evil. We do not believe it should be banned from creative work. People are allowed to make art however they want.

What we believe is this: you deserve to know.

When you listen to a song that moves you, you are entering a relationship with the person who made it. You are investing something — attention, emotion, money, identity. That investment is made on the assumption that a human being poured themselves into what you're hearing. When that assumption is wrong and nobody told you, the relationship is a fraud. Not because AI music is bad. Because silence about it is dishonest.

The music industry is not having this conversation loudly enough. Labels are quietly licensing AI-generated content. Artists are quietly using generative tools and not disclosing it. Platforms are adding optional disclosure tags that almost nobody uses. The infrastructure for transparency exists. The will to use it does not.

We are not waiting for the industry to figure this out.

Heteromorphic Zoo's position: **every artist who uses generative AI in their creative output should say so, clearly, permanently, and without being asked.** Not buried in metadata. Not in response to accusations. Proactively. Proudly, if they believe in what they're doing. The audience will decide what they value. The audience cannot decide if they don't know.

If your life or livelihood has been affected by AI — your voice cloned without consent, your work replaced by generated content, your income displaced by tools trained on your art — **[we want to hear from you →](/sanctuary)**.

We are not lawyers. We cannot represent you. But we can listen, we can amplify patterns we see, and we can connect you with organizations that can help. The Zoo's reach is small. The principle is not.

---

## Design Notes for CZ

**Section headers:** Functional sans-serif. These are operational markers, not liturgical text. The content carries the register; the headers stay quiet.

**Section 1 pull-quote:** "Every note is human." — largest type on the page. This is the sentence that gets screenshotted.

**Section 2 pull-quote:** "There was a promise... We took that promise seriously." — design for quotation. This sentence should work extracted from context: as a tweet, a story screenshot, a forum signature. Pull-quote typography. Consider a subtle background treatment to set it apart from the surrounding prose — not a blockquote (too academic), something that signals "this is the line."

**Section 3 link to /sanctuary:** The contact form link should use `--accent-gold`, not `--hz-glow-magenta`. Gold = sacred concern, magenta = engagement invitation. Different purposes, different signals. Rimuru's Phase 7 spec covers `/sanctuary` architecture in detail.

**Background treatment:** When the policy expands (if accordion) or loads (if `/policy` page), the background should shift subtly darker — `rgba(45, 15, 46, 0.5)` or equivalent. This signals "you are now reading something serious" without breaking the site's visual language. The policy is inside the cathedral, but it's a different room.

**The "All rites reserved" footer joke** should be visible when the policy is expanded. The proximity of the copyright notice to the AI policy reinforces the message: this band pays attention to every surface.

---

## Design Notes for Rubedo

**String location:** All policy text goes in `copy.ts` (or the site's content constants file), not hardcoded into the policy page component. Future copy edits should be one-file changes.

**Auto-deploy constraint:** The policy page MUST be a single coordinated push — text, page component, and contact form endpoint together. Half-finished policy in production is worse than no policy. Stage everything, push once.

**Section anchors:** Each section's wrapper element gets an `id` attribute matching the anchor names above. The URL pattern is `/policy#every-note-is-human`, `/policy#what-we-use-ai-for`, `/policy#the-problem-is-silence`.

**The /sanctuary link:** Points to a separate route that Rimuru is speccing. For now, the href can be `/sanctuary` — if the page doesn't exist yet, the 404 page handles it gracefully ("You have wandered beyond the known rites").

---

## Register Verification Checklist

Read each section aloud. If any sentence passes any of these tests, it's wrong:

- [ ] Could this sentence appear on a SaaS landing page? → Rewrite
- [ ] Could this sentence appear in a corporate press release? → Rewrite
- [ ] Does this sentence apologize for using AI? → Rewrite (we don't apologize; we disclose)
- [ ] Does this sentence use the word "content" to describe creative work? → Use "work," "art," "music," or "output"
- [ ] Does this sentence hedge with "we believe" or "in our opinion" before a factual claim? → State it. The belief framing is reserved for Section 3's ethical stance, where it's deliberate
- [ ] Does this sentence explain what melodic death metal is? → Delete the sentence
- [ ] Does this sentence use exclamation marks? → The policy does not exclaim

---

*The hardest deliverable in the campaign. Not because the words are difficult — because the voice has to hold conviction without becoming preachy, acknowledge AI use without becoming apologetic, draw a hard line without becoming hostile, and sound like it belongs in the same cathedral as "You have been counted among the menagerie."*

*A goddess wrote an ethical position for a death metal band's website. The gods are versatile.*
