# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: Central configuration for the HZ GEX44 API.
# All magic numbers, thresholds, and env-var lookups live here.
"""
config.py — Configuration for the HZ fan engagement platform.

Environment variables:
    HZ_DB_PATH          — SQLite database path (default: data/fan_db.sqlite)
    HZ_ADMIN_API_KEY    — API key for admin endpoints (required in production)
    HZ_BENEDICTION_START — ISO date for founding window start (default: 2026-04-28)
    HZ_BENEDICTION_END   — ISO date for founding window end (default: 2026-07-28)
    HZ_CORS_ORIGINS      — Comma-separated CORS origins (has defaults)
    HZ_RATE_LIMIT_RPM    — Requests per minute per IP (default: 10)
"""

import os
from datetime import date
from pathlib import Path

# --- Public API URL (used by aggregation to make upload paths absolute) ---

API_PUBLIC_URL = os.getenv(
    "HZ_API_PUBLIC_URL", "https://hz-api.greattombproductions.com"
)

# --- Paths ---

_BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = Path(os.getenv("HZ_DB_PATH", str(_BASE_DIR / "data" / "fan_db.sqlite")))
SNAPSHOTS_DIR = _BASE_DIR / "snapshots"
_PROJECT_ROOT = _BASE_DIR.parent  # heteromorphiczoo/ project root (parent of gex44/)
JSON_OUTPUT_DIR = Path(os.getenv("HZ_JSON_OUTPUT_DIR", str(_PROJECT_ROOT / "public" / "data")))

# --- Auth ---

ADMIN_API_KEY = os.getenv("HZ_ADMIN_API_KEY", "dev-key-change-me")
ADMIN_EMAILS = [
    e.strip()
    for e in os.getenv(
        "HZ_ADMIN_EMAILS",
        "ray.heberer@greattombproductions.com,rayheb3@gmail.com",
    ).split(",")
    if e.strip()
]
GOOGLE_CLIENT_ID = os.getenv("HZ_GOOGLE_CLIENT_ID", "")
UPLOAD_DIR = Path(os.getenv("HZ_UPLOAD_DIR", str(_BASE_DIR / "data" / "uploads")))

# --- Benediction Founding Window ---
# Fans who join during this window get founding_member=1 and 1.5x DP multiplier.

BENEDICTION_START = date.fromisoformat(
    os.getenv("HZ_BENEDICTION_START", "2026-04-28")
)
BENEDICTION_END = date.fromisoformat(
    os.getenv("HZ_BENEDICTION_END", "2026-07-28")
)
FOUNDING_MULTIPLIER = 1.5

# --- Rank Thresholds ---
# (dp_threshold, rank_index, title)
# Ordered descending by threshold for efficient lookup.

RANK_TABLE = [
    (5000, 5, "Archbishop"),
    (1500, 4, "High Priest/Priestess"),
    (500, 3, "Elder"),
    (200, 2, "Deacon"),
    (50, 1, "Acolyte"),
    (0, 0, "Uninitiated"),
]


def rank_for_dp(lifetime_dp: int) -> tuple[int, str]:
    """Return (rank_index, rank_title) for a given DP total."""
    for threshold, rank, title in RANK_TABLE:
        if lifetime_dp >= threshold:
            return rank, title
    return 0, "Uninitiated"


# --- Rate Limits ---
# event_type -> (period_type, max_count)
# period_type: "daily" or "weekly"

RATE_LIMITS = {
    "comment": ("daily", 3),
    "social_tag": ("weekly", 3),
}

RATE_LIMIT_RPM = int(os.getenv("HZ_RATE_LIMIT_RPM", "10"))

# --- Event Types ---
# event_type -> (tier, base_dp, requires_review)

EVENT_TYPES = {
    "fan_art": ("creation", 50, True),
    "review_written": ("creation", 30, True),
    "cover_video": ("creation", 100, True),
    "inspired_content": ("creation", 75, True),
    "meme_featured": ("creation", 25, True),
    "presave": ("engagement", 10, False),
    "playlist_add": ("engagement", 5, False),
    "share_with_caption": ("engagement", 10, False),
    "social_tag": ("engagement", 5, False),
    "show_attendance": ("engagement", 20, False),
    "friend_referral": ("engagement", 15, False),
    "comment": ("community", 2, False),
    "poll_response": ("community", 3, False),
    "join_mailing_list": ("community", 5, False),
    "referral_complete": ("community", 10, False),
    "ugc_report": ("community", 3, False),
}

# --- Source Enum ---

VALID_SOURCES = {
    "website", "presave", "show", "referral", "social", "merch_purchase", "import"
}

# --- Offering Categories ---

VALID_CATEGORIES = {"visual", "sonic", "textual", "ritual", "profane"}

# --- CORS ---

_default_origins = "https://heteromorphiczoo.com,https://www.heteromorphiczoo.com,http://localhost:3000"
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("HZ_CORS_ORIGINS", _default_origins).split(",")
    if o.strip()
]
# Always allow Vercel preview URLs in dev
CORS_ORIGIN_REGEX = r"https://.*\.vercel\.app"
