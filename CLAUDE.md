# heteromorphiczoo.com

Band website for Heteromorphic Zoo. Next.js + Vercel frontend, SQLite + Python/FastAPI backend.

---

## Architecture

**This machine (saturna / GEX44) is the production server.** The API runs here. The database is here. Code edits take effect after restarting uvicorn — there is no remote deployment step for backend changes.

```
┌─────────────────────────────────────────────────────────┐
│  Vercel (frontend)                                      │
│  heteromorphiczoo.com                                   │
│  Next.js app, static JSON in public/data/               │
│  Auto-deploys from git push to GreatTombProductions/    │
│  heteromorphiczoo                                       │
└────────────────────┬────────────────────────────────────┘
                     │ POST /api/hz/* (write path)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  GEX44 / saturna (this machine)                         │
│  hz-api.greattombproductions.com (port 8081)            │
│  FastAPI + uvicorn, SQLite at gex44/data/fan_db.sqlite  │
│  Code is live on disk — restart to pick up changes      │
└─────────────────────────────────────────────────────────┘
```

### Data flow

- **Write path:** Website forms → GEX44 API → SQLite
- **Read path:** SQLite → aggregation script → static JSON → Vercel CDN
- The frontend never queries the database directly. Display data is pre-computed JSON.

---

## Deployment

```bash
# Full deploy: restart API, re-aggregate JSON, commit & push everything
./gex44/scripts/deploy.sh

# Individual steps
./gex44/scripts/deploy.sh backend      # Just restart uvicorn
./gex44/scripts/deploy.sh aggregate    # Just rebuild JSON
./gex44/scripts/deploy.sh push         # Just commit & push to Vercel
./gex44/scripts/deploy.sh --dry-run    # Show what would be pushed
```

The backend runs as: `uvicorn gex44.api.main:app --host 0.0.0.0 --port 8081`
Working directory: this project root (`0th-floor-exterior/central-mausoleum/heteromorphiczoo/`).
Env var: `HZ_ADMIN_API_KEY` (set in shell environment, not .env file at runtime).

### Aggregation

Aggregation rebuilds the static JSON files that the frontend reads (`public/data/*.json`). It runs:
- Automatically after fan joins, offering/reaction submissions, and admin reviews
- On demand via the "Rebuild JSON" button on the admin dashboard
- On demand via `POST /api/hz/admin/aggregate` (API key or OAuth)
- Debounced to at most once per 60 seconds

After aggregation, the JSON files are on disk but not yet live on Vercel until pushed (`deploy.py frontend`).

---

## Project structure

```
src/                    Next.js frontend (Vercel)
  app/                  Pages (landing, reactions, offerings, menagerie, admin/*)
  components/           Shared components (SignupForm, Navigation, etc.)
  lib/                  Copy strings (copy.ts), admin API client, utilities
  
gex44/                  Backend (runs on this machine)
  api/
    main.py             FastAPI app — join, reactions, offerings, census endpoints
    admin_routes.py     Admin endpoints (dashboard, CRUD, review, chronicle)
    auth.py             Google OAuth + API key verification
    config.py           All configuration, env vars, rank table, event types
    db.py               SQLite connection management (WAL mode, FK enforcement)
    models.py           Pydantic request/response models
  scripts/
    aggregate.py        Rebuild static JSON from SQLite
    deploy.py           Backend restart + frontend JSON push
    init_db.py          Schema creation (idempotent)
    migrate_*.py        Schema migrations
  data/
    fan_db.sqlite       Production database (gitignored)
    uploads/            User-uploaded files (gitignored)

specs/                  Design specs (data pipeline, engagement system, aesthetics)
public/data/            Aggregated JSON files served by Vercel CDN
```

---

## Admin panel

`/admin` — Google OAuth protected. Authorized emails in `config.py` `ADMIN_EMAILS`.

Features: dashboard (stats + "Rebuild JSON" button), fan management, offerings review, reactions review, chronicle editor.

---

## Key conventions

- **Copy strings:** All user-facing text lives in `src/lib/copy.ts`. Edit there, not in components.
- **API base URL:** Frontend components that call GEX44 must use `process.env.NEXT_PUBLIC_GEX44_API_URL || "https://hz-api.greattombproductions.com"`. Never use relative paths for API calls — they'd hit Vercel, not GEX44.
- **Schema changes:** SQLite doesn't support ALTER COLUMN. Write a `migrate_*.py` script that rebuilds the table. Update `init_db.py` for fresh databases.
- **Foreign keys:** Enforced (`PRAGMA foreign_keys=ON`). Design for nullable FKs when records can exist without a fan (e.g., admin-seeded offerings).
