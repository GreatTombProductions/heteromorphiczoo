# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: FastAPI application for the HZ fan engagement platform.
# 6 endpoints per data-pipeline-spec.md Section 2.
# Monday-critical: POST /api/hz/join must work for Benediction launch.
"""
main.py — HZ GEX44 FastAPI application.

Endpoints:
    POST /api/hz/join          — Email capture ("Join the menagerie")
    POST /api/hz/reactions      — Reaction video submission
    POST /api/hz/offerings      — UGC submission
    POST /api/hz/admin/review   — Band review (approve/reject/feature)
    GET  /api/hz/census         — Public census stats
    POST /api/hz/admin/aggregate — Trigger manual aggregation

Run: uvicorn api.main:app --host 0.0.0.0 --port 8000
"""

import asyncio
import time
import uuid
from datetime import date, datetime, timezone

from fastapi import Body, Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import (
    ADMIN_API_KEY,
    BENEDICTION_END,
    BENEDICTION_START,
    CORS_ORIGIN_REGEX,
    CORS_ORIGINS,
    EVENT_TYPES,
    FOUNDING_MULTIPLIER,
    PUBLIC_UPLOAD_ALLOWED_TYPES,
    PUBLIC_UPLOAD_MAX_BYTES,
    RANK_TABLE,
    RATE_LIMIT_RPM,
    UPLOAD_DIR,
    VALID_CATEGORIES,
    VALID_SOURCES,
    rank_for_dp,
)
from .admin_routes import router as admin_router
from .auth import verify_admin_optional
from .db import close_app_db, get_app_db
from .models import (
    AggregateRequest,
    AggregateResponse,
    CensusResponse,
    JoinRequest,
    JoinResponse,
    RankCount,
    ReactionRequest,
    ReactionResponse,
    ReviewRequest,
    ReviewResponse,
    RollEntry,
    RollResponse,
    SanctuaryRequest,
    SanctuaryResponse,
)
from .oembed import extract_video_id, fetch_oembed

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Heteromorphic Zoo — Menagerie API",
    description="Fan engagement platform for Heteromorphic Zoo",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


# Mount admin routes (all under /api/hz/admin/* and /api/hz/chronicle)
app.include_router(admin_router, prefix="/api/hz")

# Mount static file serving for uploads
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.on_event("shutdown")
def shutdown():
    close_app_db()


# ---------------------------------------------------------------------------
# IP rate limiting (in-memory, resets on restart — fine for this scale)
# ---------------------------------------------------------------------------

_rate_buckets: dict[str, list[float]] = {}


def _check_rate_limit(request: Request):
    """Enforce per-IP rate limit on public endpoints."""
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60.0

    bucket = _rate_buckets.setdefault(ip, [])
    # Prune old entries
    _rate_buckets[ip] = [t for t in bucket if now - t < window]
    bucket = _rate_buckets[ip]

    if len(bucket) >= RATE_LIMIT_RPM:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Try again in a minute.",
        )
    bucket.append(now)


# ---------------------------------------------------------------------------
# Aggregation debounce
# ---------------------------------------------------------------------------

_last_aggregation: float = 0.0
_aggregation_lock = asyncio.Lock()


async def _trigger_aggregation():
    """Run aggregation, debounced to at most once per minute."""
    global _last_aggregation
    now = time.time()
    if now - _last_aggregation < 60:
        return  # Debounced

    async with _aggregation_lock:
        # Double-check after acquiring lock
        if time.time() - _last_aggregation < 60:
            return

        # Import here to avoid circular dependency at module load
        import importlib
        import sys

        # Add scripts to path if needed
        from pathlib import Path
        scripts_dir = str(Path(__file__).resolve().parent.parent / "scripts")
        if scripts_dir not in sys.path:
            sys.path.insert(0, scripts_dir)

        try:
            if "aggregate" in sys.modules:
                mod = importlib.reload(sys.modules["aggregate"])
            else:
                mod = importlib.import_module("aggregate")
            mod.aggregate()
            _last_aggregation = time.time()
        except Exception as e:
            # Aggregation failure should not break the write path
            print(f"[WARN] Aggregation failed: {e}")


def _verify_admin_key(api_key: str):
    """Validate admin API key."""
    if api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key.")


def _is_founding_window() -> bool:
    """Check if we're currently in the Benediction founding window."""
    today = date.today()
    return BENEDICTION_START <= today <= BENEDICTION_END


