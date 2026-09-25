#!/usr/bin/env bash
#
# Heteromorphic Zoo — generated-data refresh + deploy (central-heartbeat flow).
#
# Invoked by central-heartbeat via agents/infrastructure-schedule.yaml (or run
# manually for the first fire / recovery). Ruled 2026-09-21 (Ray): HZ deploys
# are an auto-flow surface like necro-game-news — the flow owns the push leg;
# never hand-push (docs/GIT_STRATEGY.md, Submodule Mirror Freshness).
#
# Steps:
#   1. Rebuild the static JSON from the live SQLite DB (aggregate.py)
#   2. Commit the refreshed data files (data-only pathspec, isolated)
#   3. Push the submodule — every commit on the branch deploys via Vercel
#
# Safe to re-run: no-op when nothing changed. Any earlier step failing aborts
# before the push (set -e); a failed push leaves the queue for the next tick.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

LOG_DIR="$PROJECT_ROOT/logs/heartbeat"
mkdir -p "$LOG_DIR"
exec >> "$LOG_DIR/deploy.out.log" 2>> "$LOG_DIR/deploy.err.log"

echo "=== $(date -Iseconds) HZ heartbeat deploy ==="

# --- 1. Refresh generated site JSON from the live database ---
python3 "$PROJECT_ROOT/gex44/scripts/aggregate.py"

# --- 2. Commit refreshed data files only (explicit pathspec — never -A, so
#        work staged by another session in this shared repo is never swept) ---
DATA_PATHS="public/data/census.json public/data/menagerie-roll.json public/data/offerings.json public/data/reactions.json public/data/altar.json"
if [ -n "$(git status --porcelain -- $DATA_PATHS)" ]; then
    git commit --only -m "chore(data): refresh generated site data $(date +%F)" -- $DATA_PATHS
    echo "Committed data refresh."
else
    echo "No data changes to commit."
fi

# --- 3. Push — the submodule push is the production deploy (Vercel) ---
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
    echo "WARN: on branch '$BRANCH' (expected main); skipping push."
    exit 1
fi

UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
if [ -z "$UPSTREAM" ]; then
    echo "WARN: no upstream configured; skipping push."
    exit 1
fi

AHEAD="$(git rev-list --count '@{u}..HEAD')"
if [ "$AHEAD" -eq 0 ]; then
    echo "Nothing ahead of upstream; no push needed."
else
    echo "Pushing $AHEAD commit(s) -> origin main (Vercel deploy)..."
    git push origin main
    echo "Pushed; HEAD now $(git rev-parse --short HEAD)."
fi

echo "=== Done ==="
