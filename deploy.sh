#!/bin/bash
# Deploy heteromorphiczoo.com to Vercel via GitHub
#
# Creates a GitHub repo under GreatTombProductions, converts the project
# directory into a git submodule in greattomb, and pushes. Vercel auto-deploys
# once connected to the repo (set up in Vercel dashboard after first run).
#
# First run: creates the repo, initializes submodule, pushes.
# Subsequent runs: commits and pushes current state.
#
# Requires: gh (GitHub CLI), authenticated with repo creation permissions.
#   gh auth login
#
# After first run: connect the repo in Vercel dashboard → Import Project.
# Vercel auto-detects Next.js. No vercel.json needed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
GREATTOMB_ROOT="$(cd "$PROJECT_DIR/../../.." && pwd)"
GITHUB_ORG="GreatTombProductions"
REPO_NAME="heteromorphiczoo"
REL_PATH="0th-floor-exterior/central-mausoleum/heteromorphiczoo"
REMOTE_URL="git@github.com:$GITHUB_ORG/$REPO_NAME.git"

echo "=== Heteromorphic Zoo Deploy ==="

# ─── Verify build works ───
echo ""
echo "[1/5] Verifying build..."
cd "$PROJECT_DIR"
if ! npx --yes next build > /dev/null 2>&1; then
    echo "ERROR: Next.js build failed. Fix build errors before deploying."
    npx next build 2>&1 | tail -20
    exit 1
fi
echo "  Build: OK"

# ─── Generate empty JSON fixtures if missing ───
echo ""
echo "[2/5] Ensuring data fixtures exist..."
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

CREATED=0
for file in "${!FIXTURES[@]}"; do
    if [ ! -f "$DATA_DIR/$file" ]; then
        echo "${FIXTURES[$file]}" > "$DATA_DIR/$file"
        echo "  Created: $file"
        CREATED=$((CREATED + 1))
    fi
done
if [ "$CREATED" -eq 0 ]; then
    echo "  All fixtures present"
else
    echo "  Created $CREATED fixture(s)"
fi

# ─── Detect current state ───
echo ""
echo "[3/5] Checking repo state..."

IS_SUBMODULE=false
if [ -f "$PROJECT_DIR/.git" ] && grep -q "gitdir:" "$PROJECT_DIR/.git" 2>/dev/null; then
    IS_SUBMODULE=true
fi

# ─── Subsequent run: commit and push ───
if $IS_SUBMODULE; then
    echo "  Already a submodule. Pushing update."
    cd "$PROJECT_DIR"

    echo ""
    echo "[4/5] Staging changes..."
    git add -A

    if git diff --cached --quiet; then
        echo "  No changes to deploy."
        echo ""
        echo "=== Nothing to deploy. Site is up to date. ==="
        exit 0
    fi

    echo ""
    echo "[5/5] Committing and pushing..."
    git commit -m "deploy: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    git push origin main

    # Update submodule pointer in greattomb
    cd "$GREATTOMB_ROOT"
    git add "$REL_PATH"
    git commit -m "submodule: update heteromorphiczoo" || true

    echo ""
    echo "=== Update pushed. Vercel will auto-deploy. ==="
    exit 0
fi

# ─── First run: create repo and convert to submodule ───
echo "  First deploy — creating repo and converting to submodule."
echo ""
echo "  This will:"
echo "    1. Remove the project from greattomb's git index"
echo "    2. Initialize it as a standalone repo"
echo "    3. Create $GITHUB_ORG/$REPO_NAME on GitHub"
echo "    4. Push to GitHub"
echo "    5. Re-add as a git submodule in greattomb"
echo ""
read -p "  Proceed? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Step 1: Remove from greattomb's index (keeps files on disk)
echo ""
echo "[4/5] Setting up standalone repo..."
cd "$GREATTOMB_ROOT"
git rm -r --cached "$REL_PATH" > /dev/null 2>&1 || true

# Step 2: Initialize standalone git repo
cd "$PROJECT_DIR"
git init
git branch -M main
git add -A
git commit -m "initial: heteromorphiczoo.com — the menagerie's cathedral"

# Step 3: Create GitHub repo if it doesn't exist
echo ""
echo "[5/5] Creating GitHub repo and pushing..."
if ! gh repo view "$GITHUB_ORG/$REPO_NAME" &>/dev/null; then
    gh repo create "$GITHUB_ORG/$REPO_NAME" \
        --private \
        --description "heteromorphiczoo.com — the menagerie's cathedral"
    echo "  Created: $GITHUB_ORG/$REPO_NAME (private)"
else
    echo "  Repo already exists: $GITHUB_ORG/$REPO_NAME"
fi

# Step 4: Push
git remote add origin "$REMOTE_URL"
git push -u origin main --force

# Step 5: Convert to submodule
# git submodule add needs to clone into the path, so move it aside.
# Everything is on GitHub at this point, so the clone will have all files.
TEMP_BACKUP="/tmp/heteromorphiczoo-backup-$$"
mv "$PROJECT_DIR" "$TEMP_BACKUP"

cd "$GREATTOMB_ROOT"
git submodule add "$REMOTE_URL" "$REL_PATH"
git add .gitmodules "$REL_PATH"
git commit -m "submodule: add heteromorphiczoo ($GITHUB_ORG/$REPO_NAME)"

# Restore node_modules from backup (avoid reinstall)
if [ -d "$TEMP_BACKUP/node_modules" ]; then
    cp -r "$TEMP_BACKUP/node_modules" "$PROJECT_DIR/"
fi
rm -rf "$TEMP_BACKUP"

echo ""
echo "=== First deploy complete ==="
echo ""
echo "Repo: https://github.com/$GITHUB_ORG/$REPO_NAME"
echo ""
echo "Next steps:"
echo "  1. Go to https://vercel.com/new"
echo "  2. Import $GITHUB_ORG/$REPO_NAME"
echo "  3. Vercel auto-detects Next.js — accept defaults"
echo "  4. Copy the .vercel.app URL for testing"
echo "  5. When ready, point heteromorphiczoo.com DNS to Vercel"
echo ""
echo "For subsequent deploys:"
echo "  bash deploy.sh    (from the project directory)"
echo ""
echo "For data updates (after GEX44 API is live):"
echo "  python3 gex44/scripts/aggregate.py"
echo "  bash deploy.sh"
