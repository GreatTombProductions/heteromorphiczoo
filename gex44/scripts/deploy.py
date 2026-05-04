# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: Deployment for HZ — backend (restart uvicorn) and/or frontend (push JSON to Vercel).
"""
deploy.py — HZ deployment tool.

Two deployment targets:
    backend  — Restart the uvicorn API server (picks up code changes already on disk)
    frontend — Commit and push aggregated JSON files to trigger Vercel auto-deploy

Usage:
    python3 scripts/deploy.py backend              # Restart API server
    python3 scripts/deploy.py frontend             # Push JSON data to Vercel
    python3 scripts/deploy.py all                  # Both
    python3 scripts/deploy.py frontend --dry-run   # Show what would be committed
"""

import argparse
import os
import signal
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent  # heteromorphiczoo/
_GEX44_DIR = _PROJECT_ROOT / "gex44"


# ---------------------------------------------------------------------------
# Backend: restart uvicorn
# ---------------------------------------------------------------------------

def _find_uvicorn_pid() -> int | None:
    """Find the PID of the running uvicorn process for this project."""
    try:
        result = subprocess.run(
            ["pgrep", "-f", "uvicorn gex44.api.main:app"],
            capture_output=True, text=True,
        )
        pids = result.stdout.strip().split("\n")
        pids = [p for p in pids if p]
        return int(pids[0]) if pids else None
    except (ValueError, FileNotFoundError):
        return None


def deploy_backend():
    """Restart the uvicorn API server to pick up code changes."""
    pid = _find_uvicorn_pid()

    if pid:
        print(f"  Stopping uvicorn (PID {pid})...")
        os.kill(pid, signal.SIGTERM)
        # Wait for process to exit
        for _ in range(30):
            try:
                os.kill(pid, 0)  # Check if still alive
                time.sleep(0.2)
            except OSError:
                break
        else:
            print(f"  [WARN] Process {pid} didn't exit cleanly, sending SIGKILL")
            os.kill(pid, signal.SIGKILL)
            time.sleep(0.5)
        print("  Stopped.")
    else:
        print("  No running uvicorn found.")

    # Start fresh
    env = os.environ.copy()
    # Preserve HZ_ env vars from the old process if possible
    print(f"  Starting uvicorn from {_PROJECT_ROOT}...")
    proc = subprocess.Popen(  # noqa: F841 — keeps subprocess ref alive
        [
            sys.executable, "-m", "uvicorn",
            "gex44.api.main:app",
            "--host", "0.0.0.0",
            "--port", "8081",
        ],
        cwd=str(_PROJECT_ROOT),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,  # Detach from this process
    )
    time.sleep(1.5)

    # Verify it started
    new_pid = _find_uvicorn_pid()
    if new_pid:
        print(f"  [OK] uvicorn running (PID {new_pid})")
    else:
        print("  [ERROR] uvicorn failed to start. Check logs.")
        sys.exit(1)


# ---------------------------------------------------------------------------
# Frontend: push JSON data to Vercel
# ---------------------------------------------------------------------------

def deploy_frontend(dry_run: bool = False):
    """Commit and push JSON data files to trigger Vercel deploy."""
    data_dir = _PROJECT_ROOT / "public" / "data"
    if not data_dir.exists():
        print(f"  [ERROR] Data directory not found: {data_dir}")
        print("  Run aggregate.py first to generate JSON files.")
        sys.exit(1)

    json_files = list(data_dir.glob("*.json"))
    if not json_files:
        print("  [WARN] No JSON files found in data directory. Nothing to deploy.")
        return

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if dry_run:
        print(f"  [DRY RUN] Would commit {len(json_files)} files from {data_dir}:")
        for f in sorted(json_files):
            print(f"    {f.name}")
        print(f"  [DRY RUN] Commit message: data: aggregation {now}")
        return

    # Stage JSON files
    for f in json_files:
        rel_path = f.relative_to(_PROJECT_ROOT)
        subprocess.run(
            ["git", "add", str(rel_path)],
            cwd=str(_PROJECT_ROOT),
            check=True,
        )

    # Check if there are actually changes to commit
    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=str(_PROJECT_ROOT),
    )
    if result.returncode == 0:
        print("  [INFO] No changes to commit. JSON files are up to date.")
        return

    # Commit
    commit_msg = f"data: aggregation {now}"
    subprocess.run(
        ["git", "commit", "-m", commit_msg],
        cwd=str(_PROJECT_ROOT),
        check=True,
    )

    # Push
    subprocess.run(
        ["git", "push"],
        cwd=str(_PROJECT_ROOT),
        check=True,
    )

    print(f"  [OK] Deployed {len(json_files)} JSON files. Vercel will auto-deploy.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Deploy HZ backend and/or frontend")
    parser.add_argument(
        "target",
        choices=["backend", "frontend", "all"],
        help="What to deploy: backend (restart API), frontend (push JSON), or all",
    )
    parser.add_argument("--dry-run", action="store_true", help="Show what would happen (frontend only)")
    args = parser.parse_args()

    if args.target in ("backend", "all"):
        print("[Backend]")
        deploy_backend()

    if args.target in ("frontend", "all"):
        print("[Frontend]")
        deploy_frontend(dry_run=args.dry_run)
