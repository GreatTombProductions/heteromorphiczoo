# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: Creates the 5-table SQLite schema for the HZ fan engagement platform.
# Schema matches data-pipeline-spec.md Section 1 exactly.
"""
init_db.py — Initialize the HZ fan engagement SQLite database.

Creates all five tables: fans, engagement_events, offerings, reactions, rate_limits.
Idempotent — safe to run multiple times (uses IF NOT EXISTS).

Usage:
    python3 scripts/init_db.py                    # Uses default path from config
    python3 scripts/init_db.py /path/to/db.sqlite # Override path
"""

import sqlite3
import sys
from pathlib import Path

# Allow running from gex44/ root or scripts/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.config import DB_PATH


SCHEMA = """
-- Table: fans
-- Primary fan records. Email is the dedup key.
CREATE TABLE IF NOT EXISTS fans (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    source TEXT NOT NULL DEFAULT 'website',
    acquired_at TEXT NOT NULL,
    founding_member INTEGER NOT NULL DEFAULT 0,
    opt_in_email INTEGER NOT NULL DEFAULT 1,
    opt_in_sms INTEGER NOT NULL DEFAULT 0,
    lifetime_dp INTEGER NOT NULL DEFAULT 0,
    current_rank INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_fans_email ON fans(email);
CREATE INDEX IF NOT EXISTS idx_fans_rank ON fans(current_rank);
CREATE INDEX IF NOT EXISTS idx_fans_source ON fans(source);

-- Table: engagement_events
-- The DP ledger. Append-only. Every point-earning action ever taken.
CREATE TABLE IF NOT EXISTS engagement_events (
    id TEXT PRIMARY KEY,
    fan_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    dp_awarded INTEGER NOT NULL,
    dp_base INTEGER NOT NULL,
    multiplier REAL NOT NULL DEFAULT 1.0,
    metadata TEXT,
    release_cycle TEXT,
    reviewed INTEGER NOT NULL DEFAULT 0,
    approved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (fan_id) REFERENCES fans(id)
);

CREATE INDEX IF NOT EXISTS idx_events_fan ON engagement_events(fan_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON engagement_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON engagement_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_review ON engagement_events(reviewed, approved);

-- Table: offerings
-- Approved UGC submissions with their own display lifecycle.
CREATE TABLE IF NOT EXISTS offerings (
    id TEXT PRIMARY KEY,
    fan_id TEXT NOT NULL,
    event_id TEXT,
    category TEXT NOT NULL,
    title TEXT,
    description TEXT,
    content_url TEXT,
    content_type TEXT NOT NULL,
    thumbnail_url TEXT,
    inspired_by TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    featured_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    approved_at TEXT,
    FOREIGN KEY (fan_id) REFERENCES fans(id),
    FOREIGN KEY (inspired_by) REFERENCES offerings(id)
);

CREATE INDEX IF NOT EXISTS idx_offerings_category ON offerings(category);
CREATE INDEX IF NOT EXISTS idx_offerings_status ON offerings(status);
CREATE INDEX IF NOT EXISTS idx_offerings_featured ON offerings(featured);

-- Table: reactions
-- YouTube reaction videos. Separate table for YouTube-specific metadata.
CREATE TABLE IF NOT EXISTS reactions (
    id TEXT PRIMARY KEY,
    youtube_url TEXT UNIQUE NOT NULL,
    youtube_id TEXT NOT NULL,
    title TEXT,
    channel_name TEXT,
    thumbnail_url TEXT,
    song_tag TEXT,
    channel_subscribers INTEGER,
    submitted_by TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    discovered_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    approved_at TEXT,
    FOREIGN KEY (submitted_by) REFERENCES fans(id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_status ON reactions(status);
CREATE INDEX IF NOT EXISTS idx_reactions_song ON reactions(song_tag);

-- Table: rate_limits
-- Anti-gaming provisions. Per-fan caps on repeatable actions.
CREATE TABLE IF NOT EXISTS rate_limits (
    fan_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    period_key TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (fan_id, event_type, period_key),
    FOREIGN KEY (fan_id) REFERENCES fans(id)
);
"""


def init_db(db_path: str | None = None) -> Path:
    """Create all tables. Returns the database path used."""
    path = Path(db_path) if db_path else DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(path))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript(SCHEMA)
    conn.close()

    print(f"Database initialized: {path}")

    # Verify
    conn = sqlite3.connect(str(path))
    tables = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).fetchall()
    conn.close()

    table_names = [t[0] for t in tables]
    expected = ["engagement_events", "fans", "offerings", "rate_limits", "reactions"]
    assert table_names == expected, f"Expected {expected}, got {table_names}"
    print(f"Tables created: {', '.join(table_names)}")

    return path


if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else None
    init_db(db_path)
