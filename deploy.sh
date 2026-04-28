#!/bin/bash
# deploy.sh — Detect what changed and deploy accordingly.
#
# Runs from the heteromorphiczoo project root. Detects:
#   - Backend (gex44/) changes  → restart uvicorn
#   - Aggregation-relevant changes → rebuild static JSON
#   - Any changes at all → commit + push submodule to trigger Vercel
#
# Usage:
#   ./deploy.sh              # Auto-detect and deploy everything needed
#   ./deploy.sh --dry-run    # Show what would happen without doing it
#   ./deploy.sh --force      # Run all steps regardless of change detection
#
# On first run (not yet a submodule): converts to submodule + pushes.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
GEX44_DIR="$PROJECT_DIR/gex44"
GREATTOMB_ROOT="$(cd "$PROJECT_DIR/../../.." && pwd)"
GITHUB_ORG="GreatTombProductions"
REPO_NAME="heteromorphiczoo"
REL_PATH="0th-floor-exterior/central-mausoleum/heteromorphiczoo"
REMOTE_URL="git@github.com:$GITHUB_ORG/$REPO_NAME.git"

# --- Flags ---
DRY_RUN=false
FORCE=false
for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=true ;;
        --force)   FORCE=true ;;
    esac
done

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

step()  { echo -e "\n${GREEN}[$1]${NC} $2"; }
info()  { echo -e "  ${DIM}$1${NC}"; }
warn()  { echo -e "  ${YELLOW}$1${NC}"; }
check() { echo -e "  ${CYAN}✓${NC} $1"; }

# --- Detect submodule state ---
IS_SUBMODULE=false
if [ -f "$PROJECT_DIR/.git" ] && grep -q "gitdir:" "$PROJECT_DIR/.git" 2>/dev/null; then
    IS_SUBMODULE=true
fi

if ! $IS_SUBMODULE; then
    echo "=== First-time setup required ==="
    echo "This project is not yet a git submodule."
    echo "Run the first-time setup flow (see gex44/scripts/deploy.py or git history)."
    exit 1
fi

cd "$PROJECT_DIR"

echo "=== Heteromorphic Zoo Deploy ==="

# ─── Detect what changed ───
step "Detect" "Scanning for changes..."

BACKEND_CHANGED=false
FRONTEND_CHANGED=false
AGGREGATE_NEEDED=false
DATA_CHANGED=false

# Uncommitted changes (staged + unstaged) relative to HEAD
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || true)
STAGED_FILES=$(git diff --name-only --cached 2>/dev/null || true)
UNTRACKED_FILES=$(git ls-files --others --exclude-standard 2>/dev/null || true)
ALL_CHANGES=$(echo -e "$CHANGED_FILES\n$STAGED_FILES\n$UNTRACKED_FILES" | sort -u | grep -v '^$' || true)

if [ -z "$ALL_CHANGES" ] && ! $FORCE; then
    echo ""
    echo "=== No changes detected. Site is up to date. ==="
    exit 0
fi

