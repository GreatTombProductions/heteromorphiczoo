# Inner Circle Test Protocol

*Preparation artifact for Heteromorphic Zoo's first human test. How to invite your inner circle into the founding window — and what to listen for.*

**Produced by:** Shihoutu (post-council, 2026-04-28)
**Council origin:** 56332f25 (HZ Part 2)
**Consumed by:** Sebas (bridge → Ray), then Ray → testers via IG DMs / personal messages
**Status:** GEX44 is live on saturna:8081. Census endpoint returns 0 members. The founding window is open.

---

## The Premise

These aren't QA testers. They're the founding congregation. The first humans to walk through the cathedral doors. What they experience in the first minutes sets the norm for everyone who follows.

The test protocol is disguised. It feels like being invited into something, not being assigned a checklist. Ray sends personal messages — not a mass blast, not a form email. Each person receives a specific reason they were chosen: because they've been there from the beginning, because their reaction to the music mattered, because Ray trusts their eye.

---

## Who to Invite (3-5 people)

Ray selects. These criteria help frame the conversation:

**Ideal tester profile:**
- Has a relationship with HZ that predates this website (knows the music, has talked to Ray about it)
- Represents a different angle: one visual artist, one fellow musician, one non-musician fan, one technically minded friend
- Will give honest reactions, not polite encouragement
- Active on at least one platform where they could organically share later (IG, YouTube, Twitter/X)

**Why diversity matters for testing:** Each pipeline serves a different personality. The musician friend will naturally try the reaction/cover video submission. The visual artist will gravitate toward offerings. The non-musician fan tests whether the email signup alone feels like entering something. The technically minded friend finds the broken edges.

---

## The Invitation (Ray writes this personally — these are prompts, not templates)

The tone is personal, not promotional. "I built something and you're the first to see it" energy.

**Core message structure:**
1. Why them specifically (genuine — they'll know if it's a form letter)
2. The website URL (once DNS is live, otherwise Vercel preview URL)
3. What to do: "Join the Menagerie. Look around. If something moves you, submit it."
4. What NOT to say: Don't ask them to "test the pipelines." Don't use the word "test." The frame is "I want to know what you think" not "I need you to QA this."

**Example prompt for Ray to personalize:**

> Hey [name]. The new HZ site is live — you're one of the first to see it.
> [personal line about why them].
> Sign up with your email and take a look around. The Chronicle, the Offerings section.
> If anything strikes you, I want to hear about it. Just hit me back here.

---

## What Each Pipeline Feels Like to a Human

Not what they test. What they *experience*. This is what Ray should be listening for.

### 1. Email Signup (The Threshold)

**The action:** Enter email on the landing page → "Receive the blessing" → immediate response with fan ID, rank, founding status.

**What should happen emotionally:** The response confirms they've *entered* something. Not "thanks for subscribing" — the founding member status and rank title ("Uninitiated" at first, which has its own weight) should feel like being named.

**Listen for:**
- "Wait, I'm a founding member?" — Good. The mechanic is working.
- "What's a Devotion Point?" — Expected. The menagerie system is intentionally opaque at first. This curiosity is the hook, not a UX failure.
- "The form didn't work" or no response — Actual bug. Report immediately.
- "Where do I go after signing up?" — Navigation gap. After signup, is there a clear next step?

**Technical verification:** Fan record created in SQLite with `founding_member=1`, `lifetime_dp=7.5` (5 base × 1.5 founding multiplier).

### 2. Reaction Submission

**The action:** Submit a YouTube reaction URL → pending review → band approves → visible on reactions wall.

**What should happen emotionally:** Submitting a reaction should feel like an offering, not a form fill. The pending state should feel like anticipation ("the band will see this"), not bureaucracy ("awaiting moderator approval").

**Listen for:**
- "I submitted it, now what?" — The post-submission experience matters. Is the pending state communicated clearly?
- "Can I submit multiple?" — Rate limiting exists (10/min per IP). This won't hit it. But if they want to submit multiple, the pipeline should handle it gracefully.
- "I don't have a reaction video" — Not everyone does. This is fine. The reaction pipeline is for a specific kind of fan engagement.

**Technical verification:** Reaction record created with `status='pending'`. YouTube oEmbed metadata fetched (title, channel_name, thumbnail).

### 3. Offering Submission

**The action:** Fan submits creative content (visual, sonic, textual, ritual, profane) → pending review → band features → DP awarded.

**What should happen emotionally:** This is the highest-stakes interaction. Someone is offering their creative work to a band they care about. The submission experience should feel sacred, not transactional. The categories (visual, sonic, textual, ritual, profane) should spark recognition: "oh, *that's* what this is."

