"""
migrate_offerings_nullable_fan.py — Make offerings.fan_id nullable for admin-seeded offerings.

SQLite doesn't support ALTER COLUMN, so we rebuild the table.
Idempotent — safe to run multiple times.

Usage:
    python3 scripts/migrate_offerings_nullable_fan.py                    # Uses default path
    python3 scripts/migrate_offerings_nullable_fan.py /path/to/db.sqlite # Override path
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
    # Must disable FK checks during table rebuild
    conn.execute("PRAGMA foreign_keys=OFF")

    # Check if fan_id is already nullable
    columns = conn.execute("PRAGMA table_info(offerings)").fetchall()
    fan_id_col = next((c for c in columns if c[1] == "fan_id"), None)
    if fan_id_col and fan_id_col[3] == 0:  # notnull == 0 means already nullable
        print("  offerings.fan_id is already nullable, nothing to do.")
        conn.close()
        return

    print("  Rebuilding offerings table with nullable fan_id...")

    conn.executescript("""
        BEGIN;

        CREATE TABLE offerings_new (
            id TEXT PRIMARY KEY,
            fan_id TEXT,
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

        INSERT INTO offerings_new SELECT * FROM offerings;

        DROP TABLE offerings;

        ALTER TABLE offerings_new RENAME TO offerings;

        CREATE INDEX IF NOT EXISTS idx_offerings_category ON offerings(category);
        CREATE INDEX IF NOT EXISTS idx_offerings_status ON offerings(status);
        CREATE INDEX IF NOT EXISTS idx_offerings_featured ON offerings(featured);

        COMMIT;
    """)

    # Re-enable FK checks and verify
    conn.execute("PRAGMA foreign_keys=ON")
    fk_check = conn.execute("PRAGMA foreign_key_check(offerings)").fetchall()
    if fk_check:
        print(f"  WARNING: Foreign key violations found: {fk_check}")
    else:
        print("  Foreign key check passed.")

    print("  Done. offerings.fan_id is now nullable.")
    conn.close()


if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else None
    migrate(db_path)
