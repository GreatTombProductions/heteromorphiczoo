# Data Pipeline Spec — heteromorphiczoo.com

*Phase 4: The complete data layer specification. SQLite schema, GEX44 API endpoints, aggregation script, static JSON output format. Rubedo implements from this spec.*

**Produced by:** Mare (Session 167, post-council)
**Council origin:** f722487c (2026-04-26). Mare's Turn 6 established the unidirectional data flow. Pandora, Aqua confirmed no new services. Ray (Turn 18) confirmed SQLite fan database from day one.
**Depends on:** Phase 0 (bootstrap + spec reconciliation — COMPLETE)
**Read first:** menagerie-engagement-spec.md for DP actions and rank thresholds, fan-infrastructure-yoink-spec.md for the Alpine IQ pattern

---

## Architecture Overview

**The binding decision (council consensus):** No Turso, no Supabase, no external database services. SQLite + Python on GEX44. Static JSON to Vercel CDN. No database connections from serverless functions.

**Data regime:** Sub-ML. 10k fans = 5MB. 100k engagement events/year = 20MB. The entire database fits in RAM on anything. GROUP BY queries are the most complex operations.

### Data Flow

```
WRITE PATH (bidirectional — fan actions enter the system):
  Website forms → Vercel serverless function → GEX44 API → SQLite

READ PATH (unidirectional — pre-computed display):
  SQLite → Python aggregation script → static JSON files → Vercel CDN → site renders
```

The website NEVER queries the database directly. All display data is pre-computed JSON served from Vercel's CDN. The only real-time operations are form submissions hitting the GEX44 API.

---

## 1. SQLite Schema

Database file: `fan_db.sqlite` on GEX44, located at a path TBD by Ray (recommend `~/heteromorphiczoo/data/fan_db.sqlite`).

### Table: fans

```sql
CREATE TABLE fans (
    id TEXT PRIMARY KEY,               -- UUID4
    email TEXT UNIQUE NOT NULL,         -- Primary key for dedup (per yoink spec)
    name TEXT,                          -- Optional display name
    phone TEXT,                         -- Optional, for SMS (future Dittofeed integration)
    source TEXT NOT NULL DEFAULT 'website',  -- How they arrived
    acquired_at TEXT NOT NULL,          -- ISO 8601 timestamp
    founding_member INTEGER NOT NULL DEFAULT 0,  -- 1 if joined during Benediction window
    opt_in_email INTEGER NOT NULL DEFAULT 1,
    opt_in_sms INTEGER NOT NULL DEFAULT 0,

    -- Computed fields (refreshed by aggregation script)
    lifetime_dp INTEGER NOT NULL DEFAULT 0,
    current_rank INTEGER NOT NULL DEFAULT 0,  -- 0-5 index into rank table
    
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_fans_email ON fans(email);
CREATE INDEX idx_fans_rank ON fans(current_rank);
CREATE INDEX idx_fans_source ON fans(source);
```

**Source enum values:** `website`, `presave`, `show`, `referral`, `social`, `merch_purchase`, `import`

**Rank mapping (from engagement spec, confirmed by Ray Turn 11):**

| current_rank | Title | DP Threshold |
|-------------|-------|-------------|
| 0 | Uninitiated | 0 |
| 1 | Acolyte | 50 |
| 2 | Deacon | 200 |
| 3 | Elder | 500 |
| 4 | High Priest/Priestess | 1500 |
| 5 | Archbishop | 5000 |

### Table: engagement_events

The DP ledger. Append-only. Every point-earning action ever taken.

