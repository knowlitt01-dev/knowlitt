"""
Google Drive import.

Two modes:
  1. Auto-import (Google OAuth connected): the backend uses the stored
     access token from the user's Google OAuth session. The frontend just
     sends file IDs — no token needed in the request body.

  2. Manual picker (legacy): the frontend passes an access_token obtained
     from the Google Drive Picker widget. Still supported for users who
     haven't connected via Google OAuth.

See GOOGLE_DRIVE.md for the Cloud Console setup steps.
"""
import logging

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import require_active_access
from app.db.base import get_db
from app.models.models import Book, Flashcard, Insight, ReviewState, User
from app.services.genre_detection import detect_genre
from app.services.ingestion import IngestionError, chunk_text, extract_text_layer, run_ocr
from app.services.llm_pipeline import process_section
from app.services.companion_pipeline import process_companion_book

logger = logging.getLogger("knowlit.drive_import")
router = APIRouter(prefix="/books", tags=["books"])

DRIVE_API = "https://www.googleapis.com/drive/v3/files"


class DriveImportRequest(BaseModel):
    file_ids: list[str]
    access_token: str = ""  # optional — omit if user connected via Google OAuth


@router.post("/import-drive")
def import_from_drive(
    payload: DriveImportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_access),
):
    if not payload.file_ids:
        raise HTTPException(400, "No files selected")

    # Resolve which access token to use
    token = _resolve_access_token(payload.access_token, current_user, db)
    if not token:
        raise HTTPException(
            400,
            "No Google Drive access token available. "
            "Either connect your Google account via Sign in with Google, "
            "or pass an access_token in the request body."
        )

    results = []
    for file_id in payload.file_ids:
        results.append(_import_single_drive_file(file_id, token, db, current_user))
    return {"results": results}


def _resolve_access_token(request_token: str, user: User, db: Session) -> str | None:
    """
    Priority:
      1. Token passed explicitly in the request body (Drive Picker flow)
      2. Stored google_access_token from Google OAuth login
      3. Try to refresh using the stored refresh token
    """
    if request_token:
        return request_token

    if user.google_access_token:
        # Quick validation — if it's expired Google will return 401 and the
        # import will fail with a clear error; the refresh path handles re-auth.
        return user.google_access_token

    # Try refreshing
    from app.api.auth import refresh_google_access_token
    refreshed = refresh_google_access_token(user, db)
    return refreshed


def _import_single_drive_file(file_id: str, access_token: str, db: Session, current_user: User) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        meta_resp = requests.get(
            f"{DRIVE_API}/{file_id}", headers=headers,
            params={"fields": "name,mimeType"}, timeout=15,
        )
        # If the token expired, try to refresh once and retry
        if meta_resp.status_code == 401 and current_user.google_refresh_token:
            from app.api.auth import refresh_google_access_token
            from app.db.base import SessionLocal
            new_token = refresh_google_access_token(current_user, db)
            if new_token:
                headers = {"Authorization": f"Bearer {new_token}"}
                meta_resp = requests.get(
                    f"{DRIVE_API}/{file_id}", headers=headers,
                    params={"fields": "name,mimeType"}, timeout=15,
                )

        meta_resp.raise_for_status()
        meta = meta_resp.json()
        name, mime_type = meta["name"], meta["mimeType"]

        if mime_type == "application/vnd.google-apps.document":
            content_resp = requests.get(
                f"{DRIVE_API}/{file_id}/export", headers=headers,
                params={"mimeType": "text/plain"}, timeout=60,
            )
            content_resp.raise_for_status()
            text = content_resp.text
            is_scanned = False
        elif mime_type == "application/pdf":
            content_resp = requests.get(
                f"{DRIVE_API}/{file_id}", headers=headers,
                params={"alt": "media"}, timeout=120,
            )
            content_resp.raise_for_status()
            text, is_scanned = extract_text_layer(content_resp.content, name)
            if is_scanned:
                text = run_ocr(content_resp.content, name)
        else:
            return {"filename": name, "status": "failed", "error": f"Unsupported file type: {mime_type}"}

        return _run_pipeline(name, text, db, current_user)

    except IngestionError as e:
        return {"filename": file_id, "status": "failed", "error": str(e)}
    except requests.HTTPError as e:
        status_code = e.response.status_code if e.response is not None else "?"
        if status_code == 401:
            msg = "Google Drive access token expired or revoked. Please reconnect your Google account."
        elif status_code == 403:
            msg = "Permission denied — make sure the file is shared with your Google account."
        else:
            msg = "Couldn't access this file in Drive — check sharing permissions."
        logger.warning("Drive API HTTP %s for file %s: %s", status_code, file_id, e)
        return {"filename": file_id, "status": "failed", "error": msg}
    except Exception:
        logger.exception("Unexpected error importing Drive file %s", file_id)
        return {"filename": file_id, "status": "failed", "error": "An unexpected error occurred."}


def _run_pipeline(title: str, text: str, db: Session, current_user: User) -> dict:
    book = Book(
        user_id=current_user.id,
        title=title.rsplit(".", 1)[0],
        filename=title,
        status="processing",
    )
    db.add(book)
    db.commit()
    db.refresh(book)

    # Genre detection — same as the upload pipeline
    genre_result = detect_genre(book.title, book.author, text[:4000])
    book.genre = genre_result["genre"]
    book.sub_genre = genre_result["sub_genre"]
    book.content_mode = genre_result["content_mode"]
    db.commit()

    sections = chunk_text(text)
    if not sections:
        book.status = "failed"
        book.error_message = "No usable text found in this file."
        db.commit()
        return {"filename": title, "status": "failed", "book_id": book.id, "error": book.error_message}

    if book.content_mode == "companion":
        companion_insights = process_companion_book(
            title=book.title,
            author=book.author,
            sections=sections,
        )
        for row in companion_insights:
            db.add(Insight(
                book_id=book.id,
                text=row["text"],
                type=row["type"],
                pipeline=row["pipeline"],
                section_index=row["section_index"],
                order_index=row["order_index"],
            ))
    else:
        order_index = 0
        for section in sections:
            result = process_section(section, book_title=book.title, sub_genre=book.sub_genre or "")
            for insight in result["insights"]:
                db.add(Insight(
                    book_id=book.id,
                    text=insight["text"],
                    type=insight.get("type", "concept"),
                    pipeline="extraction",
                    section_index=0,
                    order_index=order_index,
                ))
                order_index += 1
            for card in result["flashcards"]:
                flashcard = Flashcard(book_id=book.id, front=card["front"], back=card["back"])
                db.add(flashcard)
                db.flush()
                db.add(ReviewState(flashcard_id=flashcard.id, user_id=current_user.id))

    book.status = "ready"
    db.commit()
    return {
        "filename": title,
        "status": "ready",
        "book_id": book.id,
        "genre": book.genre,
        "sub_genre": book.sub_genre,
        "content_mode": book.content_mode,
    }
