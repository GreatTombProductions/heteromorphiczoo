#!/usr/bin/env python3
# SPEC_SOURCE: specs/presave-schema.md
# LAST_PROJECTED: 2026-05-04
# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: Release-day notification trigger. Manual script Ray fires
# when he confirms the release is live across platforms. Idempotent.
"""
trigger_presave_notifications.py — Send release-day emails.

Usage:
    python3 scripts/trigger_presave_notifications.py --release benediction

Sends to two groups:
  1. Presave fans — anyone who signed up via /presave (regardless of newsletter status)
  2. Newsletter subscribers — anyone in the menagerie with opt_in_newsletter=1 who
     didn't presave (they get all-platforms links instead of a preferred platform)

Idempotent: running twice sends zero duplicate emails. Newsletter-only fans get a
synthetic presave record (platform='newsletter') inserted after send to prevent re-sends.

Prerequisites:
    - HZ_RESEND_API_KEY set in environment
    - Platform links populated in RELEASE_LINKS below
"""

import argparse
import sqlite3
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from api.config import API_PUBLIC_URL, DB_PATH, RESEND_API_KEY, RESEND_FROM_EMAIL

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


def build_email_body(platform: str, links: dict[str, str], fan_id: str) -> str:
    """Build the release-day email text."""
    primary_link = links.get(platform, links.get("other", ""))
    platform_name = PLATFORM_NAMES.get(platform, "your platform")

    lines = [
        "The rite has begun.",
        "",
        "Benediction is live. Hear the blessing:",
        "",
    ]

    # For newsletter-only fans (no platform preference), skip the primary link line
    # and just show all platforms below
    if platform != "newsletter" and primary_link:
        lines.append(f"Listen on {platform_name} \u2192 {primary_link}")
        lines.append("")

    lines.extend([
        "Every note is human. Every lyric. Every melody. Every arrangement.",
        "Every voice you hear spent years becoming itself.",
        "",
    ])

    # Add platform links (secondary for presave fans, all for newsletter fans)
    if platform == "newsletter":
        show_links = [(k, v) for k, v in links.items() if v and k != "other"]
    else:
        show_links = [(k, v) for k, v in links.items() if k != platform and v]

    if show_links:
        label = "Listen:" if platform == "newsletter" else "Also available on:"
        lines.append(label)
        for plat, url in show_links:
            name = PLATFORM_NAMES.get(plat, plat)
            lines.append(f"  {name}: {url}")
        lines.append("")

    unsub_url = f"{API_PUBLIC_URL}/api/hz/unsubscribe/{fan_id}"
    lines.extend([
        "If this moved you \u2014 tell someone.",
        "",
        "\u2014 The Zoo",
        "",
        f"Unsubscribe: {unsub_url}",
    ])

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Send release-day notifications")
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

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row

    # --- Group 1: Presave fans (notification not yet sent) ---
    presave_pending = conn.execute(
        "SELECT id, fan_id, email, platform FROM presaves WHERE release_slug = ? AND notification_sent = 0",
        (release,),
    ).fetchall()

    # --- Group 2: Newsletter subscribers who didn't presave ---
    newsletter_pending = conn.execute(
        """SELECT f.id AS fan_id, f.email
           FROM fans f
           WHERE f.opt_in_newsletter = 1
             AND f.id NOT IN (
                 SELECT fan_id FROM presaves WHERE release_slug = ?
             )""",
        (release,),
    ).fetchall()

    total = len(presave_pending) + len(newsletter_pending)

    if total == 0:
        already_sent = conn.execute(
            "SELECT COUNT(*) FROM presaves WHERE release_slug = ? AND notification_sent = 1",
            (release,),
        ).fetchone()[0]
        print(f"No pending notifications for '{release}'.")
        print(f"({already_sent} already notified)")
        conn.close()
        return

    print(f"Found {len(presave_pending)} presave + {len(newsletter_pending)} newsletter = {total} pending")

    if args.dry_run:
        for p in presave_pending:
            print(f"  [presave]     {p['email']} (platform: {p['platform']})")
        for n in newsletter_pending:
            print(f"  [newsletter]  {n['email']} (all platforms)")
        conn.close()
        return

    # Send emails
    import resend
    resend.api_key = RESEND_API_KEY

    sent = 0
    failed = 0
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # --- Send to presave fans ---
    for p in presave_pending:
        email = p["email"]
        platform = p["platform"]
        fan_id = p["fan_id"]
        body = build_email_body(platform, links, fan_id)
        unsub_url = f"{API_PUBLIC_URL}/api/hz/unsubscribe/{fan_id}"

        try:
            resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": email,
                "subject": "The rite has begun \u2014 Benediction is live",
                "text": body,
                "headers": {
                    "List-Unsubscribe": f"<{unsub_url}>",
                    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                },
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

    # --- Send to newsletter-only fans ---
    for n in newsletter_pending:
        email = n["email"]
        fan_id = n["fan_id"]
        body = build_email_body("newsletter", links, fan_id)
        unsub_url = f"{API_PUBLIC_URL}/api/hz/unsubscribe/{fan_id}"

        try:
            resend.Emails.send({
                "from": RESEND_FROM_EMAIL,
                "to": email,
                "subject": "The rite has begun \u2014 Benediction is live",
                "text": body,
                "headers": {
                    "List-Unsubscribe": f"<{unsub_url}>",
                    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                },
            })
            # Insert synthetic presave record to prevent re-sends on re-run
            presave_id = str(uuid.uuid4())
            conn.execute(
                """INSERT INTO presaves (id, fan_id, email, release_slug, platform,
                   notification_sent, notification_sent_at, created_at)
                   VALUES (?, ?, ?, ?, 'newsletter', 1, ?, ?)""",
                (presave_id, fan_id, email, release, now, now),
            )
            conn.commit()
            sent += 1
            print(f"  \u2713 {email} (newsletter)")
        except Exception as e:
            failed += 1
            print(f"  \u2717 {email}: {e}")

    conn.close()
    print(f"\nSummary: {sent} sent, {failed} failed, {total} total")


if __name__ == "__main__":
    main()
