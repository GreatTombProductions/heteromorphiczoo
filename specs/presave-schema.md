# Presave Schema Specification

**Author:** Mare (Session 174, post-council ace0e247)
**Campaign:** heteromorphiczoo-3, Phase: presave-schema
**Depends on:** Nigredo presave-intelligence, Kazuma heist 011, Aqua campaign-3-copy.md
**Feeds:** Rubedo (build-presave), Narberal (copy-lint verification of field names)
**LAST_PROJECTED:** 2026-04-29

---

## 1. Table DDL

```sql
-- Table: presaves
-- Operational state for pre-save actions. Separate from engagement_events
-- (which handles DP accounting). This table is the notification queue:
-- on release day, query by release_slug + notification_sent to find who
-- needs notifying.
--
-- Design decision: dedicated table (not fan_metadata overloading).
-- Reason: presave has a data shape that doesn't fit key-value pairs.
-- Platform preference per release, notification state, future OAuth tokens —
-- these are structured columns with query patterns that demand indexes.
-- A fan pre-saving multiple releases with different platform preferences
-- is a realistic scenario that fan_metadata handles poorly.

CREATE TABLE IF NOT EXISTS presaves (
    id TEXT PRIMARY KEY,                          -- UUID v4
    fan_id TEXT NOT NULL,                         -- FK → fans.id (always resolved)
    email TEXT NOT NULL,                          -- Denormalized from fans for trigger script efficiency
    release_slug TEXT NOT NULL,                   -- 'benediction', future releases reuse table
    platform TEXT NOT NULL,                       -- 'spotify', 'apple', 'youtube', 'bandcamp', 'other'
    confirmation_sent INTEGER NOT NULL DEFAULT 0, -- Email 1: immediate confirmation
    confirmation_sent_at TEXT,                    -- ISO 8601 timestamp
    notification_sent INTEGER NOT NULL DEFAULT 0, -- Email 2: release-day notification
    notification_sent_at TEXT,                    -- ISO 8601 timestamp
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Query patterns:
-- 1. Release-day trigger: WHERE release_slug = ? AND notification_sent = 0
-- 2. Duplicate check: WHERE fan_id = ? AND release_slug = ?
-- 3. Confirmation queue: WHERE confirmation_sent = 0 (processed immediately, but retry-safe)
-- 4. Analytics: COUNT(*) GROUP BY platform WHERE release_slug = ?

CREATE INDEX IF NOT EXISTS idx_presaves_release ON presaves(release_slug);
CREATE INDEX IF NOT EXISTS idx_presaves_fan_release ON presaves(fan_id, release_slug);
CREATE INDEX IF NOT EXISTS idx_presaves_notification ON presaves(release_slug, notification_sent);
```

### Column Justifications