```sql
CREATE TABLE engagement_events (
    id TEXT PRIMARY KEY,                -- UUID4
    fan_id TEXT NOT NULL,               -- FK to fans.id
    event_type TEXT NOT NULL,           -- Action type (see enum below)
    dp_awarded INTEGER NOT NULL,        -- Points AFTER multiplier application
    dp_base INTEGER NOT NULL,           -- Points BEFORE multiplier
    multiplier REAL NOT NULL DEFAULT 1.0,  -- Applied multiplier (founding 1.5x, multi-release 1.2x, etc.)
    metadata TEXT,                      -- JSON blob for event-specific data
    release_cycle TEXT,                 -- 'benediction', 'new-world', etc.
    reviewed INTEGER NOT NULL DEFAULT 0,  -- 1 if Creation tier, reviewed by band
    approved INTEGER NOT NULL DEFAULT 0,  -- 1 if approved (only meaningful when reviewed=1)
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    
    FOREIGN KEY (fan_id) REFERENCES fans(id)
);

CREATE INDEX idx_events_fan ON engagement_events(fan_id);
CREATE INDEX idx_events_type ON engagement_events(event_type);
CREATE INDEX idx_events_created ON engagement_events(created_at);
CREATE INDEX idx_events_review ON engagement_events(reviewed, approved);
```

**Event type enum values:**

| event_type | Tier | Base DP | Notes |
|-----------|------|---------|-------|
| `fan_art` | Creation | 50 | Requires review |
| `review_written` | Creation | 30 | 200+ words, requires review |
| `cover_video` | Creation | 100 | Requires review |
| `inspired_content` | Creation | 75 | Original music citing HZ, requires review |
| `meme_featured` | Creation | 25 | Requires review |
| `presave` | Engagement | 10 | One-time per release_cycle |
| `playlist_add` | Engagement | 5 | Verified |
| `share_with_caption` | Engagement | 10 | Original text, not just RT |
| `social_tag` | Engagement | 5 | Capped 3/week |
| `show_attendance` | Engagement | 20 | Verified |
| `friend_referral` | Engagement | 15 | |
| `comment` | Community | 2 | Capped 3/day |
| `poll_response` | Community | 3 | |
| `join_mailing_list` | Community | 5 | One-time |
| `referral_complete` | Community | 10 | When referee reaches Acolyte |
| `ugc_report` | Community | 3 | Curators earn DP too |

**metadata JSON examples:**

```json
// fan_art
{"url": "https://vercel-blob.../abc.jpg", "category": "visual", "description": "...", "inspired_by": "offering-uuid-or-null"}

// cover_video  
{"youtube_url": "https://youtube.com/watch?v=...", "song": "napalm", "category": "sonic"}

// share_with_caption
{"platform": "instagram", "post_url": "https://...", "caption_excerpt": "..."}

// show_attendance
{"venue": "...", "date": "2026-05-15", "city": "Vancouver"}
```

### Table: offerings

Approved UGC submissions. Separate from engagement_events because offerings have their own display lifecycle (gallery, featuring, the Altar).

```sql
CREATE TABLE offerings (
    id TEXT PRIMARY KEY,                -- UUID4
    fan_id TEXT NOT NULL,               -- FK to fans.id
    event_id TEXT,                      -- FK to engagement_events.id (the DP event)
    category TEXT NOT NULL,             -- visual, sonic, textual, ritual, profane
    title TEXT,                         -- Optional display title
    description TEXT,                   -- Fan's description
    content_url TEXT,                   -- CDN URL (Vercel Blob) or YouTube URL
    content_type TEXT NOT NULL,         -- 'image', 'video_embed', 'text', 'audio_embed'
    thumbnail_url TEXT,                 -- Pre-computed thumbnail
    inspired_by TEXT,                   -- FK to offerings.id (lateral emergence, optional)
    featured INTEGER NOT NULL DEFAULT 0, -- 1 if featured on the Altar
    featured_at TEXT,                   -- When featured
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, featured
    submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    approved_at TEXT,
    
    FOREIGN KEY (fan_id) REFERENCES fans(id),
    FOREIGN KEY (inspired_by) REFERENCES offerings(id)
);

CREATE INDEX idx_offerings_category ON offerings(category);
CREATE INDEX idx_offerings_status ON offerings(status);
CREATE INDEX idx_offerings_featured ON offerings(featured);
```

