# Inner Circle Test Report

*Pipeline verification and readiness assessment for the founding window inner circle test.*

**Produced by:** Sebas (2026-04-28)
**Status:** All pipelines operational. Two Ray action items remain before inviting testers.

---

## TL;DR

The site is ready for inner circle testing. All three submission pipelines work end-to-end. The founding member mechanic is active. Seed content exists (1 offering, 8 reactions). Two blockers require Ray's action before inviting anyone: DNS (still points to Shopify) and the admin API key (still default).

---

## Test URLs

**Live site (Vercel preview):** `https://heteromorphiczoo.vercel.app`

Until DNS is switched, use this URL for inner circle invitations. It's the real site, auto-deployed from git.

**Pages to test:**
- Landing + signup: `https://heteromorphiczoo.vercel.app`
- Chronicle: `https://heteromorphiczoo.vercel.app/chronicle`
- Bestiary: `https://heteromorphiczoo.vercel.app/bestiary`
- Reactions wall: `https://heteromorphiczoo.vercel.app/reactions`
- Offerings gallery: `https://heteromorphiczoo.vercel.app/offerings`
- Menagerie Roll: `https://heteromorphiczoo.vercel.app/menagerie`
- Rites: `https://heteromorphiczoo.vercel.app/rites`
- Press: `https://heteromorphiczoo.vercel.app/press`

**Admin panel:** `https://heteromorphiczoo.vercel.app/admin`
(Google OAuth — authorized for ray.heberer@greattombproductions.com and rayheb3@gmail.com)

**API base:** `https://hz-api.greattombproductions.com`

---

## Pipeline Verification Results

### 1. Email Signup (POST /api/hz/join)

**Status: PASS**

- New signup returns 201, fan_id, rank_title ("Uninitiated"), founding_member: true
- Duplicate email returns 409 with "You are already known to the menagerie."
- Upsert (changed name/newsletter) returns 200 with updated: true
- Aggregation triggers automatically after signup — menagerie-roll.json updated
- Name field auto-generates an alias (client-side) so the form feels playful

### 2. Reaction Submission (POST /api/hz/reactions)

**Status: PASS**

- YouTube URL submitted, oEmbed metadata fetched (title, channel, thumbnail)
- Returns 201 with status: "pending"
- Duplicate YouTube URL returns 409 with "This reaction video has already been submitted."
- Song tag optional, links reaction to specific HZ track
- No email required for reaction submission (anonymous allowed)

### 3. Offering Submission (POST /api/hz/offerings)

**Status: PASS**

- Multipart form with email (required), category (required), optional title/description/URL/file
- Returns 201 with status: "pending"
- If email not in DB, auto-registers the fan (founding member status applied)
- File upload works (images, audio, video, PDF — 10MB limit)
- URL-based content also works (YouTube, SoundCloud, direct links)
- Categories: visual, sonic, textual, ritual, profane

### 4. Aggregation (POST /api/hz/admin/aggregate)

**Status: PASS**

- Rebuilds: census.json, menagerie-roll.json, offerings.json, reactions.json, altar.json
- Runs in ~4ms
- Auto-triggers after signup, reaction, and offering submissions (debounced to 1/min)
- Manual trigger via admin panel "Rebuild JSON" button or API

### 5. Rites Page

**Status: PASS (graceful empty state)**

- No rites currently defined — page shows "No rites have been called. The altar rests between seasons."
- "How It Works" section renders correctly
- No crashes on empty data

---

## Founding Member Mechanic

**Status: WORKING (minor rounding note)**

- `_is_founding_window()` checks today's date against 2026-04-28 to 2026-07-28 — currently ACTIVE
- Base DP for join: 5, multiplier: 1.5x, **actual awarded: 7** (not 7.5)
- The `int()` truncation means `int(5 * 1.5) = 7` instead of 7.5
- All DP values in the system are integers. This is consistent, not a bug.
- Founding member badge shows correctly in menagerie roll

---

## Current Content State

| Content | Count | Note |
|---------|-------|------|
| Fans | 1 | Ray (TheFirstDisciple) |
| Reactions | 8 | All approved, real YouTube reaction videos |
| Offerings | 1 | Visual (artwork), approved |
| Rites | 0 | None defined yet |
| Featured (altar) | 0 | No offering featured yet |

The test protocol recommends 3-5 seed offerings before inviting testers. Currently there's 1 approved offering. Ray should seed 2-4 more before sending invitations.

---

## Ray Action Items (Before Inner Circle Test)

### 1. DNS: Point heteromorphiczoo.com to Vercel

**Current state:** heteromorphiczoo.com points to Shopify (old store).

Until this is done, share the Vercel preview URL: `https://heteromorphiczoo.vercel.app`

This is fine for inner circle testing — the URL works, CORS allows *.vercel.app, API calls resolve correctly. But for wider promotion, DNS should point to Vercel.

### 2. Admin API Key

**Current state:** `HZ_ADMIN_API_KEY` is set to `dev-key-change-me` (the default).

The admin panel uses Google OAuth (secure), so this doesn't block testing. But the legacy API key endpoints (admin/review, admin/aggregate) are accessible with the default key. Set a real value in the shell environment where uvicorn runs:

```bash
export HZ_ADMIN_API_KEY="your-strong-random-key-here"
```

Then restart uvicorn (deploy.sh handles this).

### 3. Seed Content

Before inviting testers, seed 2-4 more offerings via the admin panel (`/admin`). Candidates:
- Lordigan artwork (Benediction cover art origin)
- NCS press coverage
- Existing reaction videos (as offerings, not just reactions)

Feature at least one offering so the altar section isn't empty.

### 4. BTS Photos for Chronicle (Optional)

The chronicle supports image galleries per entry (data model ready, UI ready). If Ray has BTS photos, they can be added via the admin chronicle editor. Not required for inner circle test.

---

## Inner Circle Invitation Flow

Once the above items are done:

1. **Share this URL:** `https://heteromorphiczoo.vercel.app` (or heteromorphiczoo.com if DNS is switched)
2. **Personal DM to each tester** (see `specs/inner-circle-test-protocol.md` for tone guidance)
3. **What to say:** "I built something and you're the first to see it. Join the Menagerie. Look around."
4. **What NOT to say:** Don't use the word "test." Don't send a checklist.
5. **Collect feedback via DM.** Route bugs to the team, note what produces delight.

---

## Known Limitations (Communicate Proactively to Testers If Needed)

- **File uploads work** but only images/audio/video/PDF up to 10MB
- **Offerings gallery shows only approved content** — Ray reviews submissions in admin panel before they appear
- **No /policy or /sanctuary page yet** — AI transparency policy implementation is in progress (Rubedo's current session)
- **No /relics page yet** — merch partner program spec is in progress (Demiurge's current session)
- **Navigation includes Rites** — shows empty state until a rite is called

---

*This report is the bridge between pipeline verification and Ray's personal outreach. The test protocol (specs/inner-circle-test-protocol.md) has the full tester selection criteria and feedback routing guide.*
