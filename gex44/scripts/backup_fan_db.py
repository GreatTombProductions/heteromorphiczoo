#!/usr/bin/env python3
"""Automated WAL-safe backup of the Heteromorphic Zoo fan engagement SQLite DB.

Uses the sqlite3 Python backup API (equivalent to `sqlite3 .backup`), which is
safe against concurrent writers: it snapshots the live DB including WAL
contents without needing to checkpoint or take the DB offline.

Rotation: fan_db-YYYYMMDD.sqlite in gex44/data/backups/, keep newest N.
"""
import argparse
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

DB_PATH = Path("/home/ray/greattomb/0th-floor-exterior/central-mausoleum/heteromorphiczoo/gex44/data/fan_db.sqlite")
BACKUP_DIR = Path("/home/ray/greattomb/0th-floor-exterior/central-mausoleum/heteromorphiczoo/gex44/data/backups")
KEEP = 14  # 14 daily backups ≈ 2 weeks of history


def backup(db_path: Path, backup_dir: Path, keep: int) -> Path:
    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d")
    dest = backup_dir / f"fan_db-{stamp}.sqlite"

    # sqlite3 backup API is WAL-safe: copies main DB + replays WAL frames.
    src = sqlite3.connect(str(db_path))
    dst = sqlite3.connect(str(dest))
    with dst:
        src.backup(dst)
    src.close()
    dst.close()

    # Rotate: remove oldest backups beyond retention.
    existing = sorted(backup_dir.glob("fan_db-*.sqlite"))
    for stale in existing[:-keep] if len(existing) > keep else []:
        stale.unlink(missing_ok=True)

    return dest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DB_PATH)
    parser.add_argument("--backup-dir", type=Path, default=BACKUP_DIR)
    parser.add_argument("--keep", type=int, default=KEEP)
    parser.add_argument("--check", action="store_true",
                        help="Verify backup integrity (integrity_check) after writing")
    args = parser.parse_args()

    if not args.db.exists():
        print(f"ERROR: source DB not found: {args.db}", file=sys.stderr)
        return 1

    dest = backup(args.db, args.backup_dir, args.keep)

    # Integrity verification — cheap on a ~1MB DB, catches WAL/corruption issues.
    if args.check:
        conn = sqlite3.connect(str(dest))
        row = conn.execute("PRAGMA integrity_check").fetchone()
        conn.close()
        if row[0] != "ok":
            print(f"ERROR: integrity_check failed on {dest}: {row[0]}", file=sys.stderr)
            return 1

    print(f"OK: {dest} ({dest.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
