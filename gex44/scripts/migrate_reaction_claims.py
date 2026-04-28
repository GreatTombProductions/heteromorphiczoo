"""
migrate_reaction_claims.py — Add reaction claims infrastructure.

Changes:
    1. Add event_id column to reactions (FK to engagement_events)
    2. Add claimed_by column to reactions (FK to fans)
    3. Create reaction_claims table

Safe to run multiple times (uses IF NOT EXISTS / checks for column existence).
"""

import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.config import DB_PATH


def migrate(db_path: str | None = None):
    path = Path(db_path) if db_path else DB_PATH
    conn = sqlite3.connect(str(path))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")

    # Check existing columns on reactions
    columns = {
        row[1]
        for row in conn.execute("PRAGMA table_info(reactions)").fetchall()
    }

    if "event_id" not in columns:
        conn.execute("ALTER TABLE reactions ADD COLUMN event_id TEXT REFERENCES engagement_events(id)")
        print("Added event_id column to reactions")

    if "claimed_by" not in columns:
        conn.execute("ALTER TABLE reactions ADD COLUMN claimed_by TEXT REFERENCES fans(id)")
        print("Added claimed_by column to reactions")

    # Create reaction_claims table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS reaction_claims (
            id TEXT PRIMARY KEY,
            reaction_id TEXT NOT NULL,
            fan_id TEXT NOT NULL,
            email TEXT NOT NULL,
            event_id TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
            reviewed_at TEXT,
            FOREIGN KEY (reaction_id) REFERENCES reactions(id),
            FOREIGN KEY (fan_id) REFERENCES fans(id),
            FOREIGN KEY (event_id) REFERENCES engagement_events(id)
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_reaction_claims_reaction ON reaction_claims(reaction_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_reaction_claims_status ON reaction_claims(status)")
    print("Created reaction_claims table")

    conn.commit()
    conn.close()
    print(f"Migration complete: {path}")


if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else None
    migrate(db_path)
