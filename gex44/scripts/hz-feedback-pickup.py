#!/usr/bin/env python3
"""
HZ Feedback Pickup — Bridge from Heteromorphic Zoo fan database to agent ecosystem.

Queries the fan_db.sqlite for items needing admin review (pending reactions,
offerings, partner applications, unreviewed sanctuary submissions, reaction
claims), writes report-framed inbox files to agents/slimeko/workspace/inbox/.

These are REVIEW items for Ray's attention — Slimeko can review partner applications
(admin panel now exists at /admin/partner-applications) but cannot review visual content
(offerings) or other content-sensitive items. The inbox files surface what needs Ray's eyes;
Slimeko creates Reports or acts directly where authorized.

Idempotent: uses review-item UUID as filename, skips if file exists.
Does NOT modify the source database (HZ admin panel is the review surface).

Partner-application spam auto-rejection
---------------------------------------
A stationary bot signature hits the partner application form ~1/day. Items whose
five user-entered fields ALL match the validated signature (see
classify_partner_application) are auto-rejected via the admin API at pickup
time, before they reach Slimeko's inbox:

  - dry-run: prints `WOULD AUTO-REJECT ...`. No network calls, no writes.
  - --execute: POSTs a rejection to the admin API. On success, the standard
    inbox content (with one prepended audit line) is written to
    agents/slimeko/workspace/inbox/.processed/ as the audit record and no inbox
    file is written — the item is gone, nothing needs Slimeko's attention.
    On failure (network error, non-200, wrong body, or missing API key) the
    script falls back to writing the NORMAL inbox file so Slimeko can reject
    manually, and prints WARN to stderr. The .processed/ audit copy is NOT
    written on failure — doing so would make the idempotent skip logic silently
    suppress the fallback on the next run.

The guard REJECTS only. There is no auto-approval path, ever. Anything that
fails any predicate — including items that merely look spammy — is treated as
human and follows the normal inbox path unchanged. Default is inbox;
auto-reject is the narrow exception.

API key: HZ_ADMIN_API_KEY from 0th-floor-exterior/central-mausoleum/
heteromorphiczoo/.env (ONE LEVEL ABOVE gex44/ — not the gex44-local .env),
parsed by hand. Base URL: HZ_API_BASE_URL env override, default
https://hz-api.greattombproductions.com (the override exists so the API path
can be exercised hermetically against a local mock).

Usage:
  python3 gex44/scripts/hz-feedback-pickup.py               # dry-run
  python3 gex44/scripts/hz-feedback-pickup.py --execute      # write inbox files
  python3 gex44/scripts/hz-feedback-pickup.py --self-test    # hermetic classifier
                                                             # fixture check

No external dependencies — stdlib only (sqlite3, urllib.request, json).
"""

import json
import os
import re
import sqlite3
import sys
import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]  # heteromorphiczoo/
GREATTOMB_ROOT = Path(__file__).resolve().parents[5]  # greattomb/
SLIMEKO_INBOX = GREATTOMB_ROOT / "agents" / "slimeko" / "workspace" / "inbox"
DB_PATH = PROJECT_ROOT / "gex44" / "data" / "fan_db.sqlite"
ENV_PATH = PROJECT_ROOT / ".env"  # ONE level above gex44/ — NOT gex44/.env

DEFAULT_API_BASE_URL = "https://hz-api.greattombproductions.com"
REJECT_TIMEOUT_SECONDS = 10


def api_base_url() -> str:
    """API base URL, overridable via HZ_API_BASE_URL (read per call so a test
    harness can point it at a local mock after import)."""
    return os.environ.get("HZ_API_BASE_URL") or DEFAULT_API_BASE_URL


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
        lines.append(f"Review at: https://heteromorphiczoo.com/admin/partner-applications")

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
    if review_type == "partner-applications":
        lines.append("**For Slimeko:** Partner applications are reviewable directly — Slimeko can reject")
        lines.append("clear spam (scrambled fields + synthetic Gmail signature) via the admin API, or")
        lines.append("surface ambiguous applications to Ray for judgment.")
    else:
        lines.append("**For Slimeko:** This needs Ray's attention. You cannot review this content type directly.")
        lines.append("Create a Report for Ray (`greattomb report --type proposal`) if this is new,")
        lines.append("or batch multiple pending items into a single report.")
    lines.append("")
    lines.append(f"Item ID: {item.get('id', 'unknown')}")

    return "\n".join(lines) + "\n"



