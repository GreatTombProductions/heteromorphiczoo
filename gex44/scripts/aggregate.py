# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: SQLite -> static JSON aggregation. The read path for the entire site.
# All display data is pre-computed here, served from Vercel CDN. The website NEVER queries the DB directly.
"""
aggregate.py — SQLite to static JSON aggregation for heteromorphiczoo.com.

Reads from fan_db.sqlite, writes 5 JSON files:
    census.json, menagerie-roll.json, offerings.json, reactions.json, altar.json

Usage:
    python3 scripts/aggregate.py                     # Standard aggregation
    python3 scripts/aggregate.py --snapshot           # Also write dated snapshot
    python3 scripts/aggregate.py --db /path/to/db     # Override DB path
    python3 scripts/aggregate.py --output /path/to/dir # Override output directory
"""

import argparse
import json
import shutil
import sqlite3
import sys
from datetime import date, datetime, timezone
from pathlib import Path

# Allow running from gex44/ root or scripts/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.config import API_PUBLIC_URL, DB_PATH, JSON_OUTPUT_DIR, RANK_TABLE, SNAPSHOTS_DIR


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _resolve_url(url: str | None) -> str | None:
    """Make relative /uploads/ paths absolute so the Vercel frontend can reach GEX44."""
    if url and url.startswith("/uploads/"):
        return f"{API_PUBLIC_URL}{url}"
    return url