# Classify changes
while IFS= read -r file; do
    case "$file" in
        gex44/api/* | gex44/scripts/aggregate.py | gex44/scripts/init_db.py)
            BACKEND_CHANGED=true
            # API or aggregation code changed — re-aggregate to be safe
            AGGREGATE_NEEDED=true
            ;;
        gex44/scripts/migrate_*)
            BACKEND_CHANGED=true
            ;;
        gex44/*)
            BACKEND_CHANGED=true
            ;;
        src/* | public/* | next.config* | package* | tsconfig* | CLAUDE.md)
            FRONTEND_CHANGED=true
            ;;
        public/data/*)
            DATA_CHANGED=true
            ;;
    esac
done <<< "$ALL_CHANGES"

if $FORCE; then
    BACKEND_CHANGED=true
    AGGREGATE_NEEDED=true
    FRONTEND_CHANGED=true
fi

# Report detection results
if $BACKEND_CHANGED; then check "Backend changes detected (gex44/)"; fi
if $AGGREGATE_NEEDED; then check "Aggregation needed"; fi
if $FRONTEND_CHANGED; then check "Frontend changes detected (src/, public/)"; fi
if $DATA_CHANGED; then check "Data files changed (public/data/)"; fi
if ! $BACKEND_CHANGED && ! $FRONTEND_CHANGED && ! $DATA_CHANGED; then
    check "Other files changed"
fi

# ─── Backend: restart uvicorn ───
if $BACKEND_CHANGED; then
    step "Backend" "Restarting uvicorn..."
    if $DRY_RUN; then
        info "Would restart uvicorn via deploy.py backend"
    else
        python3 "$GEX44_DIR/scripts/deploy.py" backend
    fi
fi

# ─── Aggregate: rebuild JSON ───
if $AGGREGATE_NEEDED; then
    step "Aggregate" "Rebuilding static JSON..."
    if $DRY_RUN; then
        info "Would run aggregate.py"
    else
        python3 "$GEX44_DIR/scripts/aggregate.py"
    fi
fi

# ─── Build check ───
step "Build" "Verifying Next.js build..."
if $DRY_RUN; then
    info "Would verify build"
else
    if ! npx --yes next build > /dev/null 2>&1; then
        echo ""
        echo "  Build FAILED. Fix errors before deploying:"
        npx next build 2>&1 | tail -20
        exit 1
    fi
    check "Build passed"
fi

# ─── Ensure data fixtures ───
DATA_DIR="$PROJECT_DIR/public/data"
mkdir -p "$DATA_DIR"

declare -A FIXTURES=(
    ["census.json"]='{"total_members":0,"by_rank":[],"total_offerings":0,"total_reactions":0,"founding_members":0,"generated_at":"pre-launch"}'
    ["menagerie-roll.json"]='{"roll":[],"generated_at":"pre-launch"}'
    ["offerings.json"]='{"offerings":[],"featured":[],"by_category":{},"total":0,"generated_at":"pre-launch"}'
    ["altar.json"]='{"featured":[],"recent":[],"generated_at":"pre-launch"}'
    ["reactions.json"]='{"reactions":[],"by_song":{},"total":0,"generated_at":"pre-launch"}'
    ["rites.json"]='{"active":[],"upcoming":[],"closed":[],"generated_at":"pre-launch"}'
)

for file in "${!FIXTURES[@]}"; do
    if [ ! -f "$DATA_DIR/$file" ]; then
        if ! $DRY_RUN; then
            echo "${FIXTURES[$file]}" > "$DATA_DIR/$file"
        fi
        info "Created fixture: $file"
    fi
done

# ─── Push: commit and push ───
step "Push" "Staging changes..."

if $DRY_RUN; then
    info "Would stage all changes and push. Changed files:"
    echo "$ALL_CHANGES" | sed 's/^/    /'
    echo ""
    echo "=== Dry run complete. No changes made. ==="
    exit 0
fi

git add -A

if git diff --cached --quiet; then
    warn "Nothing to commit after staging."
    echo ""
    echo "=== Deploy complete (backend/aggregate only, no push needed). ==="
    exit 0
fi

# Build commit message from what changed
PARTS=()
if $BACKEND_CHANGED; then PARTS+=("backend"); fi
if $FRONTEND_CHANGED; then PARTS+=("frontend"); fi
if $DATA_CHANGED || $AGGREGATE_NEEDED; then PARTS+=("data"); fi
if [ ${#PARTS[@]} -eq 0 ]; then PARTS+=("update"); fi
MSG="deploy: $(IFS='+'; echo "${PARTS[*]}")"

echo ""
git diff --cached --stat
echo ""

git commit -m "$MSG"
git push origin main

# Update submodule pointer in greattomb
cd "$GREATTOMB_ROOT"
git add "$REL_PATH"
git commit -m "submodule: update heteromorphiczoo" 2>/dev/null || true

echo ""
echo "=== Deploy complete ==="
SUMMARY=()
if $BACKEND_CHANGED; then SUMMARY+=("uvicorn restarted"); fi
if $AGGREGATE_NEEDED; then SUMMARY+=("JSON re-aggregated"); fi
SUMMARY+=("pushed to Vercel")
echo "  $(IFS=', '; echo "${SUMMARY[*]}")"
