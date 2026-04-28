# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: All admin API endpoints for the HZ admin panel.
# Mounted on the FastAPI app as a router. All routes require admin auth.
"""
admin_routes.py — Admin endpoints for the HZ fan engagement platform.

All endpoints require admin authentication (Google OAuth or API key).
Mounted at /api/hz/admin/* (except public chronicle at /api/hz/chronicle).
"""

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel

from .auth import verify_admin
from .config import UPLOAD_DIR, rank_for_dp
from .db import get_app_db

router = APIRouter()


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class DashboardResponse(BaseModel):
    total_fans: int
    founding_fans: int
    pending_offerings: int
    pending_reactions: int
    total_dp_awarded: int
    by_rank: list[dict]
    by_source: list[dict]
    recent_events: list[dict]


class ChronicleEventCreate(BaseModel):
    date_display: str
    title: str
    body: str
    era: str | None = None
    video_url: str | None = None
    sort_order: int | None = None


class ChronicleEventUpdate(BaseModel):
    date_display: str | None = None
    title: str | None = None
    body: str | None = None
    era: str | None = None
    video_url: str | None = None
    sort_order: int | None = None


class TrackCreate(BaseModel):
    name: str


class FanUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    opt_in_newsletter: bool | None = None
    opt_in_email: bool | None = None


class FanMetadataUpdate(BaseModel):
    value: str


class ReviewAction(BaseModel):
    action: str  # "approve" | "reject" | "feature"


class OfferingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    content_url: str | None = None
    status: str | None = None
    featured: bool | None = None


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------


@router.get("/admin/dashboard")
async def admin_dashboard(admin: dict = Depends(verify_admin)):
    db = get_app_db()

    total_fans = db.execute("SELECT COUNT(*) FROM fans").fetchone()[0]
    founding_fans = db.execute(
        "SELECT COUNT(*) FROM fans WHERE founding_member = 1"
    ).fetchone()[0]
    pending_offerings = db.execute(
        "SELECT COUNT(*) FROM offerings WHERE status = 'pending'"
    ).fetchone()[0]
    pending_reactions = db.execute(
        "SELECT COUNT(*) FROM reactions WHERE status = 'pending'"
    ).fetchone()[0]
    total_dp = db.execute(
        "SELECT COALESCE(SUM(lifetime_dp), 0) FROM fans"
    ).fetchone()[0]

    # By rank
    by_rank = []
    for row in db.execute(
        "SELECT current_rank, COUNT(*) as count FROM fans GROUP BY current_rank ORDER BY current_rank"
    ).fetchall():
        _, title = rank_for_dp(row["current_rank"] * 50)  # rough approximation for title
        by_rank.append({"rank": row["current_rank"], "count": row["count"], "title": title})

    # By source
    by_source = [
        {"source": row["source"], "count": row["count"]}
        for row in db.execute(
            "SELECT source, COUNT(*) as count FROM fans GROUP BY source ORDER BY count DESC"
        ).fetchall()
    ]

    # Recent events (last 20)
    recent_events = [
        dict(row)
        for row in db.execute(
            """SELECT ee.id, ee.fan_id, ee.event_type, ee.dp_awarded, ee.created_at,
                      f.email, f.name
               FROM engagement_events ee
               LEFT JOIN fans f ON ee.fan_id = f.id
               ORDER BY ee.created_at DESC LIMIT 20"""
        ).fetchall()
    ]

    return DashboardResponse(
        total_fans=total_fans,
        founding_fans=founding_fans,
        pending_offerings=pending_offerings,
        pending_reactions=pending_reactions,
        total_dp_awarded=total_dp,
        by_rank=by_rank,
        by_source=by_source,
        recent_events=recent_events,
    )


# ---------------------------------------------------------------------------
# Fans
# ---------------------------------------------------------------------------