| Column | Why |
|--------|-----|
| `id` | UUID v4 primary key. Matches all other tables. |
| `fan_id` | Every presave resolves to a fan record (existing or newly created). The presave endpoint creates a fan record if one doesn't exist, mirroring the `/join` pattern. |
| `email` | Denormalized from `fans.email`. The trigger script needs email + platform for each presave. Denormalizing avoids a JOIN in the release-day query, which is a manual script Ray runs once — simplicity > normalization for a one-shot operational query. |
| `release_slug` | Short identifier for the release ('benediction'). Matches `release_cycle` in `engagement_events`. Every future release reuses this table with a different slug. |
| `platform` | Fan's preferred streaming platform. Determines which deep link is primary in the release-day email. Enum-like but stored as TEXT for flexibility (new platforms don't need schema migration). |
| `confirmation_sent` | Email 1 (Hypeddit's two-email pattern, stolen via Kazuma heist 011). Sent immediately after presave. Boolean integer, 0/1. |
| `confirmation_sent_at` | Timestamp of Email 1 delivery. NULL until sent. For debugging delivery issues. |
| `notification_sent` | Email 2 (release-day). The core operational field. The trigger script queries `WHERE notification_sent = 0`. |
| `notification_sent_at` | Timestamp of Email 2 delivery. NULL until sent. |
| `created_at` | When the presave was registered. Default to current UTC. |

### What's NOT in this table

| Omitted Column | Why |
|----------------|-----|
| `oauth_token` | Spotify Extended Quota Mode requires 250K MAU + registered business entity (Nigredo finding). This is categorically inaccessible for HZ, not a timeline issue. Apple MusicKit is viable ($100/yr) but Phase 2. If/when OAuth materializes, add columns via migration script — don't pre-allocate for a feature that may never ship. |
| `library_saved` | Same reasoning. Phase 2 OAuth feature. |
| `name` | Lives on `fans.name`. No presave-specific name field needed. |
| `opt_in_email` | The act of presaving IS opting in to release notification. Broader newsletter opt-in lives on `fans.opt_in_newsletter`. |
| `phone` | Not captured by the presave flow. Aqua's copy specifies email-only capture (single field, every friction point kills conversion). |

### Relationship to engagement_events

Both tables get the release identifier. They serve different purposes:

```
presaves                              engagement_events
├── Operational state                  ├── DP accounting (append-only ledger)
├── Notification queue                 ├── Multiplier calculation
├── Platform preference                ├── Review status
├── Email delivery tracking            └── release_cycle = 'benediction'
└── release_slug = 'benediction'
```

The `engagement_events` row records that DP was awarded. The `presaves` row tracks whether the fan was notified. No join required for basic queries on either side. The `release_slug` / `release_cycle` values match so cross-table analytics are possible when needed.

---

## 2. Valid Platforms

```python
VALID_PLATFORMS = {"spotify", "apple", "youtube", "bandcamp", "other"}
```

Add to `config.py` alongside `VALID_SOURCES`. The presave endpoint validates against this set.

Platform names match Aqua's `PRESAVE.platforms` keys in `copy.ts` exactly:
- `spotify` → "Spotify"
- `apple` → "Apple Music"
- `youtube` → "YouTube Music"
- `bandcamp` → "Bandcamp"
- `other` → "Other"

---

## 3. Pydantic Models

Add to `models.py`:

```python
# --- Presave ---

class PresaveRequest(BaseModel):
    email: EmailStr
    platform: str                         # 'spotify', 'apple', 'youtube', 'bandcamp', 'other'
    release_slug: str = "benediction"     # Default to current release
    name: str | None = None               # Optional — used if fan doesn't exist yet
    source: str = "presave"               # Default source for new fan records


class PresaveResponse(BaseModel):
    id: str                               # presave record ID
    message: str
    already_presaved: bool = False
    founding_member: bool
    dp_awarded: int
```

---

## 4. Endpoint Contract: `POST /api/hz/presave`

### Request

```json
{
    "email": "fan@example.com",
    "platform": "spotify",
    "release_slug": "benediction",
    "name": "Optional Name",
    "source": "presave"
}
```

**Required:** `email`, `platform`
**Optional:** `release_slug` (defaults to "benediction"), `name`, `source`

### Response — Success (201)

```json
{
    "id": "uuid-of-presave-record",
    "message": "You have been summoned.",
    "already_presaved": false,
    "founding_member": true,
    "dp_awarded": 15
}
```

### Response — Already Presaved (409)

```json
{
    "id": "uuid-of-existing-presave-record",
    "message": "You are already among the summoned.",
    "already_presaved": true,
    "founding_member": true,
    "dp_awarded": 0
}
```

### Logic Flow

```
1. Validate platform ∈ VALID_PLATFORMS, else 422
2. Normalize email (strip, lowercase)
3. Look up fan by email (case-insensitive, same as /join)
4. If fan exists:
   a. Check for duplicate presave (fan_id + release_slug)
   b. If duplicate → 409 with "already among the summoned"
   c. If not duplicate → proceed to step 6
5. If fan doesn't exist:
   a. Create fan record (same pattern as /join)
      - source = req.source (default "presave")
      - founding_member = _is_founding_window()
      - opt_in_newsletter = False (presave ≠ newsletter signup)
   b. Fire join_mailing_list engagement event (5 DP base)
      - This is the menagerie join, not the presave DP
   c. Proceed to step 6
6. Create presave record in presaves table
7. Fire presave engagement event (10 DP base)
   - event_type = "presave"
   - release_cycle = release_slug
   - multiplier = FOUNDING_MULTIPLIER if in founding window
   - reviewed = 0, approved = 0 (presave config: no review required)
8. Update fan lifetime_dp and current_rank
9. Send confirmation email (Email 1) via Resend
   - On success: SET confirmation_sent = 1, confirmation_sent_at = now
   - On failure: leave confirmation_sent = 0 (retry-safe)
10. Return 201 with presave ID, message, founding status, total DP awarded
```

### DP Accounting Detail

A new fan who presaves during the founding window earns:
- `join_mailing_list`: 5 base × 1.5 multiplier = 7 DP
- `presave`: 10 base × 1.5 multiplier = 15 DP
- **Total: 22 DP** (enough for Rank 1: Aspirant at 10 DP)

An existing fan who presaves during the founding window earns:
- `presave`: 10 base × 1.5 multiplier = 15 DP (added to lifetime)

The response `dp_awarded` field shows the presave DP only (not the join DP). The join DP is a side effect of fan creation, not a presave-specific award.

### Error Responses

| Code | Condition | Body |
|------|-----------|------|
| 422 | Invalid email or platform | Pydantic validation error |
| 409 | Same fan + same release_slug already exists | `already_presaved: true` |
| 429 | Rate limit exceeded | Standard rate limit response |

### Rate Limiting

Same `_check_rate_limit` as `/join`. The presave endpoint is public-facing and should use the same IP-based rate limiting (the existing 30 req/min per IP from `config.py`).

---

## 5. Confirmation Email Contract (Email 1)

Sent immediately after presave, within the endpoint handler. Uses Resend API.

### Resend Integration

```python
# Add to config.py
RESEND_API_KEY = os.getenv("HZ_RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.getenv("HZ_RESEND_FROM", "noreply@heteromorphiczoo.band")
```

### Send Pattern

```python
import resend  # pip install resend

resend.api_key = RESEND_API_KEY

def send_presave_confirmation(email: str, release_slug: str) -> bool:
    """Send Email 1 (confirmation). Returns True on success."""
    try:
        resend.Emails.send({
            "from": RESEND_FROM_EMAIL,
            "to": email,
            "subject": PRESAVE_EMAILS["confirmation"]["subject"],
            "text": "\n".join(PRESAVE_EMAILS["confirmation"]["body"]),
        })
        return True
    except Exception:
        # Log but don't fail the presave — email is best-effort
        return False
```

**Failure mode:** If Resend fails, the presave record still exists with `confirmation_sent = 0`. A future retry script can query `WHERE confirmation_sent = 0 AND created_at < [threshold]` to find unsent confirmations. But at HZ's scale this is unlikely to matter — Resend's free tier has >99% deliverability.

**Copy source:** `PRESAVE_EMAILS.confirmation` from Aqua's `campaign-3-copy.md`. Subject: "You have been summoned — Benediction". The email copy lives in `copy.ts`, not hardcoded in the backend.

### Anti-Pattern

Do NOT send the confirmation email as a background task that runs after the response. Send it inline, before returning the response. At HZ's volume (dozens of presaves, not thousands), the ~200ms Resend API call is acceptable latency. Sending inline means `confirmation_sent` is accurate in the response — the fan knows whether they'll get the email.

---

## 6. Release-Day Trigger Contract (Email 2)

Manual script. Ray fires when he confirms the release is live across platforms.

### Script Interface

```bash
python3 scripts/trigger_presave_notifications.py --release benediction
```

### Script Behavior

```
1. Connect to SQLite database
2. Query: SELECT * FROM presaves
         WHERE release_slug = ? AND notification_sent = 0
3. For each presave record:
   a. Generate platform-specific deep link based on presave.platform:
      - spotify: https://open.spotify.com/album/{SPOTIFY_ALBUM_ID}
      - apple: https://music.apple.com/album/{APPLE_ALBUM_ID}
      - youtube: https://music.youtube.com/browse/{YOUTUBE_ALBUM_ID}
      - bandcamp: https://heteromorphiczoo.bandcamp.com/album/benediction
      - other: https://heteromorphiczoo.band/presave/benediction (post-release state)
   b. Send release-day email via Resend:
      - Primary CTA: deep link for stated platform preference
      - Secondary: "Also available on:" links for all other platforms
      - Copy from PRESAVE_EMAILS.releaseDay (Aqua's copy)
   c. On success: UPDATE presaves SET notification_sent = 1,
                  notification_sent_at = now WHERE id = ?
   d. On failure: log error, skip (don't mark as sent), continue to next
4. Print summary: N sent, M failed, K already notified
```

### Platform Deep Links Configuration

The deep links depend on IDs that only exist after the release goes live. These are NOT stored in the presaves table — they're configuration for the trigger script.

```python
# trigger_presave_notifications.py

RELEASE_LINKS = {
    "benediction": {
        "spotify": "https://open.spotify.com/album/XXXXX",    # From Spotify for Artists
        "apple": "https://music.apple.com/album/XXXXX",       # From Apple Music for Artists
        "youtube": "https://music.youtube.com/browse/XXXXX",   # From YouTube Music
        "bandcamp": "https://heteromorphiczoo.bandcamp.com/album/benediction",
        "other": "https://heteromorphiczoo.band/presave/benediction",
    }
}
```

Ray fills in the platform IDs when he confirms the release is live. The script validates that all platform links are populated before sending.

### Timing

**Manual trigger, not cron.** Council consensus (Pandora proposed, Mare amplified):

Distributors don't guarantee synchronized release timing across platforms. Spotify may go live at midnight in the earliest timezone. Apple Music similar. YouTube varies. A cron job that fires at midnight UTC would need retry logic for platforms that aren't live yet, creating complexity for a one-shot operation.

Ray fires the script when he can visually confirm the release is live on all platforms. One command, done.

### Idempotence

The script is idempotent. Running it twice sends zero duplicate emails because `notification_sent` is checked and set per-record. Safe to re-run if the first execution is interrupted.

---

## 7. init_db.py Update

Add the presaves table to the `SCHEMA` string in `init_db.py` and update the expected tables assertion:

```python
# After sanctuary_submissions table definition, add:

-- Table: presaves
-- Pre-save notification queue. Operational state for release-day email trigger.
-- DP accounting lives in engagement_events; this table tracks notification delivery.
CREATE TABLE IF NOT EXISTS presaves (
    id TEXT PRIMARY KEY,
    fan_id TEXT NOT NULL,
    email TEXT NOT NULL,
    release_slug TEXT NOT NULL,
    platform TEXT NOT NULL,
    confirmation_sent INTEGER NOT NULL DEFAULT 0,
    confirmation_sent_at TEXT,
    notification_sent INTEGER NOT NULL DEFAULT 0,
    notification_sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (fan_id) REFERENCES fans(id)
);

CREATE INDEX IF NOT EXISTS idx_presaves_release ON presaves(release_slug);
CREATE INDEX IF NOT EXISTS idx_presaves_fan_release ON presaves(fan_id, release_slug);
CREATE INDEX IF NOT EXISTS idx_presaves_notification ON presaves(release_slug, notification_sent);
```

Update expected tables list (alphabetical):
```python
expected = [
    "chronicle_events", "chronicle_media", "chronicle_tracks",
    "engagement_events", "fan_metadata", "fans", "offerings",
    "presaves", "rate_limits", "reaction_claims", "reactions",
    "sanctuary_submissions"
]
```

---

## 8. Existing Config Verification

**Confirmed present and correct in `config.py`:**

| Config | Value | Location |
|--------|-------|----------|
| `presave` event type | `("engagement", 10, False)` — 10 DP base, no review required | Line 111 |
| `presave` in VALID_SOURCES | Present | Line 129 |
| Founding window | 2026-04-28 through 2026-07-28 | Lines 61-65 |
| Founding multiplier | 1.5× | Line 67 |

**Needs adding to `config.py`:**

| Config | Value | Purpose |
|--------|-------|---------|
| `VALID_PLATFORMS` | `{"spotify", "apple", "youtube", "bandcamp", "other"}` | Platform enum validation |
| `RESEND_API_KEY` | `os.getenv("HZ_RESEND_API_KEY", "")` | Resend API authentication |
| `RESEND_FROM_EMAIL` | `os.getenv("HZ_RESEND_FROM", "noreply@heteromorphiczoo.band")` | Sender address |

---

## 9. Same-URL Lifecycle Transition

Kazuma's stolen decision SD-5 (unanimous convergence): `/presave/benediction` works forever. Before release: countdown + presave + email capture. After release: same URL, streaming links replace presave form.

**Data-layer implication:** The frontend needs to know whether a release is in pre-release or post-release state. Two options:

1. **Config-driven (recommended):** Add release state to `config.py`:
   ```python
   RELEASES = {
       "benediction": {
           "title": "Benediction",
           "subtitle": "feat. Coty Garcia",
           "status": "presave",  # "presave" | "released"
           "links": {}           # Populated when released
       }
   }
   ```
   Ray updates `status` to `"released"` and populates `links` when the release goes live. The frontend reads this config via a lightweight API endpoint. Matches the manual-trigger philosophy — Ray controls state transitions.

2. **Date-driven:** Frontend checks if `releaseDate` has passed. Simpler but requires knowing the exact release date in advance, which distributors don't always provide.

Option 1 is recommended. The release state change is a deliberate action (Ray confirms it's live), not an automatic date threshold. This aligns with the manual trigger script — both are intentional transitions Ray controls.

---

## 10. Migration Path

For the existing production database on GEX44:

```bash
# SSH to GEX44, then:
cd /path/to/gex44
python3 -c "
import sqlite3
from api.config import DB_PATH
conn = sqlite3.connect(str(DB_PATH))
conn.execute('''CREATE TABLE IF NOT EXISTS presaves (
    id TEXT PRIMARY KEY,
    fan_id TEXT NOT NULL,
    email TEXT NOT NULL,
    release_slug TEXT NOT NULL,
    platform TEXT NOT NULL,
    confirmation_sent INTEGER NOT NULL DEFAULT 0,
    confirmation_sent_at TEXT,
    notification_sent INTEGER NOT NULL DEFAULT 0,
    notification_sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime(chr(37)+\"Y-\"+chr(37)+\"m-\"+chr(37)+\"dT\"+chr(37)+\"H:\"+chr(37)+\"M:\"+chr(37)+\"SZ\", \"now\")),
    FOREIGN KEY (fan_id) REFERENCES fans(id)
)''')
conn.execute('CREATE INDEX IF NOT EXISTS idx_presaves_release ON presaves(release_slug)')
conn.execute('CREATE INDEX IF NOT EXISTS idx_presaves_fan_release ON presaves(fan_id, release_slug)')
conn.execute('CREATE INDEX IF NOT EXISTS idx_presaves_notification ON presaves(release_slug, notification_sent)')
conn.commit()
conn.close()
print('presaves table created')
"
```

Or, safer: run the updated `init_db.py` (which uses `IF NOT EXISTS` for all tables).

---

## 11. Anti-Patterns for Rubedo

- **Do NOT build Spotify OAuth flow.** Extended Quota Mode is categorically inaccessible (250K MAU + registered business entity). Nigredo's finding upgrades Phase 1 from "pragmatic fallback" to "only viable path."
- **Do NOT build a presave count display on the page.** No service shows public counts. Low counts discourage (negative social proof). Track internally only.
- **Do NOT use a cron job for release-day trigger.** Manual script only.
- **Do NOT gate email capture behind platform selection.** They're parallel fields on the same page (Kazuma SD-3).
- **Do NOT store platform deep links in the presaves table.** They're release-level config, not per-presave data. The trigger script uses a release-level config dict.
- **Do NOT add OAuth columns to the table now.** Add them via migration if/when Phase 2 materializes. Don't pre-allocate for uncertain features.
- **Do NOT skip the confirmation email (Email 1).** The two-email pattern (confirmation + release-day) is the converged industry practice. Both emails use Aqua's liturgical copy from `campaign-3-copy.md`.

---

*Mare Session 174 — Campaign heteromorphiczoo-3 phase delivery: presave-schema*