### Table: reactions

YouTube reaction videos. Separate table because these are seeded (not always fan-submitted) and have YouTube-specific metadata.

```sql
CREATE TABLE reactions (
    id TEXT PRIMARY KEY,                -- UUID4
    youtube_url TEXT UNIQUE NOT NULL,
    youtube_id TEXT NOT NULL,           -- Extracted video ID
    title TEXT,                         -- From oEmbed
    channel_name TEXT,                  -- From oEmbed
    thumbnail_url TEXT,                 -- From oEmbed
    song_tag TEXT,                      -- Which HZ song: 'napalm', 'ritual-of-fidelity', etc.
    channel_subscribers INTEGER,        -- Approximate, for industry surface
    submitted_by TEXT,                  -- FK to fans.id (null if seeded by band)
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    discovered_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    approved_at TEXT,
    
    FOREIGN KEY (submitted_by) REFERENCES fans(id)
);

CREATE INDEX idx_reactions_status ON reactions(status);
CREATE INDEX idx_reactions_song ON reactions(song_tag);
```

### Table: rate_limits

Anti-gaming provisions. Tracks per-fan caps on repeatable actions.

```sql
CREATE TABLE rate_limits (
    fan_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    period_key TEXT NOT NULL,           -- '2026-04-26' for daily, '2026-W17' for weekly
    count INTEGER NOT NULL DEFAULT 0,
    
    PRIMARY KEY (fan_id, event_type, period_key),
    FOREIGN KEY (fan_id) REFERENCES fans(id)
);
```

**Rate limit rules:**

| event_type | Period | Max |
|-----------|--------|-----|
| `comment` | daily | 3 |
| `social_tag` | weekly | 3 |

---

## 2. GEX44 API

A lightweight Python API server on GEX44. Framework: **FastAPI** (async, minimal, well-indexed in training distribution, produces good OpenAPI docs automatically). Runs behind whatever reverse proxy Ray already uses.

### API Endpoints

**Base URL:** `https://{gex44-domain}/api/hz` (exact domain TBD by Ray)

#### POST /api/hz/join

Email capture — "Join the menagerie." The Monday-critical endpoint.

```
Request:
{
    "email": "fan@example.com",
    "name": "Optional Name",     // optional
    "source": "website"          // optional, defaults to "website"
}

Response (201 Created):
{
    "id": "uuid",
    "rank_title": "Uninitiated",
    "founding_member": true,
    "message": "You have been counted among the menagerie."
}

Response (409 Conflict — already exists):
{
    "id": "existing-uuid",
    "rank_title": "Acolyte",
    "message": "You are already known to the menagerie."
}
```

**Logic:**
1. Validate email format
2. Check for existing fan by email (case-insensitive)
3. If new: create fan record, determine founding_member based on current date vs. Benediction window config, create `join_mailing_list` engagement event (5 DP × founding multiplier), return 201
4. If existing: return 409 with current status
5. Trigger aggregation (or mark as needing aggregation)

#### POST /api/hz/reactions

Reaction video submission.

```
Request:
{
    "youtube_url": "https://www.youtube.com/watch?v=...",
    "song_tag": "napalm",          // optional
    "submitted_by_email": null      // optional, for DP credit
}

Response (201 Created):
{
    "id": "uuid",
    "title": "FIRST TIME HEARING Heteromorphic Zoo - Napalm",
    "channel_name": "MetalReactor",
    "thumbnail_url": "https://img.youtube.com/vi/.../hqdefault.jpg",
    "status": "pending"
}
```

**Logic:**
1. Extract YouTube video ID from URL (handle youtube.com/watch?v=, youtu.be/, youtube.com/shorts/)
2. Call YouTube oEmbed API: `https://www.youtube.com/oembed?url={url}&format=json`
3. Extract title, author_name (channel), thumbnail_url from oEmbed response
4. If `submitted_by_email` provided and fan exists, link to fan and queue DP event
5. Insert into reactions table with status='pending'
6. Return extracted metadata