@router.get("/admin/fans")
async def list_fans(
    search: str = Query("", description="Search by email or name"),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    sort: str = Query("lifetime_dp", description="Sort field"),
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()
    offset = (page - 1) * per_page

    # Allowed sort fields to prevent injection
    allowed_sorts = {"lifetime_dp", "created_at", "email", "name", "current_rank"}
    sort_field = sort if sort in allowed_sorts else "lifetime_dp"

    where = ""
    params: list = []
    if search:
        where = "WHERE LOWER(email) LIKE ? OR LOWER(name) LIKE ?"
        pattern = f"%{search.lower()}%"
        params = [pattern, pattern]

    total = db.execute(
        f"SELECT COUNT(*) FROM fans {where}", params
    ).fetchone()[0]

    fans = [
        dict(row)
        for row in db.execute(
            f"""SELECT id, email, name, source, founding_member, lifetime_dp,
                       current_rank, acquired_at, created_at
                FROM fans {where}
                ORDER BY {sort_field} DESC
                LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        ).fetchall()
    ]

    # Add rank titles and engagement counts
    for fan in fans:
        _, fan["rank_title"] = rank_for_dp(fan["lifetime_dp"])
        fan["engagement_count"] = db.execute(
            "SELECT COUNT(*) FROM engagement_events WHERE fan_id = ?",
            (fan["id"],),
        ).fetchone()[0]

    pages = max(1, (total + per_page - 1) // per_page)
    return {"fans": fans, "total": total, "page": page, "pages": pages}


@router.get("/admin/fans/{fan_id}")
async def get_fan(fan_id: str, admin: dict = Depends(verify_admin)):
    db = get_app_db()

    fan = db.execute("SELECT * FROM fans WHERE id = ?", (fan_id,)).fetchone()
    if not fan:
        raise HTTPException(status_code=404, detail="Fan not found.")

    fan_dict = dict(fan)
    _, fan_dict["rank_title"] = rank_for_dp(fan_dict["lifetime_dp"])

    events = [
        dict(row)
        for row in db.execute(
            """SELECT id, event_type, dp_awarded, dp_base, multiplier, approved, created_at
               FROM engagement_events WHERE fan_id = ?
               ORDER BY created_at DESC""",
            (fan_id,),
        ).fetchall()
    ]

    metadata = [
        {"field_key": row["field_key"], "field_value": row["field_value"]}
        for row in db.execute(
            "SELECT field_key, field_value FROM fan_metadata WHERE fan_id = ? ORDER BY created_at",
            (fan_id,),
        ).fetchall()
    ]

    fan_dict["events"] = events
    fan_dict["metadata"] = metadata
    return fan_dict


@router.put("/admin/fans/{fan_id}")
async def update_fan(
    fan_id: str,
    body: FanUpdate,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()

    existing = db.execute("SELECT id FROM fans WHERE id = ?", (fan_id,)).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Fan not found.")

    updates = []
    params = []
    for field, value in body.model_dump(exclude_none=True).items():
        if field in ("opt_in_newsletter", "opt_in_email"):
            updates.append(f"{field} = ?")
            params.append(int(value))
        elif field == "email":
            updates.append("email = ?")
            params.append(value.strip().lower())
        else:
            updates.append(f"{field} = ?")
            params.append(value)

    if not updates:
        return {"status": "no changes"}

    updates.append("updated_at = ?")
    params.append(_now_iso())
    params.append(fan_id)

    db.execute(f"UPDATE fans SET {', '.join(updates)} WHERE id = ?", params)
    db.commit()
    return {"status": "updated"}


@router.put("/admin/fans/{fan_id}/metadata/{field_key}")
async def update_fan_metadata(
    fan_id: str,
    field_key: str,
    body: FanMetadataUpdate,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()

    fan = db.execute("SELECT id FROM fans WHERE id = ?", (fan_id,)).fetchone()
    if not fan:
        raise HTTPException(status_code=404, detail="Fan not found.")

    now = _now_iso()
    existing = db.execute(
        "SELECT id FROM fan_metadata WHERE fan_id = ? AND field_key = ?",
        (fan_id, field_key),
    ).fetchone()

    if existing:
        db.execute(
            "UPDATE fan_metadata SET field_value = ?, updated_at = ? WHERE id = ?",
            (body.value[:500], now, existing["id"]),
        )
    else:
        meta_id = str(uuid.uuid4())
        db.execute(
            "INSERT INTO fan_metadata (id, fan_id, field_key, field_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (meta_id, fan_id, field_key[:50], body.value[:500], now, now),
        )

    db.commit()
    return {"status": "updated"}


@router.delete("/admin/fans/{fan_id}/metadata/{field_key}")
async def delete_fan_metadata(
    fan_id: str,
    field_key: str,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()

    existing = db.execute(
        "SELECT id FROM fan_metadata WHERE fan_id = ? AND field_key = ?",
        (fan_id, field_key),
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Metadata field not found.")

    db.execute("DELETE FROM fan_metadata WHERE id = ?", (existing["id"],))
    db.commit()
    return {"status": "deleted"}


@router.delete("/admin/fans/{fan_id}")
async def delete_fan(fan_id: str, admin: dict = Depends(verify_admin)):
    db = get_app_db()

    existing = db.execute("SELECT id FROM fans WHERE id = ?", (fan_id,)).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Fan not found.")

    # Cascade: metadata, engagement events, offerings linkage
    db.execute("DELETE FROM fan_metadata WHERE fan_id = ?", (fan_id,))
    db.execute("DELETE FROM engagement_events WHERE fan_id = ?", (fan_id,))
    db.execute("DELETE FROM fans WHERE id = ?", (fan_id,))
    db.commit()
    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Offerings
# ---------------------------------------------------------------------------


@router.get("/admin/offerings")
async def list_offerings(
    status: str = Query("pending"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()
    offset = (page - 1) * per_page

    where = "WHERE o.status = ?" if status != "all" else ""
    params: list = [status] if status != "all" else []

    total = db.execute(
        f"SELECT COUNT(*) FROM offerings o {where}", params
    ).fetchone()[0]

    offerings = [
        dict(row)
        for row in db.execute(
            f"""SELECT o.id, o.category, o.title, o.description, o.content_url,
                       o.content_type, o.status, o.submitted_at, o.featured,
                       f.email as fan_email, f.name as fan_name
                FROM offerings o
                LEFT JOIN fans f ON o.fan_id = f.id
                {where}
                ORDER BY o.submitted_at DESC
                LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        ).fetchall()
    ]

    pages = max(1, (total + per_page - 1) // per_page)
    return {"offerings": offerings, "total": total, "page": page, "pages": pages}


@router.post("/admin/offerings", status_code=201)
async def create_offering_admin(
    category: str = Form(...),
    title: str = Form(""),
    description: str = Form(""),
    content_url: str = Form(None),
    content_type: str = Form("image"),
    file: UploadFile | None = File(None),
    admin: dict = Depends(verify_admin),
):
    """Create offering as admin (seed gallery). No fan linkage, auto-approved."""
    db = get_app_db()

    content_url_final = content_url
    if file and file.filename:
        # Save file to uploads directory
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        category_dir = UPLOAD_DIR / category
        category_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = category_dir / filename
        content_bytes = await file.read()
        filepath.write_bytes(content_bytes)
        content_url_final = f"/uploads/{category}/{filename}"
        content_type = "image"

    offering_id = str(uuid.uuid4())
    now = _now_iso()

    # Admin-created offerings: no fan_id, auto-approved, no DP event
    db.execute(
        """INSERT INTO offerings (id, fan_id, category, title, description,
               content_url, content_type, status, featured, submitted_at, approved_at)
           VALUES (?, NULL, ?, ?, ?, ?, ?, 'approved', 0, ?, ?)""",
        (offering_id, category, title, description, content_url_final,
         content_type, now, now),
    )
    db.commit()

    return {"id": offering_id, "status": "approved", "content_url": content_url_final}


@router.put("/admin/offerings/{offering_id}")
async def update_offering(
    offering_id: str,
    body: OfferingUpdate,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()

    existing = db.execute(
        "SELECT id FROM offerings WHERE id = ?", (offering_id,)
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Offering not found.")

    updates = []
    params = []
    for field, value in body.model_dump(exclude_none=True).items():
        if field == "featured":
            updates.append("featured = ?")
            params.append(int(value))
            if value:
                updates.append("featured_at = ?")
                params.append(_now_iso())
        else:
            updates.append(f"{field} = ?")
            params.append(value)

    if not updates:
        return {"status": "no changes"}

    params.append(offering_id)
    db.execute(
        f"UPDATE offerings SET {', '.join(updates)} WHERE id = ?", params
    )
    db.commit()
    return {"status": "updated"}


@router.post("/admin/offerings/{offering_id}/review")
async def review_offering(
    offering_id: str,
    body: ReviewAction,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()
    now = _now_iso()

    offering = db.execute(
        "SELECT id, fan_id, event_id, status FROM offerings WHERE id = ?",
        (offering_id,),
    ).fetchone()
    if not offering:
        raise HTTPException(status_code=404, detail="Offering not found.")

    from .config import FOUNDING_MULTIPLIER

    if body.action == "approve":
        db.execute(
            "UPDATE offerings SET status = 'approved', approved_at = ? WHERE id = ?",
            (now, offering_id),
        )
        _award_dp_for_event(db, offering["event_id"], now, FOUNDING_MULTIPLIER)
    elif body.action == "feature":
        db.execute(
            """UPDATE offerings SET status = 'featured', featured = 1,
               featured_at = ?, approved_at = COALESCE(approved_at, ?) WHERE id = ?""",
            (now, now, offering_id),
        )
        _award_dp_for_event(db, offering["event_id"], now, FOUNDING_MULTIPLIER)
    elif body.action == "reject":
        db.execute(
            "UPDATE offerings SET status = 'rejected' WHERE id = ?", (offering_id,)
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid action.")

    db.commit()

    import asyncio
    from .main import _trigger_aggregation
    asyncio.create_task(_trigger_aggregation())

    return {"status": body.action + "d" if body.action != "reject" else "rejected"}


# ---------------------------------------------------------------------------
# Reactions
# ---------------------------------------------------------------------------


@router.get("/admin/reactions")
async def list_reactions(
    status: str = Query("pending"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()
    offset = (page - 1) * per_page

    where = "WHERE r.status = ?" if status != "all" else ""
    params: list = [status] if status != "all" else []

    total = db.execute(
        f"SELECT COUNT(*) FROM reactions r {where}", params
    ).fetchone()[0]

    reactions = [
        dict(row)
        for row in db.execute(
            f"""SELECT r.id, r.youtube_url, r.youtube_id, r.title, r.channel_name,
                       r.thumbnail_url, r.song_tag, r.status, r.discovered_at,
                       f.email as submitted_by_email, f.name as submitted_by_name
                FROM reactions r
                LEFT JOIN fans f ON r.submitted_by = f.id
                {where}
                ORDER BY r.discovered_at DESC
                LIMIT ? OFFSET ?""",
            params + [per_page, offset],
        ).fetchall()
    ]

    pages = max(1, (total + per_page - 1) // per_page)
    return {"reactions": reactions, "total": total, "page": page, "pages": pages}


@router.post("/admin/reactions/{reaction_id}/review")
async def review_reaction(
    reaction_id: str,
    body: ReviewAction,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()
    now = _now_iso()

    reaction = db.execute(
        "SELECT id, status FROM reactions WHERE id = ?", (reaction_id,)
    ).fetchone()
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found.")

    if body.action in ("approve", "feature"):
        db.execute(
            "UPDATE reactions SET status = 'approved', approved_at = ? WHERE id = ?",
            (now, reaction_id),
        )
    elif body.action == "reject":
        db.execute(
            "UPDATE reactions SET status = 'rejected' WHERE id = ?", (reaction_id,)
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid action.")

    db.commit()

    import asyncio
    from .main import _trigger_aggregation
    asyncio.create_task(_trigger_aggregation())

    return {"status": body.action + "d" if body.action != "reject" else "rejected"}


# ---------------------------------------------------------------------------
# Chronicle (admin CRUD)
# ---------------------------------------------------------------------------


@router.get("/admin/chronicle")
async def admin_list_chronicle(admin: dict = Depends(verify_admin)):
    db = get_app_db()

    events = []
    for row in db.execute(
        "SELECT * FROM chronicle_events ORDER BY sort_order ASC"
    ).fetchall():
        event = dict(row)
        event["media"] = [
            dict(m) for m in db.execute(
                "SELECT * FROM chronicle_media WHERE chronicle_event_id = ? ORDER BY sort_order",
                (row["id"],),
            ).fetchall()
        ]
        event["tracks"] = [
            dict(t) for t in db.execute(
                "SELECT * FROM chronicle_tracks WHERE chronicle_event_id = ? ORDER BY sort_order",
                (row["id"],),
            ).fetchall()
        ]
        events.append(event)

    return {"events": events, "total": len(events)}


@router.post("/admin/chronicle", status_code=201)
async def create_chronicle_event(
    body: ChronicleEventCreate,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()
    event_id = str(uuid.uuid4())
    now = _now_iso()

    # Auto-assign sort_order if not provided
    sort_order = body.sort_order
    if sort_order is None:
        max_order = db.execute(
            "SELECT COALESCE(MAX(sort_order), 0) FROM chronicle_events"
        ).fetchone()[0]
        sort_order = max_order + 10

    db.execute(
        """INSERT INTO chronicle_events (id, date_display, title, body, era, video_url, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (event_id, body.date_display, body.title, body.body, body.era,
         body.video_url, sort_order, now, now),
    )
    db.commit()

    return {"id": event_id, "sort_order": sort_order}


@router.put("/admin/chronicle/{event_id}")
async def update_chronicle_event(
    event_id: str,
    body: ChronicleEventUpdate,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()

    existing = db.execute(
        "SELECT id FROM chronicle_events WHERE id = ?", (event_id,)
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Chronicle event not found.")

    updates = []
    params = []
    for field, value in body.model_dump(exclude_none=True).items():
        updates.append(f"{field} = ?")
        params.append(value)

    if not updates:
        return {"status": "no changes"}

    updates.append("updated_at = ?")
    params.append(_now_iso())
    params.append(event_id)

    db.execute(
        f"UPDATE chronicle_events SET {', '.join(updates)} WHERE id = ?", params
    )
    db.commit()
    return {"status": "updated"}


@router.delete("/admin/chronicle/{event_id}")
async def delete_chronicle_event(
    event_id: str, admin: dict = Depends(verify_admin)
):
    db = get_app_db()

    existing = db.execute(
        "SELECT id FROM chronicle_events WHERE id = ?", (event_id,)
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Chronicle event not found.")

    # Cascade deletes media and tracks via FK ON DELETE CASCADE
    db.execute("DELETE FROM chronicle_media WHERE chronicle_event_id = ?", (event_id,))
    db.execute("DELETE FROM chronicle_tracks WHERE chronicle_event_id = ?", (event_id,))
    db.execute("DELETE FROM chronicle_events WHERE id = ?", (event_id,))
    db.commit()

    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Chronicle media
# ---------------------------------------------------------------------------


@router.post("/admin/chronicle/{event_id}/media", status_code=201)
async def add_chronicle_media(
    event_id: str,
    file: UploadFile = File(...),
    alt: str = Form(""),
    caption: str = Form(None),
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()

    existing = db.execute(
        "SELECT id FROM chronicle_events WHERE id = ?", (event_id,)
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Chronicle event not found.")

    # Save file
    media_dir = UPLOAD_DIR / "chronicle"
    media_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = media_dir / filename
    content_bytes = await file.read()
    filepath.write_bytes(content_bytes)

    src = f"/uploads/chronicle/{filename}"
    media_id = str(uuid.uuid4())

    max_order = db.execute(
        "SELECT COALESCE(MAX(sort_order), 0) FROM chronicle_media WHERE chronicle_event_id = ?",
        (event_id,),
    ).fetchone()[0]

    db.execute(
        """INSERT INTO chronicle_media (id, chronicle_event_id, media_type, src, alt, caption, sort_order)
           VALUES (?, ?, 'image', ?, ?, ?, ?)""",
        (media_id, event_id, src, alt, caption, max_order + 1),
    )
    db.commit()

    return {"id": media_id, "src": src}


@router.delete("/admin/chronicle/media/{media_id}")
async def delete_chronicle_media(
    media_id: str, admin: dict = Depends(verify_admin)
):
    db = get_app_db()

    media = db.execute(
        "SELECT id, src FROM chronicle_media WHERE id = ?", (media_id,)
    ).fetchone()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found.")

    # Delete file if it's a local upload
    if media["src"].startswith("/uploads/"):
        filepath = UPLOAD_DIR.parent / media["src"].lstrip("/")
        if filepath.exists():
            filepath.unlink()

    db.execute("DELETE FROM chronicle_media WHERE id = ?", (media_id,))
    db.commit()

    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Chronicle tracks
# ---------------------------------------------------------------------------


@router.post("/admin/chronicle/{event_id}/tracks", status_code=201)
async def add_chronicle_track(
    event_id: str,
    body: TrackCreate,
    admin: dict = Depends(verify_admin),
):
    db = get_app_db()

    existing = db.execute(
        "SELECT id FROM chronicle_events WHERE id = ?", (event_id,)
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Chronicle event not found.")

    track_id = str(uuid.uuid4())
    max_order = db.execute(
        "SELECT COALESCE(MAX(sort_order), 0) FROM chronicle_tracks WHERE chronicle_event_id = ?",
        (event_id,),
    ).fetchone()[0]

    db.execute(
        "INSERT INTO chronicle_tracks (id, chronicle_event_id, name, sort_order) VALUES (?, ?, ?, ?)",
        (track_id, event_id, body.name, max_order + 1),
    )
    db.commit()

    return {"id": track_id, "name": body.name}


@router.delete("/admin/chronicle/tracks/{track_id}")
async def delete_chronicle_track(
    track_id: str, admin: dict = Depends(verify_admin)
):
    db = get_app_db()

    existing = db.execute(
        "SELECT id FROM chronicle_tracks WHERE id = ?", (track_id,)
    ).fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail="Track not found.")

    db.execute("DELETE FROM chronicle_tracks WHERE id = ?", (track_id,))
    db.commit()

    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Public chronicle (replaces static copy.ts import)
# ---------------------------------------------------------------------------


@router.get("/chronicle")
async def public_chronicle():
    """Public, read-only chronicle endpoint. No auth required."""
    db = get_app_db()

    events = []
    for row in db.execute(
        "SELECT id, date_display, title, body, era, video_url, sort_order FROM chronicle_events ORDER BY sort_order ASC"
    ).fetchall():
        event = dict(row)
        event["images"] = [
            {"src": m["src"], "alt": m["alt"]}
            for m in db.execute(
                "SELECT src, alt FROM chronicle_media WHERE chronicle_event_id = ? ORDER BY sort_order",
                (row["id"],),
            ).fetchall()
        ]
        event["tracks"] = [
            t["name"]
            for t in db.execute(
                "SELECT name FROM chronicle_tracks WHERE chronicle_event_id = ? ORDER BY sort_order",
                (row["id"],),
            ).fetchall()
        ]
        events.append(event)

    return {"events": events}


# ---------------------------------------------------------------------------
# File upload (generic)
# ---------------------------------------------------------------------------


@router.post("/admin/upload", status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    category: str = Form("general"),
    admin: dict = Depends(verify_admin),
):
    """Generic file upload. Saves to UPLOAD_DIR/{category}/{uuid}_{filename}."""
    target_dir = UPLOAD_DIR / category
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = target_dir / filename
    content_bytes = await file.read()
    filepath.write_bytes(content_bytes)

    return {"url": f"/uploads/{category}/{filename}"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _award_dp_for_event(db, event_id: str | None, now: str, founding_multiplier: float):
    """Award DP for an engagement event if not already awarded."""
    if not event_id:
        return

    event = db.execute(
        "SELECT dp_base, approved, fan_id FROM engagement_events WHERE id = ?",
        (event_id,),
    ).fetchone()
    if not event or event["approved"]:
        return

    fan = db.execute(
        "SELECT founding_member FROM fans WHERE id = ?", (event["fan_id"],)
    ).fetchone()
    multiplier = founding_multiplier if (fan and fan["founding_member"]) else 1.0
    dp_awarded = int(event["dp_base"] * multiplier)

    db.execute(
        "UPDATE engagement_events SET approved = 1, dp_awarded = ?, multiplier = ? WHERE id = ?",
        (dp_awarded, multiplier, event_id),
    )
    db.execute(
        "UPDATE fans SET lifetime_dp = lifetime_dp + ?, updated_at = ? WHERE id = ?",
        (dp_awarded, now, event["fan_id"]),
    )