# ---------------------------------------------------------------------------
# Partner-application spam signature (write-time guard)
#
# A stationary bot submits ~1 partner application/day with a fixed shape.
# Spam is declared ONLY when all five user-entered fields match below; any
# predicate failure means "human" and the normal inbox path is taken. There is
# no score and no partial match - when in doubt, inbox.
# ---------------------------------------------------------------------------

SCRAMBLED_RE = re.compile(r"^[A-Za-z]{12,30}$")
PORTFOLIO_URL_RE = re.compile(r"^https?://[a-z]{5,15}\.com/?$")
EMAIL_RE = re.compile(r"^[a-z0-9.]+@gmail\.com$")

SPAM_REASON = "bot signature: scrambled name/craft/pitch + throwaway-or-scrambled portfolio + segmented gmail"
AUTO_REJECT_AUDIT_LINE = "AUTO-REJECTED at pickup by signature guard — no Slimeko action needed."
AUTO_REJECT_NOTES = "auto-rejected at pickup by signature guard"


def _case_transitions(s: str) -> int:
    """Count adjacent character pairs whose letter case differs."""
    return sum(1 for a, b in zip(s, s[1:]) if a.isupper() != b.isupper())


def _is_scrambled(value) -> bool:
    """True for bot-generated case-scrambled tokens: 12-30 ASCII letters,
    mixed case, at least 4 case transitions."""
    if not isinstance(value, str) or not SCRAMBLED_RE.fullmatch(value):
        return False
    if value.isupper() or value.islower():
        return False  # all-same-case is not the bot
    return _case_transitions(value) >= 4


def _is_spam_portfolio(value) -> bool:
    """Portfolio is either a lowercase throwaway domain of 5-15 letters (later
    era of the bot) or a scrambled token (early era, stored pre-URL)."""
    if not isinstance(value, str):
        return False
    return bool(PORTFOLIO_URL_RE.fullmatch(value)) or _is_scrambled(value)


def _is_spam_email(value) -> bool:
    """Lowercase gmail address with >=5 dot-separated local-part segments of
    1-7 chars each and a local part of >=10 chars total."""
    if not isinstance(value, str) or not EMAIL_RE.fullmatch(value):
        return False
    if value != value.lower():
        return False
    local = value.split("@", 1)[0]
    segments = local.split(".")
    if len(segments) < 5:
        return False
    if any(not 1 <= len(seg) <= 7 for seg in segments):
        return False
    return len(local) >= 10


def classify_partner_application(item: dict) -> str:
    """Pure classifier: "spam" only if ALL five user-entered fields match the
    validated bot signature, else "human". No I/O."""
    for field in ("name", "craft", "pitch"):
        if not _is_scrambled(item.get(field)):
            return "human"
    if not _is_spam_portfolio(item.get("portfolio")):
        return "human"
    if not _is_spam_email(item.get("email")):
        return "human"
    return "spam"


# ---------------------------------------------------------------------------
# Admin API rejection (the only review surface - the DB is never written)
# ---------------------------------------------------------------------------


def load_admin_api_key(env_path: Path = ENV_PATH) -> "str | None":
    """Resolve the HZ admin API key: HZ_ADMIN_API_KEY from the environment if
    set, else hand-parsed from env_path (KEY=value lines, surrounding quotes
    stripped). env_path is heteromorphiczoo/.env - ONE LEVEL ABOVE gex44/, not
    the gex44-local .env."""
    env_key = os.environ.get("HZ_ADMIN_API_KEY")
    if env_key:
        return env_key
    try:
        text = env_path.read_text(encoding="utf-8")
    except OSError:
        return None
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        if key.strip() == "HZ_ADMIN_API_KEY":
            return val.strip().strip('"').strip("'")
    return None