#### POST /api/hz/offerings

UGC submission. Multipart form for file uploads.

```
Request (multipart/form-data):
{
    "email": "fan@example.com",      // required, for DP credit
    "category": "visual",            // visual, sonic, textual, ritual, profane
    "title": "Napalm Fan Art",       // optional
    "description": "My interpretation of the bridge section",
    "content_url": "https://...",    // For video/audio embeds (YouTube, SoundCloud)
    "file": <binary>,                // For image uploads (fan art)
    "inspired_by": "offering-uuid"   // optional, lateral emergence
}

Response (201 Created):
{
    "id": "uuid",
    "status": "pending",
    "message": "Your offering has been received. The menagerie will judge its worthiness."
}
```

**Logic:**
1. Validate category against enum
2. If file provided: upload to Vercel Blob (via Vercel Blob API token), get CDN URL
3. Look up fan by email (must exist — prompt to join first if not)
4. Create offering record with status='pending'
5. Create engagement_event with reviewed=1, approved=0 (awaits band review)
6. Return confirmation

#### POST /api/hz/admin/review

Band review endpoint for offerings and reactions. Protected by API key.

```
Request:
{
    "type": "offering",              // or "reaction"
    "id": "uuid",
    "action": "approve",             // or "reject" or "feature"
    "api_key": "..."
}

Response (200 OK):
{
    "status": "approved",
    "dp_awarded": 50                 // null if rejected
}
```

**Logic:**
1. Validate API key against config
2. Update offering/reaction status
3. If approved offering: set engagement_event.approved=1, compute DP with multipliers, update fan.lifetime_dp
4. If featured: set offering.featured=1, offering.featured_at=now
5. Trigger aggregation

#### GET /api/hz/census

Public census stats. Lightweight, cacheable.

```
Response (200 OK):
{
    "total_members": 847,
    "by_rank": {
        "Uninitiated": 450,
        "Acolyte": 280,
        "Deacon": 82,
        "Elder": 28,
        "High Priest/Priestess": 5,
        "Archbishop": 2
    },
    "total_offerings": 203,
    "total_reactions": 47,
    "last_updated": "2026-04-27T03:00:00Z"
}
```

This endpoint can serve as a quick health check too. Cache for 5 minutes.

#### POST /api/hz/admin/aggregate

Trigger manual aggregation run. Protected by API key.

```
Request:
{
    "api_key": "..."
}

Response (200 OK):
{
    "status": "complete",
    "files_written": ["census.json", "menagerie-roll.json", "offerings.json", "reactions.json"],
    "duration_ms": 340
}
```

### CORS Configuration

The API must accept requests from:
- `https://heteromorphiczoo.com`
- `https://www.heteromorphiczoo.com`
- `https://*.vercel.app` (temporary Vercel preview URLs during development)

### Authentication

- **Public endpoints:** `/join`, `/reactions`, `/offerings`, `/census` — no auth, rate-limited by IP
- **Admin endpoints:** `/admin/*` — API key in request body (simple, sufficient for band-only access)
- **Rate limiting:** 10 requests/minute per IP on public endpoints. Standard for form submission APIs.

---

## 3. Aggregation Script

`aggregate.py` — Python script that reads SQLite and writes static JSON files for Vercel to serve.

### Trigger Conditions

1. **On write events:** After any `/join`, approved `/admin/review`, or `/admin/aggregate` call. Debounced to run at most once per minute.
2. **Nightly cron:** 3:00 AM PDT. Full recompute of all derived fields (lifetime_dp, current_rank) and all static JSON outputs.
3. **Manual:** `python3 aggregate.py` from GEX44 CLI.

### Aggregation Steps

