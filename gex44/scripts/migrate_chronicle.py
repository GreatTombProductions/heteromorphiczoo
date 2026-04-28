# FILE_TRAJECTORY: stepping-stone
# TRAJECTORY_NOTE: One-time migration to seed chronicle_events from copy.ts data.
# Run after init_db.py has created the chronicle tables.
"""
migrate_chronicle.py — Seed chronicle events from the hardcoded copy.ts data.

This is a one-time migration script. After running, the chronicle data lives
in SQLite and the API is the source of truth. copy.ts CHRONICLE can be kept
as fallback.

Usage:
    python3 scripts/migrate_chronicle.py                    # Uses default DB
    python3 scripts/migrate_chronicle.py /path/to/db.sqlite # Override path
"""

import sqlite3
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.config import DB_PATH

# The 8 chronicle events from copy.ts, in order
CHRONICLE_EVENTS = [
    {
        "date_display": "November 2022",
        "title": "The Specimen",
        "body": "A demo called Avatara. Ray Heberer, Megan Ash, and Harry Tadayon on vocals. The specimen the band formed around. Chris linked Ray with Bryce, Harry recommended Coty. Everything that follows grows from this recording.",
        "era": "formation",
    },
    {
        "date_display": "2023",
        "title": "The Zoo Awakens",
        "body": "Heteromorphic Zoo coalesces in British Columbia. Ray Heberer \u2014 guitar, composition, production. Coty Garcia \u2014 the founding voice. Megan Ash \u2014 violin, written into the architecture, never decoration. Bryce Butler \u2014 drums. The tagline crystallizes: worship music for monsters.",
        "era": "formation",
    },
    {
        "date_display": "February 2, 2024",
        "title": "First Rites \u2014 Napalm",
        "body": 'The first single and music video. No Clean Singing writes of "utterly deranged vocals that sound like a fight between bull elephants, howler monkeys, and a pack of demons that just escaped Hell." The 13-year editorial thread between Ray and NCS reviewer Islander continues.',
        "era": "singles",
        "video_url": "https://youtu.be/8uQZ5Rv8yIs",
    },
    {
        "date_display": "May 10, 2024",
        "title": "Second Offering \u2014 Avatara",
        "body": 'Second single and music video. Artwork by Lordigan Pedro Sena. "Gentle and beguiling at first\u2026 the violin, guitar, and piano elegantly channel wistfulness and sorrow."',
        "era": "singles",
        "video_url": "https://youtu.be/nWZVq-u7Lec",
    },
    {
        "date_display": "October 10, 2024",
        "title": "The New World Arrives",
        "body": "Five vignettes from a coalition of monsters conquering a new realm. Guest appearances: Ville Hokkanen of Synestia on \"Your Final Seconds.\" Raymond Heberer III \u2014 Ray's father \u2014 on trombone, and Francesco Ferrini of Fleshgod Apocalypse on orchestral arrangement, both on \"Aura of Despair.\" Produced by Chris Wiseman. Mixed and mastered by Christian Donaldson. Artwork by Lordigan Pedro Sena.",
        "era": "ep",
        "tracks": [
            "Ritual of Fidelity",
            "Your Final Seconds",
            "Napalm",
            "Avatara",
            "Aura of Despair",
        ],
    },
    {
        "date_display": "September 2025",
        "title": "The Solo Flight \u2014 Hexed",
        "body": 'Megan Ash releases "Hexed," her first solo single. The violinist steps forward as vocalist and artist in her own right. Covered by FemMetal Rocks.',
        "era": "solo",
    },
    {
        "date_display": "2025",
        "title": "The Crucible",
        "body": "The year the zoo went underground and leveled up. Fifteen-plus instrumental mixes with Bryce. One hundred percent real toms and cymbals, snare at ninety percent of the blended tone. Violin tone refined through covers and Hexed. Greg's production mentorship. Coty sharing vocal chain secrets. The backlog grew. The vision sharpened.",
        "era": "crucible",
    },
    {
        "date_display": "April 2026",
        "title": "Benediction",
        "body": "Ray takes the voice. Benediction \u2014 featuring Coty Garcia \u2014 is a dual-vocalist rite honoring the founding voice and ushering in the next era. Not every band announces a succession with a song where both voices coexist. Written early 2024. Mastered April 2026. The last long-cycle release. Everything after ships faster.",
        "era": "benediction",
    },
]


def migrate(db_path: str | None = None):
    path = Path(db_path) if db_path else DB_PATH
    conn = sqlite3.connect(str(path))
    conn.execute("PRAGMA foreign_keys=ON")

    # Check if chronicle_events table exists
    tables = [
        row[0]
        for row in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
    ]
    if "chronicle_events" not in tables:
        print("ERROR: chronicle_events table does not exist. Run init_db.py first.")
        conn.close()
        sys.exit(1)

    # Check if already migrated
    existing = conn.execute("SELECT COUNT(*) FROM chronicle_events").fetchone()[0]
    if existing > 0:
        print(f"Chronicle already has {existing} events. Skipping migration.")
        conn.close()
        return

    # Insert events
    for i, event in enumerate(CHRONICLE_EVENTS):
        event_id = str(uuid.uuid4())
        sort_order = (i + 1) * 10  # 10, 20, 30... for room to insert between

        conn.execute(
            """INSERT INTO chronicle_events (id, date_display, title, body, era, video_url, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                event_id,
                event["date_display"],
                event["title"],
                event["body"],
                event.get("era"),
                event.get("video_url"),
                sort_order,
            ),
        )

        # Insert tracks if present
        for j, track_name in enumerate(event.get("tracks", [])):
            track_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO chronicle_tracks (id, chronicle_event_id, name, sort_order) VALUES (?, ?, ?, ?)",
                (track_id, event_id, track_name, j),
            )

        print(f"  [{i+1}/8] {event['date_display']} — {event['title']}")

    conn.commit()
    conn.close()
    print(f"\nMigrated {len(CHRONICLE_EVENTS)} chronicle events successfully.")


if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else None
    migrate(db_path)
