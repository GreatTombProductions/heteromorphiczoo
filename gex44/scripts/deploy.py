# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: Push aggregated JSON to Vercel via git commit + push.
# Option A from data-pipeline-spec.md Section 4 — simplest for launch.
"""
deploy.py — Push aggregated JSON files to Vercel.

Commits JSON files in the Next.js project's public/data/ directory
and pushes to trigger Vercel auto-deploy.

Usage:
    python3 scripts/deploy.py                         # Default paths
    python3 scripts/deploy.py --repo /path/to/nextjs  # Override repo path
    python3 scripts/deploy.py --dry-run               # Show what would be committed
"""

import argparse
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def deploy(repo_path: Path | None = None, dry_run: bool = False):
    """Commit and push JSON data files to trigger Vercel deploy."""
    # Default: the heteromorphiczoo Next.js project root
    if repo_path is None:
        repo_path = Path(__file__).resolve().parent.parent.parent
        # This assumes gex44/ is inside the Next.js project directory

    data_dir = repo_path / "public" / "data"
    if not data_dir.exists():
        print(f"[ERROR] Data directory not found: {data_dir}")
        print("Run aggregate.py first to generate JSON files.")
        sys.exit(1)

    json_files = list(data_dir.glob("*.json"))
    if not json_files:
        print("[WARN] No JSON files found in data directory. Nothing to deploy.")
        return

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if dry_run:
        print(f"[DRY RUN] Would commit {len(json_files)} files from {data_dir}:")
        for f in sorted(json_files):
            print(f"  {f.name}")
        print(f"[DRY RUN] Commit message: data: aggregation {now}")
        return

    # Stage JSON files
    for f in json_files:
        rel_path = f.relative_to(repo_path)
        subprocess.run(
            ["git", "add", str(rel_path)],
            cwd=str(repo_path),
            check=True,
        )

    # Check if there are actually changes to commit
    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=str(repo_path),
    )
    if result.returncode == 0:
        print("[INFO] No changes to commit. JSON files are up to date.")
        return

    # Commit
    commit_msg = f"data: aggregation {now}"
    subprocess.run(
        ["git", "commit", "-m", commit_msg],
        cwd=str(repo_path),
        check=True,
    )

    # Push
    subprocess.run(
        ["git", "push"],
        cwd=str(repo_path),
        check=True,
    )

    print(f"[OK] Deployed {len(json_files)} JSON files. Vercel will auto-deploy.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deploy HZ data to Vercel")
    parser.add_argument("--repo", type=str, help="Path to Next.js project root")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be committed")
    args = parser.parse_args()

    deploy(
        repo_path=Path(args.repo) if args.repo else None,
        dry_run=args.dry_run,
    )
