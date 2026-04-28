"""
migrate_fans_v2.py — Add fan_metadata table and opt_in_newsletter column.

Idempotent — safe to run multiple times.

Usage:
    python3 scripts/migrate_fans_v2.py                    # Uses default path
    python3 scripts/migrate_fans_v2.py /path/to/db.sqlite # Override path
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

    # 1. Add opt_in_newsletter column to fans (if not exists)
    columns = [row[1] for row in conn.execute("PRAGMA table_info(fans)").fetchall()]
    if "opt_in_newsletter" not in columns:
        conn.execute("ALTER TABLE fans ADD COLUMN opt_in_newsletter INTEGER NOT NULL DEFAULT 0")
        print("  Added opt_in_newsletter column to fans")
    else:
        print("  opt_in_newsletter column already exists")

    # 2. Create fan_metadata table
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS fan_metadata (
            id TEXT PRIMARY KEY,
            fan_id TEXT NOT NULL,
            field_key TEXT NOT NULL,
            field_value TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
            FOREIGN KEY (fan_id) REFERENCES fans(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_fan_metadata_fan ON fan_metadata(fan_id);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_fan_metadata_fan_key ON fan_metadata(fan_id, field_key);
    """)
    print("  fan_metadata table ready")

    conn.close()
    print(f"Migration complete: {path}")


if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else None
    migrate(db_path)