def _connect(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def recompute_dp_and_ranks(conn: sqlite3.Connection):
    """Recompute lifetime_dp and current_rank for all fans from the engagement ledger."""
    # Step 1: Recompute lifetime_dp from engagement_events
    # Only count events where (not reviewed) OR (reviewed AND approved)
    conn.execute("""
        UPDATE fans SET lifetime_dp = (
            SELECT COALESCE(SUM(dp_awarded), 0)
            FROM engagement_events
            WHERE fan_id = fans.id
            AND (reviewed = 0 OR approved = 1)
        )
    """)

    # Step 2: Recompute current_rank (ranks never decrease — high-water mark)
    # RANK_TABLE is ordered descending by threshold
    for threshold, rank_idx, _ in RANK_TABLE:
        conn.execute(
            "UPDATE fans SET current_rank = MAX(current_rank, ?) WHERE lifetime_dp >= ?",
            (rank_idx, threshold),
        )

    conn.execute(
        "UPDATE fans SET updated_at = ?", (_now_iso(),)
    )
    conn.commit()


def write_census_json(conn: sqlite3.Connection, output_dir: Path) -> dict:
    """Write census.json — aggregate stats."""
    total = conn.execute("SELECT COUNT(*) FROM fans").fetchone()[0]
    founding = conn.execute(
        "SELECT COUNT(*) FROM fans WHERE founding_member = 1"
    ).fetchone()[0]

    by_rank = []
    for _, rank_idx, title in sorted(RANK_TABLE, key=lambda r: r[1]):
        count = conn.execute(
            "SELECT COUNT(*) FROM fans WHERE current_rank = ?", (rank_idx,)
        ).fetchone()[0]
        by_rank.append({"rank": rank_idx, "title": title, "count": count})

    total_offerings = conn.execute(
        "SELECT COUNT(*) FROM offerings WHERE status IN ('approved', 'featured')"
    ).fetchone()[0]
    total_reactions = conn.execute(
        "SELECT COUNT(*) FROM reactions WHERE status = 'approved'"
    ).fetchone()[0]

    data = {
        "total_members": total,
        "by_rank": by_rank,
        "total_offerings": total_offerings,
        "total_reactions": total_reactions,
        "founding_members": founding,
        "generated_at": _now_iso(),
    }

    path = output_dir / "census.json"
    path.write_text(json.dumps(data, indent=2))
    return data


def write_menagerie_roll_json(conn: sqlite3.Connection, output_dir: Path) -> dict:
    """Write menagerie-roll.json — public leaderboard of named fans."""
    rows = conn.execute("""
        SELECT name, current_rank, lifetime_dp, founding_member, acquired_at
        FROM fans
        WHERE name IS NOT NULL AND name != ''
        ORDER BY current_rank DESC, lifetime_dp DESC
    """).fetchall()

    # Map rank index to title
    rank_titles = {r[1]: r[2] for r in RANK_TABLE}

    roll = []
    for row in rows:
        roll.append({
            "name": row["name"],
            "rank": row["current_rank"],
            "rank_title": rank_titles.get(row["current_rank"], "Uninitiated"),
            "lifetime_dp": row["lifetime_dp"],
            "founding_member": bool(row["founding_member"]),
            "joined": row["acquired_at"][:10] if row["acquired_at"] else None,
        })

    data = {
        "roll": roll,
        "generated_at": _now_iso(),
    }

    path = output_dir / "menagerie-roll.json"
    path.write_text(json.dumps(data, indent=2))
    return data


def write_offerings_json(conn: sqlite3.Connection, output_dir: Path) -> dict:
    """Write offerings.json — approved/featured UGC."""
    rows = conn.execute("""
        SELECT o.id, o.category, o.title, o.description, o.content_url,
               o.content_type, o.thumbnail_url, o.inspired_by, o.featured,
               o.approved_at, f.name as creator_name, f.current_rank as creator_rank
        FROM offerings o
        LEFT JOIN fans f ON o.fan_id = f.id
        WHERE o.status IN ('approved', 'featured')
        ORDER BY o.approved_at DESC
    """).fetchall()

    rank_titles = {r[1]: r[2] for r in RANK_TABLE}

    offerings = []
    for row in rows:
        offerings.append({
            "id": row["id"],
            "category": row["category"],
            "title": row["title"],
            "description": row["description"],
            "content_url": _resolve_url(row["content_url"]),
            "content_type": row["content_type"],
            "thumbnail_url": _resolve_url(row["thumbnail_url"]),
            "creator_name": row["creator_name"] or "The Menagerie",
            "creator_rank": row["creator_rank"] or 0,
            "creator_rank_title": rank_titles.get(row["creator_rank"] or 0, "Uninitiated"),
            "inspired_by": row["inspired_by"],
            "featured": bool(row["featured"]),
            "approved_at": row["approved_at"],
        })

    # Category counts
    by_category = {}
    for cat in ("visual", "sonic", "textual", "ritual", "profane"):
        count = conn.execute(
            "SELECT COUNT(*) FROM offerings WHERE category = ? AND status IN ('approved', 'featured')",
            (cat,),
        ).fetchone()[0]
        by_category[cat] = count

    data = {
        "offerings": offerings,
        "by_category": by_category,
        "generated_at": _now_iso(),
    }

    path = output_dir / "offerings.json"
    path.write_text(json.dumps(data, indent=2))
    return data


def write_reactions_json(conn: sqlite3.Connection, output_dir: Path) -> dict:
    """Write reactions.json — approved reaction videos."""
    rows = conn.execute("""
        SELECT r.id, r.youtube_url, r.youtube_id, r.title, r.channel_name,
               r.thumbnail_url, r.song_tag, r.approved_at,
               f.name as claimed_by_name
        FROM reactions r
        LEFT JOIN fans f ON r.claimed_by = f.id
        WHERE r.status = 'approved'
    """).fetchall()

    reactions = []
    for row in rows:
        entry = {
            "id": row["id"],
            "youtube_url": row["youtube_url"],
            "youtube_id": row["youtube_id"],
            "title": row["title"],
            "channel_name": row["channel_name"],
            "thumbnail_url": row["thumbnail_url"],
            "song_tag": row["song_tag"],
            "approved_at": row["approved_at"],
        }
        if row["claimed_by_name"]:
            entry["claimed_by_name"] = row["claimed_by_name"]
        reactions.append(entry)

    # Song counts
    song_rows = conn.execute("""
        SELECT song_tag, COUNT(*) as cnt
        FROM reactions
        WHERE status = 'approved' AND song_tag IS NOT NULL
        GROUP BY song_tag
    """).fetchall()
    by_song = {row["song_tag"]: row["cnt"] for row in song_rows}

    data = {
        "reactions": reactions,
        "by_song": by_song,
        "total": len(reactions),
        "generated_at": _now_iso(),
    }

    path = output_dir / "reactions.json"
    path.write_text(json.dumps(data, indent=2))
    return data


def write_altar_json(conn: sqlite3.Connection, output_dir: Path) -> dict:
    """Write altar.json — the currently featured offering."""
    rank_titles = {r[1]: r[2] for r in RANK_TABLE}

    # Current featured offering (most recently featured)
    current = conn.execute("""
        SELECT o.id, o.category, o.title, o.description, o.content_url,
               o.content_type, o.thumbnail_url, o.featured_at,
               f.name as creator_name, f.current_rank as creator_rank
        FROM offerings o
        LEFT JOIN fans f ON o.fan_id = f.id
        WHERE o.featured = 1
        ORDER BY o.featured_at DESC
        LIMIT 1
    """).fetchone()

    current_data = None
    if current:
        current_data = {
            "id": current["id"],
            "category": current["category"],
            "title": current["title"],
            "description": current["description"],
            "content_url": _resolve_url(current["content_url"]),
            "content_type": current["content_type"],
            "thumbnail_url": _resolve_url(current["thumbnail_url"]),
            "creator_name": current["creator_name"] or "The Menagerie",
            "creator_rank_title": rank_titles.get(current["creator_rank"] or 0, "Uninitiated"),
            "featured_at": current["featured_at"],
        }

    # Recent featured (excluding current)
    recent_rows = conn.execute("""
        SELECT o.id, o.category, o.title, o.content_type, o.thumbnail_url,
               o.featured_at, f.name as creator_name
        FROM offerings o
        LEFT JOIN fans f ON o.fan_id = f.id
        WHERE o.featured = 1
        ORDER BY o.featured_at DESC
        LIMIT 6 OFFSET 1
    """).fetchall()

    recent = []
    for row in recent_rows:
        recent.append({
            "id": row["id"],
            "category": row["category"],
            "title": row["title"],
            "content_type": row["content_type"],
            "thumbnail_url": _resolve_url(row["thumbnail_url"]),
            "creator_name": row["creator_name"] or "The Menagerie",
            "featured_at": row["featured_at"],
        })

    data = {
        "current": current_data,
        "recent": recent,
        "generated_at": _now_iso(),
    }

    path = output_dir / "altar.json"
    path.write_text(json.dumps(data, indent=2))
    return data


def aggregate(
    db_path: Path | None = None,
    output_dir: Path | None = None,
    snapshot: bool = False,
):
    """Full aggregation run. Returns list of files written."""
    db_path = db_path or DB_PATH
    output_dir = output_dir or JSON_OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    conn = _connect(db_path)

    try:
        # Recompute derived fields
        recompute_dp_and_ranks(conn)

        # Write all JSON files
        write_census_json(conn, output_dir)
        write_menagerie_roll_json(conn, output_dir)
        write_offerings_json(conn, output_dir)
        write_reactions_json(conn, output_dir)
        write_altar_json(conn, output_dir)

        files_written = [
            "census.json",
            "menagerie-roll.json",
            "offerings.json",
            "reactions.json",
            "altar.json",
        ]

        print(f"Aggregation complete: {len(files_written)} files written to {output_dir}")

        # Snapshot mode: copy to dated directory
        if snapshot:
            snapshot_dir = (SNAPSHOTS_DIR / date.today().isoformat())
            snapshot_dir.mkdir(parents=True, exist_ok=True)
            for f in files_written:
                src = output_dir / f
                if src.exists():
                    shutil.copy2(str(src), str(snapshot_dir / f))
            print(f"Snapshot written to {snapshot_dir}")

        return files_written

    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HZ fan data aggregation")
    parser.add_argument("--snapshot", action="store_true", help="Write dated snapshot")
    parser.add_argument("--db", type=str, help="Override database path")
    parser.add_argument("--output", type=str, help="Override output directory")
    args = parser.parse_args()

    aggregate(
        db_path=Path(args.db) if args.db else None,
        output_dir=Path(args.output) if args.output else None,
        snapshot=args.snapshot,
    )
