# FILE_TRAJECTORY: load-bearing
# TRAJECTORY_NOTE: Google OAuth token verification for admin endpoints.
"""
auth.py — Admin authentication for the HZ GEX44 API.

Two auth methods:
  1. Google OAuth ID token (frontend admin panel via next-auth)
  2. API key (CLI/script backward compat)
"""

import httpx
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import ADMIN_API_KEY, ADMIN_EMAILS

security = HTTPBearer(auto_error=False)


async def verify_admin(
    credentials: HTTPAuthorizationCredentials | None = Security(security),
) -> dict:
    """Verify admin access via Google OAuth token OR API key.

    Returns dict with 'email' and 'method' keys on success.
    Raises HTTPException on auth failure.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required.")

    token = credentials.credentials

    # API key as Bearer token (backward compat for CLI usage)
    if token == ADMIN_API_KEY:
        return {"email": "api-key-user", "method": "api_key"}

    # Verify Google ID token via Google's tokeninfo endpoint
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token.")

            token_info = resp.json()
            email = token_info.get("email", "")

            if email not in ADMIN_EMAILS:
                raise HTTPException(status_code=403, detail="Not authorized.")

            return {"email": email, "method": "google_oauth"}
    except httpx.RequestError:
        raise HTTPException(
            status_code=503, detail="Token verification service unavailable."
        )