```python
# Pseudocode — Rubedo implements

def aggregate():
    db = sqlite3.connect('fan_db.sqlite')
    
    # 1. Recompute lifetime_dp for all fans from engagement_events
    #    Only count events where (reviewed=0) OR (reviewed=1 AND approved=1)
    db.execute("""
        UPDATE fans SET lifetime_dp = (
            SELECT COALESCE(SUM(dp_awarded), 0)
            FROM engagement_events 
            WHERE fan_id = fans.id
            AND (reviewed = 0 OR approved = 1)
        )
    """)
    
    # 2. Recompute current_rank based on lifetime_dp thresholds
    #    Ranks never decrease (high-water mark)
    rank_thresholds = [(5000, 5), (1500, 4), (500, 3), (200, 2), (50, 1), (0, 0)]
    for threshold, rank in rank_thresholds:
        db.execute("""
            UPDATE fans SET current_rank = MAX(current_rank, ?)
            WHERE lifetime_dp >= ?
        """, (rank, threshold))
    
    # 3. Write static JSON files
    write_census_json(db)
    write_menagerie_roll_json(db)
    write_offerings_json(db)
    write_reactions_json(db)
    write_altar_json(db)
    
    # 4. If --snapshot flag: copy JSON files to snapshots/{YYYY-MM-DD}/
    if snapshot_mode:
        snapshot_dir = f"snapshots/{date.today().isoformat()}"
        os.makedirs(snapshot_dir, exist_ok=True)
        for f in json_files:
            shutil.copy2(f"public/data/{f}", f"{snapshot_dir}/{f}")
    
    # 5. Deploy JSON to Vercel
    #    Option A: git commit + push to trigger Vercel rebuild
    #    Option B: Upload to Vercel Blob as static assets
    #    Option C: Write to a directory that Vercel's build fetches from a URL
    #    Recommend Option A for simplicity — JSON files in public/data/
    deploy_to_vercel()
```

### Static JSON Output Files

All written to a deploy directory. Vercel serves these from `public/data/`.

#### census.json

```json
{
    "total_members": 847,
    "by_rank": [
        {"rank": 0, "title": "Uninitiated", "count": 450},
        {"rank": 1, "title": "Acolyte", "count": 280},
        {"rank": 2, "title": "Deacon", "count": 82},
        {"rank": 3, "title": "Elder", "count": 28},
        {"rank": 4, "title": "High Priest/Priestess", "count": 5},
        {"rank": 5, "title": "Archbishop", "count": 2}
    ],
    "total_offerings": 203,
    "total_reactions": 47,
    "founding_members": 134,
    "generated_at": "2026-04-27T03:00:00Z"
}
```

#### menagerie-roll.json

```json
{
    "roll": [
        {
            "name": "FanDisplayName",
            "rank": 5,
            "rank_title": "Archbishop",
            "lifetime_dp": 6200,
            "founding_member": true,
            "joined": "2026-04-28"
        }
    ],
    "generated_at": "2026-04-27T03:00:00Z"
}
```

**Sort order:** rank descending, then lifetime_dp descending within rank. Only fans with `name` set appear (email-only fans are counted in census but not displayed on roll — privacy). Fans can opt out of the roll by not setting a display name.

#### offerings.json

```json
{
    "offerings": [
        {
            "id": "uuid",
            "category": "visual",
            "title": "Napalm Fan Art",
            "description": "My interpretation of the bridge section",
            "content_url": "https://...",
            "content_type": "image",
            "thumbnail_url": "https://...",
            "creator_name": "FanName",
            "creator_rank": 2,
            "creator_rank_title": "Deacon",
            "inspired_by": null,
            "featured": false,
            "approved_at": "2026-05-01T14:30:00Z"
        }
    ],
    "by_category": {
        "visual": 45,
        "sonic": 30,
        "textual": 18,
        "ritual": 5,
        "profane": 12
    },
    "generated_at": "2026-04-27T03:00:00Z"
}
```

**Sort order:** approved_at descending (newest first). Featured offerings have a separate key for the Altar component. Only status='approved' or status='featured' included.

#### reactions.json

