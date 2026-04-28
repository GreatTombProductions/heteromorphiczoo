#!/usr/bin/env bash
# deploy.sh — Full deployment: restart API, aggregate, commit & push everything.
#
# Usage:
#   ./gex44/scripts/deploy.sh              # Full deploy (backend + aggregate + push)
#   ./gex44/scripts/deploy.sh backend      # Just restart uvicorn
#   ./gex44/scripts/deploy.sh aggregate    # Just rebuild JSON
#   ./gex44/scripts/deploy.sh push         # Just commit & push to Vercel
#   ./gex44/scripts/deploy.sh --dry-run    # Show what would be pushed

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
GEX44_DIR="$PROJECT_ROOT/gex44"

cd "$PROJECT_ROOT"

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

step() { echo -e "\n${GREEN}[$1]${NC} $2"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- Backend: restart uvicorn ---
do_backend() {
    step "Backend" "Restarting uvicorn..."
    python3 "$GEX44_DIR/scripts/deploy.py" backend
}

# --- Aggregate: rebuild JSON ---
do_aggregate() {
    step "Aggregate" "Rebuilding static JSON..."
    python3 "$GEX44_DIR/scripts/aggregate.py"
}

# --- Push: commit and push everything ---
do_push() {
    local dry_run="${1:-}"

    step "Push" "Staging changes..."

    # Stage code changes (src/, gex44/, CLAUDE.md, etc.)
    local code_changes
    code_changes=$(git diff --name-only -- src/ gex44/ CLAUDE.md 2>/dev/null || true)
    if [[ -n "$code_changes" ]]; then
        echo "$code_changes" | while read -r f; do
            [[ -f "$f" ]] && git add "$f"
        done
    fi

    # Stage JSON data files
    if [[ -d "public/data" ]]; then
        git add public/data/*.json 2>/dev/null || true
    fi

    # Check if anything to commit
    if git diff --cached --quiet 2>/dev/null; then
        warn "Nothing to commit. Everything is up to date."
        return 0
    fi

    # Show what's staged
    echo ""
    git diff --cached --stat
    echo ""

    if [[ "$dry_run" == "--dry-run" ]]; then
        warn "Dry run — nothing committed or pushed."
        git reset HEAD -- . >/dev/null 2>&1
        return 0
    fi

    # Build commit message
    local msg="deploy: "
    local parts=()

    if git diff --cached --quiet -- src/ 2>/dev/null; then :; else
        parts+=("frontend")
    fi
    if git diff --cached --quiet -- gex44/ 2>/dev/null; then :; else
        parts+=("backend")
    fi
    if git diff --cached --quiet -- public/data/ 2>/dev/null; then :; else
        parts+=("data")
    fi
    if git diff --cached --quiet -- CLAUDE.md 2>/dev/null; then :; else
        parts+=("docs")
    fi

    if [[ ${#parts[@]} -eq 0 ]]; then
        msg="deploy: update"
    else
        msg="deploy: $(IFS='+'; echo "${parts[*]}")"
    fi

    git commit -m "$msg"
    git push

    step "Done" "Pushed to git. Vercel will auto-deploy."
}

# --- Main ---
TARGET="${1:-all}"

case "$TARGET" in
    backend)
        do_backend
        ;;
    aggregate)
        do_aggregate
        ;;
    push)
        do_push "${2:-}"
        ;;
    --dry-run)
        do_push --dry-run
        ;;
    all)
        do_backend
        do_aggregate
        do_push "${2:-}"
        ;;
    *)
        echo "Usage: $0 [all|backend|aggregate|push|--dry-run]"
        exit 1
        ;;
esac
