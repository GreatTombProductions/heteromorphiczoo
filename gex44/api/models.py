# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: Pydantic models for all API request/response payloads.
# Matches data-pipeline-spec.md Section 2 endpoint contracts exactly.
"""
models.py — Pydantic models for the HZ GEX44 API.
"""

from pydantic import BaseModel, EmailStr, Field


# --- Join ---

class JoinRequest(BaseModel):
    email: EmailStr
    name: str | None = None
    source: str = "website"
    opt_in_newsletter: bool = False
    metadata: dict[str, str] | None = None


class JoinResponse(BaseModel):
    id: str
    rank_title: str
    founding_member: bool
    message: str


# --- Reactions ---

class ReactionRequest(BaseModel):
    youtube_url: str
    song_tag: str | None = None
    submitted_by_email: str | None = None


class ReactionResponse(BaseModel):
    id: str
    title: str | None
    channel_name: str | None
    thumbnail_url: str | None
    status: str


# --- Offerings ---

class OfferingResponse(BaseModel):
    id: str
    status: str
    message: str


# --- Admin Review ---

class ReviewRequest(BaseModel):
    type: str = Field(..., pattern=r"^(offering|reaction)$")
    id: str
    action: str = Field(..., pattern=r"^(approve|reject|feature)$")
    api_key: str


class ReviewResponse(BaseModel):
    status: str
    dp_awarded: int | None = None


# --- Admin Aggregate ---

class AggregateRequest(BaseModel):
    api_key: str | None = None


class AggregateResponse(BaseModel):
    status: str
    files_written: list[str]
    duration_ms: int


# --- Census ---

class RankCount(BaseModel):
    rank: int
    title: str
    count: int


class CensusResponse(BaseModel):
    total_members: int
    by_rank: list[RankCount]
    total_offerings: int
    total_reactions: int
    founding_members: int
    last_updated: str


# --- Sanctuary ---

# --- Roll ---

class RollEntry(BaseModel):
    name: str
    rank: int
    rank_title: str
    lifetime_dp: int
    founding_member: bool
    joined: str | None = None


class RollResponse(BaseModel):
    roll: list[RollEntry]
    total: int
    generated_at: str


# --- Sanctuary ---

# --- Reaction Claims ---

class ClaimRequest(BaseModel):
    email: EmailStr


class ClaimResponse(BaseModel):
    id: str
    message: str


class SanctuaryRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    category: str
    story: str = Field(..., min_length=20)


class SanctuaryResponse(BaseModel):
    id: str
    message: str


# --- Presave ---

class PresaveRequest(BaseModel):
    email: EmailStr
    platform: str
    release_slug: str = "benediction"
    name: str | None = None
    source: str = "presave"
    opt_in_newsletter: bool = False
    metadata: dict[str, str] | None = None


class PresaveResponse(BaseModel):
    id: str
    message: str
    already_presaved: bool = False
    founding_member: bool
    dp_awarded: int


# --- Partner Apply ---

class PartnerApplyRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    craft: str = Field(..., min_length=1, max_length=500)
    portfolio: str = Field(..., min_length=1, max_length=500)
    pitch: str = Field(..., min_length=1, max_length=2000)
    email: EmailStr


class PartnerApplyResponse(BaseModel):
    id: str
    message: str