```json
{
    "reactions": [
        {
            "id": "uuid",
            "youtube_url": "https://www.youtube.com/watch?v=...",
            "youtube_id": "abc123",
            "title": "FIRST TIME HEARING Heteromorphic Zoo - Napalm",
            "channel_name": "MetalReactor",
            "thumbnail_url": "https://img.youtube.com/vi/abc123/hqdefault.jpg",
            "song_tag": "napalm",
            "approved_at": "2026-04-28T10:00:00Z"
        }
    ],
    "by_song": {
        "napalm": 12,
        "ritual-of-fidelity": 8,
        "your-final-seconds": 5,
        "avatara": 3,
        "aura-of-despair": 4,
        "benediction": 15
    },
    "total": 47,
    "generated_at": "2026-04-27T03:00:00Z"
}
```

**Sort order:** None imposed — the client-side display shuffles randomly on each page load (per Ray's request). The JSON array is in insertion order. Only status='approved' included.

#### altar.json

The currently featured offering. Rotated weekly by the band via admin review.

```json
{
    "current": {
        "id": "uuid",
        "category": "sonic",
        "title": "Napalm Full Band Cover",
        "description": "...",
        "content_url": "https://youtube.com/...",
        "content_type": "video_embed",
        "thumbnail_url": "https://...",
        "creator_name": "FanName",
        "creator_rank_title": "Elder",
        "featured_at": "2026-05-05T00:00:00Z"
    },
    "recent": [],
    "generated_at": "2026-04-27T03:00:00Z"
}
```

---

## 4. Deployment Pipeline

### JSON Delivery to Vercel

**Recommended approach:** The aggregation script writes JSON files to a well-known directory. A deploy script pushes them to the Vercel project.

**Option A (simplest, recommended for launch):** JSON files live in the Next.js project's `public/data/` directory. The aggregation script on GEX44 writes to a local copy of the repo and pushes. Vercel auto-deploys on push.

```bash
# On GEX44, after aggregation:
cd /path/to/heteromorphiczoo
python3 scripts/aggregate.py          # Writes to public/data/
git add public/data/*.json
git commit -m "data: aggregation $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push
# Vercel auto-deploys
```

**Option B (more robust, future):** Use Vercel's REST API to upload blobs directly, bypassing git. This avoids noise in git history from data updates.

For launch, Option A. The git commits are actually useful — they provide a history of menagerie growth.

### GEX44 Setup

```
~/heteromorphiczoo/
├── data/
│   └── fan_db.sqlite
├── api/
│   ├── main.py           # FastAPI app
│   ├── models.py          # Pydantic models for request/response
│   ├── db.py              # SQLite connection helpers
│   ├── oembed.py          # YouTube oEmbed client
│   └── config.py          # API keys, Benediction window dates, rate limits
├── scripts/
│   ├── aggregate.py       # SQLite → JSON
│   ├── deploy.py          # Push JSON to Vercel project
│   ├── init_db.py         # Create tables from schema
│   └── seed_reactions.py  # Bulk-import from reaction-urls.txt (Phase 5)
└── requirements.txt       # fastapi, uvicorn, httpx (for oEmbed)
```

### Snapshots (Cultural Telemetry)

The aggregation script also writes dated snapshots for cultural telemetry analysis (requested by Rimuru for engagement decay curves, lateral emergence rates, founding cohort retention):

```bash
~/heteromorphiczoo/snapshots/
├── 2026-04-28/
│   ├── census.json
│   ├── menagerie-roll.json
│   ├── offerings.json
│   └── reactions.json
├── 2026-04-29/
│   └── ...
```

After writing the live JSON files to `public/data/`, `aggregate.py` copies them to `snapshots/{YYYY-MM-DD}/`. This runs on the nightly cron only (not on event-triggered aggregation). Dated directories accumulate. No cleanup needed at this data regime — a year of daily snapshots is <100MB.

Reference: Rimuru's cultural architecture spec at `0th-floor-exterior/central-mausoleum/heteromorphiczoo/specs/cultural-architecture-specs.md`, Section 4.

### Cron

```cron
# Nightly aggregation + snapshot at 3:00 AM PDT
0 3 * * * cd ~/heteromorphiczoo && python3 scripts/aggregate.py --snapshot && python3 scripts/deploy.py
```

---

## 5. Garden Integration

When this goes live, I document it as a garden source:

| Property | Value |
|----------|-------|
| Source | heteromorphiczoo.com — fan engagement platform |
| Format | SQLite on GEX44 |
| Refresh | Event-driven (form submit) + nightly aggregation (3 AM PDT) |
| Coverage | 100% of site-captured fans |
| Schema | fans + engagement_events + offerings + reactions + rate_limits |
| Downstream | Static JSON for site display, future Dittofeed segments, FLTV analytics |

**Freshness monitoring:** The nightly aggregation produces a timestamp in each JSON file. If `generated_at` is >26 hours old, alert. The API server health can be checked via `GET /api/hz/census`.

**Schema evolution:** Any changes to the SQLite schema require corresponding updates to: aggregate.py (which fields to read), the JSON output format (which fields to write), and the Next.js components (which fields to render). Changes propagate through the static JSON pipeline, not through live DB connections, so schema migrations don't cause runtime failures on the website — only stale data until the aggregation catches up.

---

## 6. What This Spec Does NOT Cover

- **Vercel Blob setup for image uploads.** Rubedo handles this during Phase 6 (Offerings Gallery). The API endpoint stubs the upload path.
- **Dittofeed integration.** Future phase. The SQLite schema is designed to be exportable.
- **Press CRM.** Separate system per yoink spec. Runs on GEX44 independently.
- **Admin UI beyond API endpoints.** Band reviews offerings via API calls. A proper admin UI is a future phase.
- **Email sending (SES, etc.).** The /join endpoint captures emails. Sending emails is a Dittofeed concern.

---

## 7. Anti-Patterns (Load-Bearing)

- **Do NOT add a database connection from Vercel serverless functions to SQLite on GEX44.** The entire architecture depends on the JSON pipeline. Serverless functions only hit the GEX44 API for writes.
- **Do NOT use Prisma, Drizzle, or any ORM.** Raw SQLite via Python's sqlite3 module. Five tables, GROUP BY queries. An ORM adds a dependency that provides no value at this scale.
- **Do NOT add real-time features (WebSockets, SSE) for the display layer.** The site renders from static JSON. Near-real-time is achieved by triggering aggregation after write events (debounced to 1/min). The Census counter doesn't need to update live — it updates on page load.
- **Do NOT implement DP multiplier stacking logic yet.** For launch, only the Founding Menagerie multiplier (1.5x) applies. Multi-release and cross-platform multipliers are future phases when there's enough data to matter.
- **Do NOT store fan passwords.** There are no fan accounts. Fans identify by email. The menagerie is not a login system — it's a ledger.

---

## 8. Acceptance Criteria

Phase 4 is complete when:

1. `init_db.py` creates all five tables with correct schema
2. `POST /api/hz/join` successfully creates a fan record and returns rank info
3. `POST /api/hz/reactions` successfully calls YouTube oEmbed and stores metadata
4. `aggregate.py` reads from SQLite and writes census.json, menagerie-roll.json, offerings.json, reactions.json, altar.json
5. The JSON files are valid and contain the documented structure
6. The API starts with `uvicorn api.main:app` and responds to requests

7. `aggregate.py --snapshot` writes dated copies to `snapshots/{YYYY-MM-DD}/`

**Not required for Phase 4 completion:**
- Vercel deployment (that's Phase 3's concern for the frontend)
- Actual DNS or domain setup
- Image upload to Vercel Blob (Phase 6)
- Admin UI beyond API endpoints
- Cron setup (documented above, configured when GEX44 path is decided)

---

*This spec is the data layer for the entire menagerie. The website is a presentation layer that reads the JSON this pipeline produces. Everything computationally interesting happens here.*