**PREREQUISITE:** Must have joined the Menagerie first (email signup). If someone tries to submit an offering without being a member, the error should be clear and direct them to sign up, not show a generic 403.

**Listen for:**
- "What's the difference between the categories?" — Good question. The category names should be evocative enough to self-explain, but if testers ask, the descriptions on the form need work.
- "How do I submit a cover video?" — Content type routing: video_embed for YouTube, audio_embed for SoundCloud. Is this clear?
- "I tried to upload an image but it didn't work" — **Known limitation.** File uploads are currently stubbed (`pending-upload://`). Only URL-based content works right now. Communicate this proactively: "Image uploads are coming — for now, link to your work hosted elsewhere."
- "What happens after I submit?" — The pending review state. Same question as reactions. The answer is "the band reviews and features the best ones."
- "What's 'inspired_by'?" — The creative chain field. Optional. If they use it, it's a signal that the lateral creative culture is already emerging.

**Technical verification:** Offering record with correct category, `status='pending'`, fan linked, engagement event created.

### 4. The Overall Experience

**Listen for:**
- Mobile experience (most testers will arrive via IG DM → phone browser)
- Load time (Vercel CDN should handle this, but verify on first load)
- "The text is hard to read" — The votive glass treatment should have fixed this. If it persists on specific devices or screen sizes, note which ones.
- "I don't know what to do" — Navigation and on-page guidance. Are the calls to action clear without being aggressive?
- "This is unlike any band website I've seen" — That's the goal. Note whether this registers as positive or confusing.
- The *specific thing* they gravitate toward — Chronicle? Bestiary? Offerings? What they explore first reveals what draws them. This is consumer behavior data.

---

## Feedback Channels

**Primary:** Direct messages back to Ray (same channel as the invitation — IG DM, text, whatever was used to invite). This is personal, not a feedback form. The testers aren't filing bug reports. They're talking to Ray.

**What Ray collects and routes:**
- **Bugs** (form didn't submit, page crashed, broken link) → Rubedo immediately, file in HZ submodule issues or DM
- **Confusion** (didn't know what to do, category unclear, post-submission ambiguity) → Aqua for copy, CZ for UX
- **Delight** (this is amazing, I want to share this, the vibe is immaculate) → Note what specifically produced the reaction
- **Suggestions** (I wish I could..., it would be cool if...) → Capture, don't promise. These feed future iterations.

**Secondary:** If a tester posts about the site on their own channels (IG story, tweet, etc.) before being asked to, that's the strongest signal. Note what they said and how they framed it. That organic framing is worth more than any deliberate positioning work.

---

## The Seed Content Question

Rimuru's council point is load-bearing: the founding cohort must arrive to a space that's already been consecrated, not an empty warehouse.

Before inviting anyone, the Offerings gallery needs 3-5 seed pieces. Otherwise the first tester sees "no offerings" and the category permission is absent — nobody submits because nobody has submitted.

**Candidates Ray mentioned in Campaign 1:**
- Lordigan artwork (the Benediction cover art origin)
- NCS press coverage
- Existing reaction videos

**Ray action:** "Which of these are ready to link? Can you submit them as the band's inaugural offerings before inviting testers?"

---

## Timing

The founding window runs April 28 – July 28, 2026. Three months. The pipeline is live. The urgency is "before you start promoting Benediction on Instagram" — not "today."

A reasonable sequence:
1. Ray seeds 3-5 offerings (30 minutes of his time)
2. Ray invites 3-5 inner circle testers with personal messages (an evening)
3. Testers explore over 2-3 days at their own pace
4. Ray collects impressions via DM (natural conversation, not structured survey)
5. Ray routes bugs and confusion to the team
6. Based on the test round: decide whether to open wider (social posts, broader IG outreach)

No pressure to compress this. The founding window is patient. Better to have 5 testers who feel like they discovered something sacred than 50 who feel like they got a mass link.

---

## What Success Looks Like

Not "all pipelines pass QA." Success for the inner circle test is:

- Every tester signed up for the Menagerie (email pipeline works)
- At least one tester submitted *something* (reaction or offering) without being asked to
- At least one tester messaged Ray back with a specific thing they liked (not just "looks good")
- At least one tester shared the site unprompted on their own channels
- Zero crashers or data-loss bugs on the critical path (signup → receive confirmation)
- Ray has a clear sense of what to fix before wider promotion

The unprompted share is the gold standard. It means the experience was nourishing enough to propagate without being asked.

---

*This document is the test protocol disguised as an invitation guide. Sebas surfaces it to Ray. Ray makes it personal. The testers never see this document — they see Ray's authentic enthusiasm for something he built.*