def reject_partner_application(item_id: str, base_url: str, api_key: str) -> bool:
    """POST a rejection for item_id. True only on HTTP 200 with a JSON body of
    {"status": "rejected"}; every failure mode (network error, non-200,
    unparseable body, wrong status) returns False."""
    url = f"{base_url.rstrip('/')}/api/hz/admin/partner-applications/{item_id}/review"
    payload = json.dumps({"action": "reject", "notes": AUTO_REJECT_NOTES}).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=REJECT_TIMEOUT_SECONDS) as response:
            if response.status != 200:
                return False
            body = json.loads(response.read().decode("utf-8"))
    except Exception:
        return False
    return isinstance(body, dict) and body.get("status") == "rejected"


# ---------------------------------------------------------------------------
# Factored spam-path handler
# ---------------------------------------------------------------------------


def inbox_filename(item: dict) -> str:
    """Single source of truth for the pickup filename - the inbox file, its
    .processed/ audit copy, and the skip logic must all agree on this."""
    return f"from-hz-{item['_review_type']}-{item['id']}.md"


def handle_spam_candidate(
    item: dict,
    execute: bool,
    *,
    inbox_dir: "Path | None" = None,
    api_key: "str | None" = None,
    base_url: "str | None" = None,
) -> str:
    """Handle a partner application that matched the spam signature.

    Returns an outcome token:
      "would-reject"    dry-run: printed intent only - no network, no writes
      "rejected"        API rejected the item; audit record written to
                        inbox_dir/.processed/ and NO inbox file written
      "fallback-inbox"  rejection failed (missing key or API failure); the
                        NORMAL inbox file was written so Slimeko can reject it
                        manually, and no .processed/ copy was written (the skip
                        logic would otherwise suppress the fallback next run)

    inbox_dir / api_key / base_url are hermetic-test seams: they re-point the
    write target and bypass .env key resolution / production URL respectively.
    inbox_dir defaults to SLIMEKO_INBOX resolved at call time (not def time),
    so a harness re-pointing that global stays consistent with main()'s write.
    """
    if inbox_dir is None:
        inbox_dir = SLIMEKO_INBOX
    filename = inbox_filename(item)

    if not execute:
        print(f"  WOULD AUTO-REJECT {filename} ({SPAM_REASON})")
        return "would-reject"

    def _fallback(warn: str) -> str:
        print(f"WARN: {filename} {warn}; falling back to inbox", file=sys.stderr)
        content = build_inbox_content(item)
        inbox_dir.mkdir(parents=True, exist_ok=True)
        (inbox_dir / filename).write_text(content)
        print(f"  WROTE {filename} (spam auto-reject fallback)")
        return "fallback-inbox"

    key = api_key or load_admin_api_key()
    if not key:
        return _fallback("auto-reject failed (no HZ_ADMIN_API_KEY available)")

    if not reject_partner_application(item["id"], base_url or api_base_url(), key):
        return _fallback("auto-reject failed")

    content = AUTO_REJECT_AUDIT_LINE + "\n" + build_inbox_content(item)
    audit_dir = inbox_dir / ".processed"
    audit_dir.mkdir(parents=True, exist_ok=True)
    (audit_dir / filename).write_text(content)
    print(f"  AUTO-REJECTED {filename}")
    return "rejected"


# ---------------------------------------------------------------------------
# Hermetic self-test fixtures - embedded VERBATIM from the validated spec
# (13 historical spam instances + 5 human-shaped counterexamples). Literals
# only: the self-test must not touch network, files, or DB.
# ---------------------------------------------------------------------------