def _now_iso() -> str:
    """Current UTC timestamp in ISO 8601."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------------------
# POST /api/hz/join — Monday-critical
# ---------------------------------------------------------------------------

@app.post("/api/hz/join", response_model=JoinResponse, status_code=201)
async def join_menagerie(req: JoinRequest, request: Request):
    """Email capture — 'Join the menagerie.' The Monday-critical endpoint."""
    _check_rate_limit(request)

    db = get_app_db()
    email_lower = req.email.strip().lower()

    # Check for existing fan (case-insensitive)
    existing = db.execute(
        "SELECT id, current_rank, lifetime_dp, founding_member FROM fans WHERE LOWER(email) = ?",
        (email_lower,),
    ).fetchone()

    if existing:
        # --- Upsert: update name, newsletter, metadata if anything changed ---
        import re as _re

        fan_id = existing["id"]
        now = _now_iso()
        changes: list[str] = []

        # Name: update if submitted name is non-empty and differs
        if req.name and req.name.strip():
            stored_name = db.execute(
                "SELECT name FROM fans WHERE id = ?", (fan_id,)
            ).fetchone()["name"]
            if stored_name != req.name.strip():
                db.execute(
                    "UPDATE fans SET name = ?, updated_at = ? WHERE id = ?",
                    (req.name.strip(), now, fan_id),
                )
                changes.append("name")

        # Newsletter opt-in: update if differs
        stored_newsletter = db.execute(
            "SELECT opt_in_newsletter FROM fans WHERE id = ?", (fan_id,)
        ).fetchone()["opt_in_newsletter"]
        if int(req.opt_in_newsletter) != stored_newsletter:
            db.execute(
                "UPDATE fans SET opt_in_newsletter = ?, updated_at = ? WHERE id = ?",
                (int(req.opt_in_newsletter), now, fan_id),
            )
            changes.append("newsletter")

        # Metadata: upsert any new or changed key/value pairs
        if req.metadata:
            existing_meta = {
                row["field_key"]: row["field_value"]
                for row in db.execute(
                    "SELECT field_key, field_value FROM fan_metadata WHERE fan_id = ?",
                    (fan_id,),
                ).fetchall()
            }
            for key, value in list(req.metadata.items())[:20]:
                clean_key = _re.sub(r'[^a-zA-Z0-9_ -]', '', key)[:50].strip()
                clean_value = str(value)[:500].strip()
                if clean_key and clean_value:
                    if existing_meta.get(clean_key) != clean_value:
                        meta_id = str(uuid.uuid4())
                        db.execute(
                            """INSERT OR REPLACE INTO fan_metadata (id, fan_id, field_key, field_value, created_at, updated_at)
                               VALUES (
                                   COALESCE((SELECT id FROM fan_metadata WHERE fan_id = ? AND field_key = ?), ?),
                                   ?, ?, ?, COALESCE((SELECT created_at FROM fan_metadata WHERE fan_id = ? AND field_key = ?), ?), ?
                               )""",
                            (fan_id, clean_key, meta_id, fan_id, clean_key, clean_value, fan_id, clean_key, now, now),
                        )
                        changes.append(f"metadata:{clean_key}")

        if changes:
            db.commit()
            asyncio.create_task(_trigger_aggregation())

        _, rank_title = rank_for_dp(existing["lifetime_dp"])

        is_founding = bool(existing["founding_member"])

        if changes:
            return JSONResponse(
                status_code=200,
                content={
                    "id": fan_id,
                    "rank_title": rank_title,
                    "founding_member": is_founding,
                    "updated": True,
                    "message": "The menagerie has noted your changes.",
                },
            )
        else:
            return JSONResponse(
                status_code=409,
                content={
                    "id": fan_id,
                    "rank_title": rank_title,
                    "founding_member": is_founding,
                    "updated": False,
                    "message": "You are already known to the menagerie.",
                },
            )

    # New fan
    fan_id = str(uuid.uuid4())
    founding = _is_founding_window()
    source = req.source if req.source in VALID_SOURCES else "website"
    now = _now_iso()

    db.execute(
        """INSERT INTO fans (id, email, name, source, acquired_at, founding_member, opt_in_newsletter, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (fan_id, email_lower, req.name, source, now, int(founding), int(req.opt_in_newsletter), now, now),
    )

    # Store arbitrary metadata key/value pairs
    if req.metadata:
        import re
        for key, value in list(req.metadata.items())[:20]:  # Cap at 20 fields
            clean_key = re.sub(r'[^a-zA-Z0-9_ -]', '', key)[:50].strip()
            clean_value = str(value)[:500].strip()
            if clean_key and clean_value:
                meta_id = str(uuid.uuid4())
                db.execute(
                    """INSERT OR REPLACE INTO fan_metadata (id, fan_id, field_key, field_value, created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (meta_id, fan_id, clean_key, clean_value, now, now),
                )

    # Create join_mailing_list engagement event
    base_dp = EVENT_TYPES["join_mailing_list"][1]  # 5
    multiplier = FOUNDING_MULTIPLIER if founding else 1.0
    dp_awarded = int(base_dp * multiplier)
    event_id = str(uuid.uuid4())

    db.execute(
        """INSERT INTO engagement_events (id, fan_id, event_type, dp_awarded, dp_base, multiplier, created_at)
           VALUES (?, ?, 'join_mailing_list', ?, ?, ?, ?)""",
        (event_id, fan_id, dp_awarded, base_dp, multiplier, now),
    )

    # Update fan DP
    db.execute(
        "UPDATE fans SET lifetime_dp = ?, updated_at = ? WHERE id = ?",
        (dp_awarded, now, fan_id),
    )

    db.commit()

    # Trigger aggregation (non-blocking)
    asyncio.create_task(_trigger_aggregation())

    _, rank_title = rank_for_dp(dp_awarded)
    return JoinResponse(
        id=fan_id,
        rank_title=rank_title,
        founding_member=founding,
        message="You have been counted among the menagerie.",
    )


# ---------------------------------------------------------------------------
# POST /api/hz/reactions
# ---------------------------------------------------------------------------

@app.post("/api/hz/reactions", response_model=ReactionResponse, status_code=201)
async def submit_reaction(req: ReactionRequest, request: Request):
    """Reaction video submission."""
    _check_rate_limit(request)

    video_id = extract_video_id(req.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL.")

    db = get_app_db()

    # Check for duplicate
    existing = db.execute(
        "SELECT id FROM reactions WHERE youtube_id = ?", (video_id,)
    ).fetchone()
    if existing:
        raise HTTPException(
            status_code=409, detail="This reaction video has already been submitted."
        )

    # Fetch oEmbed metadata
    oembed_data = await fetch_oembed(req.youtube_url)
    if not oembed_data:
        raise HTTPException(
            status_code=400,
            detail="Could not fetch video metadata. Check the URL is valid and the video is public.",
        )

    # Link to fan if email provided
    submitted_by = None
    if req.submitted_by_email:
        fan = db.execute(
            "SELECT id FROM fans WHERE LOWER(email) = ?",
            (req.submitted_by_email.strip().lower(),),
        ).fetchone()
        if fan:
            submitted_by = fan["id"]

    reaction_id = str(uuid.uuid4())
    now = _now_iso()
    canonical_url = f"https://www.youtube.com/watch?v={video_id}"

    db.execute(
        """INSERT INTO reactions (id, youtube_url, youtube_id, title, channel_name,
           thumbnail_url, song_tag, submitted_by, status, discovered_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)""",
        (
            reaction_id,
            canonical_url,
            video_id,
            oembed_data["title"],
            oembed_data["channel_name"],
            oembed_data["thumbnail_url"],
            req.song_tag,
            submitted_by,
            now,
        ),
    )
    db.commit()

    return ReactionResponse(
        id=reaction_id,
        title=oembed_data["title"],
        channel_name=oembed_data["channel_name"],
        thumbnail_url=oembed_data["thumbnail_url"],
        status="pending",
    )


# ---------------------------------------------------------------------------
# POST /api/hz/offerings
# ---------------------------------------------------------------------------

@app.post("/api/hz/offerings", status_code=201)
async def submit_offering(
    request: Request,
    email: str = Form(...),
    category: str = Form(...),
    title: str = Form(None),
    description: str = Form(None),
    content_url: str = Form(None),
    inspired_by: str = Form(None),
    file: UploadFile | None = File(None),
):
    """UGC submission. Multipart form for file uploads."""
    _check_rate_limit(request)

    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {', '.join(sorted(VALID_CATEGORIES))}",
        )

    db = get_app_db()

    # Find or create fan
    email_lower = email.strip().lower()
    fan = db.execute(
        "SELECT id FROM fans WHERE LOWER(email) = ?", (email_lower,)
    ).fetchone()

    if fan:
        fan_id = fan["id"]
    else:
        # Auto-register: create fan record from the offering submission
        fan_id = str(uuid.uuid4())
        founding = _is_founding_window()
        now_join = _now_iso()

        db.execute(
            """INSERT INTO fans (id, email, name, source, acquired_at, founding_member, opt_in_newsletter, created_at, updated_at)
               VALUES (?, ?, NULL, 'website', ?, ?, 0, ?, ?)""",
            (fan_id, email_lower, now_join, int(founding), now_join, now_join),
        )

        # Create join engagement event
        join_base_dp = EVENT_TYPES["join_mailing_list"][1]
        join_multiplier = FOUNDING_MULTIPLIER if founding else 1.0
        join_dp = int(join_base_dp * join_multiplier)
        join_event_id = str(uuid.uuid4())

        db.execute(
            """INSERT INTO engagement_events (id, fan_id, event_type, dp_awarded, dp_base, multiplier, created_at)
               VALUES (?, ?, 'join_mailing_list', ?, ?, ?, ?)""",
            (join_event_id, fan_id, join_dp, join_base_dp, join_multiplier, now_join),
        )

        db.execute(
            "UPDATE fans SET lifetime_dp = ?, updated_at = ? WHERE id = ?",
            (join_dp, now_join, fan_id),
        )

    # Determine content type and URL
    if file and file.filename:
        # Validate MIME type
        if file.content_type not in PUBLIC_UPLOAD_ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Accepted: images, audio, video, PDF.",
            )

        # Read file and enforce size limit
        content_bytes = await file.read()
        if len(content_bytes) > PUBLIC_UPLOAD_MAX_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {PUBLIC_UPLOAD_MAX_BYTES // (1024 * 1024)} MB.",
            )

        # Save to uploads directory (same layout as admin uploads)
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        category_dir = UPLOAD_DIR / category
        category_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = category_dir / filename
        filepath.write_bytes(content_bytes)

        # Detect content_type from MIME for proper gallery rendering
        mime = file.content_type or ""
        if mime.startswith("image/"):
            content_type = "image"
        elif mime.startswith("audio/"):
            content_type = "audio_embed"
        elif mime.startswith("video/"):
            content_type = "video_embed"
        else:
            content_type = "text"  # PDF, etc. — renders as link
        content_url_final = f"/uploads/{category}/{filename}"
    elif content_url:
        # Video/audio embed
        if "youtube.com" in content_url or "youtu.be" in content_url:
            content_type = "video_embed"
        elif "soundcloud.com" in content_url:
            content_type = "audio_embed"
        else:
            content_type = "text"
        content_url_final = content_url
    else:
        content_type = "text"
        content_url_final = None

    offering_id = str(uuid.uuid4())
    now = _now_iso()

    # Determine event_type based on category
    event_type_map = {
        "visual": "fan_art",
        "sonic": "cover_video",
        "textual": "review_written",
        "ritual": "inspired_content",
        "profane": "meme_featured",
    }
    event_type = event_type_map.get(category, "fan_art")
    _, base_dp, requires_review = EVENT_TYPES[event_type]

    # Create engagement event (pending review)
    event_id = str(uuid.uuid4())
    db.execute(
        """INSERT INTO engagement_events (id, fan_id, event_type, dp_awarded, dp_base,
           multiplier, reviewed, approved, created_at)
           VALUES (?, ?, ?, 0, ?, 1.0, 1, 0, ?)""",
        (event_id, fan_id, event_type, base_dp, now),
    )

    # Create offering
    db.execute(
        """INSERT INTO offerings (id, fan_id, event_id, category, title, description,
           content_url, content_type, inspired_by, status, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)""",
        (
            offering_id,
            fan_id,
            event_id,
            category,
            title,
            description,
            content_url_final,
            content_type,
            inspired_by,
            now,
        ),
    )
    db.commit()

    return JSONResponse(
        status_code=201,
        content={
            "id": offering_id,
            "status": "pending",
            "message": "Your offering has been received. The menagerie will judge its worthiness.",
        },
    )


# ---------------------------------------------------------------------------
# POST /api/hz/admin/review
# ---------------------------------------------------------------------------

@app.post("/api/hz/admin/review", response_model=ReviewResponse)
async def admin_review(req: ReviewRequest):
    """Band review endpoint for offerings and reactions."""
    _verify_admin_key(req.api_key)

    db = get_app_db()
    now = _now_iso()
    dp_awarded = None

    if req.type == "offering":
        offering = db.execute(
            "SELECT id, fan_id, event_id, status FROM offerings WHERE id = ?",
            (req.id,),
        ).fetchone()
        if not offering:
            raise HTTPException(status_code=404, detail="Offering not found.")

        if req.action == "approve":
            db.execute(
                "UPDATE offerings SET status = 'approved', approved_at = ? WHERE id = ?",
                (now, req.id),
            )
            if offering["event_id"]:
                # Compute DP with multiplier
                event = db.execute(
                    "SELECT dp_base, fan_id FROM engagement_events WHERE id = ?",
                    (offering["event_id"],),
                ).fetchone()
                if event:
                    fan = db.execute(
                        "SELECT founding_member FROM fans WHERE id = ?",
                        (event["fan_id"],),
                    ).fetchone()
                    multiplier = FOUNDING_MULTIPLIER if (fan and fan["founding_member"]) else 1.0
                    dp_awarded = int(event["dp_base"] * multiplier)
                    db.execute(
                        "UPDATE engagement_events SET approved = 1, dp_awarded = ?, multiplier = ? WHERE id = ?",
                        (dp_awarded, multiplier, offering["event_id"]),
                    )
                    # Update fan lifetime_dp
                    db.execute(
                        "UPDATE fans SET lifetime_dp = lifetime_dp + ?, updated_at = ? WHERE id = ?",
                        (dp_awarded, now, event["fan_id"]),
                    )
            new_status = "approved"

        elif req.action == "feature":
            db.execute(
                "UPDATE offerings SET status = 'featured', featured = 1, featured_at = ?, approved_at = COALESCE(approved_at, ?) WHERE id = ?",
                (now, now, req.id),
            )
            # Also approve the event if not already
            if offering["event_id"]:
                event = db.execute(
                    "SELECT dp_base, approved, fan_id FROM engagement_events WHERE id = ?",
                    (offering["event_id"],),
                ).fetchone()
                if event and not event["approved"]:
                    fan = db.execute(
                        "SELECT founding_member FROM fans WHERE id = ?",
                        (event["fan_id"],),
                    ).fetchone()
                    multiplier = FOUNDING_MULTIPLIER if (fan and fan["founding_member"]) else 1.0
                    dp_awarded = int(event["dp_base"] * multiplier)
                    db.execute(
                        "UPDATE engagement_events SET approved = 1, dp_awarded = ?, multiplier = ? WHERE id = ?",
                        (dp_awarded, multiplier, offering["event_id"]),
                    )
                    db.execute(
                        "UPDATE fans SET lifetime_dp = lifetime_dp + ?, updated_at = ? WHERE id = ?",
                        (dp_awarded, now, event["fan_id"]),
                    )
            new_status = "featured"

        elif req.action == "reject":
            db.execute(
                "UPDATE offerings SET status = 'rejected' WHERE id = ?",
                (req.id,),
            )
            new_status = "rejected"
        else:
            raise HTTPException(status_code=400, detail="Invalid action.")

    elif req.type == "reaction":
        reaction = db.execute(
            "SELECT id, status FROM reactions WHERE id = ?", (req.id,)
        ).fetchone()
        if not reaction:
            raise HTTPException(status_code=404, detail="Reaction not found.")

        if req.action in ("approve", "feature"):
            db.execute(
                "UPDATE reactions SET status = 'approved', approved_at = ? WHERE id = ?",
                (now, req.id),
            )
            new_status = "approved"
        elif req.action == "reject":
            db.execute(
                "UPDATE reactions SET status = 'rejected' WHERE id = ?",
                (req.id,),
            )
            new_status = "rejected"
        else:
            raise HTTPException(status_code=400, detail="Invalid action.")
    else:
        raise HTTPException(status_code=400, detail="Invalid type.")

    db.commit()

    # Trigger aggregation
    asyncio.create_task(_trigger_aggregation())

    return ReviewResponse(status=new_status, dp_awarded=dp_awarded)


# ---------------------------------------------------------------------------
# POST /api/hz/sanctuary — AI impact contact form
# ---------------------------------------------------------------------------

VALID_SANCTUARY_CATEGORIES = {
    "My voice or likeness was used without my consent",
    "AI-generated content has replaced work I would have been hired for",
    "Content I created was used to train AI systems without my permission",
    "AI-generated work has been falsely attributed to me",
    "Other \u2014 I\u2019ll explain below",
}


@app.post("/api/hz/sanctuary", response_model=SanctuaryResponse, status_code=201)
async def submit_sanctuary(req: SanctuaryRequest, request: Request):
    """AI impact contact form submission. Confidential intake — never public."""
    _check_rate_limit(request)

    if req.category not in VALID_SANCTUARY_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail="Invalid category.",
        )

    if len(req.story.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Story must be at least 20 characters.",
        )

    db = get_app_db()
    submission_id = str(uuid.uuid4())
    now = _now_iso()

    db.execute(
        """INSERT INTO sanctuary_submissions (id, name, email, category, story, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            submission_id,
            req.name.strip() if req.name else None,
            req.email.strip().lower() if req.email else None,
            req.category,
            req.story.strip(),
            now,
        ),
    )
    db.commit()

    # No aggregation — sanctuary submissions are never public
    return SanctuaryResponse(
        id=submission_id,
        message="Your voice has been received. The Zoo is listening.",
    )


