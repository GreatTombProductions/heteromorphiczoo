#!/usr/bin/env python3
# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: Release-day notification trigger. Manual script Ray fires
# when he confirms the release is live across platforms. Idempotent.
"""
trigger_presave_notifications.py — Send release-day emails to presave fans.

Usage:
    python3 scripts/trigger_presave_notifications.py --release benediction

The script:
1. Queries presaves where notification_sent = 0 for the given release
2. Sends release-day emails via Resend with platform-specific deep links
3. Marks each presave as notified
4. Prints a summary

Idempotent: running twice sends zero duplicate emails.

Prerequisites:
    - HZ_RESEND_API_KEY set in environment
    - Platform links populated in RELEASE_LINKS below
"""

import argparse
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.config import DB_PATH, RESEND_API_KEY, RESEND_FROM_EMAIL

# --- Platform Deep Links ---
# Fill these in when the release goes live on each platform.
# Ray copies the URLs from Spotify for Artists, Apple Music for Artists, etc.

RELEASE_LINKS: dict[str, dict[str, str]] = {
    "benediction": {
        "spotify": "",      # e.g. https://open.spotify.com/album/XXXXX
        "apple": "",        # e.g. https://music.apple.com/album/XXXXX
        "youtube": "",      # e.g. https://music.youtube.com/browse/XXXXX
        "bandcamp": "https://heteromorphiczoo.bandcamp.com/album/benediction",
        "other": "https://heteromorphiczoo.band/presave/benediction",
    }
}

PLATFORM_NAMES = {
    "spotify": "Spotify",
    "apple": "Apple Music",
    "youtube": "YouTube Music",
    "bandcamp": "Bandcamp",
    "other": "All Platforms",
}


def build_email_body(platform: str, links: dict[str, str]) -> str:
    """Build the release-day email text."""
    primary_link = links.get(platform, links.get("other", ""))
    platform_name = PLATFORM_NAMES.get(platform, "your platform")

    lines = [
        "The rite has begun.",
        "",
        "Benediction is live. Hear the blessing:",
        "",
        f"Listen on {platform_name} \u2192 {primary_link}" if primary_link else "",
        "",
        "Every note is human. Every lyric. Every melody. Every arrangement.",
        "Every voice you hear spent years becoming itself.",
        "",
    ]

    # Add secondary platform links
    other_links = [(k, v) for k, v in links.items() if k != platform and v]
    if other_links:
        lines.append("Also available on:")
        for plat, url in other_links:
            name = PLATFORM_NAMES.get(plat, plat)
            lines.append(f"  {name}: {url}")
        lines.append("")

    lines.extend([
        "If this moved you \u2014 tell someone.",
        "",
        "\u2014 The Zoo",
    ])

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Send release-day presave notifications")
    parser.add_argument("--release", required=True, help="Release slug (e.g. 'benediction')")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be sent without sending")
    args = parser.parse_args()

    release = args.release
    links = RELEASE_LINKS.get(release)
    if not links:
        print(f"ERROR: No links configured for release '{release}'")
        print(f"Available releases: {', '.join(RELEASE_LINKS.keys())}")
        sys.exit(1)

    # Validate that platform links are populated
    empty_platforms = [k for k, v in links.items() if not v and k != "other"]
    if empty_platforms and not args.dry_run:
        print(f"WARNING: Empty links for: {', '.join(empty_platforms)}")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != "y":
            print("Aborted.")
            sys.exit(0)

    if not RESEND_API_KEY and not args.dry_run:
        print("ERROR: HZ_RESEND_API_KEY not set")
        sys.exit(1)

    # Query pending presaves
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    pending = conn.execute(
        "SELECT * FROM presaves WHERE release_slug = ? AND notification_sent = 0",
        (release,),
    ).fetchall()

    if not pending:
        print(f"No pending notifications for '{release}'.")
        already_sent = conn.execute(
            "SELECT COUNT(*) FROM presaves WHERE release_slug = ? AND notification_sent = 1",
            (release,),
        ).fetchone()[0]
        print(f"({already_sent} already notified)")
        conn.close()
        return

    print(f"Found {len(pending)} pending notifications for '{release}'")

    if args.dry_run:
        for p in pending:
            print(f"  Would email: {p['email']} (platform: {p['platform']})")
        conn.close()
        return

    # Send emails
    import resend
    resend.api_key = RESEND_API_KEY

    sent = 0
    failed = 0
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    for p in pending:
        email = p["email"]
        platform = p["platform"]
        body = build_email_body(platform, links)

        try:
            resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": email,
                "subject": "The rite has begun \u2014 Benediction is live",
                "text": body,
            })
            conn.execute(
                "UPDATE presaves SET notification_sent = 1, notification_sent_at = ? WHERE id = ?",
                (now, p["id"]),
            )
            conn.commit()
            sent += 1
            print(f"  \u2713 {email} ({PLATFORM_NAMES.get(platform, platform)})")
        except Exception as e:
            failed += 1
            print(f"  \u2717 {email}: {e}")

    conn.close()
    print(f"\nSummary: {sent} sent, {failed} failed, {len(pending)} total")


if __name__ == "__main__":
    main()