SPAM_FIXTURES = [
    {"name": 'wWLaKQxAeRxEwyoYs', "craft": 'EHOecbMVBddHHiNj', "portfolio": 'SSgXrEhpcUSyGqNz', "pitch": 'PXfMOhMpdfoJkfKuPMGwx', "email": 'k.u.b.ixa.qa9.80@gmail.com'},
    {"name": 'gqfkxIftBkgOLYTbv', "craft": 'fnhhBpyNMkoxXijDJVoZPS', "portfolio": 'zWRyoVOBIUIuKPWdBGldHUC', "pitch": 'kZAhXCMcECwLnYzULeqCzX', "email": 'aha.ji.pa.b.i.w.81.1@gmail.com'},
    {"name": 'nSCcZapbKyzdvlvYuhtoEOl', "craft": 'xIlxKGUXzSBjUcRMxqwviqiz', "portfolio": 'https://iaqsvrocc.com', "pitch": 'gyONdHBARzBZSjdhoG', "email": 'ele.jem.a.y.ep.i.21@gmail.com'},
    {"name": 'zjKwZVeejpJavVSPWFnEMvy', "craft": 'eeGAKpMIJOpiPmIapagzVX', "portfolio": 'https://eizgzrauhp.com', "pitch": 'oApEUbfPDGSqAPJGx', "email": 'c.um.miev.er.4.7.89@gmail.com'},
    {"name": 'goHDDXgooGwmflhv', "craft": 'VEcNVvgksnMdoesVVNAszD', "portfolio": 'https://bxhoqv.com', "pitch": 'VYgFaxPAzvKcgjQzcChH', "email": 'a.v.a.p.ubu.mi151@gmail.com'},
    {"name": 'pwwQjruoCkFDEGNFu', "craft": 'yreUTZhffHiDthyzv', "portfolio": 'https://oyftugffecfz.com', "pitch": 'ObBwPuLOUvUqWgRGIvTHOO', "email": 'e.le.a.no.rbl.ackwe.l.l661.9@gmail.com'},
    {"name": 'XsCPVkNyIUuysvHVNexQqI', "craft": 'JOkiFDKvwlLFhSMkr', "portfolio": 'https://eidfeeuiq.com', "pitch": 'HLIjsteEoizDvGdFRwLfA', "email": 'u.z.o.si.f.e.so60@gmail.com'},
    {"name": 'xqyfFfUCAWXlbBPyej', "craft": 'glYXeLXhcycSayIwDT', "portfolio": 'https://hruorqgr.com', "pitch": 'IByUKKalXBcYYbSViFCX', "email": 'e.r.oz.oci.vo4.3.9@gmail.com'},
    {"name": 'AcVQHKQbhtiaJfXcH', "craft": 'veOfzTMzHzMnpMiGgV', "portfolio": 'https://rfqkcijacij.com', "pitch": 'DcICXQnbQBwakZGXev', "email": 'e.s.p.arz.am.ilize.n.ts@gmail.com'},
    {"name": 'drFndToEONhPKjqygzKrjy', "craft": 'sHXbPqbMEBHAukVBimvS', "portfolio": 'https://flpdeu.com', "pitch": 'uHsyumqXmeXPgUMHXckayA', "email": 'd.if.i.q.u.fito1.4@gmail.com'},
    {"name": 'VVppdZdoyUCwuuIjHfm', "craft": 'KAUewSUitwNambcFovKhUp', "portfolio": 'https://xgrcsxmtg.com', "pitch": 'ONOdibtceNYiasgUty', "email": 'e.nixe.j.o.r.e.7.9@gmail.com'},
    {"name": 'bUtSzNzQJiXPCzotgw', "craft": 'FVPkLayMiCnnYGJX', "portfolio": 'https://vcydhtnh.com', "pitch": 'zcPPZotCarriOSOCT', "email": 'xuw.edu.m.4.3.1@gmail.com'},
    {"name": 'XyeNgeXvUiQvRzkGWW', "craft": 'ePcXVaDvnDboXqeTw', "portfolio": 'https://lqrxjx.com', "pitch": 'DKmCSZPwtDCfLrxNBQ', "email": 'al.ok.e.dudob.a58.8@gmail.com'},
]