# ---------------------------------------------------------------------------
# GET /api/hz/roll — live menagerie leaderboard
# ---------------------------------------------------------------------------

@app.get("/api/hz/roll", response_model=RollResponse)
async def get_roll(request: Request):
    """Public menagerie roll — live leaderboard of named fans."""
    _check_rate_limit(request)

    db = get_app_db()

    # Rank title lookup
    rank_titles = {r[1]: r[2] for r in RANK_TABLE}

    rows = db.execute("""
        SELECT name, current_rank, lifetime_dp, founding_member, acquired_at
        FROM fans
        WHERE name IS NOT NULL AND name != ''
        ORDER BY current_rank DESC, lifetime_dp DESC
    """).fetchall()

    roll = []
    for row in rows:
        roll.append(RollEntry(
            name=row["name"],
            rank=row["current_rank"],
            rank_title=rank_titles.get(row["current_rank"], "Uninitiated"),
            lifetime_dp=row["lifetime_dp"],
            founding_member=bool(row["founding_member"]),
            joined=row["acquired_at"][:10] if row["acquired_at"] else None,
        ))

    total = db.execute("SELECT COUNT(*) FROM fans").fetchone()[0]

    return RollResponse(
        roll=roll,
        total=total,
        generated_at=_now_iso(),
    )


