#!/usr/bin/env python3
"""
HZ Feedback Pickup — Bridge from Heteromorphic Zoo fan database to agent ecosystem.

Queries the fan_db.sqlite for items needing admin review (pending reactions,
offerings, partner applications, unreviewed sanctuary submissions, reaction
claims), writes report-framed inbox files to agents/slimeko/workspace/inbox/.

These are REVIEW items for Ray's attention — Slimeko cannot act on them directly
(no admin panel access, no review authority). The inbox files surface what needs
Ray's eyes; Slimeko creates Reports from them.

Idempotent: uses review-item UUID as filename, skips if file exists.
Does NOT modify the source database (HZ admin panel is the review surface).

Usage:
  python3 gex44/scripts/hz-feedback-pickup.py              # dry-run
  python3 gex44/scripts/hz-feedback-pickup.py --execute     # write inbox files

No external dependencies — uses only stdlib sqlite3.
"""

import sqlite3
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]  # heteromorphiczoo/
GREATTOMB_ROOT = Path(__file__).resolve().parents[5]  # greattomb/
SLIMEKO_INBOX = GREATTOMB_ROOT / "agents" / "slimeko" / "workspace" / "inbox"
DB_PATH = PROJECT_ROOT / "gex44" / "data" / "fan_db.sqlite"

# What to look for in each table
REVIEW_TYPES = {
    "reactions": {
        "table": "reactions",
        "where": "status = 'pending'",
        "order": "discovered_at ASC",
        "id_field": "id",
        "label": "Reaction",
    },
    "offerings": {
        "table": "offerings",
        "where": "status = 'pending'",
        "order": "submitted_at ASC",
        "id_field": "id",
        "label": "Offering",
    },
    "partner-applications": {
        "table": "partner_applications",
        "where": "status = 'pending'",
        "order": "submitted_at ASC",
        "id_field": "id",
        "label": "Partner Application",
    },
    "sanctuary": {
        "table": "sanctuary_submissions",
        "where": "reviewed = 0",
        "order": "submitted_at ASC",
        "id_field": "id",
        "label": "Sanctuary Submission",
    },
    "reaction-claims": {
        "table": "reaction_claims",
        "where": "status = 'pending'",
        "order": "submitted_at ASC",
        "id_field": "id",
        "label": "Reaction Claim",
    },
}


def get_pending_items(db_path: Path) -> list[dict]:
    """Query all review-queue tables for pending/unreviewed items."""
    if not db_path.exists():
        print(f"ERROR: Database not found at {db_path}", file=sys.stderr)
        sys.exit(1)

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    results = []

    try:
        for review_type, config in REVIEW_TYPES.items():
            try:
                cursor = conn.execute(
                    f"SELECT * FROM {config['table']} WHERE {config['where']} ORDER BY {config['order']}"
                )
                for row in cursor.fetchall():
                    item = dict(row)
                    item["_review_type"] = review_type
                    item["_label"] = config["label"]
                    results.append(item)
            except Exception as e:
                print(f"WARN: Could not query {config['table']}: {e}", file=sys.stderr)
    finally:
        conn.close()

    return results