HUMAN_FIXTURES = [
    {"name": 'Jane Doe', "craft": 'Mixing engineer', "portfolio": 'https://janedoeaudio.com', "pitch": 'I would love to collaborate on stem mixing for your release', "email": 'jane.doe@gmail.com'},
    {"name": 'BjornHalvorsen', "craft": 'Illustrator', "portfolio": 'https://bjornhalvorsen.com', "pitch": 'Dark fantasy illustration portfolio on request', "email": 'b.halvorsen@gmail.com'},
    {"name": 'Jane Doe', "craft": 'Producer', "portfolio": 'https://janedoe.com', "pitch": "Let's collaborate on the next record", "email": 'jane.doe.work.2024@gmail.com'},
    {"name": 'JOHNSMITH', "craft": 'DRUMMER', "portfolio": 'https://johnsmithdrums.com', "pitch": 'AVAILABLE FOR TOURING', "email": 'john.smith@gmail.com'},
    {"name": 'Jane Doe', "craft": 'Producer', "portfolio": 'https://janedoe.com', "pitch": "Let's collaborate", "email": 'jane.doe.smith.work.2024@gmail.com'},
]

def run_self_test() -> int:
    """Run the classifier against the embedded fixtures. No network, no file
    writes, no DB access. Returns a process exit code."""
    cases = ([("spam", f) for f in SPAM_FIXTURES] + [("human", f) for f in HUMAN_FIXTURES])
    failures = 0
    print(f"hz-feedback-pickup self-test: {len(SPAM_FIXTURES)} spam + {len(HUMAN_FIXTURES)} human fixtures")
    for index, (expected, fixture) in enumerate(cases, start=1):
        got = classify_partner_application(fixture)
        ok = got == expected
        failures += 0 if ok else 1
        print(f"  {'PASS' if ok else 'FAIL'} case {index:02d}/{len(cases)} expected={expected} got={got} - {fixture['name']} <{fixture['email']}>")
    spam_ok = sum(1 for e, f in cases if e == "spam" and classify_partner_application(f) == "spam")
    human_ok = sum(1 for e, f in cases if e == "human" and classify_partner_application(f) == "human")
    print(f"\n{spam_ok}/{len(SPAM_FIXTURES)} spam fixtures passed, {human_ok}/{len(HUMAN_FIXTURES)} human fixtures passed.")
    if failures:
        print("SELF-TEST FAILED - classifier drifted from the validated signature.", file=sys.stderr)
    return 1 if failures else 0

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
    auto_rejected = 0
    would_reject = 0

    for item in items:
        # Save before build_inbox_content pops them
        review_type = item["_review_type"]
        label = item["_label"]
        item_id = item["id"]
        filename = inbox_filename(item)
        filepath = SLIMEKO_INBOX / filename

        processed_path = SLIMEKO_INBOX / ".processed" / filename
        if filepath.exists() or processed_path.exists():
            reason = "inbox" if filepath.exists() else "processed"
            print(f"  SKIP {filename} (already in {reason})")
            skipped += 1
            continue

        # Write-time spam guard: partner applications whose five user-entered
        # fields all match the validated bot signature are rejected via the
        # admin API here, before anything reaches the inbox. Anything else
        # falls through to the normal, unchanged path below.
        if review_type == "partner-applications" and classify_partner_application(item) == "spam":
            outcome = handle_spam_candidate(item, execute)
            if outcome == "rejected":
                auto_rejected += 1
                continue  # audit record only; no inbox file, nothing to review
            if outcome == "fallback-inbox":
                written += 1  # normal inbox file written by the handler
                continue
            would_reject += 1  # dry-run "would-reject"
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

    if not execute:
        if written > 0:
            print(f"\nDry run: {written} file(s) would be written. Re-run with --execute to write.")
        if would_reject > 0:
            print(f"Dry run: {would_reject} partner application(s) would be auto-rejected as spam.")
    else:
        summary = f"\n{written} written, {skipped} skipped (already in inbox)."
        if auto_rejected:
            summary += f" {auto_rejected} auto-rejected as spam (audit record in inbox/.processed/)."
        print(summary)


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        sys.exit(run_self_test())
    main()
