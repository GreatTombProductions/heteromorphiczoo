"""
migrate_sanctuary.py — Add sanctuary_submissions table for the AI impact contact form.

Usage:
    python3 scripts/migrate_sanctuary.py
    python3 scripts/migrate_sanctuary.py /path/to/db.sqlite
"""

import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.config import DB_PATH

MIGRATION = """
-- Table: sanctuary_submissions
-- AI impact contact form submissions. Confidential intake — never public.
CREATE TABLE IF NOT EXISTS sanctuary_submissions (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    category TEXT NOT NULL,
    story TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    reviewed INTEGER NOT NULL DEFAULT 0,
    reviewed_at TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_sanctuary_reviewed ON sanctuary_submissions(reviewed);
CREATE INDEX IF NOT EXISTS idx_sanctuary_submitted ON sanctuary_submissions(submitted_at);
"""


def migrate(db_path: str | None = None) -> None:
    path = Path(db_path) if db_path else DB_PATH
    conn = sqlite3.connect(str(path))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript(MIGRATION)
    conn.close()
    print(f"Migration complete: sanctuary_submissions table added to {path}")


if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else None
    migrate(db_path)