# ---------------------------------------------------------------------------
# GET /api/hz/census
# ---------------------------------------------------------------------------

@app.get("/api/hz/census", response_model=CensusResponse)
async def get_census(request: Request):
    """Public census stats. Lightweight, cacheable."""
    _check_rate_limit(request)

    db = get_app_db()

    total = db.execute("SELECT COUNT(*) FROM fans").fetchone()[0]
    founding = db.execute(
        "SELECT COUNT(*) FROM fans WHERE founding_member = 1"
    ).fetchone()[0]

    by_rank = []
    for _, rank_idx, title in RANK_TABLE:
        count = db.execute(
            "SELECT COUNT(*) FROM fans WHERE current_rank = ?", (rank_idx,)
        ).fetchone()[0]
        by_rank.append(RankCount(rank=rank_idx, title=title, count=count))
    # Sort ascending by rank
    by_rank.sort(key=lambda r: r.rank)

    total_offerings = db.execute(
        "SELECT COUNT(*) FROM offerings WHERE status IN ('approved', 'featured')"
    ).fetchone()[0]
    total_reactions = db.execute(
        "SELECT COUNT(*) FROM reactions WHERE status = 'approved'"
    ).fetchone()[0]

    return CensusResponse(
        total_members=total,
        by_rank=by_rank,
        total_offerings=total_offerings,
        total_reactions=total_reactions,
        founding_members=founding,
        last_updated=_now_iso(),
    )


# ---------------------------------------------------------------------------
# POST /api/hz/admin/aggregate
# ---------------------------------------------------------------------------

@app.post("/api/hz/admin/aggregate", response_model=AggregateResponse)
async def admin_aggregate(
    req: AggregateRequest | None = Body(default=None),
    admin: dict | None = Depends(verify_admin_optional),
):
    """Trigger manual aggregation run. Accepts API key or OAuth Bearer token."""
    if admin:
        pass  # OAuth-authenticated
    elif req and req.api_key:
        _verify_admin_key(req.api_key)
    else:
        raise HTTPException(status_code=401, detail="Authentication required.")

    start = time.time()

    # Force aggregation (bypass debounce)
    global _last_aggregation
    _last_aggregation = 0
    await _trigger_aggregation()

    duration_ms = int((time.time() - start) * 1000)

    return AggregateResponse(
        status="complete",
        files_written=["census.json", "menagerie-roll.json", "offerings.json", "reactions.json", "altar.json"],
        duration_ms=duration_ms,
    )