def build_inbox_content(item: dict) -> str:
    """Build a report-framed inbox file for Slimeko → Ray attention."""
    review_type = item.pop("_review_type")
    label = item.pop("_label")

    # Pretty-print relevant fields based on type
    lines = [
        f"---",
        f"from: hz-fan-database",
        f"review_type: {review_type}",
        f"source: heteromorphic-zoo",
        f"priority: normal",
    ]

    # Add timestamp
    for ts_field in ("submitted_at", "discovered_at", "created_at"):
        if ts_field in item and item[ts_field]:
            lines.append(f"requested: {item[ts_field]}")
            break

    lines.append("")
    lines.append("# Review Needed — HZ Admin Panel")
    lines.append("")
    lines.append(f"This is a **{label}** awaiting review in the HZ admin panel.")
    lines.append("")
    lines.append("**Summary:**")
    lines.append("")

    # Type-specific summary
    if review_type == "reactions":
        lines.append(f"- **YouTube:** [{item.get('title', 'Untitled')}]({item.get('youtube_url', '')})")
        lines.append(f"- **Channel:** {item.get('channel_name', 'Unknown')}")
        lines.append(f"- **Song:** {item.get('song_tag', 'Unspecified')}")
        if item.get("submitted_by"):
            lines.append(f"- **Submitted by:** fan {item.get('submitted_by', '')}")
        lines.append(f"- **Discovered:** {item.get('discovered_at', 'Unknown')}")
        lines.append("")
        lines.append(f"Review at: https://heteromorphiczoo.com/admin/reactions")
        lines.append("Action: Watch the reaction video. Approve if it's a genuine reaction, reject if spam/low-effort.")

    elif review_type == "offerings":
        lines.append(f"- **Category:** {item.get('category', 'Unknown')}")
        lines.append(f"- **Title:** {item.get('title', 'Untitled')}")
        if item.get("description"):
            lines.append(f"- **Description:** {item.get('description', '')[:200]}")
        if item.get("content_url"):
            lines.append(f"- **Content:** {item.get('content_url', '')}")
        lines.append(f"- **Content Type:** {item.get('content_type', 'Unknown')}")
        if item.get("fan_id"):
            lines.append(f"- **Fan ID:** {item.get('fan_id', '')}")
        lines.append(f"- **Submitted:** {item.get('submitted_at', 'Unknown')}")
        lines.append("")
        lines.append(f"Review at: https://heteromorphiczoo.com/admin/offerings")
        lines.append("Action: View the fan art/creative work. Approve if genuine, feature if gallery-worthy, reject if inappropriate.")

    elif review_type == "partner-applications":
        lines.append(f"- **Name:** {item.get('name', 'Unknown')}")
        lines.append(f"- **Craft:** {item.get('craft', '')}")
        lines.append(f"- **Portfolio:** {item.get('portfolio', '')}")
        if item.get("pitch"):
            lines.append(f"- **Pitch:** {item.get('pitch', '')[:300]}")
        lines.append(f"- **Email:** {item.get('email', '')}")
        lines.append(f"- **Submitted:** {item.get('submitted_at', 'Unknown')}")
        lines.append("")
        lines.append(f"Review at: https://heteromorphiczoo.com/admin (Partner Applications)")
        lines.append("Action: Evaluate the collaborator proposal. Approve if there's genuine alignment, reject if not.")

    elif review_type == "sanctuary":
        lines.append(f"- **Name:** {item.get('name', 'Anonymous')}")
        if item.get("email"):
            lines.append(f"- **Email:** {item.get('email', '')}")
        lines.append(f"- **Category:** {item.get('category', 'Unknown')}")
        if item.get("story"):
            lines.append(f"- **Story (first 200 chars):** {item.get('story', '')[:200]}...")
        lines.append(f"- **Submitted:** {item.get('submitted_at', 'Unknown')}")
        lines.append("")
        lines.append(f"Review at: https://heteromorphiczoo.com/admin/sanctuary")
        lines.append("Action: Read the AI impact story. Mark reviewed. No approval/rejection — this is confidential intake.")

    elif review_type == "reaction-claims":
        lines.append(f"- **Claimant Email:** {item.get('email', 'Unknown')}")
        lines.append(f"- **Fan ID:** {item.get('fan_id', 'Unknown')}")
        if item.get("reaction_id"):
            lines.append(f"- **Reaction ID:** {item.get('reaction_id', '')}")
        lines.append(f"- **Submitted:** {item.get('submitted_at', 'Unknown')}")
        lines.append("")
        lines.append(f"Review at: https://heteromorphiczoo.com/admin/claims")
        lines.append("Action: Verify the fan actually submitted/was featured in this reaction. Approve or reject.")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("**For Slimeko:** This needs Ray's attention. You cannot review HZ content directly.")
    lines.append("Create a Report for Ray (`greattomb report --type proposal`) if this is new,")
    lines.append("or batch multiple pending items into a single report.")
    lines.append("")
    lines.append(f"Item ID: {item.get('id', 'unknown')}")

    return "\n".join(lines) + "\n"


def main():
    execute = "--execute" in sys.argv

    items = get_pending_items(DB_PATH)

    if not items:
        print("No pending review items found in HZ database.")
        return

    # Group by type for readable output
    by_type: dict[str, list] = {}
    for item in items:
        rt = item["_review_type"]
        by_type.setdefault(rt, []).append(item)

    total = len(items)
    print(f"Found {total} pending review item(s):")
    for rt, group in sorted(by_type.items()):
        print(f"  {REVIEW_TYPES[rt]['label']}: {len(group)}")

    written = 0
    skipped = 0

    for item in items:
        # Save before build_inbox_content pops them
        review_type = item["_review_type"]
        label = item["_label"]
        item_id = item["id"]
        filename = f"from-hz-{review_type}-{item_id}.md"
        filepath = SLIMEKO_INBOX / filename

        if filepath.exists():
            print(f"  SKIP {filename} (already in inbox)")
            skipped += 1
            continue

        if execute:
            content = build_inbox_content(item)
            SLIMEKO_INBOX.mkdir(parents=True, exist_ok=True)
            filepath.write_text(content)
            print(f"  WROTE {filename}")
            written += 1
        else:
            print(f"  WOULD WRITE {filename}")
            if review_type == "reactions":
                print(f"    {item.get('title', 'Untitled')} by {item.get('channel_name', 'Unknown')}")
            elif review_type == "offerings":
                print(f"    [{item.get('category', '?')}] {item.get('title', 'Untitled')}")
            elif review_type == "partner-applications":
                print(f"    {item.get('name', 'Unknown')} — {item.get('craft', '?')}")
            elif review_type == "sanctuary":
                print(f"    {item.get('name', 'Anonymous')} — {item.get('category', '?')}")
            elif review_type == "reaction-claims":
                print(f"    {item.get('email', '?')} claiming reaction {item.get('reaction_id', '?')}")
            written += 1

    if not execute and written > 0:
        print(f"\nDry run: {written} file(s) would be written. Re-run with --execute to write.")
    elif execute:
        print(f"\n{written} written, {skipped} skipped (already in inbox).")


if __name__ == "__main__":
    main()
