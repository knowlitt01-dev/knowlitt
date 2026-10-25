"""
Auth routes — email/password + Google OAuth 2.0.

Google OAuth flow:
  1. Frontend calls GET /auth/google/authorize  → redirects to Google consent screen
     with scopes: openid email profile drive.readonly
  2. User grants consent → Google redirects to GET /auth/google/callback?code=…
  3. Backend exchanges code for tokens, upserts User, returns JWT + drive status
     as a redirect to the frontend with ?token=<jwt>&drive=1

This gives us:
  - Sign in with Google (new accounts auto-created)
  - Google Drive access token stored server-side so we can import Drive files
    without the user manually pasting a token in the UI
"""
import logging
import urllib.parse

import requests as http_requests
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.base import get_db
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("knowlit.auth")

# Google OAuth endpoints
_GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
_GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
_GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

# Scopes:  openid + email + profile (for login) + drive.readonly (for Drive import)
_GOOGLE_SCOPES = " ".join([
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/drive.readonly",
])


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    google_drive_connected: bool = False


class UserResponse(BaseModel):
    id: str
    email: str
    google_drive_connected: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Email / password auth
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/signup", response_model=TokenResponse)
@limiter.limit("5/minute")
def signup(request: Request, payload: SignupRequest, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(400, "An account with this email already exists")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(
        access_token=create_access_token(user.id),
        google_drive_connected=user.google_drive_connected,
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    # hashed_password can be None for Google-only accounts
    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    return TokenResponse(
        access_token=create_access_token(user.id),
        google_drive_connected=user.google_drive_connected,
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        google_drive_connected=current_user.google_drive_connected,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Google OAuth — Step 1: redirect to Google consent screen
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/google/authorize")
def google_authorize():
    """
    Redirects the browser to Google's OAuth consent screen.
    Called by the frontend when the user clicks "Continue with Google".
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(501, "Google OAuth is not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env")

    redirect_uri = f"{settings.FRONTEND_URL}/api/auth/google/callback"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": _GOOGLE_SCOPES,
        "access_type": "offline",   # request refresh_token so Drive stays connected
        "prompt": "consent",         # force consent screen so we always get refresh_token
    }
    url = f"{_GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)


# ─────────────────────────────────────────────────────────────────────────────
# Google OAuth — Step 2: handle the callback from Google
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db), error: str = ""):
    """
    Google redirects here after the user grants (or denies) consent.
    Exchanges the auth code for tokens, upserts the user, issues a JWT,
    then redirects back to the frontend with the token in the query string.
    """
    if error or not code:
        # User denied consent — redirect to login with an error flag
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=google_denied")

    if not settings.GOOGLE_CLIENT_ID:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=not_configured")

    redirect_uri = f"{settings.FRONTEND_URL}/api/auth/google/callback"

    # ── Exchange auth code for tokens ──
    try:
        token_resp = http_requests.post(
            _GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=15,
        )
        token_resp.raise_for_status()
        token_data = token_resp.json()
    except Exception as exc:
        logger.error("Google token exchange failed: %s", exc)
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=google_token_failed")

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")  # present only on first consent

    if not access_token:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=google_no_token")

    # ── Fetch user info ──
    try:
        info_resp = http_requests.get(
            _GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        info_resp.raise_for_status()
        info = info_resp.json()
    except Exception as exc:
        logger.error("Google userinfo fetch failed: %s", exc)
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=google_userinfo_failed")

    google_id = info.get("sub")
    email = info.get("email")

    if not google_id or not email:
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error=google_missing_fields")

    # ── Upsert user ──
    user = (
        db.query(User).filter(User.google_id == google_id).first()
        or db.query(User).filter(User.email == email).first()
    )

    if user is None:
        # New user — create account (no password required)
        user = User(email=email, hashed_password=None, google_id=google_id)
        db.add(user)
    else:
        # Existing user — link Google account if not already linked
        if not user.google_id:
            user.google_id = google_id

    # Always update tokens (access_token expires; refresh_token only on fresh consent)
    user.google_access_token = access_token
    if refresh_token:
        user.google_refresh_token = refresh_token
        user.google_drive_connected = True
    elif user.google_refresh_token:
        # Already had a refresh token from a previous login — Drive still connected
        user.google_drive_connected = True

    db.commit()
    db.refresh(user)

    jwt = create_access_token(user.id)
    drive_flag = "1" if user.google_drive_connected else "0"

    # Redirect to frontend — token is passed as a query param and immediately
    # stored in localStorage by the frontend handler page (see /app/auth/google/callback)
    return RedirectResponse(
        f"{settings.FRONTEND_URL}/auth/google/callback?token={jwt}&drive={drive_flag}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Refresh Google access token (called server-side by Drive import when needed)
# ─────────────────────────────────────────────────────────────────────────────

def refresh_google_access_token(user: User, db: Session) -> str | None:
    """
    Uses the stored refresh token to get a new access token.
    Updates the user record and returns the new access token, or None on failure.
    """
    if not user.google_refresh_token or not settings.GOOGLE_CLIENT_ID:
        return None
    try:
        resp = http_requests.post(
            _GOOGLE_TOKEN_URL,
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "refresh_token": user.google_refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        new_token = data.get("access_token")
        if new_token:
            user.google_access_token = new_token
            db.commit()
            return new_token
    except Exception as exc:
        logger.warning("Failed to refresh Google access token for user %s: %s", user.id, exc)
    return None
