# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: YouTube oEmbed client for extracting reaction video metadata.
"""
oembed.py — YouTube oEmbed client.

Extracts video metadata (title, channel, thumbnail) without requiring a YouTube API key.
The oEmbed endpoint is public and rate-limit-friendly for our volume.
"""

import re
import httpx


OEMBED_URL = "https://www.youtube.com/oembed"

# Patterns for extracting YouTube video IDs
_YOUTUBE_PATTERNS = [
    re.compile(r"(?:youtube\.com/watch\?v=|youtube\.com/watch\?.+&v=)([a-zA-Z0-9_-]{11})"),
    re.compile(r"youtu\.be/([a-zA-Z0-9_-]{11})"),
    re.compile(r"youtube\.com/shorts/([a-zA-Z0-9_-]{11})"),
    re.compile(r"youtube\.com/embed/([a-zA-Z0-9_-]{11})"),
]


def extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from various URL formats."""
    for pattern in _YOUTUBE_PATTERNS:
        match = pattern.search(url)
        if match:
            return match.group(1)
    return None


async def fetch_oembed(youtube_url: str) -> dict | None:
    """
    Fetch oEmbed metadata for a YouTube URL.

    Returns dict with keys: title, author_name, thumbnail_url, html
    Returns None if the video doesn't exist or oEmbed fails.
    """
    video_id = extract_video_id(youtube_url)
    if not video_id:
        return None

    canonical_url = f"https://www.youtube.com/watch?v={video_id}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                OEMBED_URL,
                params={"url": canonical_url, "format": "json"},
            )
            resp.raise_for_status()
            data = resp.json()

            return {
                "video_id": video_id,
                "title": data.get("title"),
                "channel_name": data.get("author_name"),
                "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
            }
        except (httpx.HTTPError, ValueError):
            return None
